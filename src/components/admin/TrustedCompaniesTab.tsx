 import { useState, useEffect } from "react";
 import { Trash2, RefreshCw, Plus, Upload, X } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { useToast } from "@/hooks/use-toast";
 import { supabase } from "@/integrations/supabase/client";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from "@/components/ui/alert-dialog";
 
 interface TrustedCompany {
   id: string;
   name: string;
   logo_url: string;
   display_order: number;
 }
 
 export function TrustedCompaniesTab() {
   const [companies, setCompanies] = useState<TrustedCompany[]>([]);
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [name, setName] = useState("");
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string | null>(null);
   const { toast } = useToast();
 
   const fetchCompanies = async () => {
     setLoading(true);
     const { data, error } = await supabase
       .from("trusted_companies")
       .select("*")
       .order("display_order");
 
     if (error) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } else {
       setCompanies(data || []);
     }
     setLoading(false);
   };
 
   useEffect(() => {
     fetchCompanies();
   }, []);
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       setSelectedFile(file);
       const reader = new FileReader();
       reader.onloadend = () => {
         setPreview(reader.result as string);
       };
       reader.readAsDataURL(file);
     }
   };
 
   const resetForm = () => {
     setName("");
     setSelectedFile(null);
     setPreview(null);
   };
 
   const handleUpload = async () => {
     if (!name || !selectedFile) {
       toast({ title: "Erro", description: "Preencha o nome e selecione uma imagem.", variant: "destructive" });
       return;
     }
 
     setUploading(true);
 
     try {
       // Upload image to storage
       const fileExt = selectedFile.name.split(".").pop();
       const fileName = `${Date.now()}.${fileExt}`;
       const filePath = `logos/${fileName}`;
 
       const { error: uploadError } = await supabase.storage
         .from("company-logos")
         .upload(filePath, selectedFile);
 
       if (uploadError) throw uploadError;
 
       // Get public URL
       const { data: urlData } = supabase.storage
         .from("company-logos")
         .getPublicUrl(filePath);
 
       // Insert into database
       const { error: insertError } = await supabase.from("trusted_companies").insert({
         name,
         logo_url: urlData.publicUrl,
         display_order: companies.length,
       });
 
       if (insertError) throw insertError;
 
       toast({ title: "Sucesso", description: "Logo adicionado!" });
       setIsDialogOpen(false);
       resetForm();
       fetchCompanies();
     } catch (error: any) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } finally {
       setUploading(false);
     }
   };
 
   const handleDelete = async (company: TrustedCompany) => {
     try {
       // Extract file path from URL
       const urlParts = company.logo_url.split("/company-logos/");
       if (urlParts.length > 1) {
         const filePath = urlParts[1];
         await supabase.storage.from("company-logos").remove([filePath]);
       }
 
       const { error } = await supabase.from("trusted_companies").delete().eq("id", company.id);
       if (error) throw error;
 
       toast({ title: "Sucesso", description: "Logo removido!" });
       fetchCompanies();
     } catch (error: any) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     }
   };
 
   return (
     <Card>
       <CardHeader className="flex flex-row items-center justify-between">
         <div>
           <CardTitle>Empresas Parceiras</CardTitle>
           <CardDescription>Logos de empresas que confiam na sua internet</CardDescription>
         </div>
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={fetchCompanies} disabled={loading}>
             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
           </Button>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
             <DialogTrigger asChild>
               <Button onClick={resetForm}>
                 <Plus className="w-4 h-4 mr-2" />
                 Adicionar Logo
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Adicionar Empresa Parceira</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-2">
                   <Label>Nome da Empresa</Label>
                   <Input
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Ex: Empresa XYZ"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Logo da Empresa</Label>
                   <div className="flex items-center gap-4">
                     <label className="flex-1">
                       <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                         {preview ? (
                           <div className="relative">
                             <img
                               src={preview}
                               alt="Preview"
                               className="max-h-24 mx-auto object-contain"
                             />
                             <button
                               type="button"
                               onClick={(e) => {
                                 e.preventDefault();
                                 setSelectedFile(null);
                                 setPreview(null);
                               }}
                               className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           </div>
                         ) : (
                           <div className="text-muted-foreground">
                             <Upload className="w-8 h-8 mx-auto mb-2" />
                             <p className="text-sm">Clique para selecionar</p>
                             <p className="text-xs">PNG, JPG ou SVG</p>
                           </div>
                         )}
                       </div>
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleFileChange}
                         className="hidden"
                       />
                     </label>
                   </div>
                 </div>
               </div>
               <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                   Cancelar
                 </Button>
                 <Button onClick={handleUpload} disabled={uploading}>
                   {uploading ? "Enviando..." : "Adicionar"}
                 </Button>
               </div>
             </DialogContent>
           </Dialog>
         </div>
       </CardHeader>
       <CardContent>
         {loading ? (
           <div className="text-center py-8 text-muted-foreground">Carregando...</div>
         ) : companies.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground">
             Nenhuma empresa cadastrada. Os logos aparecerão na seção empresarial do site.
           </div>
         ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {companies.map((company) => (
               <div
                 key={company.id}
                 className="relative group border rounded-lg p-4 flex flex-col items-center"
               >
                 <img
                   src={company.logo_url}
                   alt={company.name}
                   className="h-16 w-auto object-contain mb-2"
                 />
                 <p className="text-sm font-medium text-center">{company.name}</p>
                 <AlertDialog>
                   <AlertDialogTrigger asChild>
                     <Button
                       variant="destructive"
                       size="sm"
                       className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                     >
                       <Trash2 className="w-3 h-3" />
                     </Button>
                   </AlertDialogTrigger>
                   <AlertDialogContent>
                     <AlertDialogHeader>
                       <AlertDialogTitle>Remover logo?</AlertDialogTitle>
                       <AlertDialogDescription>
                         O logo de "{company.name}" será removido do site.
                       </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
                       <AlertDialogAction onClick={() => handleDelete(company)}>
                         Remover
                       </AlertDialogAction>
                     </AlertDialogFooter>
                   </AlertDialogContent>
                 </AlertDialog>
               </div>
             ))}
           </div>
         )}
       </CardContent>
     </Card>
   );
 }