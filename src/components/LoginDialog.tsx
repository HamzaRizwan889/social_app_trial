"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { z } from "zod";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { loginSchema, type LoginValues } from "@/schemas/loginSchema";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);

    if (next) {
      form.reset();
      setSubmitError(null);
    }
  };

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null);

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);

      setOpen(false);
      router.push("/dashboard");
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  const handleForgotPassword = async () => {
    setSubmitError(null);

    const parsed = z
      .string()
      .email()
      .safeParse(form.getValues("email"));

    if (!parsed.success) {
      form.setError("email", {
        message: "Enter your email above first",
      });
      return;
    }

    setResetting(true);

    try {
      await sendPasswordResetEmail(auth, parsed.data);

      toast.success("Password reset email sent. Check your inbox.");
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        Log In
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>
            Log in with your email and password.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">
                Email
              </FieldLabel>

              <Input
                id="login-email"
                type="email"
                {...form.register("email")}
              />

              <FieldError>
                {form.formState.errors.email?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="login-password">
                Password
              </FieldLabel>

              <Input
                id="login-password"
                type="password"
                {...form.register("password")}
              />

              <FieldError>
                {form.formState.errors.password?.message}
              </FieldError>
            </Field>
          </FieldGroup>

          {submitError && (
            <p className="text-sm text-destructive">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in…" : "Log In"}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={handleForgotPassword}
            disabled={resetting}
          >
            {resetting ? "Sending…" : "Forgot password?"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}