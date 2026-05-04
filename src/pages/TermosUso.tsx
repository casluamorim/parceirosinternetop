import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/config";

export default function TermosUso() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 lg:py-20 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>

        <article>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>

          <p className="text-base leading-relaxed mb-6">
            Ao acessar este site, o usuário declara estar ciente e concordar integralmente com os
            presentes Termos de Uso da {siteConfig.company.name}.
          </p>

          <Section title="1. Uso do Site">
            <p>
              O usuário se compromete a utilizar este site de forma adequada, ética e em
              conformidade com a legislação brasileira vigente.
            </p>
          </Section>

          <Section title="2. Disponibilidade do Serviço">
            <p>
              A disponibilidade dos serviços de internet pode variar conforme análise técnica,
              viabilidade de infraestrutura e localização do endereço informado pelo cliente.
            </p>
          </Section>

          <Section title="3. Velocidade da Internet">
            <p>
              A velocidade contratada pode sofrer variações em razão de fatores técnicos,
              interferências, condições da rede, equipamentos do cliente e horários de pico,
              respeitando os índices mínimos previstos pela ANATEL.
            </p>
          </Section>

          <Section title="4. Instalação">
            <p>
              A instalação dos serviços está sujeita à viabilidade técnica e a agendamento
              prévio, podendo ser reagendada em caso de impossibilidade no local.
            </p>
          </Section>

          <Section title="5. Planos e Condições">
            <p>
              Os valores, ofertas, promoções e condições comerciais podem ser alterados a
              qualquer momento, sem aviso prévio, sendo aplicáveis as condições vigentes
              no ato da contratação.
            </p>
          </Section>

          <Section title="6. Fidelidade">
            <p>
              Todos os planos possuem fidelidade mínima de <strong>12 meses</strong>. O
              cancelamento antes do prazo implicará multa equivalente a <strong>10%</strong> do
              valor proporcional aos meses restantes do contrato, conforme previsto em contrato.
            </p>
          </Section>

          <Section title="7. Uso Indevido">
            <p>
              O uso inadequado dos serviços, inclusive para fins ilícitos, fraude ou
              compartilhamento não autorizado, poderá resultar em suspensão ou cancelamento
              imediato do contrato, sem prejuízo das sanções legais cabíveis.
            </p>
          </Section>

          <Section title="8. Limitação de Responsabilidade">
            <p>
              A {siteConfig.company.name} não se responsabiliza por danos indiretos, lucros
              cessantes ou indisponibilidades decorrentes de fatores externos, caso fortuito ou
              força maior.
            </p>
          </Section>

          <Section title="9. Propriedade Intelectual">
            <p>
              Todo o conteúdo deste site (textos, imagens, marcas, logotipos) é de propriedade
              da {siteConfig.company.name} e protegido pelas leis de direitos autorais.
            </p>
          </Section>

          <Section title="10. Foro">
            <p>
              Fica eleito o foro da comarca de <strong>Balneário Camboriú/SC</strong> para
              dirimir quaisquer controvérsias decorrentes destes Termos de Uso.
            </p>
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
      <div className="text-base leading-relaxed text-muted-foreground space-y-3 [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
