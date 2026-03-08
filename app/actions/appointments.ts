"use server";

import { prisma } from "@/lib/prisma";
import { Appointment, AppointmentStatus, PaymentMethod } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Tipos já existentes
export type CreateAppointmentInput = {
  clientId: string;
  serviceId: string;
  dateTime: Date | string;
  observations?: string;
  packageId?: string;
  repeatCount?: number; // 🔥 NOVO: Quantidade de repetições (semanais)
};

export type CreateAppointmentResult =
  | { success: true; appointments: Appointment[] }
  | { success: false; error: string };

// --- Ação de Criar (Agora com Recorrência Inteligente) ---
export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  try {
    const admin = await requireAuth();
    const {
      clientId,
      serviceId,
      dateTime,
      observations,
      packageId,
      repeatCount = 1,
    } = input;
    const firstDateTime =
      typeof dateTime === "string" ? new Date(dateTime) : dateTime;

    // Garante que no mínimo 1 agendamento será criado
    const totalSessionsToCreate = Math.max(1, repeatCount);
    let startSessionNumber = 0;

    // Se estiver atrelado a um pacote, fazemos as validações de saldo
    if (packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
      });

      if (!pkg || pkg.organization_id !== admin.organizationId) {
        return { success: false, error: "Pacote não encontrado." };
      }

      const sessionsAvailable = pkg.total_sessions - pkg.used_sessions;
      if (sessionsAvailable < totalSessionsToCreate) {
        return {
          success: false,
          error: `Saldo insuficiente. O pacote tem apenas ${sessionsAvailable} sessões disponíveis.`,
        };
      }

      // Marca de onde o contador vai começar (ex: se já usou 2, a próxima é a 3)
      startSessionNumber = pkg.used_sessions;
    }

    // 🔥 O PULO DO GATO: Criamos todos os agendamentos de uma vez, somando 7 dias para cada repetição
    const appointments = await prisma.$transaction(async (tx) => {
      const created: Appointment[] = [];

      for (let i = 0; i < totalSessionsToCreate; i++) {
        const sessionDate = new Date(firstDateTime);
        // Adiciona i semanas (i * 7 dias) à data original
        sessionDate.setDate(sessionDate.getDate() + i * 7);

        const appt = await tx.appointment.create({
          data: {
            date_time: sessionDate,
            observations,
            client_id: clientId,
            service_id: serviceId,
            package_id: packageId || null,
            organization_id: admin.organizationId,
            // Se tiver pacote, numera a sessão. Se não, fica nulo.
            session_number: packageId ? startSessionNumber + i + 1 : null,
          },
        });
        created.push(appt);
      }
      return created;
    });

    revalidatePath("/admin/agenda");
    return { success: true, appointments };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao criar agendamento." };
  }
}

// --- Ação de Atualizar (Mantida e intacta) ---
export async function updateAppointment(
  id: string,
  data: {
    status: string;
    paymentMethod: string;
    observations: string;
    hasCharge: boolean;
  },
) {
  try {
    const admin = await requireAuth();

    const statusMap: Record<string, AppointmentStatus> = {
      a_confirmar: AppointmentStatus.PENDENTE,
      confirmado: AppointmentStatus.CONFIRMADO,
      atrasou: AppointmentStatus.PENDENTE,
      nao_compareceu: AppointmentStatus.CANCELADO,
      cancelado: AppointmentStatus.CANCELADO,
      realizado: AppointmentStatus.REALIZADO,
    };

    const paymentMap: Record<string, PaymentMethod> = {
      pix: PaymentMethod.PIX,
      dinheiro: PaymentMethod.DINHEIRO,
      cartao_credito: PaymentMethod.CARTAO_CREDITO,
      cartao_debito: PaymentMethod.CARTAO_DEBITO,
      transferencia: PaymentMethod.OUTRO,
    };

    const finalStatus = statusMap[data.status] || AppointmentStatus.PENDENTE;
    const finalPaymentMethod =
      data.paymentMethod === "nenhum"
        ? null
        : paymentMap[data.paymentMethod] || null;

    let finalHasCharge = data.hasCharge;
    if (
      finalStatus === AppointmentStatus.REALIZADO &&
      finalPaymentMethod !== null
    ) {
      finalHasCharge = false;
    }

    if (finalStatus === AppointmentStatus.CANCELADO) {
      finalHasCharge = false;
    }

    const updated = await prisma.appointment.update({
      where: {
        id,
        organization_id: admin.organizationId,
      },
      data: {
        status: finalStatus,
        payment_method: finalPaymentMethod,
        observations: data.observations,
        has_charge: finalHasCharge,
      },
      include: {
        service: true,
      },
    });

    const sanitizedAppointment = {
      ...updated,
      service: {
        ...updated.service,
        price: Number(updated.service.price),
      },
    };

    revalidatePath("/admin/agenda");

    return {
      success: true,
      appointment: sanitizedAppointment,
    };
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return { success: false, error: "Erro ao salvar alterações." };
  }
}

// --- Ação de Deletar (Lixeira) ---
export async function deleteAppointment(id: string) {
  try {
    const admin = await requireAuth();
    await prisma.appointment.delete({
      where: {
        id,
        organization_id: admin.organizationId,
      },
    });

    revalidatePath("/admin/agenda");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao excluir agendamento." };
  }
}

// --- Atualiza Data/Hora (Drag and Drop) ---
export async function updateAppointmentDateTime(
  id: string,
  newDateIso: string,
) {
  try {
    const admin = await requireAuth();

    await prisma.appointment.update({
      where: {
        id,
        organization_id: admin.organizationId,
      },
      data: {
        date_time: new Date(newDateIso),
      },
    });

    revalidatePath("/admin/agenda");
    return { success: true };
  } catch (error) {
    console.error("Erro ao mover agendamento:", error);
    return { success: false, error: "Falha ao reagendar." };
  }
}
