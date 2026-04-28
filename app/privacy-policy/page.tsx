import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Privacidade - MyPages",
  description: "Política de privacidade do aplicativo MyPages",
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "03 de abril de 2025"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Política de Privacidade
          </h1>
          <p className="text-gray-500 text-sm">Última atualização: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introdução</h2>
            <p>
              O <strong>MyPages</strong> ("nós", "nosso" ou "aplicativo") é uma plataforma para
              monitoramento e análise de crescimento de páginas em redes sociais. Esta Política de
              Privacidade descreve como coletamos, usamos, armazenamos e protegemos as suas
              informações pessoais quando você utiliza nossos serviços.
            </p>
            <p className="mt-2">
              Ao utilizar o MyPages, você concorda com as práticas descritas nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Dados que Coletamos</h2>
            <p className="mb-2">Coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Dados de cadastro:</strong> nome, sobrenome e endereço de e-mail fornecidos
                no momento do registro.
              </li>
              <li>
                <strong>Dados de páginas monitoradas:</strong> nome de usuário, nome da página e
                métricas de crescimento (seguidores, visualizações) inseridos manualmente ou
                sincronizados via API.
              </li>
              <li>
                <strong>Dados de conexão com redes sociais:</strong> quando você conecta sua conta
                do Instagram ou Facebook, coletamos tokens de acesso, ID da conta, nome de usuário
                e foto de perfil da plataforma conectada para fins de sincronização automática de
                dados.
              </li>
              <li>
                <strong>Dados de uso:</strong> informações sobre como você interage com a
                plataforma, como páginas visitadas e funcionalidades utilizadas.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Como Usamos os Dados</h2>
            <p className="mb-2">Utilizamos os dados coletados para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criar e gerenciar sua conta no MyPages;</li>
              <li>Exibir dashboards e gráficos de crescimento das suas páginas;</li>
              <li>Sincronizar automaticamente dados das redes sociais conectadas;</li>
              <li>Melhorar a qualidade e as funcionalidades da plataforma;</li>
              <li>Garantir a segurança e prevenir fraudes;</li>
              <li>Cumprir obrigações legais.</li>
            </ul>
            <p className="mt-3">
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins
              comerciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. Integrações com Redes Sociais (Meta)
            </h2>
            <p className="mb-2">
              O MyPages pode se integrar às plataformas do Facebook e Instagram (ambas da Meta
              Platforms, Inc.) mediante autorização explícita do usuário. Ao conectar sua conta:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Solicitamos apenas as permissões necessárias para leitura de dados de perfil e
                métricas das páginas que você autorizar.
              </li>
              <li>
                Os tokens de acesso obtidos são armazenados de forma segura e utilizados
                exclusivamente para buscar dados em seu nome.
              </li>
              <li>
                Você pode revogar essa autorização a qualquer momento nas configurações do Facebook
                ou Instagram em{" "}
                <a
                  href="https://www.facebook.com/settings?tab=applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  facebook.com/settings
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros. Adotamos medidas técnicas e
              organizacionais adequadas para proteger suas informações contra acesso não autorizado,
              alteração, divulgação ou destruição, incluindo criptografia de senhas e comunicações
              via HTTPS.
            </p>
            <p className="mt-2">
              Manteremos seus dados enquanto sua conta estiver ativa ou conforme necessário para
              fornecer os serviços. Você pode solicitar a exclusão de seus dados a qualquer momento
              (veja a Seção 7).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para manter sua sessão autenticada na plataforma. Não
              utilizamos cookies de rastreamento de terceiros para fins publicitários.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Seus Direitos</h2>
            <p className="mb-2">De acordo com a LGPD e demais legislações aplicáveis, você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar os dados que temos sobre você;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a exclusão dos seus dados pessoais;</li>
              <li>Revogar o consentimento para tratamento de dados a qualquer momento;</li>
              <li>Portabilidade dos dados, quando aplicável.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer um desses direitos, acesse nossa{" "}
              <Link href="/data-deletion" className="text-purple-600 hover:underline">
                página de exclusão de dados
              </Link>{" "}
              ou entre em contato pelo e-mail{" "}
              <a href="mailto:contato@mypages.app" className="text-purple-600 hover:underline">
                contato@mypages.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Menores de Idade</h2>
            <p>
              O MyPages não é destinado a menores de 13 anos. Não coletamos intencionalmente dados
              de crianças. Se você acredita que coletamos dados de um menor, entre em contato
              conosco imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9. Alterações nesta Política
            </h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos
              alterações significativas, notificaremos você por e-mail ou por meio de um aviso
              destacado na plataforma. O uso contínuo do MyPages após as alterações constitui
              aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contato</h2>
            <p>
              Se tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de
              Privacidade, entre em contato conosco:
            </p>
            <div className="mt-3 p-4 bg-purple-50 rounded-lg">
              <p>
                <strong>E-mail:</strong>{" "}
                <a href="mailto:contato@mypages.app" className="text-purple-600 hover:underline">
                  contato@mypages.app
                </a>
              </p>
              <p className="mt-1">
                <strong>Exclusão de dados:</strong>{" "}
                <Link href="/data-deletion" className="text-purple-600 hover:underline">
                  mypages.app/data-deletion
                </Link>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 space-y-2">
          <div className="flex justify-center gap-6">
            <Link href="/terms-of-use" className="text-purple-600 hover:underline">
              Termos de Uso
            </Link>
            <Link href="/data-deletion" className="text-purple-600 hover:underline">
              Exclusão de Dados
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
