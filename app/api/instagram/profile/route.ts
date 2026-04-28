import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, "").trim().toLowerCase()

    // Try multiple methods to get Instagram profile picture
    let profilePicUrl: string | null = null

    // Method 1: Use instadp.io service (most reliable)
    try {
      const response = await fetch(`https://instadp.io/api/profile?username=${cleanUsername}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data?.profile_pic_url_hd || data?.profile_pic_url) {
          profilePicUrl = data.profile_pic_url_hd || data.profile_pic_url
        }
      }
    } catch (err) {
      console.log("Method 1 (instadp.io) failed:", err)
    }

    // Method 2: Try i.instagram.com API
    if (!profilePicUrl) {
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
            profilePicUrl = data.data.user.profile_pic_url_hd
          } else if (data?.data?.user?.profile_pic_url) {
            profilePicUrl = data.data.user.profile_pic_url
          }
        }
      } catch (err) {
        console.log("Method 2 (i.instagram.com) failed:", err)
      }
    }

    // Method 3: Try to fetch from Instagram's public page
    if (!profilePicUrl) {
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
          
          // Try multiple regex patterns
          const patterns = [
            /<meta property="og:image" content="([^"]+)"/,
            /"profile_pic_url_hd":"([^"]+)"/,
            /"profile_pic_url":"([^"]+)"/,
            /profilePicUrl['"]\s*:\s*['"]([^'"]+)['"]/,
          ]

          for (const pattern of patterns) {
            const match = html.match(pattern)
            if (match && match[1]) {
              profilePicUrl = match[1].replace(/\\u0026/g, "&").replace(/\\/g, "")
              break
            }
          }
        }
      } catch (err) {
        console.log("Method 3 (instagram.com) failed:", err)
      }
    }

    // Method 4: Use a public CDN proxy for default Instagram profile picture format
    if (!profilePicUrl) {
      // Generate a placeholder that looks like an Instagram profile
      profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&size=150&background=E1306C&color=fff&bold=true`
    }

    return NextResponse.json({ 
      success: true, 
      profilePicUrl,
      username: cleanUsername,
      isPlaceholder: profilePicUrl?.includes("ui-avatars.com")
    })

  } catch (error) {
    console.error("Error fetching Instagram profile:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch Instagram profile" 
    }, { status: 500 })
  }
}
