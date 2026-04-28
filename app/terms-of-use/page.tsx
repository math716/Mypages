import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Termos de Uso - MyPages",
  description: "Termos de uso da plataforma MyPages",
}

export default function TermsOfUsePage() {
  const lastUpdated = "06 de abril de 2025"

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
            Termos de Uso
          </h1>
          <p className="text-gray-500 text-sm">Última atualização: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar o <strong>MyPages</strong> ("plataforma", "serviço" ou
              "aplicativo"), você concorda com estes Termos de Uso e com nossa{" "}
              <Link href="/privacy-policy" className="text-purple-600 hover:underline">
                Política de Privacidade
              </Link>
              . Se não concordar com qualquer parte destes termos, não utilize o serviço.
            </p>
            <p className="mt-2">
              Estes termos constituem um contrato legal entre você ("usuário") e o MyPages.
              Reservamo-nos o direito de atualizar estes termos a qualquer momento, com aviso
              prévio quando as alterações forem significativas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Descrição do Serviço</h2>
            <p>
              O MyPages é uma plataforma de monitoramento e análise de crescimento de páginas em
              redes sociais. Por meio da plataforma, você pode:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Cadastrar e acompanhar o crescimento de páginas em diferentes redes sociais;</li>
              <li>Visualizar gráficos e dashboards com métricas de seguidores e visualizações;</li>
              <li>Conectar contas de redes sociais (Instagram, Facebook, TikTok) para sincronização automática de dados;</li>
              <li>Definir metas mensais e acompanhar o progresso;</li>
              <li>Gerar relatórios e comparativos entre páginas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cadastro e Conta</h2>
            <p className="mb-2">Para utilizar o MyPages, você deve:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ter pelo menos 13 anos de idade;</li>
              <li>Fornecer informações verdadeiras, precisas e atualizadas no cadastro;</li>
              <li>Manter a confidencialidade de suas credenciais de acesso;</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta.</li>
            </ul>
            <p className="mt-3">
              Você é responsável por todas as atividades realizadas com sua conta. O MyPages não se
              responsabiliza por perdas decorrentes do uso não autorizado das suas credenciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Uso Permitido</h2>
            <p className="mb-2">Você concorda em utilizar o MyPages somente para fins lícitos e de acordo com estes termos. É expressamente proibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar o serviço para fins ilegais ou não autorizados;</li>
              <li>Inserir dados falsos ou enganosos na plataforma;</li>
              <li>Tentar acessar sistemas, contas ou dados de outros usuários;</li>
              <li>Realizar engenharia reversa, descompilar ou desmontar qualquer parte do aplicativo;</li>
              <li>Usar scripts, bots ou meios automatizados para acessar o serviço sem autorização;</li>
              <li>Transmitir vírus, malware ou qualquer código malicioso;</li>
              <li>Violar os termos de uso das redes sociais conectadas (Meta, TikTok, X, Kwai etc.).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Integrações com Redes Sociais</h2>
            <p className="mb-2">
              Ao conectar sua conta de uma rede social ao MyPages, você autoriza a plataforma a
              acessar determinados dados do seu perfil conforme as permissões solicitadas. Você
              declara e garante que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Possui os direitos necessários para autorizar o acesso às contas que conectar;
              </li>
              <li>
                O uso dos dados obtidos pelas integrações estará em conformidade com os termos de
                uso das respectivas plataformas (Meta, TikTok, X, Kwai);
              </li>
              <li>
                Compreende que o acesso pode ser revogado a qualquer momento nas configurações da
                rede social correspondente.
              </li>
            </ul>
            <p className="mt-3">
              O MyPages não é afiliado, patrocinado ou endossado por Meta, TikTok, X Corp., Kwai
              ou qualquer outra plataforma de rede social.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma MyPages — incluindo design, logotipos, textos, gráficos,
              código-fonte e funcionalidades — é de propriedade exclusiva do MyPages e está protegido
              por leis de propriedade intelectual.
            </p>
            <p className="mt-2">
              Os dados que você insere na plataforma (nomes de páginas, métricas, metas) permanecem
              de sua propriedade. Ao utilizá-los no MyPages, você nos concede uma licença limitada,
              não exclusiva e revogável para armazená-los e exibi-los exclusivamente para fins de
              operação do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Disponibilidade do Serviço</h2>
            <p>
              Nos esforçamos para manter o MyPages disponível 24 horas por dia, 7 dias por semana.
              No entanto, não garantimos disponibilidade ininterrupta. O serviço pode ficar
              temporariamente indisponível por:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Manutenções programadas ou emergenciais;</li>
              <li>Falhas de infraestrutura ou serviços de terceiros;</li>
              <li>Eventos fora do nosso controle (força maior).</li>
            </ul>
            <p className="mt-3">
              Não nos responsabilizamos por perdas ou danos decorrentes de indisponibilidade
              temporária do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitação de Responsabilidade</h2>
            <p>
              O MyPages é fornecido "no estado em que se encontra", sem garantias de qualquer tipo.
              Na máxima extensão permitida pela lei, não nos responsabilizamos por:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Imprecisões nos dados sincronizados a partir de APIs de terceiros;</li>
              <li>Perdas de dados causadas por falhas técnicas;</li>
              <li>Decisões de negócio tomadas com base nas informações exibidas na plataforma;</li>
              <li>Danos indiretos, incidentais ou consequenciais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Cancelamento e Encerramento</h2>
            <p>
              Você pode encerrar sua conta a qualquer momento diretamente na plataforma ou
              solicitando a{" "}
              <Link href="/data-deletion" className="text-purple-600 hover:underline">
                exclusão dos seus dados
              </Link>
              .
            </p>
            <p className="mt-2">
              Reservamo-nos o direito de suspender ou encerrar sua conta, a nosso critério, caso
              sejam identificadas violações destes Termos de Uso, sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Lei Aplicável</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil,
              incluindo a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e o Código
              de Defesa do Consumidor (Lei nº 8.078/1990). Fica eleito o foro da Comarca de São
              Paulo/SP para dirimir eventuais litígios, com renúncia a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos de Uso, entre em contato:
            </p>
            <div className="mt-3 p-4 bg-purple-50 rounded-lg">
              <p>
                <strong>E-mail:</strong>{" "}
                <a href="mailto:contato@mypages.app" className="text-purple-600 hover:underline">
                  contato@mypages.app
                </a>
              </p>
              <p className="mt-1">
                <strong>Política de Privacidade:</strong>{" "}
                <Link href="/privacy-policy" className="text-purple-600 hover:underline">
                  mypages.app/privacy-policy
                </Link>
              </p>
              <p className="mt-1">
                <strong>Exclusão de Dados:</strong>{" "}
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
            <Link href="/privacy-policy" className="text-purple-600 hover:underline">
              Política de Privacidade
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
