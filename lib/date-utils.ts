import { addWeeks } from "date-fns";

/**
 * Gera uma lista de datas para agendamentos recorrentes.
 * @param startDate A data e hora do primeiro agendamento.
 * @param occurrences O número total de sessões (ex: 10).
 * @returns Um array de objetos Date.
 */
export function generateRecurrentDates(
  startDate: Date,
  occurrences: number,
): Date[] {
  const dates: Date[] = [];

  for (let i = 0; i < occurrences; i++) {
    // Adiciona i semanas à data inicial (0 semanas, 1 semana, etc.)
    const nextDate = addWeeks(new Date(startDate), i);
    dates.push(nextDate);
  }

  return dates;
}
