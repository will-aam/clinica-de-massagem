"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, Power, PowerOff } from "lucide-react";
import { updateService, toggleServiceStatus } from "@/app/actions/services";

interface ServiceEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: any | null;
  categories: any[];
  onSuccess: () => void;
}

type Duration = {
  id: string;
  label: string;
  minutes: number;
};

export function ServiceEditModal({
  open,
  onOpenChange,
  service,
  categories,
  onSuccess,
}: ServiceEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category_id: "",
  });

  // Busca as durações cadastradas toda vez que o modal for aberto
  useEffect(() => {
    if (open) {
      fetch("/api/service-durations")
        .then((res) => res.json())
        .then((data) => setDurations(data))
        .catch((err) => console.error("Erro ao buscar durações:", err));
    }
  }, [open]);

  // Carrega os dados do serviço no formulário quando o modal abre
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        price: service.price?.toString() || "",
        duration: service.duration?.toString() || "",
        category_id: service.category_id || "",
      });
    }
  }, [service]);

  if (!service) return null;

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.duration ||
      !formData.category_id
    ) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateService(service.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category_id: formData.category_id,
      });

      if (res.success) {
        toast.success("Serviço atualizado com sucesso!");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const res = await toggleServiceStatus(service.id, service.active);
      if (res.success) {
        const msg = service.active ? "Serviço desativado" : "Serviço ativado";
        toast.success(msg);
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Erro ao alterar status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(val) =>
                setFormData({ ...formData, category_id: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                // 🔥 Classes adicionadas para remover as setas nativas do input de número
                className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>

            {/* 🔥 Novo Select de Duração puxando da API */}
            <div className="grid gap-2">
              <Label htmlFor="duration">Duração</Label>
              <Select
                value={formData.duration}
                onValueChange={(val) =>
                  setFormData({ ...formData, duration: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tempo" />
                </SelectTrigger>
                <SelectContent>
                  {durations.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhuma duração cadastrada
                    </SelectItem>
                  ) : (
                    durations.map((d) => (
                      <SelectItem key={d.id} value={d.minutes.toString()}>
                        {d.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className={service.active ? "text-destructive" : "text-emerald-600"}
            onClick={handleToggleStatus}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : service.active ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" /> Desativar
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" /> Ativar
              </>
            )}
          </Button>

          <div className="flex-1" />

          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
