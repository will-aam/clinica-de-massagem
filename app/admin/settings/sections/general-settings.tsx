"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, Info, Repeat } from "lucide-react";

export function GeneralSettings() {
  // Estado para controlar se é CPF ou CNPJ
  const [docType, setDocType] = useState<"CNPJ" | "CPF">("CNPJ");

  const [formData, setFormData] = useState({
    companyName: "Totten Tecnologia LTDA",
    tradeName: "Totten",
    document: "00.000.000/0001-00", // Substituiu o campo 'cnpj'
    contactPhone: "(00) 0000-0000",
  });

  // Esses dados viriam do banco de dados global da empresa
  const whatsappFromMessages = "(00) 90000-0000";
  const emailFromSecurity = "admin@totten.com";

  // Função mágica para formatar CPF e CNPJ enquanto digita
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

    if (docType === "CPF") {
      v = v.slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setFormData({ ...formData, document: v.slice(0, 14) }); // Limita a 14 caracteres
    } else {
      v = v.replace(/^(\d{2})(\d)/, "$1.$2");
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
      setFormData({ ...formData, document: v.slice(0, 18) }); // Limita a 18 caracteres
    }
  };

  // Função mágica para formatar Telefone enquanto digita
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length <= 10) {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{4})(\d)/g, "$1-$2");
    } else {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{5})(\d)/g, "$1-$2");
    }
    setFormData({ ...formData, contactPhone: v.slice(0, 15) });
  };

  // Alternar entre CPF e CNPJ (e limpar o campo para não bugar a formatação)
  const toggleDocType = () => {
    setDocType(docType === "CNPJ" ? "CPF" : "CNPJ");
    setFormData({ ...formData, document: "" });
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Building className="h-5 w-5 text-primary" />
          Dados da Empresa
        </CardTitle>
        <CardDescription>
          Configure as informações principais da sua empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Nomes da Empresa */}
        <div className="grid gap-2">
          <Label htmlFor="tradeName" className="font-medium">
            Nome de Exibição do Sistema
          </Label>
          <Input
            id="tradeName"
            value={formData.tradeName}
            onChange={(e) =>
              setFormData({ ...formData, tradeName: e.target.value })
            }
            placeholder="Ex: Minha Clínica"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Razão Social / Nome Completo</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="document">{docType}</Label>
              <button
                type="button"
                onClick={toggleDocType}
                className="text-[10px] text-primary flex items-center gap-1 hover:underline font-medium uppercase tracking-wider"
              >
                <Repeat className="h-3 w-3" />
                Mudar para {docType === "CNPJ" ? "CPF" : "CNPJ"}
              </button>
            </div>
            <Input
              id="document"
              value={formData.document}
              onChange={handleDocumentChange}
              placeholder={
                docType === "CNPJ" ? "00.000.000/0001-00" : "000.000.000-00"
              }
            />
          </div>
        </div>

        {/* Informações de Contato (Centralizadas) */}
        <div className="grid sm:grid-cols-3 gap-4 pt-6 mt-2 border-t border-border">
          {/* Telefone Fixo/Contato */}
          <div className="grid gap-2">
            <Label htmlFor="contactPhone">Telefone Fixo / Recados</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* WhatsApp (Apenas Leitura - Informativo) */}
          <div className="grid gap-2">
            <Label htmlFor="whatsapp" className="text-muted-foreground">
              WhatsApp Principal
            </Label>
            <Input
              id="whatsapp"
              value={whatsappFromMessages}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" />
              Altere na aba "Mensagens"
            </p>
          </div>

          {/* E-mail (Apenas Leitura - Informativo) */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-muted-foreground">
              E-mail Administrativo
            </Label>
            <Input
              id="email"
              value={emailFromSecurity}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" />
              Altere na aba "Acesso"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
