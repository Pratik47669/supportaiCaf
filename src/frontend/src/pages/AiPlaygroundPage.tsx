import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useSendToGemini } from "@/hooks/useChatQueries";
import { useAiConfigStore } from "@/store";
import { useAuthStore } from "@/store";
import {
  Bot,
  Hash,
  MessageSquareText,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Thermometer,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const personalities = [
  {
    value: "professional",
    label: "Professional",
    description: "Formal, precise, and business-focused",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm, approachable, and conversational",
  },
  {
    value: "casual",
    label: "Casual",
    description: "Relaxed, informal, and easy-going",
  },
  {
    value: "technical",
    label: "Technical",
    description: "Detailed, technical, and developer-focused",
  },
  {
    value: "empathetic",
    label: "Empathetic",
    description: "Understanding, patient, and supportive",
  },
];

const tones = [
  { value: "neutral", label: "Neutral" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "calm", label: "Calm" },
  { value: "direct", label: "Direct" },
  { value: "diplomatic", label: "Diplomatic" },
];

interface TestMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function AiPlaygroundPage() {
  const { config, updateConfig, resetConfig } = useAiConfigStore();
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt);
  const [temperature, setTemperature] = useState([config.temperature]);
  const [maxTokens, setMaxTokens] = useState([config.maxTokens]);
  const [personality, setPersonality] = useState(config.personality);
  const [tone, setTone] = useState(config.tone);

  // AI Test Chat state
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const sendToGemini = useSendToGemini();
  const { businessId } = useAuthStore();

  const handleSave = () => {
    updateConfig({
      systemPrompt,
      temperature: temperature[0],
      maxTokens: maxTokens[0],
      personality,
      tone,
    });
    toast.success("AI configuration saved successfully");
  };

  const handleReset = () => {
    resetConfig();
    setSystemPrompt(config.systemPrompt);
    setTemperature([config.temperature]);
    setMaxTokens([config.maxTokens]);
    setPersonality(config.personality);
    setTone(config.tone);
    toast.info("Configuration reset to defaults");
  };

  const handleTestSend = async () => {
    if (!testInput.trim()) return;
    if (!businessId) {
      toast.error("Please set up your business first");
      return;
    }

    const userMsg: TestMessage = {
      id: Date.now().toString(),
      role: "user",
      content: testInput.trim(),
      timestamp: new Date(),
    };

    setTestMessages((prev) => [...prev, userMsg]);
    setTestInput("");
    setIsTesting(true);

    try {
      // Use a dummy conversation ID (0n) for playground testing
      // In a real scenario, this would create a temporary conversation
      const result = await sendToGemini.mutateAsync({
        conversationId: 0n,
        message: userMsg.content,
      });

      const aiMsg: TestMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: typeof result === "string" ? result : "AI response received",
        timestamp: new Date(),
      };
      setTestMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: TestMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          "Sorry, I couldn't process that request. Please check your Gemini API key in settings.",
        timestamp: new Date(),
      };
      setTestMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Playground</h1>
          <p className="text-muted-foreground text-sm">
            Configure and test your AI assistant behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="ai_playground.reset_button"
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 size-4" />
            Reset
          </Button>
          <Button
            data-ocid="ai_playground.save_button"
            size="sm"
            onClick={handleSave}
          >
            <Save className="mr-2 size-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Prompt */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="size-5 text-primary" />
                System Prompt
              </CardTitle>
              <CardDescription>
                Define the base instructions and context for your AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-prompt">Instructions</Label>
                <Textarea
                  data-ocid="ai_playground.system_prompt_input"
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system instructions for the AI..."
                  className="min-h-[200px] resize-y font-mono text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  This prompt sets the foundation for how the AI responds to all
                  queries.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Configuration Panel */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Temperature */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Thermometer className="size-4 text-primary" />
                Temperature
              </CardTitle>
              <CardDescription>
                Control creativity vs. determinism
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                data-ocid="ai_playground.temperature_slider"
                value={temperature}
                onValueChange={setTemperature}
                min={0}
                max={2}
                step={0.1}
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deterministic</span>
                <span className="font-mono font-medium">
                  {temperature[0].toFixed(1)}
                </span>
                <span className="text-muted-foreground">Creative</span>
              </div>
            </CardContent>
          </Card>

          {/* Max Tokens */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="size-4 text-primary" />
                Max Tokens
              </CardTitle>
              <CardDescription>Maximum response length</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                data-ocid="ai_playground.max_tokens_slider"
                value={maxTokens}
                onValueChange={setMaxTokens}
                min={50}
                max={4000}
                step={50}
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Short</span>
                <span className="font-mono font-medium">{maxTokens[0]}</span>
                <span className="text-muted-foreground">Long</span>
              </div>
            </CardContent>
          </Card>

          {/* Personality */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="size-4 text-primary" />
                Personality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={personality}
                onValueChange={(v) =>
                  setPersonality(
                    v as "professional" | "calm" | "friendly" | "witty",
                  )
                }
              >
                <SelectTrigger data-ocid="ai_playground.personality_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {personalities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex flex-col">
                        <span>{p.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {p.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tone */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                Tone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={tone}
                onValueChange={(v) =>
                  setTone(v as "empathetic" | "casual" | "direct" | "formal")
                }
              >
                <SelectTrigger data-ocid="ai_playground.tone_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Test Chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="size-5 text-primary" />
              Test AI Chat
            </CardTitle>
            <CardDescription>
              Send test messages to verify your AI configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg bg-muted/30 min-h-[200px] max-h-[300px] overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {testMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Sparkles className="text-muted-foreground size-8 mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Send a message to test your AI assistant
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-full">
                          {msg.role === "user" ? (
                            <User className="size-3" />
                          ) : (
                            <Sparkles className="size-3 text-primary" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] text-sm px-3 py-2 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isTesting && (
                      <div className="flex gap-2">
                        <div className="bg-primary/10 flex size-6 items-center justify-center rounded-full">
                          <Sparkles className="size-3 animate-pulse text-primary" />
                        </div>
                        <div className="bg-card border text-sm px-3 py-2 rounded-lg">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                data-ocid="ai_playground.test_input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type a test message..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleTestSend();
                  }
                }}
              />
              <Button
                data-ocid="ai_playground.test_send_button"
                size="icon"
                className="size-10 shrink-0"
                onClick={handleTestSend}
                disabled={!testInput.trim() || isTesting}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
