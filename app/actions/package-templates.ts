"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 🔥 FUNÇÃO AUXILIAR: Converte Decimal do Prisma em Number para o Next.js
function sanitizePackage(pkg: any) {
  if (!pkg) return null;
  return {
    ...pkg,
    price: Number(pkg.price || 0),
  };
}

export async function updatePackageTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    total_sessions?: number;
    price?: number;
    validity_days?: number | null;
  },
) {
  try {
    const admin = await requireAuth();

    const updated = await prisma.packageTemplate.update({
      where: { id, organization_id: admin.organizationId },
      data: {
        name: data.name,
        description: data.description,
        total_sessions: data.total_sessions,
        price: data.price,
        validity_days: data.validity_days,
      },
    });

    revalidatePath("/admin/services");

    // Retornamos o objeto sanitizado para evitar o erro de Decimal no Modal
    return { success: true, package: sanitizePackage(updated) };
  } catch (error) {
    console.error("Erro ao atualizar pacote:", error);
    return { success: false, error: "Erro ao atualizar pacote." };
  }
}

export async function togglePackageTemplateStatus(
  id: string,
  currentStatus: boolean,
) {
  try {
    const admin = await requireAuth();

    const updated = await prisma.packageTemplate.update({
      where: { id, organization_id: admin.organizationId },
      data: { active: !currentStatus },
    });

    revalidatePath("/admin/services");
    return { success: true, package: sanitizePackage(updated) };
  } catch (error) {
    console.error("Erro ao mudar status do pacote:", error);
    return { success: false, error: "Erro ao mudar status do pacote." };
  }
}
