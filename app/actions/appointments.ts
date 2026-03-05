// app/actions/appointments.ts
"use server";

// Servidor Action: createAppointment
// Responsável por criar agendamentos, com suporte a pacotes (sessões múltiplas).

import { prisma } from "@/lib/prisma";
import { Appointment } from "@prisma/client";
import { requireAuth } from "@/lib/auth";

// Tipo de entrada para criar um agendamento
export type CreateAppointmentInput = {
  clientId: string;
  serviceId: string;
  // Data/hora do primeiro agendamento (ou único, se avulso)
  dateTime: Date | string;
  observations?: string;
  // Se informado, vincula o agendamento a um pacote existente
  packageId?: string;
};

// Tipo de retorno
export type CreateAppointmentResult =
  | { success: true; appointments: Appointment[] }
  | { success: false; error: string };

/**
 * Cria um ou mais agendamentos.
 *
 * Regras de negócio:
 * 1. Se não houver pacote, cria apenas um Appointment com status PENDENTE.
 * 2. Se houver pacote (packageId), lê o Package para calcular quantas sessões
 *    restam (X = total_sessions - used_sessions) e cria X Appointments com:
 *      - session_number sequencial (1, 2, 3 ... X)
 *      - date_time calculado somando 7 dias por sessão (mesma hora, semanas seguintes)
 *    Toda a criação ocorre em uma transação Prisma para garantir consistência.
 */
export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  try {
    const admin = await requireAuth();

    const { clientId, serviceId, dateTime, observations, packageId } = input;

    // Converte para Date caso venha como string ISO
    const firstDateTime =
      typeof dateTime === "string" ? new Date(dateTime) : dateTime;

    // --- Caso 1: Agendamento avulso (sem pacote) ---
    if (!packageId) {
      const appointment = await prisma.appointment.create({
        data: {
          date_time: firstDateTime,
          observations,
          client_id: clientId,
          service_id: serviceId,
          organization_id: admin.organizationId,
          // status PENDENTE é o padrão do modelo
        },
      });

      return { success: true, appointments: [appointment] };
    }

    // --- Caso 2: Agendamento vinculado a pacote ---
    // Busca o pacote para calcular a quantidade de sessões a agendar.
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg || pkg.organization_id !== admin.organizationId) {
      return { success: false, error: "Pacote não encontrado." };
    }

    // Quantidade de sessões restantes para agendar
    const sessionsToSchedule = pkg.total_sessions - pkg.used_sessions;

    if (sessionsToSchedule <= 0) {
      return {
        success: false,
        error: "Todas as sessões do pacote já foram utilizadas ou agendadas.",
      };
    }

    // Usa transação para garantir que ou todos os agendamentos são criados, ou nenhum.
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
            session_number: i + 1,
          },
        });

        created.push(appt);
      }

      return created;
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao criar o agendamento. Tente novamente.",
    };
  }
}
