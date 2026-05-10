import { Link, Navigate, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import GoogleOAuthButton from "@/components/GoogleOAuthButton";
import SydneySuburbSelect from "@/components/SydneySuburbSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";

const COMPANION_OPTIONS = ["solo", "partner", "friends", "family", "dog"];
const TRAVEL_OPTIONS = ["walk", "public_transport", "drive"];

const registerSchema = z.object({
  email: z.string().trim().email("Use a valid email."),
  password: z.string().min(6, "Password needs at least 6 characters."),
  suburb: z.string().min(1, "Choose a Sydney suburb from the list."),
  postcode: z.string().optional(),
  suburb_lat: z.number().nullable().optional(),
  suburb_lng: z.number().nullable().optional(),
  companions: z.enum(COMPANION_OPTIONS),
  travel_mode: z.enum(TRAVEL_OPTIONS),
});

export default function Register() {
  const { register: createAccount, loginWithGoogle, token } = useAuth();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
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
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  if (token) return <Navigate to="/explore/canvas" replace />;

  async function onSubmit(form) {
    try {
      await createAccount(form);
      toast.success("Account made. Your beach memory is on.");
      navigate("/explore/canvas", { replace: true });
    } catch (caughtError) {
      toast.error(getApiErrorMessage(caughtError, "Couldn't create the account. Give it another go."));
    }
  }

  async function handleGoogleCredential(credential) {
    try {
      const response = await loginWithGoogle(credential);
      toast.success(response.user?.profile_complete ? "Google signup is ready." : "Google signup is ready. Add your beach settings next.");
      navigate(response.user?.profile_complete ? "/explore/canvas" : "/profile", { replace: true });
    } catch (caughtError) {
      toast.error(getApiErrorMessage(caughtError, "Couldn't continue with Google."));
    }
  }

  return (
    <main className="auth-page">
      <Form {...form}>
        <form className="auth-panel" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-heading">
            <p>BEACHPLEASE</p>
            <h1>Sign up</h1>
            <span>Save postcards, build a beach shelf, and let recommendations remember your side of Sydney.</span>
          </div>

        <label>
          Email
          <Input
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <span className="auth-field-error">{errors.email.message}</span>}
        </label>

        <label>
          Password
          <Input
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
        </label>

        <label>
          Sydney suburb
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
          Beach company
          <select aria-invalid={Boolean(errors.companions)} {...register("companions")}>
            {COMPANION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Usual travel mode
          <select aria-invalid={Boolean(errors.travel_mode)} {...register("travel_mode")}>
            {TRAVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>

        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "saving..." : "SIGN UP"}
        </Button>

        <GoogleOAuthButton onCredential={handleGoogleCredential} disabled={isSubmitting} />

        <p className="auth-muted">
          Already sorted? <Link to="/login">Log in</Link>
        </p>
        </form>
      </Form>
    </main>
  );
}
