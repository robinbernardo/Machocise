import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header/Header";
import { SkipLink } from "@/components/SkipLink/SkipLink";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Machocise",
  description: "Camera-based exercise form checker and rep counter.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
