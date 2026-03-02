"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type ActionState = {
  error: string;
};

export async function registerAdmin(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const displayName = formData.get("displayName") as string;
  const companyName = formData.get("companyName") as string;
  const document = formData.get("document") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !companyName || !document) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return { error: "Este e-mail já está em uso." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: companyName,
          slug: slug,
          settings: {
            create: {
              company_name: companyName,
              document: document,
              phone_landline: contactPhone, // Salva o telefone
              phone_whatsapp: "", // Será configurado depois
            },
          },
        },
      });

      await tx.admin.create({
        data: {
          display_name: displayName,
          email: email,
          password: hashedPassword,
          organizations: {
            connect: { id: org.id },
          },
        },
      });
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return { error: "Ocorreu um erro ao criar a conta. Tente novamente." };
  }

  redirect("/admin/login");
}
