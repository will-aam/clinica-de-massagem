"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Phone,
  MessageCircle,
  Mail,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import type { Client as ClientType, Package as PackageType } from "@/lib/data";

interface ClientContactProps {
  client: ClientType;
  activePackage: PackageType | null;
}

function formatPhoneInput(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function ClientContact({ client, activePackage }: ClientContactProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const clientEmail = (client as any).email || "";
  const [editPhone, setEditPhone] = useState(client.phone_whatsapp);
  const [editEmail, setEditEmail] = useState(clientEmail);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: client.name, // Mantém o nome atual
          cpf: client.cpf, // Mantém o CPF atual
          phone_whatsapp: editPhone,
          email: editEmail,
        }),
      });
      if (res.ok) {
        toast.success("Contato atualizado!");
        setIsEditing(false);
        mutate(`/api/clients/${client.id}`);
      }
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = client.phone_whatsapp.replace(/\D/g, "");
    const name = client.name.split(" ")[0];
    const message = `Olá, ${name}! Tudo bem? 💆‍♀️✨`;
    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleEmail = () => {
    window.open(`mailto:${clientEmail}`, "_self");
  };

  return (
    <Card className="md:col-span-2 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-3 md:pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Share2 className="h-5 w-5 text-primary" /> Contato e Mensagens
        </CardTitle>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <div className="flex gap-1">
              <Button
                onClick={() => setIsEditing(false)}
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 text-[#25D366]"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={3} />
                )}
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-primary rounded-full h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive rounded-full h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        /* função delete */
                      }}
                      className="bg-destructive text-white"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
        {isEditing ? (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                WhatsApp
              </label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(formatPhoneInput(e.target.value))}
                className="bg-muted/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                E-mail
              </label>
              <Input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="bg-muted/50"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleWhatsApp}
              className="bg-[#25D366] text-white hover:bg-[#128C7E] rounded-full flex-1 h-12 text-base"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={handleEmail}
              className="rounded-full flex-1 h-12 text-base border-primary/20"
            >
              <Mail className="mr-2 h-5 w-5 text-primary" /> E-mail
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
