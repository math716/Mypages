import { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Mail, Settings, Trash2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Exclusão de Dados - MyPages",
  description: "Saiba como solicitar a exclusão dos seus dados no MyPages",
}

interface Props {
  searchParams: { code?: string }
}

export default function DataDeletionPage({ searchParams }: Props) {
  const confirmationCode = searchParams?.code

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <img
              src="/logo.jpg"
              alt="MyPages Logo"
              className="h-12 w-12 rounded-xl object-cover shadow-lg"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MyPages
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Exclusão de Dados</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Você tem o direito de solicitar a exclusão de todos os seus dados armazenados no
            MyPages.
          </p>
        </div>

        {/* Confirmation status (shown when Meta redirects user with a code) */}
        {confirmationCode && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-green-800 text-lg">
                Solicitação de exclusão recebida
              </h2>
              <p className="text-green-700 mt-1">
                Seus dados vinculados ao Facebook/Instagram estão sendo removidos do MyPages.
              </p>
              <p className="text-green-600 text-sm mt-2">
                Código de confirmação:{" "}
                <code className="font-mono bg-green-100 px-2 py-0.5 rounded">
                  {confirmationCode}
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-8 text-gray-700 leading-relaxed">

          {/* Option 1: Delete via Meta settings */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Opção 1 — Remover via Facebook/Instagram
              </h2>
            </div>
            <p className="mb-4">
              Se você conectou sua conta do Facebook ou Instagram ao MyPages, pode remover o acesso
              diretamente nas configurações do Facebook. Isso acionará automaticamente a exclusão
              dos seus dados em nosso sistema.
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Acesse{" "}
                <a
                  href="https://www.facebook.com/settings?tab=applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Configurações do Facebook → Aplicativos e sites
                </a>
              </li>
              <li>Localize o aplicativo <strong>MyPages</strong> na lista</li>
              <li>Clique em <strong>Remover</strong> e confirme a exclusão</li>
              <li>
                O Facebook notificará o MyPages automaticamente e seus dados vinculados serão
                excluídos
              </li>
            </ol>
          </section>

          <hr className="border-gray-100" />

          {/* Option 2: Delete account inside the app */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-pink-100">
                <Trash2 className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Opção 2 — Excluir conta no MyPages
              </h2>
            </div>
            <p className="mb-4">
              Você pode excluir diretamente sua conta e todos os dados associados dentro da
              plataforma MyPages:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Faça login em{" "}
                <Link href="/" className="text-purple-600 hover:underline">
                  mypages.app
                </Link>
              </li>
              <li>Acesse as configurações da sua conta</li>
              <li>Selecione a opção <strong>Excluir minha conta</strong></li>
              <li>Confirme a exclusão — todos os seus dados serão removidos permanentemente</li>
            </ol>
          </section>

          <hr className="border-gray-100" />

          {/* Option 3: Contact us */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Opção 3 — Solicitar por e-mail
              </h2>
            </div>
            <p className="mb-4">
              Se preferir, envie um e-mail solicitando a exclusão dos seus dados. Responderemos e
              processaremos sua solicitação em até <strong>30 dias</strong>.
            </p>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p>
                <strong>E-mail:</strong>{" "}
                <a href="mailto:contato@mypages.app" className="text-purple-600 hover:underline">
                  contato@mypages.app
                </a>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Informe no e-mail: seu nome, endereço de e-mail cadastrado e o motivo da
                solicitação.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* What gets deleted */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">O que será excluído</h2>
            <p className="mb-3">Ao solicitar a exclusão, removeremos permanentemente:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sua conta e dados de cadastro (nome, e-mail)</li>
              <li>Todas as páginas e perfis que você cadastrou no MyPages</li>
              <li>Todo o histórico de métricas e dados diários inseridos</li>
              <li>Metas mensais e configurações personalizadas</li>
              <li>Tokens de acesso e conexões com Facebook e Instagram</li>
              <li>Sessões e dados de autenticação</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              A exclusão é irreversível. Após a confirmação, não será possível recuperar os dados.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 space-y-2">
          <div className="flex justify-center gap-6">
            <Link href="/privacy-policy" className="text-purple-600 hover:underline">
              Política de Privacidade
            </Link>
            <Link href="/terms-of-use" className="text-purple-600 hover:underline">
              Termos de Uso
            </Link>
          </div>
          <div>
            <Link href="/" className="text-purple-600 hover:underline">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
