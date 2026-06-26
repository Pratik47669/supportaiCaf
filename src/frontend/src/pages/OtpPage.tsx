import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
import { useGenerateOtp, useVerifyOtp } from "@/hooks/useQueries";
import { useAuthStore } from "@/store";

export default function OtpPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const generateOtpMutation = useGenerateOtp();
  const verifyOtpMutation = useVerifyOtp();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setIsLoading(true);

    try {
      const email = user?.email || "";
      if (!email) {
        setError("No email found. Please register again.");
        setIsLoading(false);
        return;
      }

      await verifyOtpMutation.mutateAsync({ email, code });

      if (user) {
        setUser({ ...user, isVerified: true });
      }

      toast.success("Email verified successfully");
      navigate({ to: "/onboarding" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setCountdown(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    const email = user?.email || "";
    if (!email) {
      setError("No email found. Please register again.");
      return;
    }

    try {
      await generateOtpMutation.mutateAsync(email);
      toast.success("New code sent");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resend code";
      toast.error(message);
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
                <Mail className="size-6" />
              </div>
              <CardTitle className="font-display text-2xl">
                Verify your email
              </CardTitle>
              <CardDescription>
                We sent a 6-digit code to{" "}
                <span className="text-foreground font-medium">
                  {user?.email || "your email"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={`otp-input-${index}-${digit}`}
                      data-ocid={`otp.digit_input.${index + 1}`}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="h-12 w-12 text-center text-lg font-semibold"
                      required
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-destructive text-center text-sm">
                    {error}
                  </p>
                )}
                <Button
                  data-ocid="otp.verify_button"
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify email"}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                <RotateCcw className="size-3.5" />
                {countdown > 0 ? (
                  <span className="text-muted-foreground">
                    Resend code in {countdown}s
                  </span>
                ) : (
                  <button
                    data-ocid="otp.resend_button"
                    type="button"
                    onClick={handleResend}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
