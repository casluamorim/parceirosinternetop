 import { useState, useEffect } from "react";
 import { Trash2, RefreshCw, Plus, Pencil, Save, X, Star } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
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
 
 interface Testimonial {
   id: string;
   name: string;
   location: string;
   text: string;
   rating: number;
 }
 
 export function TestimonialsTab() {
   const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
   const [loading, setLoading] = useState(true);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     name: "",
     location: "",
     text: "",
     rating: 5,
   });
 
   const fetchTestimonials = async () => {
     setLoading(true);
     const { data, error } = await supabase
       .from("testimonials")
       .select("*")
       .order("created_at", { ascending: false });
 
     if (error) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } else {
       setTestimonials(data || []);
     }
     setLoading(false);
   };
 
   useEffect(() => {
     fetchTestimonials();
   }, []);
 
   const resetForm = () => {
     setFormData({ name: "", location: "", text: "", rating: 5 });
   };
 
   const handleCreate = async () => {
     if (!formData.name || !formData.location || !formData.text) {
       toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
       return;
     }
 
     const { error } = await supabase.from("testimonials").insert({
       name: formData.name,
       location: formData.location,
       text: formData.text,
       rating: formData.rating,
     });
 
     if (error) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } else {
       toast({ title: "Sucesso", description: "Depoimento adicionado!" });
       setIsNewDialogOpen(false);
       resetForm();
       fetchTestimonials();
     }
   };
 
   const handleUpdate = async (id: string) => {
     if (!formData.name || !formData.location || !formData.text) {
       toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
       return;
     }
 
     const { error } = await supabase
       .from("testimonials")
       .update({
         name: formData.name,
         location: formData.location,
         text: formData.text,
         rating: formData.rating,
       })
       .eq("id", id);
 
     if (error) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } else {
       toast({ title: "Sucesso", description: "Depoimento atualizado!" });
       setEditingId(null);
       resetForm();
       fetchTestimonials();
     }
   };
 
   const handleDelete = async (id: string) => {
     const { error } = await supabase.from("testimonials").delete().eq("id", id);
     if (error) {
       toast({ title: "Erro", description: error.message, variant: "destructive" });
     } else {
       toast({ title: "Sucesso", description: "Depoimento excluído!" });
       fetchTestimonials();
     }
   };
 
   const startEdit = (testimonial: Testimonial) => {
     setFormData({
       name: testimonial.name,
       location: testimonial.location,
       text: testimonial.text,
       rating: testimonial.rating,
     });
     setEditingId(testimonial.id);
   };
 
   const cancelEdit = () => {
     setEditingId(null);
     resetForm();
   };
 
   return (
     <Card>
       <CardHeader className="flex flex-row items-center justify-between">
         <div>
           <CardTitle>Depoimentos de Clientes</CardTitle>
           <CardDescription>Gerencie os depoimentos exibidos no site</CardDescription>
         </div>
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={fetchTestimonials} disabled={loading}>
             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
           </Button>
           <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
             <DialogTrigger asChild>
               <Button onClick={resetForm}>
                 <Plus className="w-4 h-4 mr-2" />
                 Novo Depoimento
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Novo Depoimento</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-2">
                   <Label>Nome do Cliente</Label>
                   <Input
                     value={formData.name}
                     onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                     placeholder="Ex: João Silva"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Localização</Label>
                   <Input
                     value={formData.location}
                     onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                     placeholder="Ex: Centro, Cidade"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Avaliação</Label>
                   <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <button
                         key={star}
                         type="button"
                         onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                         className="p-1"
                       >
                         <Star
                           className={`w-6 h-6 ${
                             star <= formData.rating
                               ? "fill-yellow-400 text-yellow-400"
                               : "text-muted-foreground"
                           }`}
                         />
                       </button>
                     ))}
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Depoimento</Label>
                   <Textarea
                     value={formData.text}
                     onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                     placeholder="O que o cliente disse sobre o serviço..."
                     rows={4}
                   />
                 </div>
               </div>
               <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                   Cancelar
                 </Button>
                 <Button onClick={handleCreate}>
                   <Save className="w-4 h-4 mr-2" />
                   Salvar
                 </Button>
               </div>
             </DialogContent>
           </Dialog>
         </div>
       </CardHeader>
       <CardContent>
         {loading ? (
           <div className="text-center py-8 text-muted-foreground">Carregando...</div>
         ) : testimonials.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground">Nenhum depoimento cadastrado</div>
         ) : (
           <div className="space-y-4">
             {testimonials.map((testimonial) => (
               <div key={testimonial.id} className="p-4 border rounded-lg">
                 {editingId === testimonial.id ? (
                   <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label>Nome</Label>
                         <Input
                           value={formData.name}
                           onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label>Localização</Label>
                         <Input
                           value={formData.location}
                           onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                         />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <Label>Avaliação</Label>
                       <div className="flex gap-1">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             key={star}
                             type="button"
                             onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                             className="p-1"
                           >
                             <Star
                               className={`w-5 h-5 ${
                                 star <= formData.rating
                                   ? "fill-yellow-400 text-yellow-400"
                                   : "text-muted-foreground"
                               }`}
                             />
                           </button>
                         ))}
                       </div>
                     </div>
                     <div className="space-y-2">
                       <Label>Depoimento</Label>
                       <Textarea
                         value={formData.text}
                         onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                         rows={3}
                       />
                     </div>
                     <div className="flex gap-2">
                       <Button size="sm" onClick={() => handleUpdate(testimonial.id)}>
                         <Save className="w-4 h-4 mr-2" />
                         Salvar
                       </Button>
                       <Button size="sm" variant="outline" onClick={cancelEdit}>
                         <X className="w-4 h-4 mr-2" />
                         Cancelar
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-semibold">{testimonial.name}</h4>
                         <span className="text-sm text-muted-foreground">• {testimonial.location}</span>
                       </div>
                       <div className="flex gap-0.5 mb-2">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <Star
                             key={star}
                             className={`w-4 h-4 ${
                               star <= testimonial.rating
                                 ? "fill-yellow-400 text-yellow-400"
                                 : "text-muted-foreground"
                             }`}
                           />
                         ))}
                       </div>
                       <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                     </div>
                     <div className="flex gap-2 ml-4">
                       <Button variant="outline" size="sm" onClick={() => startEdit(testimonial)}>
                         <Pencil className="w-4 h-4" />
                       </Button>
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button variant="outline" size="sm" className="text-destructive">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Excluir depoimento?</AlertDialogTitle>
                             <AlertDialogDescription>
                               Esta ação não pode ser desfeita. O depoimento de "{testimonial.name}" será removido.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancelar</AlertDialogCancel>
                             <AlertDialogAction onClick={() => handleDelete(testimonial.id)}>
                               Excluir
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                   </div>
                 )}
               </div>
             ))}
           </div>
         )}
       </CardContent>
     </Card>
   );
 }