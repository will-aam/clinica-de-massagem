"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  User,
  Phone,
  MessageCircle,
  Mail,
  Trash2,
  Pencil,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Client as ClientType, Package as PackageType } from "@/lib/data";

interface ClientContactProps {
  client: ClientType;
  activePackage: PackageType | null;
}

// Máscara de telefone (reaproveitada)
function formatPhoneInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function ClientContact({ client, activePackage }: ClientContactProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  // Estados para a Edição In-line
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Usamos "as any" temporariamente para ignorar o erro do TS caso você ainda não tenha atualizado o lib/data.ts
  const clientEmail = (client as any).email || "";

  const [editPhone, setEditPhone] = useState(client.phone_whatsapp);
  const [editEmail, setEditEmail] = useState(clientEmail);

  // --- FUNÇÃO DE SALVAR EDIÇÃO ---
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT", // ou PATCH, dependendo de como está sua API de atualização
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_whatsapp: editPhone,
          email: editEmail,
        }),
      });

      if (res.ok) {
        toast.success("Dados atualizados com sucesso!");
        setIsEditing(false); // Sai do modo de edição
        mutate(`/api/clients/${client.id}`); // Atualiza a tela automaticamente
      } else {
        toast.error("Erro ao atualizar os dados.");
      }
    } catch {
      toast.error("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  // --- FUNÇÃO DE EXCLUIR ---
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Cliente excluído com sucesso!");
        router.push("/admin/clients");
      } else {
        toast.error("Erro ao excluir cliente");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setDeleting(false);
    }
  };

  // --- COMUNICAÇÃO ---
  const handleWhatsApp = () => {
    const phone = client.phone_whatsapp.replace(/\D/g, "");
    const name = client.name.split(" ")[0];
    const used = activePackage?.used_sessions || 0;
    const total = activePackage?.total_sessions || 0;

    let message = `Olá, ${name}! Tudo bem? 💆‍♀️✨\n\nPassando para lembrar que seu pacote na Serenità está ativo.`;
    if (activePackage) {
      message += `\nVocê já realizou ${used} de ${total} sessões.`;
      if (total - used <= 2 && total - used > 0) {
        message += `\n⚠️ Faltam apenas ${total - used} sessões para concluir este pacote!`;
      }
    }
    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleEmail = () => {
    const name = client.name.split(" ")[0];
    const subject = encodeURIComponent("Atualização do seu Pacote - Serenità");
    const body = encodeURIComponent(
      `Olá, ${name}!\n\nEste é um aviso sobre o seu pacote de massagens na Serenità.\n\nQualquer dúvida, estamos à disposição.`,
    );
    window.open(
      `mailto:${clientEmail}?subject=${subject}&body=${body}`,
      "_self",
    );
  };

  return (
    <Card className="md:col-span-2 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-3 md:pb-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" /> Contato e Ações
          </CardTitle>
          <CardDescription className="hidden md:block">
            Cadastrado em{" "}
            {new Date(client.created_at).toLocaleDateString("pt-BR")}
          </CardDescription>
        </div>

        {/* BOTÕES DE AÇÃO SUPERIORES */}
        <div className="flex items-center gap-1">
          {/* Lógica do Lápis virando Vezinho e o botão de Cancelar (X) */}
          {isEditing ? (
            <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
              {/* Botão X para Cancelar */}
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditPhone(client.phone_whatsapp); // Reseta o telefone pro original
                  setEditEmail(clientEmail); // Reseta o email pro original
                }}
                disabled={saving}
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Botão Check Verde para Salvar */}
              <Button
                onClick={handleSaveEdit}
                disabled={saving}
                size="icon"
                variant="ghost"
                className="text-[#25D366] hover:text-[#128C7E] hover:bg-[#25D366]/10 rounded-full transition-colors"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" strokeWidth={3} />
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {/* Lixeira (Soma quando estiver editando para focar na edição) */}
          {!isEditing && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir{" "}
                    <strong>{client.name}</strong>? Todo o histórico de
                    check-ins e pacotes será apagado. Esta ação não pode ser
                    desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive hover:bg-destructive/90 text-white"
                  >
                    {deleting ? "Excluindo..." : "Sim, Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-6">
        {/* MODO DE VISUALIZAÇÃO vs MODO DE EDIÇÃO */}
        <div className="flex flex-col gap-3">
          {/* CAMPO: WHATSAPP */}
          {isEditing ? (
            <div className="flex items-center gap-3 w-full max-w-sm">
              <div className="bg-primary/10 p-2 rounded-full shadow-sm shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(formatPhoneInput(e.target.value))}
                placeholder="(00) 90000-0000"
                className="bg-muted/50 h-10 border-border/50"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50 w-fit pr-6">
              <div className="bg-background p-2 rounded-full shadow-sm">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {client.phone_whatsapp}
              </span>
            </div>
          )}

          {/* CAMPO: E-MAIL */}
          {isEditing ? (
            <div className="flex items-center gap-3 w-full max-w-sm">
              <div className="bg-primary/10 p-2 rounded-full shadow-sm shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="bg-muted/50 h-10 border-border/50"
              />
            </div>
          ) : (
            // Só mostra a pill de email no modo de visualização se o cliente tiver um email salvo
            clientEmail && (
              <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50 w-fit pr-6">
                <div className="bg-background p-2 rounded-full shadow-sm">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {clientEmail}
                </span>
              </div>
            )
          )}
        </div>

        {/* BOTÕES DE AÇÃO RÁPIDA (Só aparecem se NÃO estiver editando) */}
        {!isEditing && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleWhatsApp}
              className="bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors rounded-full sm:rounded-md w-full sm:w-auto shadow-sm"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Chamar no WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={handleEmail}
              className="rounded-full sm:rounded-md w-full sm:w-auto shadow-sm"
            >
              <Mail className="mr-2 h-4 w-4" /> Enviar E-mail
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
