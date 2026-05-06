import {
  Database,
  Megaphone,
  Cookie,
  Scale,
  Lock,
  Clock,
  UserCheck,
  Share2,
  Mail,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import { LgpdRequestForm } from "@/components/legal/LgpdRequestForm";
import { siteConfig } from "@/lib/config";

const TOC = [
  { id: "coleta", label: "1. Coleta de Dados" },
  { id: "uso", label: "2. Uso das Informações" },
  { id: "marketing", label: "3. Marketing e Anúncios" },
  { id: "cookies", label: "4. Uso de Cookies" },
  { id: "base-legal", label: "5. Base Legal (LGPD)" },
  { id: "seguranca", label: "6. Segurança dos Dados" },
  { id: "armazenamento", label: "7. Tempo de Armazenamento" },
  { id: "direitos", label: "8. Direitos do Usuário" },
  { id: "compartilhamento", label: "9. Compartilhamento" },
  { id: "contato", label: "10. Contato" },
  { id: "lgpd-form", label: "🔐 Solicitação LGPD" },
];

export default function PoliticaPrivacidade() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      toc={TOC}
      intro={
        <p>
          A {siteConfig.company.name} valoriza a sua privacidade e se compromete a proteger
          os dados pessoais coletados através deste site, em conformidade com a Lei Geral de
          Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
        </p>
      }
    >
      <LegalSection id="coleta" title="1. Coleta de Dados" icon={<Database className="w-5 h-5" />}>
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
      </LegalSection>

      <LegalSection id="uso" title="2. Uso das Informações" icon={<FileText className="w-5 h-5" />}>
        <p>Utilizamos os dados para:</p>
        <ul>
          <li>Entrar em contato com o cliente</li>
          <li>Oferecer e prestar nossos serviços de internet</li>
          <li>Realizar campanhas de marketing e remarketing</li>
          <li>Melhorar a experiência de navegação no site</li>
        </ul>
      </LegalSection>

      <LegalSection id="marketing" title="3. Marketing e Anúncios" icon={<Megaphone className="w-5 h-5" />}>
        <p>
          Utilizamos ferramentas como <strong>Facebook Ads</strong> e <strong>Google Ads</strong>{" "}
          para exibir anúncios personalizados e realizar campanhas de remarketing aos usuários
          que demonstraram interesse em nossos serviços.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="4. Uso de Cookies" icon={<Cookie className="w-5 h-5" />}>
        <p>
          Utilizamos cookies para melhorar a experiência do usuário, personalizar conteúdos e
          analisar o desempenho do site.
        </p>

        <h3 className="font-display font-bold text-foreground text-lg mt-4">Tipos de cookies utilizados</h3>
        <div className="grid sm:grid-cols-3 gap-3 not-prose">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="font-semibold text-foreground mb-1">Essenciais</p>
            <p className="text-sm">Necessários para o funcionamento básico do site.</p>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="font-semibold text-foreground mb-1">Desempenho</p>
            <p className="text-sm">Ajudam a entender como o site é utilizado.</p>
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="font-semibold text-foreground mb-1">Marketing</p>
            <p className="text-sm">Permitem anúncios personalizados e remarketing.</p>
          </div>
        </div>

        <h3 className="font-display font-bold text-foreground text-lg mt-4">Ferramentas utilizadas</h3>
        <ul>
          <li>Meta (Facebook Ads)</li>
          <li>Google Ads</li>
          <li>Google Analytics</li>
        </ul>

        <h3 className="font-display font-bold text-foreground text-lg mt-4">Controle de cookies</h3>
        <p>O usuário pode gerenciar ou desativar cookies diretamente no navegador.</p>
      </LegalSection>

      <LegalSection id="base-legal" title="5. Base Legal (LGPD)" icon={<Scale className="w-5 h-5" />}>
        <p>O tratamento de dados é realizado com base nas hipóteses legais previstas na LGPD, como:</p>
        <ul>
          <li>Consentimento do usuário</li>
          <li>Execução de contrato</li>
          <li>Cumprimento de obrigações legais ou regulatórias</li>
          <li>Legítimo interesse</li>
        </ul>
      </LegalSection>

      <LegalSection id="seguranca" title="6. Segurança dos Dados" icon={<Lock className="w-5 h-5" />}>
        <p>
          Adotamos medidas técnicas e administrativas adequadas para proteger as informações
          contra acessos não autorizados, perdas, alterações ou destruição indevida.
        </p>
      </LegalSection>

      <LegalSection id="armazenamento" title="7. Tempo de Armazenamento" icon={<Clock className="w-5 h-5" />}>
        <p>
          Os dados são armazenados apenas pelo tempo necessário para cumprir as finalidades
          descritas nesta política ou para atender obrigações legais.
        </p>
      </LegalSection>

      <LegalSection id="direitos" title="8. Direitos do Usuário" icon={<UserCheck className="w-5 h-5" />}>
        <p>Nos termos da LGPD, o usuário pode solicitar a qualquer momento:</p>
        <ul>
          <li>Acesso aos seus dados pessoais</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados</li>
          <li>Anonimização, bloqueio ou eliminação dos dados</li>
          <li>Portabilidade dos dados</li>
          <li>Revogação do consentimento</li>
        </ul>
      </LegalSection>

      <LegalSection id="compartilhamento" title="9. Compartilhamento com Terceiros" icon={<Share2 className="w-5 h-5" />}>
        <p>
          Não vendemos dados pessoais. Podemos compartilhar informações estritamente
          necessárias com parceiros operacionais (ex.: instalação, faturamento, plataformas
          de anúncios) sempre dentro das finalidades aqui descritas.
        </p>
      </LegalSection>

      <LegalSection id="contato" title="10. Contato" icon={<Mail className="w-5 h-5" />}>
        <p>
          Para dúvidas, exercício de direitos ou solicitações relacionadas aos seus dados,
          entre em contato pelos canais oficiais:
        </p>
        <ul>
          <li>WhatsApp: {siteConfig.contact.whatsappDisplay}</li>
          <li>Telefone: {siteConfig.contact.phone}</li>
          <li>Endereço: {siteConfig.address.full}</li>
        </ul>
      </LegalSection>

      <LegalSection
        id="lgpd-form"
        title="Solicitação de Dados (LGPD)"
        icon={<ShieldCheck className="w-5 h-5" />}
      >
        <p className="mb-4">
          Use o formulário abaixo para exercer seus direitos como titular de dados pessoais.
        </p>
        <LgpdRequestForm />
      </LegalSection>
    </LegalLayout>
  );
}
