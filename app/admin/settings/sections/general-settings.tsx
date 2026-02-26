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
import { Building } from "lucide-react";

export function GeneralSettings() {
  const [formData, setFormData] = useState({
    companyName: "Serenità",
    tradeName: "Serenità Massoterapia",
    cnpj: "00.000.000/0001-00",
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Dados da Empresa
        </CardTitle>
        <CardDescription>
          Configure como o nome da sua clínica aparece no sistema e nos recibos.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tradeName">Nome Fantasia (Aparece no Totem)</Label>
          <Input
            id="tradeName"
            value={formData.tradeName}
            onChange={(e) =>
              setFormData({ ...formData, tradeName: e.target.value })
            }
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Razão Social</Label>
            <Input id="companyName" value={formData.companyName} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" value={formData.cnpj} disabled />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
