import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import AiPlaygroundPage from "@/pages/AiPlaygroundPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ChatPage from "@/pages/ChatPage";
import CustomersPage from "@/pages/CustomersPage";
import DashboardPage from "@/pages/DashboardPage";
import KbPage from "@/pages/KbPage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";
import OtpPage from "@/pages/OtpPage";
import RegisterPage from "@/pages/RegisterPage";
import SettingsPage from "@/pages/SettingsPage";
import TeamPage from "@/pages/TeamPage";
import TicketsPage from "@/pages/TicketsPage";
import { useAuthStore } from "@/store";
import { type FeatureToggles, useFeatureToggleStore } from "@/store";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="bg-primary/10 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function FeatureGuard({
  featureKey,
  children,
}: {
  featureKey: keyof FeatureToggles;
  children: React.ReactNode;
}) {
  const enabled = useFeatureToggleStore((s) => s[featureKey]);
  if (!enabled) {
    return <Navigate to="/settings" />;
  }
  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-right" richColors />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const otpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/otp",
  component: OtpPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: () => (
    <AuthGuard>
      <OnboardingPage />
    </AuthGuard>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: () => (
    <AuthGuard>
      <FeatureGuard featureKey="aiChat">
        <ChatPage />
      </FeatureGuard>
    </AuthGuard>
  ),
});

const ticketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tickets",
  component: () => (
    <AuthGuard>
      <FeatureGuard featureKey="tickets">
        <TicketsPage />
      </FeatureGuard>
    </AuthGuard>
  ),
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/team",
  component: () => (
    <AuthGuard>
      <FeatureGuard featureKey="teamManagement">
        <TeamPage />
      </FeatureGuard>
    </AuthGuard>
  ),
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: () => (
    <AuthGuard>
      <FeatureGuard featureKey="analytics">
        <AnalyticsPage />
      </FeatureGuard>
    </AuthGuard>
  ),
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers",
  component: () => (
    <AuthGuard>
      <FeatureGuard featureKey="customers">
        <CustomersPage />
      </FeatureGuard>
    </AuthGuard>
  ),
});

const kbRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kb",
  component: () => (
    <AuthGuard>
      <FeatureGuard featureKey="knowledgeBase">
        <KbPage />
      </FeatureGuard>
    </AuthGuard>
  ),
});

const aiPlaygroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-playground",
  component: () => (
    <AuthGuard>
      <AiPlaygroundPage />
    </AuthGuard>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <AuthGuard>
      <SettingsPage />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  otpRoute,
  onboardingRoute,
  dashboardRoute,
  chatRoute,
  ticketsRoute,
  teamRoute,
  analyticsRoute,
  customersRoute,
  kbRoute,
  aiPlaygroundRoute,
  settingsRoute,
]);

export { routeTree };
