// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { InstallPrompt } from "@/components/install-prompt"; // 🔥 LINHA NOVA: Importando o nosso banner
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Totten - Sistema de Gestão e Check-in",
  description:
    "Sistema completo de gestão de check-ins, pacotes de sessões e controle de atendimento para empresas.",
  keywords: [
    "sistema de gestão",
    "totem de atendimento",
    "check-in",
    "pacotes de sessões",
    "gestão de clientes",
    "automação de atendimento",
  ],
  openGraph: {
    title: "Totten - Sistema de Gestão e Check-in",
    description:
      "Sistema completo de gestão de check-ins e pacotes de sessões.",
    url: "https://totten.com.br",
    siteName: "Totten",
    locale: "pt_BR",
    type: "website",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Totten",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <InstallPrompt />{" "}
            {/* 🔥 LINHA NOVA: O banner de instalação entra aqui! */}
            {children}
            <Toaster position="top-right" richColors />
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
