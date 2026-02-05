 import { useState, useEffect } from "react";
 import { Save, RefreshCw } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Switch } from "@/components/ui/switch";
 import { useToast } from "@/hooks/use-toast";
 import { supabase } from "@/integrations/supabase/client";
 import { siteConfig } from "@/lib/config";
 
 interface SiteSettings {
   promo_active: boolean;
   promo_banner_text: string;
   promo_discount: string;
   promo_discount_text: string;
   company_phone: string;
   company_whatsapp: string;
   company_email: string;
 }
 
 const defaultSettings: SiteSettings = {
   promo_active: true,
   promo_banner_text: siteConfig.promo.bannerText,
   promo_discount: siteConfig.promo.discount,
   promo_discount_text: siteConfig.promo.discountText,
   company_phone: siteConfig.contact.phone,
   company_whatsapp: siteConfig.contact.whatsappDisplay,
   company_email: siteConfig.contact.email,
 };
 
 export function SettingsTab() {
   const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
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
       ]);
 
       toast({ title: "Sucesso", description: "Configurações salvas!" });
     } catch (error: any) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } finally {
       setSaving(false);
     }
   };
 
   if (loading) {
     return (
       <div className="text-center py-8 text-muted-foreground">Carregando...</div>
     );
   }
 
   return (
     <div className="space-y-6">
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