import { Link } from "@tanstack/react-router";
import { Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ThemeToggle } from "./ThemeToggle";

export function LandingHeader() {
  return (
    <header className="bg-card/80 border-b backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ticket className="size-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            SupportAI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            data-ocid="landing.login_button"
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to="/login">Sign in</Link>
          </Button>
          <Button data-ocid="landing.register_button" size="sm" asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-muted/40 border-t">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="text-muted-foreground text-sm">
          &copy; {year}. Built with love using{" "}
          <a
            href="https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=supportai"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
