import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de CourtRank para inscribirte en torneos y seguir tu progreso.",
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
