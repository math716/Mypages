import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Append pgbouncer=true to DATABASE_URL to avoid "prepared statement already exists" error
function getDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  if (url.includes('pgbouncer=true')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}pgbouncer=true`
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatasourceUrl(),
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
