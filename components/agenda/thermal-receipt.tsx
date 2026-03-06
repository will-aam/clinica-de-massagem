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

    // 🔥 BUSCA DE PREÇO MELHORADA (Prioriza Pacote > Valor da Sessão > Serviço Base)
    const rawPrice =
      appointment.package?.price ??
      appointment.price ??
      appointment.service?.price ??
      0;

    const priceValue = Number(rawPrice);

    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceValue);

    const isPackage = !!appointment.packageId;

    return (
      <div className="hidden print:block">
        <div
          ref={ref}
          className="w-[80mm] p-5 bg-white text-black font-mono text-[11px] leading-tight mx-auto"
          style={{ color: "#000" }}
        >
          {/* Cabeçalho */}
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
            <p className="font-bold text-[12px] uppercase">*** RECIBO ***</p>
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-1 mb-3">
            <p className="truncate">
              CLIENTE: {appointment.clientName?.toUpperCase()}
            </p>
            <p>
              DATA: {format(today, "dd/MM/yyyy")} - {format(today, "HH:mm")}
            </p>
          </div>

          <div className="border-b border-black border-dashed my-2" />

          {/* Itens */}
          <table className="w-full mb-3">
            <thead>
              <tr className="text-left font-bold border-b border-black">
                <td className="pb-1">DESCRIÇÃO</td>
                <td className="text-right pb-1">VALOR</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pt-2">
                  <p className="font-bold">{appointment.service}</p>
                  <p className="text-[9px] italic">
                    {appointment.sessionInfo || "Sessão Avulsa"}
                  </p>
                </td>
                <td className="text-right align-top pt-2">
                  {isPackage ? "PACOTE" : formattedPrice}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 🔥 OBSERVAÇÕES (Adicionado aqui) */}
          {appointment.observations && (
            <div className="mb-3 p-2 border border-black border-dotted rounded">
              <p className="font-bold text-[9px] mb-1 uppercase">
                Observações:
              </p>
              <p className="text-[9px] italic leading-snug">
                {appointment.observations}
              </p>
            </div>
          )}

          <div className="border-b border-black border-dashed my-2" />

          {/* Totais */}
          <div className="flex justify-between items-center text-[12px] font-bold">
            <span>TOTAL:</span>
            <span>{formattedPrice}</span>
          </div>

          <div className="flex justify-between items-center text-[11px] mt-1">
            <span>VALOR PAGO HOJE:</span>
            <span className="font-bold">
              {isPackage ? "R$ 0,00" : formattedPrice}
            </span>
          </div>

          {/* Assinatura e Rodapé */}
          <div className="text-center mt-8">
            <div className="border-t border-black w-3/4 mx-auto mb-1" />
            <p className="text-[9px] uppercase">
              {settings?.trade_name || "Assinatura"}
            </p>

            <p className="text-[9px] mt-6 italic">
              Obrigado pela confiança! ✨
            </p>
            <p className="text-[7px] mt-2 opacity-40">totten.com.br</p>
          </div>
        </div>
      </div>
    );
  },
);

ThermalReceipt.displayName = "ThermalReceipt";
