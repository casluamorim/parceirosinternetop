import { useState } from "react";
import { X, MessageCircle, Loader2, Check, Copy } from "lucide-react";
import { siteConfig } from "@/lib/config";
import type { PlanItem } from "./PlansSection";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  planItem: PlanItem | null;
}

type ContractPath = "online" | "whatsapp" | null;

export function ContractModal({ isOpen, onClose, planItem }: ContractModalProps) {
  const [selectedPath, setSelectedPath] = useState<ContractPath>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    cpfCnpj: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: siteConfig.coverage.cities[0],
    phone: "",
    whatsapp: "",
    email: "",
    installationTime: "manha",
    observations: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateProtocol = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PI${timestamp}${random}`;
  };

  const handleOnlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const protocol = generateProtocol();
    setProtocolNumber(protocol);
    console.log("Contract data:", { plan: planItem, customer: formData, protocol });
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleWhatsApp = () => {
    if (!planItem) return;
    const message = encodeURIComponent(
      `Olá! Gostaria de contratar o plano ${planItem.name} de ${planItem.speed} Mega.

📍 Meus dados:
Nome: ${formData.fullName || "(a confirmar)"}
Cidade: ${formData.city}
Bairro: ${formData.neighborhood || "(a confirmar)"}

Por favor, confirmem endereço e horário para instalação!`
    );
    window.open(`https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`, "_blank");
    onClose();
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocolNumber);
  };

  const resetModal = () => {
    setSelectedPath(null);
    setIsSuccess(false);
    setProtocolNumber("");
    setFormData({
      fullName: "", cpfCnpj: "", cep: "", address: "", number: "",
      complement: "", neighborhood: "", city: siteConfig.coverage.cities[0],
      phone: "", whatsapp: "", email: "", installationTime: "manha", observations: "",
    });
  };

  const handleClose = () => { resetModal(); onClose(); };

  if (!isOpen || !planItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-background rounded-2xl shadow-xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 lg:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {isSuccess ? "Pedido enviado!" : `Contratar ${planItem.name}`}
            </h2>
            {!isSuccess && (
              <p className="text-sm text-muted-foreground">
                {planItem.speed} Mega • R$ {Number(planItem.price).toFixed(2).replace(".", ",")}/mês
              </p>
            )}
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 lg:p-6">
          {/* Success */}
          {isSuccess && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">Solicitação recebida!</h3>
              <p className="text-muted-foreground mb-6">Entraremos em contato em breve para confirmar a instalação.</p>
              <div className="inline-flex items-center gap-2 bg-muted px-4 py-3 rounded-lg mb-6">
                <span className="text-sm text-muted-foreground">Protocolo:</span>
                <span className="font-mono font-bold text-foreground">{protocolNumber}</span>
                <button onClick={copyProtocol} className="p-1 hover:bg-background rounded transition-colors">
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Um email de confirmação foi enviado para {formData.email}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleClose} className="btn-primary">Fechar</button>
                <button onClick={() => {
                  const msg = encodeURIComponent(`Olá! Acabei de fazer um pedido de internet. Meu protocolo é ${protocolNumber}. Podem confirmar?`);
                  window.open(`https://wa.me/${siteConfig.contact.whatsapp}?text=${msg}`, "_blank");
                }} className="btn-whatsapp">
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* Path Selection */}
          {!selectedPath && !isSuccess && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-center text-muted-foreground mb-6">Como você prefere fazer a contratação?</p>
              <button onClick={() => setSelectedPath("online")} className="w-full p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Contratação online</h3>
                    <p className="text-sm text-muted-foreground">Preencha o formulário e receba a confirmação por email</p>
                  </div>
                </div>
              </button>
              <button onClick={handleWhatsApp} className="w-full p-6 rounded-xl border-2 border-whatsapp hover:bg-whatsapp/5 transition-all text-left group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-whatsapp/10 flex items-center justify-center group-hover:bg-whatsapp/20 transition-colors">
                    <MessageCircle className="w-6 h-6 text-whatsapp" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Atendimento humanizado</h3>
                    <p className="text-sm text-muted-foreground">Fale com um atendente no WhatsApp e tire suas dúvidas</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Online Form */}
          {selectedPath === "online" && !isSuccess && (
            <form onSubmit={handleOnlineSubmit} className="space-y-6 animate-fade-in">
              <button type="button" onClick={() => setSelectedPath(null)} className="text-sm text-primary hover:underline mb-4">← Voltar</button>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Dados pessoais</h4>
                <div className="grid gap-4">
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nome completo" className="input-premium" required />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleInputChange} placeholder="CPF ou CNPJ" className="input-premium" required />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="input-premium" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Telefone" className="input-premium" required />
                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="WhatsApp" className="input-premium" required />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Endereço de instalação</h4>
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} placeholder="CEP" className="input-premium" required />
                    <select name="city" value={formData.city} onChange={handleInputChange} className="input-premium col-span-2" required>
                      {siteConfig.coverage.cities.map((city) => (<option key={city} value={city}>{city}</option>))}
                    </select>
                  </div>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Rua/Avenida" className="input-premium" required />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" name="number" value={formData.number} onChange={handleInputChange} placeholder="Número" className="input-premium" required />
                    <input type="text" name="complement" value={formData.complement} onChange={handleInputChange} placeholder="Complemento" className="input-premium" />
                    <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} placeholder="Bairro" className="input-premium" required />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Instalação</h4>
                <div className="grid gap-4">
                  <select name="installationTime" value={formData.installationTime} onChange={handleInputChange} className="input-premium" required>
                    <option value="manha">Manhã (8h às 12h)</option>
                    <option value="tarde">Tarde (13h às 17h)</option>
                    <option value="noite">Noite (18h às 20h)</option>
                  </select>
                  <textarea name="observations" value={formData.observations} onChange={handleInputChange} placeholder="Observações (opcional)" rows={3} className="input-premium resize-none" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-lg disabled:opacity-50">
                {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>) : "Confirmar contratação"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
