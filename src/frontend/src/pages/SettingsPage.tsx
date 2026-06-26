import {
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Moon,
  RotateCcw,
  Save,
  Sun,
  ToggleLeft,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { SidebarLayout } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  useGetGeminiApiKey,
  useGetMyBusiness,
  useSetGeminiApiKey,
  useUpdateBusiness,
} from "@/hooks/useQueries";
import {
  type FeatureToggles,
  useAiStore,
  useAuthStore,
  useBusinessStore,
  useFeatureToggleStore,
} from "@/store";

function UserProfileCard() {
  const { user } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <User className="size-5 text-primary" />
          User Profile
        </CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-semibold">
              {user?.name || "User"}
            </p>
            <p className="text-muted-foreground text-sm">
              {user?.email || "—"}
            </p>
            <Badge variant="secondary" className="mt-1 capitalize">
              {user?.role?.replace("_", " ") || "Member"}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Full Name</Label>
            <p className="text-sm font-medium">{user?.name || "—"}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Email</Label>
            <p className="text-sm font-medium">{user?.email || "—"}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Role</Label>
            <p className="text-sm font-medium capitalize">
              {user?.role?.replace("_", " ") || "—"}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Status</Label>
            <div className="flex items-center gap-1.5">
              <span className="bg-chart-3 size-2 rounded-full" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BusinessProfileCard() {
  const { business } = useBusinessStore();
  const { data: backendBusiness } = useGetMyBusiness();
  const updateBusiness = useUpdateBusiness();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: business?.name || "",
    industry: business?.industry || "",
    description: business?.description || "",
    website: business?.website || "",
    size: business?.size || "",
  });

  const activeBusiness = backendBusiness || business;

  const handleSave = () => {
    if (!activeBusiness) return;
    const businessId =
      typeof activeBusiness.id === "string"
        ? BigInt(activeBusiness.id)
        : activeBusiness.id;
    updateBusiness.mutate(
      {
        businessId,
        name: formData.name,
        industry: formData.industry,
        website: formData.website || null,
        description: formData.description,
        teamSize: formData.size,
        logoUrl: activeBusiness.logoUrl || null,
        supportEmail: activeBusiness.supportEmail || "",
        phoneNumber: activeBusiness.phoneNumber || null,
      },
      {
        onSuccess: () => {
          toast.success("Business profile updated");
          setIsEditing(false);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update business");
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          Business Profile
        </CardTitle>
        <CardDescription>Your workspace details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeBusiness ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  Business Name
                </Label>
                {isEditing ? (
                  <Input
                    data-ocid="settings.business_name.input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, name: e.target.value }))
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">{activeBusiness.name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  Industry
                </Label>
                {isEditing ? (
                  <Input
                    data-ocid="settings.industry.input"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, industry: e.target.value }))
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {activeBusiness.industry}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  Team Size
                </Label>
                {isEditing ? (
                  <Input
                    data-ocid="settings.team_size.input"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, size: e.target.value }))
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {activeBusiness.teamSize || "—"}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Website</Label>
                {isEditing ? (
                  <Input
                    data-ocid="settings.website.input"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, website: e.target.value }))
                    }
                    placeholder="https://example.com"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {activeBusiness.website || "—"}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-muted-foreground text-xs">
                  Description
                </Label>
                {isEditing ? (
                  <Input
                    data-ocid="settings.description.input"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        description: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {activeBusiness.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button
                    data-ocid="settings.business.cancel_button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: business?.name || "",
                        industry: business?.industry || "",
                        description: business?.description || "",
                        website: business?.website || "",
                        size: business?.size || "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-ocid="settings.business.save_button"
                    onClick={handleSave}
                    disabled={updateBusiness.isPending}
                  >
                    {updateBusiness.isPending ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  data-ocid="settings.business.edit_button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="bg-muted/50 rounded-lg border p-6 text-center">
            <p className="text-muted-foreground text-sm">
              No business profile found. Complete onboarding to set up your
              workspace.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GeminiApiKeyCard() {
  const { user } = useAuthStore();
  const { data: apiKey, isLoading } = useGetGeminiApiKey();
  const setGeminiApiKey = useSetGeminiApiKey();

  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const canManageKey = user?.role === "owner" || user?.role === "admin";

  const handleSave = () => {
    if (!inputKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    setGeminiApiKey.mutate(inputKey.trim(), {
      onSuccess: () => {
        toast.success("Gemini API key saved");
        setInputKey("");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to save API key");
      },
    });
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("API key copied to clipboard");
    }
  };

  const maskedKey =
    typeof apiKey === "string" && apiKey.length > 0
      ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          Gemini API Key
        </CardTitle>
        <CardDescription>
          Configure your Google Gemini API key for AI-powered features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!canManageKey && (
          <div className="bg-muted/50 rounded-lg border p-4 text-sm text-muted-foreground">
            Only owners and admins can manage the Gemini API key.
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading API key...
          </div>
        ) : apiKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
                <KeyRound className="text-muted-foreground size-4" />
                <span className="font-mono text-sm">
                  {showKey ? apiKey : maskedKey}
                </span>
              </div>
              <Button
                data-ocid="settings.gemini.toggle_visibility_button"
                variant="ghost"
                size="icon"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
              <Button
                data-ocid="settings.gemini.copy_button"
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                aria-label="Copy API key"
              >
                {copied ? (
                  <Check className="text-chart-3 size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Your API key is stored securely and used for AI chat and ticket
              summarization features.
            </p>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            No API key configured yet.
          </div>
        )}

        {canManageKey && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Update API Key</Label>
              <div className="flex gap-2">
                <Input
                  data-ocid="settings.gemini.input"
                  id="gemini-key"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="flex-1"
                />
                <Button
                  data-ocid="settings.gemini.save_button"
                  onClick={handleSave}
                  disabled={setGeminiApiKey.isPending || !inputKey.trim()}
                >
                  {setGeminiApiKey.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AppearanceCard() {
  const { config, setConfig } = useAiStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Sun className="size-5 text-primary" />
          Appearance
        </CardTitle>
        <CardDescription>
          Customize your workspace look and feel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme-toggle">Theme</Label>
            <p className="text-muted-foreground text-xs">
              Toggle between light and dark mode
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ai-toggle">AI Auto-Reply</Label>
            <p className="text-muted-foreground text-xs">
              Automatically generate AI responses for incoming tickets
            </p>
          </div>
          <Switch
            data-ocid="settings.ai_auto_reply.toggle"
            id="ai-toggle"
            checked={config.autoReply}
            onCheckedChange={(checked) =>
              setConfig({ ...config, autoReply: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

const featureToggleMeta: {
  key: keyof FeatureToggles;
  label: string;
  description: string;
}[] = [
  {
    key: "aiChat",
    label: "AI Chat",
    description: "Enable the AI-powered chat interface",
  },
  {
    key: "tickets",
    label: "Tickets",
    description: "Manage support tickets and requests",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "View performance metrics and insights",
  },
  {
    key: "teamManagement",
    label: "Team Management",
    description: "Manage team members and roles",
  },
  {
    key: "knowledgeBase",
    label: "Knowledge Base",
    description: "Access and manage help articles",
  },
  {
    key: "customers",
    label: "Customers",
    description: "View and manage customer records",
  },
];

function FeatureManagementCard() {
  const toggles = useFeatureToggleStore();

  const handleReset = () => {
    toggles.resetToDefaults();
    toast.success("All features reset to defaults");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <ToggleLeft className="size-5 text-primary" />
          Feature Management
        </CardTitle>
        <CardDescription>Enable or disable platform features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {featureToggleMeta.map((meta) => (
            <div key={meta.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={`feature-${meta.key}`}>{meta.label}</Label>
                <p className="text-muted-foreground text-xs">
                  {meta.description}
                </p>
              </div>
              <Switch
                data-ocid={`settings.feature.${meta.key}.toggle`}
                id={`feature-${meta.key}`}
                checked={toggles[meta.key]}
                onCheckedChange={(checked) =>
                  toggles.setFeature(meta.key, checked)
                }
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button
            data-ocid="settings.feature.reset_button"
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 size-4" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <SidebarLayout>
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold">Settings</h1>
              <p className="text-muted-foreground text-sm">
                Configure your SupportAI workspace
              </p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {user?.role?.replace("_", " ") || "Member"}
            </Badge>
          </div>
        </header>

        <div className="space-y-6 p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <UserProfileCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <AppearanceCard />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <FeatureManagementCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            <GeminiApiKeyCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <BusinessProfileCard />
          </motion.div>
        </div>
      </div>
    </SidebarLayout>
  );
}
