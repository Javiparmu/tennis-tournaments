"use client";

import { useAuth, useSignUp } from "@clerk/nextjs";
import { Button, Form } from "@heroui/react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { inputClass } from "@/components/host/modal-shell";
import { clerkErrorMessage } from "./clerk-errors";
import { makeNavigate } from "./finalize-navigate";
import { AuthDivider, GoogleButton } from "./social-buttons";

// Two steps: collect credentials ("start"), then verify the emailed code ("verify").
// Clerk's headless `useSignUp()` drives both; SSO short-circuits to the OAuth redirect.
type Step = "start" | "verify";

function Field({ htmlFor, label, children }: { htmlFor: string; label: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2 text-sm font-medium text-zinc-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("start");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const busy = fetchStatus === "fetching";

  // Already authenticated — nothing to render (e.g. after finalize navigates).
  if (isSignedIn) return null;

  const finalize = () => signUp.finalize({ navigate: makeNavigate(router) });

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }
    if (signUp.status === "complete") {
      await finalize();
      return;
    }
    // Email address still needs verifying — send the code and move to the verify step.
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setFormError(clerkErrorMessage(sendError));
      return;
    }
    setInfo("Te enviamos un código de verificación a tu correo.");
    setStep("verify");
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }
    if (signUp.status === "complete") await finalize();
  };

  const handleGoogle = async () => {
    setFormError(null);
    const { error } = await signUp.sso({
      strategy: "oauth_google",
      redirectUrl: "/",
      redirectCallbackUrl: "/sso-callback",
    });
    if (error) setFormError(clerkErrorMessage(error));
  };

  const backToStart = () => {
    setStep("start");
    setCode("");
    setFormError(null);
    setInfo(null);
    void signUp.reset();
  };

  const errorLine = formError ? <p className="text-sm text-rose-600">{formError}</p> : null;
  const infoLine = info ? <p className="text-sm text-court">{info}</p> : null;

  if (step === "verify") {
    return (
      <Form className="space-y-4" onSubmit={handleVerify}>
        {infoLine}
        <Field htmlFor="signup-code" label="Código de verificación">
          <input
            required
            id="signup-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className={inputClass}
          />
        </Field>
        {errorLine}
        <Button type="submit" className="w-full bg-court text-ball-bright hover:bg-court-hover" isDisabled={busy}>
          Verificar y crear cuenta
        </Button>
        <button type="button" onClick={backToStart} className="w-full text-sm font-medium text-zinc-500 hover:text-court">
          Volver
        </button>
      </Form>
    );
  }

  return (
    <div className="space-y-5">
      <GoogleButton onPress={handleGoogle} isDisabled={busy} label="Regístrate con Google" />
      <AuthDivider />

      <Form className="space-y-4" onSubmit={handleCreate}>
        <div className="grid grid-cols-2 gap-3">
          <Field htmlFor="signup-first-name" label="Nombre">
            <input
              id="signup-first-name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Rafael"
              className={inputClass}
            />
          </Field>
          <Field htmlFor="signup-last-name" label="Apellidos">
            <input
              id="signup-last-name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nadal"
              className={inputClass}
            />
          </Field>
        </div>
        <Field htmlFor="signup-email" label="Correo electrónico">
          <input
            required
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className={inputClass}
          />
        </Field>
        <Field htmlFor="signup-password" label="Contraseña">
          <input
            required
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </Field>

        {errorLine}

        {/* Clerk bot protection (Smart CAPTCHA) mounts here; required for sign-up. */}
        <div id="clerk-captcha" />

        <Button type="submit" className="w-full bg-court text-ball-bright hover:bg-court-hover" isDisabled={busy}>
          Crear cuenta
        </Button>
      </Form>
    </div>
  );
}
