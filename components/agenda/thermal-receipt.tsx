"use client";

import React, { forwardRef } from "react";
import { format } from "date-fns";

interface ThermalReceiptProps {
  appointment: any;
  settings: any;
}

export const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ appointment, settings }, ref) => {
    if (!appointment) return null;

    const today = new Date();

    // 🔥 BUSCA ROBUSTA DO PREÇO
    // Tenta pegar o preço direto, ou do serviço, garantindo que seja um número
    const rawPrice = appointment.price ?? appointment.service?.price ?? 0;
    const priceValue = Number(rawPrice);

    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceValue);

    // Identifica se é pacote para o rodapé do valor
    const isPackage = !!appointment.packageId;

    return (
      <div className="hidden print:block">
        <div
          ref={ref}
          className="w-[80mm] p-5 bg-white text-black font-mono text-[12px] leading-tight mx-auto"
          style={{ color: "#000" }}
        >
          {/* Cabeçalho da Clínica */}
          <div className="text-center mb-4">
            <h2 className="text-sm font-bold uppercase mb-1">
              {settings?.trade_name ||
                settings?.company_name ||
                "TOTTEN GESTÃO"}
            </h2>
            {settings?.phone_whatsapp && (
              <p className="text-[10px]">Whats: {settings.phone_whatsapp}</p>
            )}
            <div className="border-b border-black border-dashed my-2" />
            <p className="font-bold text-[13px] uppercase">
              *** RECIBO DE ATENDIMENTO ***
            </p>
          </div>

          {/* Identificação do Atendimento */}
          <div className="space-y-1 mb-4">
            <p className="truncate">
              CLIENTE:{" "}
              {appointment.clientName?.toUpperCase() || "CLIENTE NÃO INFORMADO"}
            </p>
            <p>DATA: {format(today, "dd/MM/yyyy")}</p>
            <p>HORA: {format(today, "HH:mm:ss")}</p>
            <p>PROFISSIONAL: {settings?.responsible_name || "---"}</p>
          </div>

          <div className="border-b border-black border-dashed my-2" />

          {/* Detalhes do Serviço */}
          <table className="w-full mb-4">
            <thead>
              <tr className="text-left font-bold">
                <td>DESCRIÇÃO</td>
                <td className="text-right">VALOR</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pt-2">
                  <p className="font-bold">{appointment.service}</p>
                  <p className="text-[10px] italic">
                    {appointment.sessionInfo || "Sessão Avulsa"}
                  </p>
                </td>
                <td className="text-right align-top pt-2">
                  {isPackage ? "COBERTO" : formattedPrice}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border-b border-black border-dashed my-2" />

          {/* Totalizador */}
          <div className="flex justify-between items-center text-[14px] font-bold mb-2">
            <span>TOTAL DO SERVIÇO:</span>
            <span>{formattedPrice}</span>
          </div>

          {isPackage && (
            <div className="text-right text-[10px] italic mb-4">
              * Pago via Pacote de Sessões
            </div>
          )}

          <div className="flex justify-between items-center text-[14px] font-bold mb-6 pt-2 border-t border-black">
            <span>VALOR PAGO HOJE:</span>
            <span>{isPackage ? "R$ 0,00" : formattedPrice}</span>
          </div>

          {/* Rodapé e Assinatura */}
          <div className="text-center space-y-4">
            <p className="text-[10px]">
              Este documento não possui valor fiscal.
            </p>

            <div className="mt-8 pt-4">
              <p className="mb-0">__________________________</p>
              <p className="text-[10px] uppercase">
                {settings?.trade_name || "Assinatura do Responsável"}
              </p>
            </div>

            <div className="pt-4 pb-2">
              <p className="text-[10px] italic">
                Obrigado pela confiança! 💆‍♀️✨
              </p>
              <p className="text-[8px] mt-2 opacity-50 italic">totten.com.br</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ThermalReceipt.displayName = "ThermalReceipt";
