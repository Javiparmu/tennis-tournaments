"use client";

import { useSignIn } from "@clerk/nextjs";
import { Button, Form } from "@heroui/react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { inputClass } from "@/components/modal-shell";
import { clerkErrorMessage } from "./clerk-errors";
import { makeNavigate } from "./finalize-navigate";
import { AuthDivider, GoogleButton } from "./social-buttons";

// The sign-in is a small state machine: the credential step ("start") can branch
// into a passwordless email-code step or a password-reset step, each with its own
// verification form. Clerk drives everything through the headless `useSignIn()` hook.
type Step = "start" | "email-code" | "reset";

function Field({ htmlFor, label, children }: { htmlFor: string; label: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2 text-sm font-medium text-stone-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const busy = fetchStatus === "fetching";

  const finalize = () => signIn.finalize({ navigate: makeNavigate(router) });

  const backToStart = () => {
    setStep("start");
    setCode("");
    setNewPassword("");
    setFormError(null);
    setInfo(null);
    void signIn.reset();
  };

  const handlePassword = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const { error } = await signIn.password({ identifier: email, password });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }
    if (signIn.status === "complete") await finalize();
    else setFormError("No se pudo completar el inicio de sesión.");
  };

  const handleGoogle = async () => {
    setFormError(null);
    const { error } = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: "/",
      redirectCallbackUrl: "/sso-callback",
    });
    if (error) setFormError(clerkErrorMessage(error));
  };

  const handleSendEmailCode = async () => {
    setFormError(null);
    if (!email.trim()) {
      setFormError("Introduce tu correo electrónico.");
      return;
    }
    const { error } = await signIn.emailCode.sendCode({ emailAddress: email });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }
    setInfo("Te enviamos un código de acceso a tu correo.");
    setStep("email-code");
  };

  const handleVerifyEmailCode = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const { error } = await signIn.emailCode.verifyCode({ code });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }
    if (signIn.status === "complete") await finalize();
  };

  const handleSendReset = async () => {
    setFormError(null);
    if (!email.trim()) {
      setFormError("Introduce tu correo para restablecer la contraseña.");
      return;
    }
    // Seed the sign-in with the identifier so the reset code targets this account.
    const { error: createError } = await signIn.create({ identifier: email });
    if (createError) {
      setFormError(clerkErrorMessage(createError));
      return;
    }
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }
    setInfo("Te enviamos un código para restablecer la contraseña.");
    setStep("reset");
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (verifyError) {
      setFormError(clerkErrorMessage(verifyError));
      return;
    }
    const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (submitError) {
      setFormError(clerkErrorMessage(submitError));
      return;
    }
    if (signIn.status === "complete") await finalize();
  };

  const errorLine = formError ? <p className="text-sm text-rose-600">{formError}</p> : null;
  const infoLine = info ? <p className="text-sm text-court">{info}</p> : null;

  if (step === "email-code") {
    return (
      <Form className="space-y-4" onSubmit={handleVerifyEmailCode}>
        {infoLine}
        <Field htmlFor="signin-email-code" label="Código de acceso">
          <input
            required
            id="signin-email-code"
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
          Verificar y entrar
        </Button>
        <button
          type="button"
          onClick={backToStart}
          className="w-full text-sm font-medium text-stone-500 hover:text-court"
        >
          Volver
        </button>
      </Form>
    );
  }

  if (step === "reset") {
    return (
      <Form className="space-y-4" onSubmit={handleReset}>
        {infoLine}
        <Field htmlFor="signin-reset-code" label="Código de restablecimiento">
          <input
            required
            id="signin-reset-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className={inputClass}
          />
        </Field>
        <Field htmlFor="signin-new-password" label="Nueva contraseña">
          <input
            required
            id="signin-new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </Field>
        {errorLine}
        <Button type="submit" className="w-full bg-court text-ball-bright hover:bg-court-hover" isDisabled={busy}>
          Cambiar contraseña y entrar
        </Button>
        <button
          type="button"
          onClick={backToStart}
          className="w-full text-sm font-medium text-stone-500 hover:text-court"
        >
          Volver
        </button>
      </Form>
    );
  }

  return (
    <div className="space-y-5">
      <GoogleButton onPress={handleGoogle} isDisabled={busy} />
      <AuthDivider />

      <Form className="space-y-4" onSubmit={handlePassword}>
        <Field htmlFor="signin-email" label="Correo electrónico">
          <input
            required
            id="signin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className={inputClass}
          />
        </Field>
        <Field htmlFor="signin-password" label="Contraseña">
          <input
            required
            id="signin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </Field>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSendReset}
            className="text-sm font-medium text-court hover:text-court-hover"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {errorLine}

        <Button type="submit" className="w-full bg-court text-ball-bright hover:bg-court-hover" isDisabled={busy}>
          Iniciar sesión
        </Button>
      </Form>

      <button
        type="button"
        onClick={handleSendEmailCode}
        className="w-full text-sm font-medium text-stone-500 hover:text-court"
      >
        Prefiero usar un código de acceso
      </button>
    </div>
  );
}
