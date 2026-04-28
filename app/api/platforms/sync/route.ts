import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

// POST /api/platforms/sync
// Syncs data from connected platforms (followers, views) and creates/updates pages
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { connectionId, platform } = await request.json()

    // Get the platform connection
    const connection = await (prisma as any).platformConnection.findFirst({
      where: {
        ...(connectionId ? { id: connectionId } : {}),
        ...(platform ? { platform } : {}),
        userId,
      },
    })

    if (!connection) {
      return NextResponse.json({ error: "No platform connection found" }, { status: 404 })
    }

    // Check if token is expired
    if (connection.tokenExpiresAt && new Date() > connection.tokenExpiresAt) {
      return NextResponse.json({ error: "Token expired. Please reconnect the platform." }, { status: 401 })
    }

    const results: any[] = []

    if (connection.platform === "instagram") {
      // Fetch Instagram Business Account data
      const igData = await fetchInstagramData(connection.accessToken, connection.platformUserId)
      if (igData) {
        results.push(igData)

        // Create or update the page in our system
        await syncPageData(userId, connection, igData)
      }
    } else if (connection.platform === "facebook") {
      // Fetch all Facebook Pages and their Instagram accounts
      const fbData = await fetchFacebookPagesData(connection.accessToken)
      if (fbData) {
        for (const pageData of fbData) {
          results.push(pageData)

          // If the Facebook page has an Instagram business account, sync it
          if (pageData.instagram) {
            await syncInstagramPageData(userId, pageData)
          }
        }
      }
    } else if (connection.platform === "tiktok") {
      const ttData = await fetchTikTokData(connection.accessToken)
      if (ttData) {
        results.push(ttData)
        await syncTikTokPageData(userId, ttData)
      }
    } else if (connection.platform === "threads") {
      const threadsData = await fetchThreadsData(connection.accessToken)
      if (threadsData) {
        results.push(threadsData)
        await syncThreadsPageData(userId, threadsData)
      }
    }

    return NextResponse.json({
      success: true,
      synced: results.length,
      results,
    })
  } catch (error) {
    console.error("Error syncing platform data:", error)
    return NextResponse.json(
      { error: "Failed to sync platform data" },
      { status: 500 }
    )
  }
}

// Fetch Instagram Business Account insights
async function fetchInstagramData(accessToken: string, _igUserId: string) {
  try {
    // Nova API: graph.instagram.com (instagram_business_basic)
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${accessToken}`
    )
    const profile = await profileRes.json()

    if (profile.error) {
      console.error("Instagram API error:", profile.error)
      return null
    }

    // Insights via nova API (metric=views substituiu impressions)
    let impressions = 0
    try {
      const insightsRes = await fetch(
        `https://graph.instagram.com/v21.0/${profile.id}/insights?metric=views&period=day&since=${getDateDaysAgo(30)}&until=${getTodayDate()}&access_token=${accessToken}`
      )
      const insightsData = await insightsRes.json()

      if (insightsData.data && insightsData.data[0]?.values) {
        impressions = insightsData.data[0].values.reduce(
          (sum: number, v: any) => sum + (v.value || 0),
          0
        )
      }
    } catch (err) {
      console.log("Could not fetch Instagram insights:", err)
    }

    return {
      platform: "instagram",
      userId: profile.id,
      username: profile.username,
      name: profile.name || profile.username,
      profilePicture: profile.profile_picture_url,
      followers: profile.followers_count || 0,
      mediaCount: profile.media_count || 0,
      impressions,
    }
  } catch (error) {
    console.error("Error fetching Instagram data:", error)
    return null
  }
}

// Fetch Facebook Pages data with their Instagram accounts
async function fetchFacebookPagesData(accessToken: string) {
  try {
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,fan_count,instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}&access_token=${accessToken}`
    )
    const pagesData = await pagesRes.json()

    if (pagesData.error || !pagesData.data) {
      console.error("Facebook Pages API error:", pagesData.error)
      return null
    }

    const results = []

    for (const page of pagesData.data) {
      const pageResult: any = {
        platform: "facebook",
        pageId: page.id,
        pageName: page.name,
        fanCount: page.fan_count || 0,
        pageAccessToken: page.access_token,
      }

      if (page.instagram_business_account) {
        const ig = page.instagram_business_account

        // Fetch Instagram insights using page access token
        let impressions = 0
        try {
          const insightsRes = await fetch(
            `https://graph.facebook.com/v19.0/${ig.id}/insights?metric=views&period=day&since=${getDateDaysAgo(30)}&until=${getTodayDate()}&access_token=${page.access_token}`
          )
          const insightsData = await insightsRes.json()

          if (insightsData.data && insightsData.data[0]?.values) {
            impressions = insightsData.data[0].values.reduce(
              (sum: number, v: any) => sum + (v.value || 0),
              0
            )
          }
        } catch (err) {
          console.log("Could not fetch Instagram insights for page:", page.name, err)
        }

        pageResult.instagram = {
          id: ig.id,
          username: ig.username,
          name: ig.name || ig.username,
          profilePicture: ig.profile_picture_url,
          followers: ig.followers_count || 0,
          mediaCount: ig.media_count || 0,
          impressions,
        }
      }

      results.push(pageResult)
    }

    return results
  } catch (error) {
    console.error("Error fetching Facebook pages data:", error)
    return null
  }
}

// Sync Instagram page data to our database
async function syncPageData(userId: string, connection: any, data: any) {
  try {
    // Find or create the page
    const existingPage = await prisma.instagramPage.findFirst({
      where: {
        userId,
        username: data.username,
        platform: "instagram",
      },
    })

    let pageId: string

    if (existingPage) {
      // Update existing page
      await prisma.instagramPage.update({
        where: { id: existingPage.id },
        data: {
          name: data.name,
          coverImage: data.profilePicture || existingPage.coverImage,
        },
      })
      pageId = existingPage.id
    } else {
      // Create new page
      const newPage = await prisma.instagramPage.create({
        data: {
          userId,
          name: data.name,
          username: data.username,
          coverImage: data.profilePicture,
          platform: "instagram",
        },
      })
      pageId = newPage.id
    }

    // Add daily data
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyData.upsert({
      where: {
        pageId_date: {
          pageId,
          date: today,
        },
      },
      update: {
        followers: data.followers,
        views: data.impressions,
      },
      create: {
        pageId,
        date: today,
        followers: data.followers,
        views: data.impressions,
      },
    })

    // Sync recent media posts
    await syncMediaPosts(pageId, connection.accessToken, data.userId)
  } catch (error) {
    console.error("Error syncing page data:", error)
  }
}

// Fetch and save recent Instagram media posts
async function syncMediaPosts(pageId: string, accessToken: string, igUserId: string) {
  try {
    const res = await fetch(
      `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count&limit=20&access_token=${accessToken}`
    )
    const data = await res.json()

    if (data.error || !data.data) return

    for (const post of data.data) {
      const thumbnailUrl = post.thumbnail_url || (post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM' ? post.media_url : null)
      await (prisma as any).mediaPost.upsert({
        where: { pageId_platformPostId: { pageId, platformPostId: post.id } },
        update: {
          mediaType: post.media_type,
          mediaUrl: post.media_url || null,
          thumbnailUrl,
          permalink: post.permalink || null,
          caption: post.caption || null,
          publishedAt: post.timestamp ? new Date(post.timestamp) : null,
          likes: post.like_count || 0,
          comments: post.comments_count || 0,
        },
        create: {
          pageId,
          platformPostId: post.id,
          mediaType: post.media_type,
          mediaUrl: post.media_url || null,
          thumbnailUrl,
          permalink: post.permalink || null,
          caption: post.caption || null,
          publishedAt: post.timestamp ? new Date(post.timestamp) : null,
          likes: post.like_count || 0,
          comments: post.comments_count || 0,
        },
      })
    }
  } catch (err) {
    console.log("Could not sync media posts:", err)
  }
}

// Sync Instagram data from a Facebook page
async function syncInstagramPageData(userId: string, pageData: any) {
  if (!pageData.instagram) return

  const ig = pageData.instagram

  try {
    const existingPage = await prisma.instagramPage.findFirst({
      where: {
        userId,
        username: ig.username,
        platform: "instagram",
      },
    })

    let pageId: string

    if (existingPage) {
      await prisma.instagramPage.update({
        where: { id: existingPage.id },
        data: {
          name: ig.name,
          coverImage: ig.profilePicture || existingPage.coverImage,
        },
      })
      pageId = existingPage.id
    } else {
      const newPage = await prisma.instagramPage.create({
        data: {
          userId,
          name: ig.name,
          username: ig.username,
          coverImage: ig.profilePicture,
          platform: "instagram",
        },
      })
      pageId = newPage.id
    }

    // Add daily data
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyData.upsert({
      where: {
        pageId_date: {
          pageId,
          date: today,
        },
      },
      update: {
        followers: ig.followers,
        views: ig.impressions,
      },
      create: {
        pageId,
        date: today,
        followers: ig.followers,
        views: ig.impressions,
      },
    })
  } catch (error) {
    console.error("Error syncing Instagram page data:", error)
  }
}

// Busca dados do perfil TikTok via API v2
async function fetchTikTokData(accessToken: string) {
  try {
    const res = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,following_count,likes_count,video_count",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const data = await res.json()

    if (data.error?.code && data.error.code !== "ok") {
      console.error("TikTok user info error:", data.error)
      return null
    }

    const user = data.data?.user
    if (!user) return null

    return {
      platform: "tiktok",
      userId: user.open_id,
      username: user.display_name || user.open_id,
      name: user.display_name || "TikTok User",
      profilePicture: user.avatar_url || null,
      followers: user.follower_count || 0,
      likes: user.likes_count || 0,
      videoCount: user.video_count || 0,
    }
  } catch (error) {
    console.error("Error fetching TikTok data:", error)
    return null
  }
}

// Sincroniza dados do TikTok no banco de dados
async function syncTikTokPageData(userId: string, data: any) {
  try {
    const existingPage = await prisma.instagramPage.findFirst({
      where: { userId, username: data.username, platform: "tiktok" },
    })

    let pageId: string

    if (existingPage) {
      await prisma.instagramPage.update({
        where: { id: existingPage.id },
        data: {
          name: data.name,
          coverImage: data.profilePicture || existingPage.coverImage,
        },
      })
      pageId = existingPage.id
    } else {
      const newPage = await prisma.instagramPage.create({
        data: {
          userId,
          name: data.name,
          username: data.username,
          coverImage: data.profilePicture,
          platform: "tiktok",
        },
      })
      pageId = newPage.id
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyData.upsert({
      where: { pageId_date: { pageId, date: today } },
      update: { followers: data.followers, views: data.likes },
      create: { pageId, date: today, followers: data.followers, views: data.likes },
    })
  } catch (error) {
    console.error("Error syncing TikTok page data:", error)
  }
}

// Busca dados do perfil Threads via API
async function fetchThreadsData(accessToken: string) {
  try {
    const res = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`
    )
    const data = await res.json()

    if (data.error) {
      console.error("Threads API error:", data.error)
      return null
    }

    // Try followers_count separately (requires threads_basic approval)
    let followers = 0
    try {
      const followersRes = await fetch(
        `https://graph.threads.net/v1.0/me?fields=followers_count&access_token=${accessToken}`
      )
      const followersData = await followersRes.json()
      if (!followersData.error) {
        followers = followersData.followers_count || 0
      }
    } catch {}

    // Tenta buscar impressões via threads_manage_insights
    let impressions = 0
    try {
      const since = getDateDaysAgo(30)
      const until = getTodayDate()
      const insightsRes = await fetch(
        `https://graph.threads.net/v1.0/${data.id}/threads_insights?metric=views&period=day&since=${since}&until=${until}&access_token=${accessToken}`
      )
      const insightsData = await insightsRes.json()
      if (insightsData.data && Array.isArray(insightsData.data)) {
        impressions = insightsData.data.reduce((sum: number, item: any) => {
          const values = item.values || []
          return sum + values.reduce((s: number, v: any) => s + (v.value || 0), 0)
        }, 0)
      }
    } catch (insightsErr) {
      console.log("Could not fetch Threads insights:", insightsErr)
    }

    return {
      platform: "threads",
      userId: data.id,
      username: data.username,
      name: data.name || data.username,
      profilePicture: data.threads_profile_picture_url || null,
      followers,
      impressions,
    }
  } catch (error) {
    console.error("Error fetching Threads data:", error)
    return null
  }
}

// Sincroniza dados do Threads no banco de dados
async function syncThreadsPageData(userId: string, data: any) {
  try {
    const existingPage = await prisma.instagramPage.findFirst({
      where: { userId, username: data.username, platform: "threads" },
    })

    let pageId: string

    if (existingPage) {
      await prisma.instagramPage.update({
        where: { id: existingPage.id },
        data: {
          name: data.name,
          coverImage: data.profilePicture || existingPage.coverImage,
        },
      })
      pageId = existingPage.id
    } else {
      const newPage = await prisma.instagramPage.create({
        data: {
          userId,
          name: data.name,
          username: data.username,
          coverImage: data.profilePicture,
          platform: "threads",
        },
      })
      pageId = newPage.id
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.dailyData.upsert({
      where: { pageId_date: { pageId, date: today } },
      update: { followers: data.followers, views: data.impressions },
      create: { pageId, date: today, followers: data.followers, views: data.impressions },
    })
  } catch (error) {
    console.error("Error syncing Threads page data:", error)
  }
}

// Helper: Get date string N days ago (YYYY-MM-DD)
function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split("T")[0]
}

// Helper: Get today's date string (YYYY-MM-DD)
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}
