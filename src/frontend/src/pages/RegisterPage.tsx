import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, UserPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/useQueries";
import { useAuthStore } from "@/store";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, setBusinessId } = useAuthStore();
  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await registerMutation.mutateAsync({
        name,
        email: email || null,
      });

      setUser({
        id: user.id.toText(),
        principal: user.principal.toText(),
        name: user.name,
        email: user.email || email || "",
        role: user.role as "owner" | "admin" | "support_agent" | "viewer",
        isVerified: false,
        createdAt: new Date(Number(user.createdAt) / 1_000_000).toISOString(),
      });

      if (user.businessId) {
        setBusinessId(user.businessId.toString());
      }

      toast.success("Account created successfully");
      navigate({ to: "/otp" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
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
                <UserPlus className="size-6" />
              </div>
              <CardTitle className="font-display text-2xl">
                Create account
              </CardTitle>
              <CardDescription>
                Start your SupportAI journey today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    data-ocid="register.name_input"
                    id="name"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    data-ocid="register.email_input"
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button
                  data-ocid="register.submit_button"
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  Already have an account?{" "}
                </span>
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
