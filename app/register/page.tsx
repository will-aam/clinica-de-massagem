"use client";

import { useState, useActionState, useEffect } from "react";
import { registerAdmin, ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Heart, ArrowLeft, Repeat, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const initialState: ActionState = { error: "" };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerAdmin,
    initialState,
  );

  // Estados para as máscaras e validações
  const [docType, setDocType] = useState<"CNPJ" | "CPF">("CNPJ");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");

  // Funções de Máscara (Idênticas às de Configurações)
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");

    if (docType === "CPF") {
      v = v.slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setDocument(v);
    } else {
      v = v.slice(0, 14);
      v = v.replace(/^(\d{2})(\d)/, "$1.$2");
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
      setDocument(v);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length <= 10) {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{4})(\d)/g, "$1-$2");
    } else {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{5})(\d)/g, "$1-$2");
    }
    setPhone(v.slice(0, 15));
  };

  const toggleDocType = () => {
    setDocType(docType === "CNPJ" ? "CPF" : "CNPJ");
    setDocument(""); // Limpa para evitar bugar a formatação
  };

  // Lógica de Força da Senha
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(password);

  let strengthColor = "bg-muted";
  let strengthText = "Muito fraca";
  if (strength >= 25) {
    strengthColor = "bg-red-500";
    strengthText = "Fraca";
  }
  if (strength >= 50) {
    strengthColor = "bg-yellow-500";
    strengthText = "Média";
  }
  if (strength >= 75) {
    strengthColor = "bg-blue-500";
    strengthText = "Forte";
  }
  if (strength === 100) {
    strengthColor = "bg-green-500";
    strengthText = "Muito Forte";
  }

  // Validar senhas antes do submit
  const preSubmitCheck = (e: React.FormEvent<HTMLFormElement>) => {
    if (password !== confirmPassword) {
      e.preventDefault();
      setPasswordMatchError("As senhas não coincidem.");
      return;
    }
    if (strength < 50) {
      e.preventDefault();
      setPasswordMatchError("A senha precisa ser mais forte.");
      return;
    }
    setPasswordMatchError("");
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background md:p-4">
      {/* Botão de Voltar - Oculto no mobile extremo para focar no form, mas visível via header ou scroll se quiser. */}
      <Link
        href="/totem/idle"
        className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group z-10"
      >
        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-card shadow-sm border border-border group-hover:bg-[#D9C6BF]/20 transition-colors">
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <span className="hidden sm:inline font-medium">Voltar</span>
      </Link>

      {/* Card que ocupa 100% no mobile e vira box no Desktop */}
      <Card className="w-full max-w-2xl border-0 md:border md:border-border shadow-none md:shadow-lg bg-background md:bg-card min-h-svh md:min-h-fit md:my-8 rounded-none md:rounded-xl">
        <CardHeader className="text-center pt-12 md:pt-6 pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-sm">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="font-serif text-2xl md:text-3xl text-card-foreground">
            Totten
          </CardTitle>
          <CardDescription>Crie a conta da sua empresa</CardDescription>
        </CardHeader>

        <CardContent className="px-4 md:px-8 pb-8">
          <form
            action={formAction}
            onSubmit={preSubmitCheck}
            className="flex flex-col gap-6"
          >
            {/* Bloco 1: Dados da Empresa e Responsável */}
            <div className="grid gap-4 border border-border rounded-lg p-4 bg-card shadow-sm">
              <h3 className="font-medium text-sm text-primary uppercase tracking-wider mb-2">
                Dados da Empresa
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="companyName" className="text-card-foreground">
                    Nome de Exibição / Fantasia
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Ex: Totten Tecnologia"
                    required
                    className="bg-muted text-foreground focus-visible:ring-primary"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="displayName" className="text-card-foreground">
                    Seu Nome Completo (Responsável)
                  </Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    placeholder="Ex: João Silva"
                    required
                    className="bg-muted text-foreground focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
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
                    name="document"
                    value={document}
                    onChange={handleDocumentChange}
                    required
                    placeholder={
                      docType === "CNPJ"
                        ? "00.000.000/0001-00"
                        : "000.000.000-00"
                    }
                    className="bg-muted text-foreground focus-visible:ring-primary"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="contactPhone"
                    className="text-card-foreground"
                  >
                    Telefone de Contato
                  </Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    placeholder="(00) 00000-0000"
                    className="bg-muted text-foreground focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Acesso e Segurança */}
            <div className="grid gap-4 border border-border rounded-lg p-4 bg-card shadow-sm">
              <h3 className="font-medium text-sm text-primary uppercase tracking-wider mb-2">
                Acesso e Segurança
              </h3>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-card-foreground">
                  E-mail de Acesso
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@empresa.com"
                  required
                  className="bg-muted text-foreground focus-visible:ring-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-card-foreground">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="bg-muted text-foreground focus-visible:ring-primary"
                  />
                  {/* Barra de Força da Senha */}
                  {password && (
                    <div className="space-y-1 mt-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Força da senha:
                        </span>
                        <span
                          className={`font-medium ${strength >= 75 ? "text-green-500" : strength >= 50 ? "text-yellow-500" : "text-red-500"}`}
                        >
                          {strengthText}
                        </span>
                      </div>
                      <Progress
                        value={strength}
                        indicatorColor={strengthColor}
                        className="h-1"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-card-foreground"
                  >
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordMatchError("");
                    }}
                    placeholder="••••••••"
                    required
                    className={`bg-muted text-foreground focus-visible:ring-primary ${
                      confirmPassword && password !== confirmPassword
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  {confirmPassword && (
                    <p
                      className={`text-xs flex items-center gap-1 mt-1 ${password === confirmPassword ? "text-green-500" : "text-destructive"}`}
                    >
                      {password === confirmPassword ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {password === confirmPassword
                        ? "As senhas coincidem"
                        : "As senhas não coincidem"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Erros Gerais (Action ou Cliente) */}
            {(state.error || passwordMatchError) && (
              <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
                {passwordMatchError || state.error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-2 text-base shadow-sm hover:scale-[1.02] transition-transform w-full"
              disabled={
                isPending || password !== confirmPassword || strength < 50
              }
            >
              {isPending ? "Criando empresa..." : "Finalizar Cadastro"}
            </Button>

            <div className="mt-2 text-center text-sm text-muted-foreground pb-4 md:pb-0">
              Já possui uma conta?{" "}
              <Link
                href="/admin/login"
                className="font-medium text-primary hover:underline"
              >
                Faça login aqui
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
