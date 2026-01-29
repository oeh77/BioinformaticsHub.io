"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Loader2, CheckCircle2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  url: z.string().url("Must be a valid URL"),
  categoryId: z.string().min(1, "Please select a category"),
  pricing: z.string().optional(),
});

interface SuggestToolDialogProps {
  categories: { id: string; name: string }[];
  trigger?: React.ReactNode;
}

export function SuggestToolDialog({ categories, trigger }: SuggestToolDialogProps) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      categoryId: "",
      pricing: "Free",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch("/api/tools/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        if (res.status === 401) {
             toast({ title: "Authentication required", description: "Please login to suggest a tool", variant: "destructive" });
             return;
        }
        throw new Error("Failed to submit");
      }

      setSuccess(true);
      form.reset();
      toast({ title: "Success", description: "Tool suggested successfully! It will be reviewed shortly.", variant: "default" });
    } catch (error) {
       toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSuccess(false), 300); // Reset success state after close animation
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger || (
            <Button className="gap-2">
                <Plus className="w-4 h-4" /> Suggest Tool
            </Button>
        )}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={handleClose} className="max-w-xl">
           {success ? (
               <div className="text-center py-10">
                   <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                   <p className="text-muted-foreground mb-6">Your tool suggestion has been submitted for review.</p>
                   <Button onClick={handleClose} className="w-full">Close</Button>
               </div>
           ) : (
               <>
                <DialogHeader>
                    <DialogTitle>Suggest a Tool</DialogTitle>
                    <DialogDescription>
                        Know a great bioinformatics tool? Share it with the community.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tool Name</label>
                        <input 
                            {...form.register("name")}
                            className="w-full px-4 py-2 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary/50 outline-none"
                            placeholder="e.g. BLAST"
                        />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select 
                            {...form.register("categoryId")}
                            className="w-full px-4 py-2 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary/50 outline-none"
                        >
                            <option value="">Select a category...</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {form.formState.errors.categoryId && <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Website URL</label>
                        <input 
                            {...form.register("url")}
                            className="w-full px-4 py-2 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary/50 outline-none"
                            placeholder="https://..."
                        />
                        {form.formState.errors.url && <p className="text-xs text-red-500">{form.formState.errors.url.message}</p>}
                    </div>

                    <div className="space-y-2">
                         <label className="text-sm font-medium">Pricing</label>
                         <div className="flex gap-4">
                             {['Free', 'Freemium', 'Paid'].map(p => (
                                 <label key={p} className="flex items-center gap-2 cursor-pointer">
                                     <input 
                                        type="radio" 
                                        value={p} 
                                        {...form.register("pricing")}
                                        className="text-primary focus:ring-primary" 
                                     />
                                     <span className="text-sm">{p}</span>
                                 </label>
                             ))}
                         </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea 
                            {...form.register("description")}
                            className="w-full px-4 py-2 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary/50 outline-none min-h-[100px]"
                            placeholder="Brief description of what this tool does..."
                        />
                        {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                                </>
                            ) : (
                                "Submit Suggestion"
                            )}
                        </Button>
                    </div>
                </form>
               </>
           )}
        </DialogContent>
      </Dialog>
    </>
  );
}
