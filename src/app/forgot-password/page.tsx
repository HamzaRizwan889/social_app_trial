"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/authErrors";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/schemas/forgotPasswordSchema";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: ForgotPasswordValues) => {
    setSubmitError(null);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setSentTo(values.email);
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/15 via-background to-accent p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Reset your password</h1>

        {sentTo ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{sentTo}</span>,
              a reset link is on its way. Check your inbox and your spam folder.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setSentTo(null)}>
              Send again
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a link to choose a new password.
            </p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                  <Input id="reset-email" type="email" {...form.register("email")} />
                  <FieldError>{errors.email?.message}</FieldError>
                </Field>
              </FieldGroup>

              {submitError && <p className="text-sm text-destructive">{submitError}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </>
        )}

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}