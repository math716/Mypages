// Platform types and configurations
export type Platform = 'instagram' | 'kawaii' | 'tiktok' | 'facebook' | 'x' | 'threads'

export interface PlatformConfig {
  id: Platform
  name: string
  icon: string // SVG path or component name
  color: string
  gradient: string
  bgColor: string
  hoverColor: string
  metrics: {
    followers: string
    views: string
    engagement?: string
  }
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    gradient: 'from-purple-500 via-pink-500 to-orange-400',
    bgColor: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400',
    hoverColor: 'hover:from-purple-600 hover:via-pink-600 hover:to-orange-500',
    metrics: {
      followers: 'followers_count',
      views: 'impressions',
      engagement: 'engagement_rate'
    }
  },
  kawaii: {
    id: 'kawaii',
    name: 'Kawaii',
    icon: 'kawaii',
    color: '#9333EA',
    gradient: 'from-purple-600 to-purple-400',
    bgColor: 'bg-gradient-to-r from-purple-600 to-purple-400',
    hoverColor: 'hover:from-purple-700 hover:to-purple-500',
    metrics: {
      followers: 'fans',
      views: 'views',
      engagement: 'likes'
    }
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'tiktok',
    color: '#000000',
    gradient: 'from-black via-gray-900 to-black',
    bgColor: 'bg-gradient-to-r from-black via-gray-900 to-black',
    hoverColor: 'hover:from-gray-900 hover:via-gray-800 hover:to-gray-900',
    metrics: {
      followers: 'follower_count',
      views: 'video_views',
      engagement: 'likes'
    }
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    gradient: 'from-blue-600 to-blue-500',
    bgColor: 'bg-gradient-to-r from-blue-600 to-blue-500',
    hoverColor: 'hover:from-blue-700 hover:to-blue-600',
    metrics: {
      followers: 'followers_count',
      views: 'impressions',
      engagement: 'engagement_rate'
    }
  },
  x: {
    id: 'x',
    name: 'X',
    icon: 'x',
    color: '#111111',
    gradient: 'from-zinc-900 to-black',
    bgColor: 'bg-gradient-to-r from-zinc-900 to-black',
    hoverColor: 'hover:from-black hover:to-zinc-900',
    metrics: {
      followers: 'followers_count',
      views: 'impressions',
      engagement: 'engagement_rate'
    }
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    icon: 'threads',
    color: '#000000',
    gradient: 'from-gray-900 to-black',
    bgColor: 'bg-gradient-to-r from-gray-900 to-black',
    hoverColor: 'hover:from-black hover:to-gray-900',
    metrics: {
      followers: 'followers_count',
      views: 'impressions',
      engagement: 'engagement_rate'
    }
  }
}

export const PLATFORM_LIST: Platform[] = ['instagram', 'kawaii', 'tiktok', 'facebook', 'x', 'threads']

// Normalize metrics from different platforms to a common format
export interface NormalizedMetrics {
  followers: number
  views: number
  engagement?: number
  growthRate?: number
}

export function normalizeMetrics(
  platform: Platform,
  rawData: Record<string, any>
): NormalizedMetrics {
  const config = PLATFORMS[platform]
  
  return {
    followers: rawData[config.metrics.followers] || rawData.followers || 0,
    views: rawData[config.metrics.views] || rawData.views || 0,
    engagement: config.metrics.engagement 
      ? rawData[config.metrics.engagement] || rawData.engagement || 0 
      : undefined,
    growthRate: rawData.growth_rate || rawData.growthRate || 0
  }
}

// Future platforms (prepared for scalability)
export const FUTURE_PLATFORMS = ['youtube', 'facebook', 'kwai_business'] as const
