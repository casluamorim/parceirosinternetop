import {
  Globe,
  Wifi,
  Gauge,
  Wrench,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Copyright,
  Landmark,
} from "lucide-react";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import { siteConfig } from "@/lib/config";

const TOC = [
  { id: "uso-site", label: "1. Uso do Site" },
  { id: "disponibilidade", label: "2. Disponibilidade" },
  { id: "velocidade", label: "3. Velocidade" },
  { id: "instalacao", label: "4. Instalação" },
  { id: "planos", label: "5. Planos e Condições" },
  { id: "fidelidade", label: "6. Fidelidade" },
  { id: "uso-indevido", label: "7. Uso Indevido" },
  { id: "responsabilidade", label: "8. Responsabilidade" },
  { id: "propriedade", label: "9. Propriedade Intelectual" },
  { id: "foro", label: "10. Foro" },
];

export default function TermosUso() {
  return (
    <LegalLayout
      title="Termos de Uso"
      toc={TOC}
      intro={
        <p>
          Ao acessar este site, o usuário declara estar ciente e concordar integralmente com os
          presentes Termos de Uso da {siteConfig.company.name}.
        </p>
      }
    >
      <LegalSection id="uso-site" title="1. Uso do Site" icon={<Globe className="w-5 h-5" />}>
        <p>
          O usuário se compromete a utilizar este site de forma adequada, ética e em
          conformidade com a legislação brasileira vigente.
        </p>
      </LegalSection>

      <LegalSection id="disponibilidade" title="2. Disponibilidade do Serviço" icon={<Wifi className="w-5 h-5" />}>
        <p>
          A disponibilidade dos serviços de internet pode variar conforme análise técnica,
          viabilidade de infraestrutura e localização do endereço informado pelo cliente.
        </p>
      </LegalSection>

      <LegalSection id="velocidade" title="3. Velocidade da Internet" icon={<Gauge className="w-5 h-5" />}>
        <p>
          A velocidade contratada pode sofrer variações em razão de fatores técnicos,
          interferências, condições da rede, equipamentos do cliente e horários de pico,
          respeitando os índices mínimos previstos pela ANATEL.
        </p>
      </LegalSection>

      <LegalSection id="instalacao" title="4. Instalação" icon={<Wrench className="w-5 h-5" />}>
        <p>
          A instalação dos serviços está sujeita à viabilidade técnica e a agendamento
          prévio, podendo ser reagendada em caso de impossibilidade no local.
        </p>
      </LegalSection>

      <LegalSection id="planos" title="5. Planos e Condições" icon={<Tag className="w-5 h-5" />}>
        <p>
          Os valores, ofertas, promoções e condições comerciais podem ser alterados a
          qualquer momento, sem aviso prévio, sendo aplicáveis as condições vigentes
          no ato da contratação.
        </p>
      </LegalSection>

      <LegalSection id="fidelidade" title="6. Fidelidade" icon={<ShieldCheck className="w-5 h-5" />}>
        <p>
          Todos os planos possuem fidelidade mínima de <strong>12 meses</strong>. O
          cancelamento antes do prazo implicará multa equivalente a <strong>10%</strong> do
          valor proporcional aos meses restantes do contrato, conforme previsto em contrato.
        </p>
      </LegalSection>

      <LegalSection id="uso-indevido" title="7. Uso Indevido" icon={<AlertTriangle className="w-5 h-5" />}>
        <p>
          O uso inadequado dos serviços, inclusive para fins ilícitos, fraude ou
          compartilhamento não autorizado, poderá resultar em suspensão ou cancelamento
          imediato do contrato, sem prejuízo das sanções legais cabíveis.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidade" title="8. Limitação de Responsabilidade" icon={<Scale className="w-5 h-5" />}>
        <p>
          A {siteConfig.company.name} não se responsabiliza por danos indiretos, lucros
          cessantes ou indisponibilidades decorrentes de fatores externos, caso fortuito ou
          força maior.
        </p>
      </LegalSection>

      <LegalSection id="propriedade" title="9. Propriedade Intelectual" icon={<Copyright className="w-5 h-5" />}>
        <p>
          Todo o conteúdo deste site (textos, imagens, marcas, logotipos) é de propriedade
          da {siteConfig.company.name} e protegido pelas leis de direitos autorais.
        </p>
      </LegalSection>

      <LegalSection id="foro" title="10. Foro" icon={<Landmark className="w-5 h-5" />}>
        <p>
          Fica eleito o foro da comarca de <strong>Balneário Camboriú/SC</strong> para
          dirimir quaisquer controvérsias decorrentes destes Termos de Uso.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
