import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Polar Knowledge Platform | Explore India's Polar Research",
  description: "Discover expeditions, scientific datasets, publications, researchers and knowledge from India's polar research ecosystem across Antarctica, Arctic, and Himalayas.",
  keywords: ["Polar Research", "NCPOR", "Antarctica Expeditions", "Maitri Station", "Bharati Station", "Himadri Arctic Base", "Glaciology", "India Climate Science"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-cyan-600 selection:text-white">
        <ClientProviders>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
