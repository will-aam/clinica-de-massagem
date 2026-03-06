"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 🔥 FUNÇÃO AUXILIAR: Converte Decimal do Prisma em Number puro para o Next.js
function sanitizeService(service: any) {
  if (!service) return null;
  return {
    ...service,
    price: Number(service.price || 0),
  };
}

// --- AÇÕES DE SERVIÇO ---

export async function createService(data: {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category_id: string;
}) {
  try {
    const admin = await requireAuth();

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category_id: data.category_id,
        organization_id: admin.organizationId,
        active: true,
      },
    });

    revalidatePath("/admin/services");
    return { success: true, service: sanitizeService(service) };
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return { success: false, error: "Erro ao criar serviço." };
  }
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    category_id?: string;
  },
) {
  try {
    const admin = await requireAuth();

    const updated = await prisma.service.update({
      where: { id, organization_id: admin.organizationId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category_id: data.category_id,
      },
    });

    revalidatePath("/admin/services");
    // Retornamos o objeto limpo para evitar erros de serialização no Client Component
    return { success: true, service: sanitizeService(updated) };
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return { success: false, error: "Erro ao atualizar serviço." };
  }
}

export async function toggleServiceStatus(id: string, currentStatus: boolean) {
  try {
    const admin = await requireAuth();

    await prisma.service.update({
      where: { id, organization_id: admin.organizationId },
      data: { active: !currentStatus },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao mudar status do serviço." };
  }
}

// --- AÇÕES DE CATEGORIA ---

export async function updateCategory(id: string, name: string) {
  try {
    const admin = await requireAuth();

    await prisma.category.update({
      where: { id, organization_id: admin.organizationId },
      data: { name },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar categoria." };
  }
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  try {
    const admin = await requireAuth();

    await prisma.category.update({
      where: { id, organization_id: admin.organizationId },
      data: { active: !currentStatus },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao mudar status da categoria." };
  }
}
