import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/config";

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 lg:py-20 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>

        <article className="prose prose-slate max-w-none">
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>

          <p className="text-base leading-relaxed mb-6">
            A {siteConfig.company.name} valoriza a sua privacidade e se compromete a proteger
            os dados pessoais coletados através deste site, em conformidade com a Lei Geral de
            Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
          </p>

          <Section title="1. Coleta de Dados">
            <p>Coletamos informações fornecidas pelo usuário, como:</p>
            <ul>
              <li>Nome</li>
              <li>Telefone</li>
              <li>E-mail</li>
              <li>Endereço e CEP</li>
            </ul>
            <p>Esses dados podem ser coletados quando o usuário:</p>
            <ul>
              <li>Preenche formulários no site</li>
              <li>Solicita atendimento ou suporte</li>
              <li>Realiza teste de cobertura por CEP</li>
            </ul>
          </Section>

          <Section title="2. Uso das Informações">
            <p>Utilizamos os dados para:</p>
            <ul>
              <li>Entrar em contato com o cliente</li>
              <li>Oferecer e prestar nossos serviços de internet</li>
              <li>Realizar campanhas de marketing e remarketing</li>
              <li>Melhorar a experiência de navegação no site</li>
            </ul>
          </Section>

          <Section title="3. Marketing e Anúncios">
            <p>
              Utilizamos ferramentas como <strong>Facebook Ads</strong> e <strong>Google Ads</strong>{" "}
              para exibir anúncios personalizados e realizar campanhas de remarketing aos usuários
              que demonstraram interesse em nossos serviços.
            </p>
          </Section>

          <Section title="4. Cookies e Tecnologias de Rastreamento">
            <p>Utilizamos cookies e tecnologias semelhantes para:</p>
            <ul>
              <li>Melhorar a navegação e o desempenho do site</li>
              <li>Personalizar conteúdo e ofertas</li>
              <li>Analisar o comportamento e as preferências do usuário</li>
            </ul>
            <p>
              O usuário pode, a qualquer momento, gerenciar ou desativar cookies através das
              configurações do seu navegador.
            </p>
          </Section>

          <Section title="5. Base Legal (LGPD)">
            <p>O tratamento de dados é realizado com base nas hipóteses legais previstas na LGPD, como:</p>
            <ul>
              <li>Consentimento do usuário</li>
              <li>Execução de contrato</li>
              <li>Cumprimento de obrigações legais ou regulatórias</li>
              <li>Legítimo interesse</li>
            </ul>
          </Section>

          <Section title="6. Segurança dos Dados">
            <p>
              Adotamos medidas técnicas e administrativas adequadas para proteger as informações
              contra acessos não autorizados, perdas, alterações ou destruição indevida.
            </p>
          </Section>

          <Section title="7. Tempo de Armazenamento">
            <p>
              Os dados são armazenados apenas pelo tempo necessário para cumprir as finalidades
              descritas nesta política ou para atender obrigações legais.
            </p>
          </Section>

          <Section title="8. Direitos do Usuário">
            <p>Nos termos da LGPD, o usuário pode solicitar a qualquer momento:</p>
            <ul>
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação dos dados</li>
              <li>Portabilidade dos dados</li>
              <li>Revogação do consentimento</li>
            </ul>
          </Section>

          <Section title="9. Compartilhamento com Terceiros">
            <p>
              Não vendemos dados pessoais. Podemos compartilhar informações estritamente
              necessárias com parceiros operacionais (ex.: instalação, faturamento, plataformas
              de anúncios) sempre dentro das finalidades aqui descritas.
            </p>
          </Section>

          <Section title="10. Contato">
            <p>
              Para dúvidas, exercício de direitos ou solicitações relacionadas aos seus dados,
              entre em contato pelos canais oficiais:
            </p>
            <ul>
              <li>WhatsApp: {siteConfig.contact.whatsappFormatted ?? siteConfig.contact.whatsapp}</li>
              <li>Telefone: {siteConfig.contact.phone}</li>
              <li>Endereço: {siteConfig.company.address}</li>
            </ul>
          </Section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-3">{title}</h2>
      <div className="text-base leading-relaxed text-muted-foreground space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
