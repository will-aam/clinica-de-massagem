# 🔐 Sistema de Autenticação Multi-Tenant - Totten

## 🎯 Como Funciona

### 1. **Login do Admin**

- Admin faz login em `/admin/login`
- NextAuth valida e-mail + senha no banco
- Cria uma **sessão JWT** com o `organization_id` embutido
- Sessão dura **30 dias** (ou até logout manual)

### 2. **Proteção de Rotas**

- Middleware intercepta TODAS as requisições para `/admin` e `/totem`
- Se não houver sessão válida → Redireciona para `/admin/login`
- Se houver sessão → Permite acesso

### 3. **Check-in Seguro**

- Cliente digita CPF no totem
- API de check-in:
  1. Extrai `organization_id` da sessão
  2. Busca cliente **APENAS** dentro dessa organização
  3. Valida pacote ativo
  4. Registra check-in

### 4. **Isolamento Total**

- ��� Cliente da "Clínica A" NUNCA consegue fazer check-in na "Clínica B"
- ❌ Ninguém vê dados de outras organizações
- ✅ Cada empresa é um mundo isolado no banco de dados

## 📦 Dependências Necessárias

```bash
pnpm add next-auth bcryptjs
pnpm add -D @types/bcryptjs
```

## 🔑 Variáveis de Ambiente

```env
# .env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-super-secreta-aqui-min-32-caracteres
```

**Gere uma chave secreta:**

```bash
openssl rand -base64 32
```

## 🚀 Como Usar

### No Servidor (API Routes / Server Components)

```typescript
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Busca dados APENAS da organização do admin logado
  const clients = await prisma.client.findMany({
    where: {
      organization_id: admin.organizationId,
    },
  });

  return Response.json(clients);
}
```

### No Client (Componentes React)

```typescript
"use client"
import { useSession, signIn, signOut } from "next-auth/react"

export function ProfileButton() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p>Carregando...</p>

  if (!session) {
    return <button onClick={() => signIn()}>Fazer Login</button>
  }

  return (
    <div>
      <p>Olá, {session.user.name}!</p>
      <p>Empresa: {session.user.organizationName}</p>
      <button onClick={() => signOut()}>Sair</button>
    </div>
  )
}
```

## 🛡️ Checklist de Segurança

- [x] Sessão armazena `organization_id` server-side (JWT)
- [x] Cliente nunca vê `organization_id` direto
- [x] Todas as queries filtram por `organization_id`
- [x] Middleware protege rotas `/admin` e `/totem`
- [x] Sessão expira em 30 dias (configurável)
- [x] Senha hasheada com bcrypt (salt 10)

## 🐛 Troubleshooting

### Erro: "Session callback error"

- Verifique se `NEXTAUTH_SECRET` está definido no `.env`

### Erro: "Prisma Client not found"

- Execute: `npx prisma generate`

### Middleware não está funcionando

- Certifique-se que `middleware.ts` está na **raiz** do projeto (não dentro de `app/`)

## 📚 Links Úteis

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Multi-Schema](https://www.prisma.io/docs/orm/prisma-schema/data-model/multi-schema)
