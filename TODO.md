# TODO - Integração OAuth Instagram/Facebook via Meta Graph API

## Fase 1: Configurar OAuth Provider no NextAuth
- [x] Não necessário — OAuth separado do login (login continua com email/senha)

## Fase 2: Criar modelo para tokens de plataforma
- [x] `prisma/schema.prisma` - Criar modelo `PlatformConnection`
- [x] Rodar `npx prisma db push` — banco sincronizado
- [x] Rodar `npx prisma generate` — client gerado

## Fase 3: Criar API de conexão com plataformas
- [x] `app/api/platforms/connect/facebook/route.ts` - Iniciar fluxo OAuth
- [x] `app/api/platforms/callback/facebook/route.ts` - Callback OAuth (troca code por token, salva conexão)
- [x] `app/api/platforms/accounts/route.ts` - Listar contas conectadas
- [x] `app/api/platforms/disconnect/route.ts` - Desconectar plataforma

## Fase 4: Criar API para buscar dados automaticamente
- [x] `app/api/platforms/sync/route.ts` - Puxar dados via Graph API (seguidores, views, insights)

## Fase 5: Criar UI de conexão
- [x] `app/pages/_components/connect-platform-modal.tsx` - Modal de conexão com botões conectar/sincronizar/desconectar
- [x] `app/pages/_components/pages-client.tsx` - Botão "Conectar Plataforma" para Instagram/Facebook + "Adicionar Manual" como alternativa

## Fase 6: Correções anteriores
- [x] `components/platform-selector.tsx` - Corrigido botão "X" duplicado (esconde texto quando platformId === 'x')
- [x] `lib/db.ts` - PgBouncer fix (prepared statements)

## Próximos passos (produção):
- [ ] Hospedar app em domínio HTTPS
- [ ] Configurar redirect URI no Meta Developer Portal para domínio de produção
- [ ] Testar fluxo OAuth completo em produção
- [ ] Implementar refresh de tokens expirados
