"use client";

import { useEffect } from "react";

// Replaces the root layout when the layout itself throws, so it must render its
// own <html>/<body>. Kept dependency-free with inline styles (global CSS/fonts
// from the root layout are not guaranteed here).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fafcf6",
          color: "#0e1a12",
        }}
      >
        <title>Error — CourtRank</title>
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Algo ha salido mal</h1>
          <p style={{ fontSize: 14, color: "#52525b", margin: "0 0 20px" }}>
            Se ha producido un error inesperado. Vuelve a intentarlo.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#0b6b3a",
              color: "#d7ff3e",
              border: "none",
              borderRadius: 12,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
