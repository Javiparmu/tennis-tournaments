// Spanish copy for Clerk errors. Dropping the prebuilt widgets also drops
// `localization={esES}`, so headless flows must render their own Spanish messages.
// We map the common error `code`s and fall back to Clerk's own message text.

type ClerkishError =
  | {
      code?: string;
      message?: string;
      longMessage?: string;
    }
  | null
  | undefined;

const MESSAGES: Record<string, string> = {
  form_identifier_not_found: "No encontramos ninguna cuenta con ese correo.",
  form_password_incorrect: "Contraseña incorrecta. Inténtalo de nuevo.",
  form_identifier_exists: "Ya existe una cuenta con ese correo.",
  form_code_incorrect: "El código no es válido. Revísalo e inténtalo de nuevo.",
  verification_expired: "El código ha caducado. Solicita uno nuevo.",
  form_password_pwned: "Esta contraseña ha aparecido en filtraciones de datos. Elige otra más segura.",
  form_password_length_too_short: "La contraseña es demasiado corta.",
  form_param_format_invalid: "El formato del correo no es válido.",
  form_password_validation_failed: "La contraseña no cumple los requisitos.",
  session_exists: "Ya has iniciado sesión.",
  captcha_invalid: "No pudimos verificar que no eres un robot. Recarga la página e inténtalo de nuevo.",
};

// Resolve a single Clerk error to Spanish. Falls back to Clerk's longMessage/message,
// then a generic line.
export function clerkErrorMessage(error: ClerkishError): string {
  if (!error) return "Algo salió mal. Inténtalo de nuevo.";
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return error.longMessage ?? error.message ?? "Algo salió mal. Inténtalo de nuevo.";
}
