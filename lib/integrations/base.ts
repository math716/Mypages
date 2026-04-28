// Base integration interface for all platforms
import { Platform, NormalizedMetrics } from '@/lib/platforms'

export interface BaseIntegration {
  platform: Platform
  
  // Authentication
  isAuthenticated(): Promise<boolean>
  authenticate(credentials: Record<string, string>): Promise<boolean>
  disconnect(): Promise<void>
  
  // Data fetching
  fetchFollowers(accountId: string): Promise<number>
  fetchViews(accountId: string, period?: { start: Date; end: Date }): Promise<number>
  fetchMetrics(accountId: string): Promise<NormalizedMetrics>
  
  // Account management
  getConnectedAccounts(): Promise<ConnectedAccount[]>
}

export interface ConnectedAccount {
  id: string
  username: string
  name: string
  profileImage?: string
  platform: Platform
  metrics?: NormalizedMetrics
}

export interface IntegrationCredentials {
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  appId?: string
  appSecret?: string
}

// Abstract base class for integrations
export abstract class BaseIntegrationImpl implements BaseIntegration {
  abstract platform: Platform
  protected credentials: IntegrationCredentials | null = null
  
  abstract isAuthenticated(): Promise<boolean>
  abstract authenticate(credentials: Record<string, string>): Promise<boolean>
  abstract disconnect(): Promise<void>
  abstract fetchFollowers(accountId: string): Promise<number>
  abstract fetchViews(accountId: string, period?: { start: Date; end: Date }): Promise<number>
  abstract fetchMetrics(accountId: string): Promise<NormalizedMetrics>
  abstract getConnectedAccounts(): Promise<ConnectedAccount[]>
  
  protected setCredentials(creds: IntegrationCredentials) {
    this.credentials = creds
  }
  
  protected clearCredentials() {
    this.credentials = null
  }
}
