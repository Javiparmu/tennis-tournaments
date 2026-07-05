import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zona de organizador",
  description: "Gestiona tus clubes y crea o administra torneos como organizador.",
};

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
