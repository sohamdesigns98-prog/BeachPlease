import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import SydneySuburbSelect from "@/components/SydneySuburbSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";

const COMPANION_OPTIONS = ["solo", "partner", "friends", "family", "dog"];
const TRAVEL_OPTIONS = ["walk", "public_transport", "drive"];

const profileSchema = z.object({
  suburb: z.string().min(1, "Choose a BeachPlease beach suburb."),
  postcode: z.string().optional(),
  suburb_lat: z.number().nullable().optional(),
  suburb_lng: z.number().nullable().optional(),
  companions: z.enum(COMPANION_OPTIONS),
  travel_mode: z.enum(TRAVEL_OPTIONS),
});

export default function Profile() {
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      suburb: "",
      postcode: "",
      suburb_lat: null,
      suburb_lng: null,
      companions: "solo",
      travel_mode: "public_transport",
    },
  });
  const {
    control,
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!user) return;
    reset({
      suburb: user.suburb || "",
      postcode: user.postcode || "",
      suburb_lat: user.suburb_lat ?? null,
      suburb_lng: user.suburb_lng ?? null,
      companions: user.companions || "solo",
      travel_mode: user.travel_mode || "public_transport",
    });
  }, [reset, user]);

  async function onSubmit(values) {
    try {
      await updateProfile(values);
      toast.success("Profile saved. Future beach picks just got less guessy.");
    } catch (caughtError) {
      toast.error(getApiErrorMessage(caughtError, "Couldn't save profile."));
    }
  }

  async function handleDelete() {
    try {
      await deleteAccount();
      navigate("/", { replace: true });
    } catch (caughtError) {
      toast.error(getApiErrorMessage(caughtError, "Couldn't delete account."));
    }
  }

  return (
    <main className="auth-page">
      <Form {...form}>
        <form className="auth-panel profile-panel" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-heading">
            <p>Profile</p>
            <h1>Your beach settings</h1>
            <span>Small details. Better recommendations.</span>
          </div>

          <label>
            Email
            <Input value={user?.email || ""} readOnly />
          </label>

          <label>
            BeachPlease suburb
            <Controller
              control={control}
              name="suburb"
              render={({ field }) => (
                <SydneySuburbSelect
                  value={field.value}
                  error={errors.suburb?.message}
                  disabled={isSubmitting}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  onSelectMeta={(meta) => {
                    setValue("postcode", meta.postcode || "");
                    setValue("suburb_lat", meta.suburb_lat ?? null);
                    setValue("suburb_lng", meta.suburb_lng ?? null);
                  }}
                />
              )}
            />
            {errors.suburb && <span className="auth-field-error">{errors.suburb.message}</span>}
          </label>

          <label>
            Companions
            <select aria-invalid={Boolean(errors.companions)} {...register("companions")}>
              {COMPANION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Travel mode
            <select aria-invalid={Boolean(errors.travel_mode)} {...register("travel_mode")}>
              {TRAVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>

          <div className="profile-actions">
            <Button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save profile"}
            </Button>
            <Button type="button" variant="outline" onClick={logout}>
              LOG OUT
            </Button>
            <ConfirmDeleteDialog
              title="Delete your account?"
              description="This removes your profile, saved plans, and clusters. This cannot be undone."
              confirmLabel="Delete account"
              onConfirm={handleDelete}
            >
              <Button type="button" variant="outline" className="danger-button">
                DELETE ACCOUNT
              </Button>
            </ConfirmDeleteDialog>
          </div>
        </form>
      </Form>
    </main>
  );
}
