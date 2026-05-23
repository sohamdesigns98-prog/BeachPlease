import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import SydneySuburbSelect from "@/components/SydneySuburbSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().trim().email("Use a valid email."),
  password: z.string().min(6, "Password needs at least 6 characters."),
});

const registerSchema = loginSchema.extend({
  suburb: z.string().min(1, "Choose a Sydney suburb from the list."),
  postcode: z.string().optional(),
  suburb_lat: z.number().nullable().optional(),
  suburb_lng: z.number().nullable().optional(),
});

export default function AuthSheet({
  isOpen = false,
  isSubmitting = false,
  error = "",
  onClose,
  onLogin,
  onRegister,
}) {
  const [mode, setMode] = useState("register");
  const schema = useMemo(() => (mode === "login" ? loginSchema : registerSchema), [mode]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", suburb: "", postcode: "", suburb_lat: null, suburb_lng: null },
  });
  const {
    control,
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset({ email: "", password: "", suburb: "", postcode: "", suburb_lat: null, suburb_lng: null });
  }, [mode, reset]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (!isOpen) return null;

  function onSubmit(payload) {
    if (mode === "login") {
      onLogin?.({ email: payload.email, password: payload.password });
      return;
    }

    onRegister?.({
      email: payload.email,
      password: payload.password,
      suburb: payload.suburb,
      postcode: payload.postcode || "",
      suburb_lat: payload.suburb_lat ?? null,
      suburb_lng: payload.suburb_lng ?? null,
    });
  }

  return (
    <section className="auth-sheet" aria-label="Save your plan">
      <button
        type="button"
        className="auth-sheet-close"
        aria-label="Close save sheet"
        onClick={onClose}
      >
        x
      </button>

      <div className="auth-sheet-copy">
        <p>Save this one</p>
        <h2>{mode === "login" ? "log in + save" : "make an account, keep the beach"}</h2>
        <span>Your saved beaches, notes, and regenerated plans stay attached to you.</span>
      </div>

      <Form {...form}>
        <form className="auth-sheet-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            type="email"
            placeholder="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <span className="auth-field-error">{errors.email.message}</span>}

        <Input
          type="password"
          placeholder="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && <span className="auth-field-error">{errors.password.message}</span>}

        {mode === "register" && (
          <>
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
          </>
        )}

          <Button type="submit" className="auth-sheet-primary" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "login"
                ? "Log in + save"
                : "Create account + save"}
          </Button>
        </form>
      </Form>

      <button
        type="button"
        className="auth-sheet-mode"
        onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
      >
        {mode === "login"
          ? "need an account? create one"
          : "already have an account? log in"}
      </button>
    </section>
  );
}
