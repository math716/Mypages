import { Platform } from '@/lib/platforms'
import { BaseIntegrationImpl, ConnectedAccount, IntegrationCredentials } from './base'
import { NormalizedMetrics } from '@/lib/platforms'

export class TikTokIntegration extends BaseIntegrationImpl {
  platform: Platform = 'tiktok'

  async isAuthenticated(): Promise<boolean> {
    return !!this.credentials?.accessToken
  }

  async authenticate(credentials: Record<string, string>): Promise<boolean> {
    this.setCredentials({
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      expiresAt: credentials.expiresAt ? new Date(credentials.expiresAt) : undefined,
    })
    return true
  }

  async disconnect(): Promise<void> {
    this.clearCredentials()
  }

  async fetchFollowers(accountId: string): Promise<number> {
    if (!this.credentials?.accessToken) throw new Error('Não autenticado')

    const res = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=follower_count',
      { headers: { Authorization: `Bearer ${this.credentials.accessToken}` } }
    )
    const data = await res.json()
    return data.data?.user?.follower_count || 0
  }

  async fetchViews(accountId: string): Promise<number> {
    // TikTok não expõe views totais de perfil via API básica
    // Retorna likes_count como proxy de engajamento
    if (!this.credentials?.accessToken) throw new Error('Não autenticado')

    const res = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=likes_count',
      { headers: { Authorization: `Bearer ${this.credentials.accessToken}` } }
    )
    const data = await res.json()
    return data.data?.user?.likes_count || 0
  }

  async fetchMetrics(accountId: string): Promise<NormalizedMetrics> {
    if (!this.credentials?.accessToken) throw new Error('Não autenticado')

    const res = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count,video_count',
      { headers: { Authorization: `Bearer ${this.credentials.accessToken}` } }
    )
    const data = await res.json()
    const user = data.data?.user || {}

    return {
      followers: user.follower_count || 0,
      views: user.likes_count || 0,
      engagement: user.video_count || 0,
    }
  }

  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    if (!this.credentials?.accessToken) return []

    const res = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count',
      { headers: { Authorization: `Bearer ${this.credentials.accessToken}` } }
    )
    const data = await res.json()
    const user = data.data?.user

    if (!user) return []

    return [{
      id: user.open_id,
      username: user.display_name || user.open_id,
      name: user.display_name || 'TikTok User',
      profileImage: user.avatar_url,
      platform: 'tiktok',
      metrics: {
        followers: user.follower_count || 0,
        views: 0,
      },
    }]
  }
}

export const tiktokIntegration = new TikTokIntegration()
