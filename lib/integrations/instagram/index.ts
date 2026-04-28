import { BaseIntegrationImpl, ConnectedAccount } from '../base'
import { Platform, NormalizedMetrics } from '@/lib/platforms'

export class InstagramIntegration extends BaseIntegrationImpl {
  platform: Platform = 'instagram'

  async isAuthenticated(): Promise<boolean> {
    return !!this.credentials?.accessToken
  }

  async authenticate(credentials: Record<string, string>): Promise<boolean> {
    if (credentials.accessToken) {
      this.setCredentials({
        accessToken: credentials.accessToken,
        expiresAt: credentials.expiresAt ? new Date(credentials.expiresAt) : undefined,
      })
      return true
    }
    return false
  }

  async disconnect(): Promise<void> {
    this.clearCredentials()
  }

  async fetchFollowers(_accountId: string): Promise<number> {
    throw new Error('Use sincronização via Meta Graph API.')
  }

  async fetchViews(_accountId: string, _period?: { start: Date; end: Date }): Promise<number> {
    throw new Error('Use sincronização via Meta Graph API.')
  }

  async fetchMetrics(_accountId: string): Promise<NormalizedMetrics> {
    throw new Error('Use sincronização via Meta Graph API.')
  }

  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    return []
  }
}

export const instagramIntegration = new InstagramIntegration()
