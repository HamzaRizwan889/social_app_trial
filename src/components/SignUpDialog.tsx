"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { signUpSchema, type SignUpValues } from "@/schemas/signUpSchema";
import type { UserProfile } from "@/types/user";
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
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function SignUpDialog() {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

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
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger render={<Button />}>
            Sign Up
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create your account</DialogTitle>
            <DialogDescription>
                Fill in your details to get started.
            </DialogDescription>
            </DialogHeader>

            <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            >
            <FieldGroup>
                <Field>
                <FieldLabel htmlFor="fullName">
                    Full name
                </FieldLabel>

                <Input
                    id="fullName"
                    placeholder="Jane Doe"
                    {...form.register("fullName")}
                />

                <FieldError>
                    {form.formState.errors.fullName?.message}
                </FieldError>
                </Field>

                <Field>
                <FieldLabel htmlFor="email">
                    Email
                </FieldLabel>

                <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    {...form.register("email")}
                />

                <FieldError>
                    {form.formState.errors.email?.message}
                </FieldError>
                </Field>

                <Field>
                <FieldLabel htmlFor="password">
                    Password
                </FieldLabel>

                <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                />

                <FieldError>
                    {form.formState.errors.password?.message}
                </FieldError>
                </Field>

                <Field>
                <FieldLabel htmlFor="confirmPassword">
                    Confirm password
                </FieldLabel>

                <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register("confirmPassword")}
                />

                <FieldError>
                    {form.formState.errors.confirmPassword?.message}
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
                {isSubmitting ? "Creating account…" : "Sign Up"}
            </Button>
            </form>
        </DialogContent>
    </Dialog>
  );
}