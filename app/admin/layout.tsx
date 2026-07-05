import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración",
  description: "Panel de administración de la plataforma: solicitudes y alta de clubes.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
