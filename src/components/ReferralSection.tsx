import { useState } from "react";
import { Gift, Loader2, Check, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function ReferralSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    referrerName: "",
    referrerWhatsapp: "",
    referredName: "",
    referredWhatsapp: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Referral submitted:", formData);

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Quero indicar um amigo para a ${siteConfig.company.name} e ganhar desconto!`
    );
    window.open(
      `https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              Programa de indicação
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Indique um amigo e ganhe desconto
            </h2>
            <p className="text-lg text-white/80 mb-6">
              Indique amigos e familiares para a Parceiros Internet. Quando eles 
              assinarem, você ganha desconto na sua próxima fatura!
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-white/90">R$ 50 de desconto por indicação</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-white/90">Sem limite de indicações</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-white/90">Seu amigo também ganha desconto</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl">
            {isSuccess ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Indicação enviada!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Entraremos em contato com seu amigo. Quando ele assinar, seu 
                  desconto será aplicado automaticamente!
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      referrerName: "",
                      referrerWhatsapp: "",
                      referredName: "",
                      referredWhatsapp: "",
                    });
                  }}
                  className="btn-outline-primary"
                >
                  Indicar outro amigo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-4">
                  Preencha os dados
                </h3>

                {/* Referrer Info */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Seus dados</p>
                  <input
                    type="text"
                    name="referrerName"
                    value={formData.referrerName}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                    className="input-premium"
                    required
                  />
                  <input
                    type="tel"
                    name="referrerWhatsapp"
                    value={formData.referrerWhatsapp}
                    onChange={handleInputChange}
                    placeholder="Seu WhatsApp"
                    className="input-premium"
                    required
                  />
                </div>

                {/* Referred Info */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Dados do seu amigo</p>
                  <input
                    type="text"
                    name="referredName"
                    value={formData.referredName}
                    onChange={handleInputChange}
                    placeholder="Nome do amigo"
                    className="input-premium"
                    required
                  />
                  <input
                    type="tel"
                    name="referredWhatsapp"
                    value={formData.referredWhatsapp}
                    onChange={handleInputChange}
                    placeholder="WhatsApp do amigo"
                    className="input-premium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar indicação"
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Prefere indicar pelo WhatsApp?
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
