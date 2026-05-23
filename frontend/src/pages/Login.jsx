import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import GoogleOAuthButton from "@/components/GoogleOAuthButton";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";

const loginSchema = z.object({
  email: z.string().trim().email("Use a valid email."),
  password: z.string().min(6, "Password needs at least 6 characters."),
});

export default function Login() {
  const { login, loginWithGoogle, token } = useAuth();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;
  const from = "/explore/canvas";

  if (token) return <Navigate to={from} replace />;

  async function onSubmit(form) {
    try {
      await login(form);
      toast.success("Logged in. Your saved beach shelf is back.");
      navigate(from, { replace: true });
    } catch (caughtError) {
      toast.error(getApiErrorMessage(caughtError, "Couldn't log you in. Check the details and try again."));
    }
  }

  async function handleGoogleCredential(credential) {
    try {
      const response = await loginWithGoogle(credential);
      toast.success("Google login worked. Welcome back.");
      navigate(response.user?.profile_complete ? from : "/profile", { replace: true });
    } catch (caughtError) {
      toast.error(getApiErrorMessage(caughtError, "Couldn't log you in with Google."));
    }
  }

  return (
    <main className="auth-page">
      <Form {...form}>
        <form className="auth-panel" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="auth-heading">
            <p>BeachPlease</p>
            <h1>Log in</h1>
            <span>Come back to the beaches you kept, notes included.</span>
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
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
        </label>

        <Button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Log in"}
        </Button>

        <GoogleOAuthButton onCredential={handleGoogleCredential} disabled={isSubmitting} />

        <p className="auth-muted">
          No account yet? <Link to="/register">Sign up</Link>
        </p>
        </form>
      </Form>
    </main>
  );
}
