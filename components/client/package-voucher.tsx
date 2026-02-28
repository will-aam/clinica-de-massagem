"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Heart, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PackageVoucherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  packageName: string;
  totalSessions: number;
}

export function PackageVoucher({
  open,
  onOpenChange,
  clientName,
  packageName,
  totalSessions,
}: PackageVoucherProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Função que tira a "foto" da div e baixa ou compartilha
  const handleExport = async (action: "download" | "share") => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // Pega as dimensões exatas do elemento na tela para evitar cortes
      const width = cardRef.current.offsetWidth;
      const height = cardRef.current.offsetHeight;

      // Gera a imagem forçando a largura e altura, e removendo distorções de margem
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        width: width,
        height: height,
        style: {
          margin: "0",
          transform: "none",
        },
      });

      if (action === "download") {
        const link = document.createElement("a");
        link.download = `Comprovante_${clientName.replace(/\s+/g, "_")}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Comprovante baixado com sucesso!");
      }

      if (action === "share") {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "comprovante.png", { type: blob.type });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Pacote Concluído - Totten",
            text: `Parabéns ${clientName.split(" ")[0]}! Você concluiu seu pacote conosco. 💆‍♀️✨`,
            files: [file],
          });
        } else {
          handleExport("download");
          toast.info(
            "Compartilhamento não suportado neste dispositivo. O arquivo foi baixado.",
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar o comprovante.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md bg-background p-4 sm:p-6 rounded-3xl overflow-y-auto max-h-[90dvh]">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle>Comprovante de Conclusão</DialogTitle>
          <DialogDescription>
            Envie este mimo para a sua cliente via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {/* O container PAI assume o controle total do alinhamento */}
        <div className="flex flex-col items-center justify-center py-2 sm:py-4 w-full overflow-hidden">
          {/* O CARD foi travado com w-[280px] e o mx-auto foi removido para não bugar o html-to-image */}
          <div
            ref={cardRef}
            className="w-70 bg-[#FAF9F6] border-2 border-[#D9C6BF] p-5 rounded-2xl flex flex-col items-center text-center shadow-sm relative overflow-hidden shrink-0"
          >
            {/* Elemento decorativo de fundo */}
            <div className="absolute -top-10 -right-10 text-[#D9C6BF]/20 pointer-events-none">
              <Heart className="h-28 w-28 fill-current" />
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D9C6BF] text-white mb-3 z-10 shadow-md shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#4A3F35] mb-1 z-10 leading-tight">
              Parabéns!
            </h2>
            <p className="text-xs text-[#7A6A5E] uppercase tracking-widest font-semibold mb-4 z-10">
              Pacote Concluído
            </p>

            <div className="w-full h-px bg-[#D9C6BF]/60 mb-4 z-10" />

            <div className="flex flex-col gap-1 w-full z-10">
              <p className="text-xs text-[#7A6A5E]">Certificamos que</p>
              <p className="text-lg font-bold text-[#4A3F35] leading-tight">
                {clientName}
              </p>
              <p className="text-xs text-[#7A6A5E] mt-1.5">
                finalizou com sucesso o
              </p>
              <p className="text-sm font-semibold text-[#4A3F35] leading-snug px-2">
                {packageName}
              </p>

              <div className="mt-4 inline-flex mx-auto items-center gap-1.5 bg-[#4A3F35] text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                <Heart className="h-3 w-3 text-[#D9C6BF]" />
                {totalSessions} / {totalSessions} Sessões
              </div>
            </div>

            <div className="mt-6 pt-3 w-full border-t border-dashed border-[#D9C6BF] z-10 flex justify-between items-center px-1">
              <span className="font-serif font-bold text-[#4A3F35] text-sm">
                Totten
              </span>
              <span className="text-[10px] text-[#7A6A5E] font-medium">
                {new Date().toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        {/* Botões empilhados ou lado a lado de forma compacta */}
        <div className="flex flex-col gap-2 w-full mt-2">
          <Button
            variant="outline"
            onClick={() => handleExport("download")}
            disabled={isExporting}
            className="w-full rounded-full border-primary/20 hover:bg-primary/5 h-10 text-xs sm:text-sm"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Baixar Imagem
          </Button>
          <Button
            onClick={() => handleExport("share")}
            disabled={isExporting}
            className="w-full rounded-full shadow-sm h-10 text-xs sm:text-sm"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            Compartilhar via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
