import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

import { LandingFooter, LandingHeader } from "@/components/LandingHeader";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Responses",
    description:
      "Leverage cutting-edge AI to draft instant, accurate replies to customer inquiries.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Resolve tickets in seconds, not hours. Automate repetitive tasks effortlessly.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Built on Internet Computer with end-to-end encryption and role-based access.",
  },
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description:
      "Manage all customer conversations in one clean, organized workspace.",
  },
  {
    icon: Sparkles,
    title: "Smart Routing",
    description:
      "Automatically assign tickets to the right agent based on expertise and workload.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingHeader />

      {/* Hero */}
      <section className="bg-background relative flex flex-1 items-center justify-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.45_0.16_255/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.75_0.17_55/0.06),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="size-3.5" />
              AI-Powered Customer Support
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Customer support,
              <br />
              <span className="text-primary">supercharged by AI</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
              SupportAI is a modern SaaS platform for AI-powered customer
              support. Streamline tickets, empower agents, and delight customers
              — all on the Internet Computer.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                data-ocid="landing.hero_register_button"
                size="lg"
                asChild
              >
                <Link to="/register">
                  Get started free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                data-ocid="landing.hero_login_button"
                variant="outline"
                size="lg"
                asChild
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 border-y px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Everything you need
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              A complete toolkit for modern support teams
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card rounded-xl border p-6 shadow-subtle transition-smooth hover:shadow-elevated"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Ready to transform your support?
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Join the next generation of customer support platforms.
            </p>
            <div className="mt-8">
              <Button data-ocid="landing.cta_register_button" size="lg" asChild>
                <Link to="/register">
                  Start for free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
