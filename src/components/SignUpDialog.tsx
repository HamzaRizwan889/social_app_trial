"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

import { auth, db } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { signUpSchema, type SignUpValues } from "@/schemas/signUpSchema";
import type { UserProfile } from "@/types/user";

import GoogleButton from "@/components/GoogleButton";
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

export default function SignUpDialog() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const { errors, isSubmitting } = form.formState;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      form.reset();
      setSubmitError(null);
    }
  };

  const onSubmit = async (values: SignUpValues) => {
    setSubmitError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, values.email, values.password);

      const profile: UserProfile = {
        uid: credential.user.uid,
        fullName: values.fullName,
        email: values.email,
        bio: "",
        photoURL: null,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", credential.user.uid), profile);

      setOpen(false);
      toast.success("Account created successfully");
      router.push("/dashboard");
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>Sign Up</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
          <DialogDescription>Fill in your details to get started.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="signup-name">Full name</FieldLabel>
              <Input id="signup-name" placeholder="Jane Doe" {...form.register("fullName")} />
              <FieldError>{errors.fullName?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input id="signup-email" type="email" {...form.register("email")} />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <Input id="signup-password" type="password" {...form.register("password")} />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-confirm">Confirm password</FieldLabel>
              <Input id="signup-confirm" type="password" {...form.register("confirmPassword")} />
              <FieldError>{errors.confirmPassword?.message}</FieldError>
            </Field>
          </FieldGroup>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Sign Up"}
          </Button>
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