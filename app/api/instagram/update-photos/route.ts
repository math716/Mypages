import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

async function fetchInstagramPhoto(username: string): Promise<{ url: string | null; isPlaceholder: boolean }> {
  const cleanUsername = username.replace(/^@/, "").trim().toLowerCase()
  
  // Method 1: Try i.instagram.com API
  try {
    const response = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`, {
      headers: {
        "User-Agent": "Instagram 76.0.0.15.395 Android (21/5.0.2; 480dpi; 1080x1776; samsung; SM-N900T; hltetmo; qcom; en_US)",
        "Accept": "*/*",
        "X-IG-App-ID": "936619743392459",
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data?.data?.user?.profile_pic_url_hd) {
        return { url: data.data.user.profile_pic_url_hd, isPlaceholder: false }
      } else if (data?.data?.user?.profile_pic_url) {
        return { url: data.data.user.profile_pic_url, isPlaceholder: false }
      }
    }
  } catch (err) {
    console.log(`Method 1 failed for ${cleanUsername}:`, err)
  }

  // Method 2: Try to fetch from Instagram's public page
  try {
    const response = await fetch(`https://www.instagram.com/${cleanUsername}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
      },
      redirect: "follow",
    })

    if (response.ok) {
      const html = await response.text()
      
      const patterns = [
        /<meta property="og:image" content="([^"]+)"/,
        /"profile_pic_url_hd":"([^"]+)"/,
        /"profile_pic_url":"([^"]+)"/,
      ]

      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          return { url: match[1].replace(/\\u0026/g, "&").replace(/\\/g, ""), isPlaceholder: false }
        }
      }
    }
  } catch (err) {
    console.log(`Method 2 failed for ${cleanUsername}:`, err)
  }

  // Method 3: Generate placeholder
  return { 
    url: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&size=150&background=E1306C&color=fff&bold=true`,
    isPlaceholder: true 
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all pages without cover images (or all pages if forceUpdate is true)
    const body = await request.json().catch(() => ({}))
    const forceUpdate = body.forceUpdate === true
    const pageIds = body.pageIds as string[] | undefined

    let whereClause: Record<string, unknown> = {
      userId: user.id,
    }

    if (pageIds && pageIds.length > 0) {
      whereClause.id = { in: pageIds }
    } else if (!forceUpdate) {
      whereClause.OR = [
        { coverImage: null },
        { coverImage: "" }
      ]
    }

    const pages = await prisma.instagramPage.findMany({
      where: whereClause,
      select: { id: true, username: true, name: true, coverImage: true }
    })

    const results: { id: string; username: string; name: string; success: boolean; photoUrl?: string; isPlaceholder?: boolean }[] = []

    // Process pages with a small delay to avoid rate limiting
    for (const page of pages) {
      const { url: photoUrl, isPlaceholder } = await fetchInstagramPhoto(page.username)
      
      if (photoUrl) {
        await prisma.instagramPage.update({
          where: { id: page.id },
          data: { coverImage: photoUrl }
        })
        results.push({ 
          id: page.id, 
          username: page.username, 
          name: page.name, 
          success: true, 
          photoUrl,
          isPlaceholder 
        })
      } else {
        results.push({ id: page.id, username: page.username, name: page.name, success: false })
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    const successCount = results.filter(r => r.success && !r.isPlaceholder).length
    const placeholderCount = results.filter(r => r.success && r.isPlaceholder).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Atualizado ${successCount} de ${results.length} páginas`,
      results,
      stats: {
        total: results.length,
        success: successCount,
        placeholder: placeholderCount,
        failed: failCount
      }
    })

  } catch (error) {
    console.error("Error updating photos:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update photos" 
    }, { status: 500 })
  }
}
