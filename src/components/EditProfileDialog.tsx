"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";
import { uploadImage } from "@/lib/cloudinary";
import { imageFileSchema, profileSchema, type ProfileValues } from "@/schemas/profileSchema";
import type { UserProfile } from "@/types/user";
import UserAvatar from "@/components/UserAvatar";
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
import { Textarea } from "@/components/ui/textarea";

interface EditProfileDialogProps {
  profile: UserProfile;
}

export default function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName, bio: profile.bio },
  });
  const { errors, isSubmitting } = form.formState;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      form.reset({ fullName: profile.fullName, bio: profile.bio });
      setFile(null);
      setPreview(null);
      setFileError(null);
      setSubmitError(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    const result = imageFileSchema.safeParse(selected);
    if (!result.success) {
      setFile(null);
      setPreview(null);
      setFileError(result.error.issues[0].message);
      return;
    }
    setFileError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const onSubmit = async (values: ProfileValues) => {
    setSubmitError(null);
    try {
      const photoURL = file ? await uploadImage(file) : profile.photoURL;
      const result = await updateProfile({ fullName: values.fullName, bio: values.bio, photoURL });
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      toast.success("Profile updated");
      setOpen(false);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "Could not update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Edit profile</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your name, bio and picture.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={profile.fullName}
              photoURL={preview ?? profile.photoURL}
              className="h-20 w-20 text-xl"
            />
            <div className="flex-1 space-y-1">
              <FieldLabel htmlFor="edit-photo">Profile picture</FieldLabel>
              <Input id="edit-photo" type="file" accept="image/*" onChange={handleFileChange} />
              {fileError && <p className="text-sm text-destructive">{fileError}</p>}
            </div>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-name">Full name</FieldLabel>
              <Input id="edit-name" {...form.register("fullName")} />
              <FieldError>{errors.fullName?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-bio">Bio</FieldLabel>
              <Textarea id="edit-bio" rows={4} {...form.register("bio")} />
              <FieldError>{errors.bio?.message}</FieldError>
            </Field>
          </FieldGroup>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}