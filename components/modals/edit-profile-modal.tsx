"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Save, X } from "lucide-react";
import { updateProfile } from "@/lib/api/profile";
import type { AuthUser } from "@/lib/api/types";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  onSuccess: (updated: AuthUser) => void;
}

interface ProfileFormData {
  first_name: string;
  second_name: string;
  phone: string;
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditProfileModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user && open) {
      reset({
        first_name: user.first_name ?? "",
        second_name: user.second_name ?? "",
        phone: user.profile?.phone ?? "",
      });
    }
  }, [user, open, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updated = await updateProfile({
        first_name: data.first_name,
        second_name: data.second_name,
        phone: data.phone,
      });

      toast.success("Profile updated successfully!");
      onSuccess(updated);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <UserCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <Dialog.Title className="text-xl font-semibold text-foreground">
                Edit Profile
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Update your personal information
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                placeholder="Your first name"
                {...register("first_name", {
                  required: "First name is required",
                })}
              />
              {errors.first_name && (
                <p className="text-xs text-destructive">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="second_name">Last Name</Label>
              <Input
                id="second_name"
                placeholder="Your last name"
                {...register("second_name", {
                  required: "Last name is required",
                })}
              />
              {errors.second_name && (
                <p className="text-xs text-destructive">
                  {errors.second_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email ?? ""}
                disabled
                className="opacity-60 cursor-not-allowed"
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+254..." {...register("phone")} />
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
