import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetCallerUser } from "@/hooks/useQueries";
import { useAuthStore } from "@/store";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setBusinessId } = useAuthStore();
  const { login, loginStatus } = useInternetIdentity();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { refetch: refetchUser } = useGetCallerUser();

  const handleInternetIdentityLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      await login();

      const { data: user } = await refetchUser();

      if (user) {
        setUser({
          id: user.id.toText(),
          principal: user.principal.toText(),
          name: user.name,
          email: user.email || "",
          role: user.role as "owner" | "admin" | "support_agent" | "viewer",
          isVerified: true,
          createdAt: new Date(Number(user.createdAt) / 1_000_000).toISOString(),
        });
        if (user.businessId) {
          setBusinessId(user.businessId.toString());
        }
        toast.success("Signed in successfully");
        navigate({ to: "/dashboard" });
      } else {
        toast.info("No account found. Please register.");
        navigate({ to: "/register" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LogIn className="size-6" />
              </div>
              <CardTitle className="font-display text-2xl">
                Welcome back
              </CardTitle>
              <CardDescription>
                Sign in to your SupportAI account with Internet Identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <p className="text-destructive text-center text-sm">{error}</p>
              )}
              <Button
                data-ocid="login.ii_button"
                onClick={handleInternetIdentityLogin}
                disabled={isLoading || loginStatus === "logging-in"}
                className="w-full"
                size="lg"
              >
                {isLoading || loginStatus === "logging-in"
                  ? "Signing in..."
                  : "Sign in with Internet Identity"}
              </Button>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                </span>
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
