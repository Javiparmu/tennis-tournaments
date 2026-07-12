import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en CourtRank para inscribirte en torneos y escalar en la clasificación.",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
