import { useState, useEffect, useRef, useMemo } from "react";
import { Save, RefreshCw, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/config";
import {
  formatMonth, MonthFormat,
  formatSeason, SeasonFormat, Hemisphere,
  TIMEZONE_OPTIONS, LOCALE_OPTIONS, MONTH_FORMAT_OPTIONS,
  HEMISPHERE_OPTIONS, SEASON_FORMAT_OPTIONS,
} from "@/lib/month-format";

interface SiteSettings {
  promo_active: boolean;
  promo_banner_text: string;
  promo_discount: string;
  promo_discount_text: string;
  company_phone: string;
  company_whatsapp: string;
  company_email: string;
  company_logo_url: string;
  month_timezone: string;
  month_locale: string;
  month_format: MonthFormat;
}

const defaultSettings: SiteSettings = {
  promo_active: true,
  promo_banner_text: siteConfig.promo.bannerText,
  promo_discount: siteConfig.promo.discount,
  promo_discount_text: siteConfig.promo.discountText,
  company_phone: siteConfig.contact.phone,
  company_whatsapp: siteConfig.contact.whatsappDisplay,
  company_email: siteConfig.contact.email,
  company_logo_url: "",
  month_timezone: "America/Sao_Paulo",
  month_locale: "pt-BR",
  month_format: "title",
};

export function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
 
   const fetchSettings = async () => {
     setLoading(true);
     const { data, error } = await supabase
       .from("site_settings")
       .select("key, value");
 
     if (error) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } else if (data) {
       const settingsMap: Record<string, any> = {};
       data.forEach((item) => {
         settingsMap[item.key] = item.value;
       });
 
       setSettings({
         promo_active: settingsMap.promo_active ?? defaultSettings.promo_active,
         promo_banner_text: settingsMap.promo_banner_text ?? defaultSettings.promo_banner_text,
         promo_discount: settingsMap.promo_discount ?? defaultSettings.promo_discount,
         promo_discount_text: settingsMap.promo_discount_text ?? defaultSettings.promo_discount_text,
         company_phone: settingsMap.company_phone ?? defaultSettings.company_phone,
         company_whatsapp: settingsMap.company_whatsapp ?? defaultSettings.company_whatsapp,
         company_email: settingsMap.company_email ?? defaultSettings.company_email,
         company_logo_url: settingsMap.company_logo_url ?? defaultSettings.company_logo_url,
         month_timezone: settingsMap.month_timezone ?? defaultSettings.month_timezone,
         month_locale: settingsMap.month_locale ?? defaultSettings.month_locale,
         month_format: (settingsMap.month_format as MonthFormat) ?? defaultSettings.month_format,
       });
     }
     setLoading(false);
   };
 
   useEffect(() => {
     fetchSettings();
   }, []);
 
   const saveSetting = async (key: string, value: any) => {
     const { error } = await supabase
       .from("site_settings")
       .upsert({ key, value }, { onConflict: "key" });
 
     if (error) throw error;
   };
 
   const handleSave = async () => {
     setSaving(true);
     try {
       await Promise.all([
         saveSetting("promo_active", settings.promo_active),
         saveSetting("promo_banner_text", settings.promo_banner_text),
         saveSetting("promo_discount", settings.promo_discount),
         saveSetting("promo_discount_text", settings.promo_discount_text),
         saveSetting("company_phone", settings.company_phone),
         saveSetting("company_whatsapp", settings.company_whatsapp),
        saveSetting("company_email", settings.company_email),
         saveSetting("company_logo_url", settings.company_logo_url),
         saveSetting("month_timezone", settings.month_timezone),
         saveSetting("month_locale", settings.month_locale),
         saveSetting("month_format", settings.month_format),
       ]);
 
       toast({ title: "Sucesso", description: "Configurações salvas!" });
     } catch (error: any) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } finally {
       setSaving(false);
     }
   };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione uma imagem.", variant: "destructive" });
      return;
    }
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      const url = data.publicUrl;
      await saveSetting("company_logo_url", url);
      setSettings((prev) => ({ ...prev, company_logo_url: url }));
      toast({ title: "Sucesso", description: "Logo atualizada!" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await saveSetting("company_logo_url", "");
      setSettings((prev) => ({ ...prev, company_logo_url: "" }));
      toast({ title: "Logo removida" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Carregando...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Logo da Empresa</CardTitle>
          <CardDescription>Envie a logo que aparecerá no cabeçalho do site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
              {settings.company_logo_url ? (
                <img src={settings.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground text-center px-2">Sem logo</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingLogo ? "Enviando..." : "Enviar logo"}
              </Button>
              {settings.company_logo_url && (
                <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ou cole a URL da logo</Label>
            <Input
              value={settings.company_logo_url}
              onChange={(e) => setSettings((prev) => ({ ...prev, company_logo_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>


       {/* Promo Settings */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <div>
             <CardTitle>Promoção Ativa</CardTitle>
             <CardDescription>Configure a barra de promoção exibida no topo do site</CardDescription>
           </div>
           <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading}>
             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
           </Button>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
             <Switch
               checked={settings.promo_active}
               onCheckedChange={(checked) =>
                 setSettings((prev) => ({ ...prev, promo_active: checked }))
               }
             />
             <div>
               <Label className="text-base">Promoção Ativa</Label>
               <p className="text-sm text-muted-foreground">
                 Ativa ou desativa a barra de promoção no topo do site
               </p>
             </div>
           </div>
 
           <div className="space-y-2">
             <Label>Texto do Banner</Label>
             <Input
               value={settings.promo_banner_text}
               onChange={(e) =>
                 setSettings((prev) => ({ ...prev, promo_banner_text: e.target.value }))
               }
               placeholder="Ex: 🎉 Promoção especial!"
             />
           </div>
 
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Desconto</Label>
               <Input
                 value={settings.promo_discount}
                 onChange={(e) =>
                   setSettings((prev) => ({ ...prev, promo_discount: e.target.value }))
                 }
                 placeholder="Ex: 50%"
               />
             </div>
             <div className="space-y-2">
               <Label>Texto do Desconto</Label>
               <Input
                 value={settings.promo_discount_text}
                 onChange={(e) =>
                   setSettings((prev) => ({ ...prev, promo_discount_text: e.target.value }))
                 }
                 placeholder="Ex: de desconto na instalação"
               />
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Contact Settings */}
       <Card>
         <CardHeader>
           <CardTitle>Informações de Contato</CardTitle>
           <CardDescription>Configure os dados de contato exibidos no site</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Telefone</Label>
               <Input
                 value={settings.company_phone}
                 onChange={(e) =>
                   setSettings((prev) => ({ ...prev, company_phone: e.target.value }))
                 }
                 placeholder="(00) 0000-0000"
               />
             </div>
             <div className="space-y-2">
               <Label>WhatsApp</Label>
               <Input
                 value={settings.company_whatsapp}
                 onChange={(e) =>
                   setSettings((prev) => ({ ...prev, company_whatsapp: e.target.value }))
                 }
                 placeholder="(00) 00000-0000"
               />
             </div>
           </div>
           <div className="space-y-2">
             <Label>Email</Label>
             <Input
               value={settings.company_email}
               onChange={(e) =>
                 setSettings((prev) => ({ ...prev, company_email: e.target.value }))
               }
               placeholder="contato@empresa.com"
             />
           </div>
         </CardContent>
       </Card>
 
       {/* Month / Timezone Settings */}
       <MonthSettingsCard
         settings={settings}
         setSettings={setSettings}
       />


 
       {/* Save Button */}
       <div className="flex justify-end">
         <Button onClick={handleSave} disabled={saving} size="lg">
           <Save className="w-4 h-4 mr-2" />
           {saving ? "Salvando..." : "Salvar Configurações"}
         </Button>
       </div>
     </div>
   );
  }

function MonthSettingsCard({
  settings,
  setSettings,
}: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}) {
  const preview = useMemo(
    () => formatMonth(new Date(), settings.month_format, settings.month_timezone, settings.month_locale),
    [settings.month_format, settings.month_timezone, settings.month_locale],
  );
  const tzGuess = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fuso horário e formato do mês</CardTitle>
        <CardDescription>
          Define como o nome do mês atual aparece nos textos automáticos do site (ex.: banner promocional).
          Use <code>{"{mes}"}</code> ou <code>{"{MES}"}</code> no texto, ou simplesmente escreva o nome de um mês —
          ele será substituído automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Fuso horário</Label>
            <Select
              value={settings.month_timezone}
              onValueChange={(v) => setSettings((p) => ({ ...p, month_timezone: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[settings.month_timezone, ...TIMEZONE_OPTIONS]
                  .filter((v, i, arr) => v && arr.indexOf(v) === i)
                  .map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Fuso detectado no navegador: {tzGuess}</p>
          </div>

          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select
              value={settings.month_locale}
              onValueChange={(v) => setSettings((p) => ({ ...p, month_locale: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCALE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato do mês</Label>
            <Select
              value={settings.month_format}
              onValueChange={(v) => setSettings((p) => ({ ...p, month_format: v as MonthFormat }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTH_FORMAT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg text-sm">
          <span className="text-muted-foreground">Pré-visualização do mês atual: </span>
          <strong>{preview}</strong>
        </div>
      </CardContent>
    </Card>
  );
}
