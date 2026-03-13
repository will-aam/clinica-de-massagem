// app/actions/transactions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { TransactionType, TransactionStatus } from "@prisma/client";

// Função auxiliar de segurança (padrão do sistema)
async function getAdminOrg() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
    include: { organizations: true },
  });

  if (!admin || admin.organizations.length === 0) {
    throw new Error("Organização não encontrada");
  }

  return admin.organizations[0].id;
}

export async function createTransaction(data: {
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // Vem do input date (YYYY-MM-DD)
  status: TransactionStatus;
  paymentMethodId?: string;
}) {
  try {
    const organizationId = await getAdminOrg();

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        description: data.description,
        amount: data.amount,
        // Convertemos a string da data para um objeto Date do JS
        date: new Date(data.date + "T12:00:00Z"),
        status: data.status,
        payment_method_id: data.paymentMethodId || null,
        organization_id: organizationId,
      },
    });

    // Avisa o Next.js para atualizar as páginas financeiras
    revalidatePath("/admin/finance/dashboard");
    revalidatePath("/admin/finance/transactions");

    return { success: true, id: transaction.id };
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return { success: false, error: "Falha ao registrar movimentação." };
  }
}
