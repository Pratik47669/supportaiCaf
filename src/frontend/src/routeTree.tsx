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
import { type FeatureToggles, useFeatureToggleStore } from "@/store";

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
  component: OnboardingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: () => (
    <FeatureGuard featureKey="aiChat">
      <ChatPage />
    </FeatureGuard>
  ),
});

const ticketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tickets",
  component: () => (
    <FeatureGuard featureKey="tickets">
      <TicketsPage />
    </FeatureGuard>
  ),
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/team",
  component: () => (
    <FeatureGuard featureKey="teamManagement">
      <TeamPage />
    </FeatureGuard>
  ),
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: () => (
    <FeatureGuard featureKey="analytics">
      <AnalyticsPage />
    </FeatureGuard>
  ),
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers",
  component: () => (
    <FeatureGuard featureKey="customers">
      <CustomersPage />
    </FeatureGuard>
  ),
});

const kbRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kb",
  component: () => (
    <FeatureGuard featureKey="knowledgeBase">
      <KbPage />
    </FeatureGuard>
  ),
});

const aiPlaygroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-playground",
  component: AiPlaygroundPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
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
