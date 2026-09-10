import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Topbar from "../components/topbar/topbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KTG Bibliotek",
  description: "Utforska och låna böcker från KTG Bibliotek. Logga in för att få tillgång till ditt personliga bibliotekskonto och ladda upp egna böcker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Topbar />
        <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans">
          <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-slate-900 text-slate-100 shadow-2xl">
              
              {children}
            </main>
        </div>
      </body>
    </html>
  );
}
