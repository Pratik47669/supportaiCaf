"use client";

import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ClipboardList,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuthStore, useSidebarStore } from "@/store";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Inbox", icon: Inbox, path: "/chat" },
  { title: "Tickets", icon: Ticket, path: "/tickets" },
  { title: "Customers", icon: Users, path: "/customers" },
  { title: "Team", icon: UserPlus, path: "/team" },
  { title: "Analytics", icon: BarChart3, path: "/analytics" },
  { title: "Knowledge Base", icon: BookOpen, path: "/kb" },
  { title: "AI Playground", icon: Sparkles, path: "/ai-playground" },
];

const settingsNavItems = [
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Help & Support", icon: HelpCircle, path: "/settings" },
];

function NavItem({
  item,
  isActive,
}: {
  item: (typeof mainNavItems)[0];
  isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        data-ocid={`nav.${item.title.toLowerCase().replace(/\s+/g, "_")}.link`}
        asChild
        isActive={isActive}
        tooltip={item.title}
      >
        <Link to={item.path}>
          <Icon className="size-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const { user, logout: storeLogout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await clear();
    } catch {
      // Ignore errors from clear()
    }
    storeLogout();
    navigate({ to: "/login" });
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
            <Bot className="text-primary-foreground size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">SupportAI</span>
            <span className="text-muted-foreground text-xs">Workspace</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 px-3 text-xs font-medium uppercase tracking-wider">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-muted-foreground/60 px-3 text-xs font-medium uppercase tracking-wider">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">
              {user?.name || user?.email || "User"}
            </span>
            <span className="text-muted-foreground truncate text-xs capitalize">
              {user?.role || "Member"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-ocid="user.profile_menu_button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="User menu"
              >
                <Settings className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {user?.name || user?.email || "User"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {user?.email || ""}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="mr-2 size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <HelpCircle className="mr-2 size-4" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-ocid="user.logout_button"
                onClick={() => setShowLogoutConfirm(true)}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-sm rounded-lg border p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold">Log out?</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Are you sure you want to log out? You will need to sign in again
                with Internet Identity.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  data-ocid="logout.cancel_button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="logout.confirm_button"
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebarStore();

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarInner />
          <SidebarRail />
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export function AppSidebar() {
  const { open, setOpen } = useSidebarStore();

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarInner />
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}

export function SidebarToggle() {
  const { toggle } = useSidebarStore();
  return (
    <Button
      data-ocid="sidebar.floating_toggle_button"
      variant="outline"
      size="icon"
      className="fixed top-4 left-4 z-50 size-9 shadow-md"
      onClick={toggle}
      aria-label="Toggle sidebar"
    >
      <Menu className="size-4" />
    </Button>
  );
}
