import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Check, Globe, Users } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBusiness } from "@/hooks/useQueries";
import { useAuthStore, useBusinessStore } from "@/store";

const industries = [
  "Technology",
  "E-commerce",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Other",
];

const sizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

const steps = [
  { label: "Business Info", icon: Building2 },
  { label: "Details", icon: Users },
  { label: "Review", icon: Check },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setBusiness, setOnboardingComplete } = useBusinessStore();
  const { user } = useAuthStore();
  const createBusinessMutation = useCreateBusiness();

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [supportEmail, setSupportEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState("");

  const canProceedStep0 = businessName && slug;
  const canProceedStep1 = industry && size;

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const business = await createBusinessMutation.mutateAsync({
        name: businessName,
        industry,
        website: website || null,
        description,
        teamSize: size,
        logoUrl: null,
        supportEmail: supportEmail || user?.email || "support@example.com",
        phoneNumber: phoneNumber || null,
      });

      setBusiness({
        id: business.id.toString(),
        name: business.name,
        slug,
        description: business.description,
        website: business.website || undefined,
        industry: business.industry,
        size: business.teamSize,
        ownerId: user?.id || "",
        createdAt: new Date(
          Number(business.createdAt) / 1_000_000,
        ).toISOString(),
      });
      useAuthStore.getState().setBusinessId(business.id.toString());
      setOnboardingComplete(true);
      toast.success("Business created successfully");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create business";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <div className="flex items-center justify-end px-4 py-3">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">
                Set up your business
              </CardTitle>
              <CardDescription>
                Tell us about your company to get started
              </CardDescription>

              {/* Stepper */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {steps.map((s, index) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${
                        index <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <s.icon className="size-3.5" />
                    </div>
                    <span
                      className={`hidden text-xs font-medium sm:inline ${
                        index <= step
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-px w-6 ${
                          index < step ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {step === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business name</Label>
                    <Input
                      data-ocid="onboarding.business_name_input"
                      id="businessName"
                      placeholder="Acme Corporation"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL slug</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        support.ai/
                      </span>
                      <Input
                        data-ocid="onboarding.slug_input"
                        id="slug"
                        placeholder="acme"
                        value={slug}
                        onChange={(e) =>
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      data-ocid="onboarding.description_input"
                      id="description"
                      placeholder="What does your business do?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">
                      Website{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Globe className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        data-ocid="onboarding.website_input"
                        id="website"
                        placeholder="https://acme.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger data-ocid="onboarding.industry_select">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Company size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger data-ocid="onboarding.size_select">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support email</Label>
                    <Input
                      data-ocid="onboarding.support_email_input"
                      id="supportEmail"
                      type="email"
                      placeholder="support@acme.com"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Phone number{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      data-ocid="onboarding.phone_input"
                      id="phoneNumber"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-muted/50 rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Business name
                      </span>
                      <span className="text-sm font-medium">
                        {businessName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Slug
                      </span>
                      <span className="text-sm font-medium">{slug}</span>
                    </div>
                    {description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Description
                        </span>
                        <span className="text-sm font-medium">
                          {description}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Industry
                      </span>
                      <span className="text-sm font-medium">{industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Size
                      </span>
                      <span className="text-sm font-medium">{size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Support email
                      </span>
                      <span className="text-sm font-medium">
                        {supportEmail}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="mt-6 flex gap-3">
                {step > 0 && (
                  <Button
                    data-ocid="onboarding.back_button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                {step < 2 ? (
                  <Button
                    data-ocid="onboarding.next_button"
                    onClick={handleNext}
                    disabled={
                      (step === 0 && !canProceedStep0) ||
                      (step === 1 && !canProceedStep1)
                    }
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button
                    data-ocid="onboarding.submit_button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Setting up..." : "Complete setup"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
