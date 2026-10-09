"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { startSession } from "@/app/actions/auth";
import { loginSchema, type LoginValues } from "@/schemas/loginSchema";
import GoogleButton from "@/components/GoogleButton";
import PasswordInput from "./PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

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
      const credential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const idToken = await credential.user.getIdToken();

      const result = await startSession({ idToken });
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }

      setOpen(false);
      router.push("/dashboard");
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>Log In</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>Log in with your email and password.</DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input id="login-email" type="email" {...form.register("email")} />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <PasswordInput autoComplete="current-password"  id="login-password" {...form.register("password")} />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>
          </FieldGroup>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Log In"}
          </Button>

          <Link
            href="/forgot-password"
            className="block text-center text-sm text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton />
      </DialogContent>
    </Dialog>
  );
}