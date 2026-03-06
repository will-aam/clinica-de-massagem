// app/actions/appointments.ts
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
};

export type CreateAppointmentResult =
  | { success: true; appointments: Appointment[] }
  | { success: false; error: string };

// --- Ação de Criar (Mantida) ---
export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  try {
    const admin = await requireAuth();
    const { clientId, serviceId, dateTime, observations, packageId } = input;
    const firstDateTime =
      typeof dateTime === "string" ? new Date(dateTime) : dateTime;

    if (!packageId) {
      const appointment = await prisma.appointment.create({
        data: {
          date_time: firstDateTime,
          observations,
          client_id: clientId,
          service_id: serviceId,
          organization_id: admin.organizationId,
        },
      });
      revalidatePath("/admin/agenda");
      return { success: true, appointments: [appointment] };
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg || pkg.organization_id !== admin.organizationId) {
      return { success: false, error: "Pacote não encontrado." };
    }

    const sessionsToSchedule = pkg.total_sessions - pkg.used_sessions;
    if (sessionsToSchedule <= 0) {
      return { success: false, error: "Saldo de sessões insuficiente." };
    }

    const appointments = await prisma.$transaction(async (tx) => {
      const created: Appointment[] = [];
      for (let i = 0; i < sessionsToSchedule; i++) {
        const sessionDate = new Date(firstDateTime);
        sessionDate.setDate(sessionDate.getDate() + i * 7);
        const appt = await tx.appointment.create({
          data: {
            date_time: sessionDate,
            observations,
            client_id: clientId,
            service_id: serviceId,
            package_id: packageId,
            organization_id: admin.organizationId,
            session_number: pkg.used_sessions + i + 1,
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

// --- Ação de Atualizar (Versão Sanitizada contra erro de Decimal) ---
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

    // 🔥 O PULO DO GATO: Serialização manual para o Next.js não dar erro
    // Transformamos o objeto do Prisma em um objeto puro (Plain Object)
    const sanitizedAppointment = {
      ...updated,
      service: {
        ...updated.service,
        price: Number(updated.service.price), // <-- Converte Decimal para Number aqui
      },
    };

    revalidatePath("/admin/agenda");

    return {
      success: true,
      appointment: sanitizedAppointment, // Agora o frontend vai aceitar!
    };
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return { success: false, error: "Erro ao salvar alterações." };
  }
}

// --- NOVO: Ação de Deletar (Lixeira) ---
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
/**
 * 🎯 Atualiza apenas a data/hora de um agendamento.
 * Recebe string ISO para garantir que o dado não se perca no transporte.
 */
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
        date_time: new Date(newDateIso), // Converte aqui no servidor
      },
    });

    revalidatePath("/admin/agenda");
    return { success: true };
  } catch (error) {
    console.error("Erro ao mover agendamento:", error);
    return { success: false, error: "Falha ao reagendar." };
  }
}
