import { describe, expect, it } from "vitest";
import { resolveApiErrorCopy } from "./error-copy";

describe("resolveApiErrorCopy", () => {
  it("returns operation-specific copy when one exists for the status", () => {
    expect(resolveApiErrorCopy(409, "tournament.create")).toBe("Ya existe un torneo con ese nombre.");
    expect(resolveApiErrorCopy(404, "player.fetch")).toBe("No existe ningún jugador con ese nombre de usuario.");
  });

  it("distinguishes the same status across different operations", () => {
    expect(resolveApiErrorCopy(409, "tournament.create")).toBe("Ya existe un torneo con ese nombre.");
    expect(resolveApiErrorCopy(409, "tournament.start")).toBe("El torneo no se puede iniciar en su estado actual.");
  });

  it("maps an unknown email to add-players copy on 404", () => {
    expect(resolveApiErrorCopy(404, "tournament.addPlayers")).toBe("No existe ningún usuario con ese correo.");
    // The 409 override still stands.
    expect(resolveApiErrorCopy(409, "tournament.addPlayers")).toBe(
      "Alguno de los jugadores ya está inscrito en el torneo.",
    );
  });

  it("falls back to generic status copy when the operation has no override", () => {
    // player.update defines 403 but not 409 → generic 409 copy.
    expect(resolveApiErrorCopy(409, "player.update")).toBe("La acción no se puede completar en este momento.");
  });

  it("uses generic status copy when no operation is given", () => {
    expect(resolveApiErrorCopy(403)).toBe("No tienes permiso para realizar esta acción.");
    expect(resolveApiErrorCopy(404)).toBe("No se ha encontrado lo que buscabas.");
    expect(resolveApiErrorCopy(500)).toBe("Ha ocurrido un error en el servidor. Inténtalo de nuevo.");
  });

  it("buckets unmapped statuses (unknown 4xx → 400, unknown 5xx → 500)", () => {
    expect(resolveApiErrorCopy(418)).toBe("Revisa los datos e inténtalo de nuevo.");
    expect(resolveApiErrorCopy(503)).toBe("Ha ocurrido un error en el servidor. Inténtalo de nuevo.");
  });

  it("returns null with no status so client-side ApiErrors keep their own Spanish message", () => {
    expect(resolveApiErrorCopy(undefined)).toBeNull();
    expect(resolveApiErrorCopy(undefined, "tournament.create")).toBeNull();
  });

  it("never leaks anything that looks like a backend id or English text", () => {
    const samples = [
      resolveApiErrorCopy(409, "match.score"),
      resolveApiErrorCopy(409, "joinRequest.create"),
      resolveApiErrorCopy(404, "player.fetch"),
    ];
    for (const copy of samples) {
      expect(copy).not.toMatch(/\d/);
      expect(copy).toMatch(/[áéíóúñ¿¡]|torneo|jugador|partido|solicitud/i);
    }
  });
});
