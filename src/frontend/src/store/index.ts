import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "owner" | "admin" | "support_agent" | "viewer";

export interface User {
  id: string;
  principal: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  businessId?: string;
}

export interface Business {
  id: string | bigint;
  name: string;
  slug?: string;
  description: string;
  website?: string;
  industry: string;
  size?: string;
  teamSize?: string;
  ownerId: string;
  createdAt: string;
  logoUrl?: string;
  supportEmail?: string;
  phoneNumber?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  customerId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  ticketId: string;
  sender: "customer" | "agent" | "ai";
  content: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
}

export interface AnalyticsSnapshot {
  totalTickets: number;
  openTickets: number;
  avgResponseTime: number;
  resolutionRate: number;
  customerSatisfaction: number;
  ticketsByDay: { date: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
}

export interface AiConfig {
  enabled: boolean;
  model: string;
  autoReply: boolean;
  confidenceThreshold: number;
}

export interface FeedbackItem {
  id: string;
  messageId: string;
  conversationId: string;
  rating: "thumbsUp" | "thumbsDown";
  comment?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  principal: string;
  eventType: string;
  details: string;
  timestamp: string;
  businessId?: string;
}

export interface WidgetConfig {
  id: string;
  businessId: string;
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  greeting: string;
  enabled: boolean;
  showBranding: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  businessId: string | null;
  setUser: (user: User | null) => void;
  setBusinessId: (businessId: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      businessId: null,
      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),
      setBusinessId: (businessId) => set({ businessId }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          businessId: null,
        }),
    }),
    {
      name: "supportai-auth",
    },
  ),
);

interface BusinessState {
  business: Business | null;
  hasCompletedOnboarding: boolean;
  setBusiness: (business: Business | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      business: null,
      hasCompletedOnboarding: false,
      setBusiness: (business) => set({ business }),
      setOnboardingComplete: (complete) =>
        set({ hasCompletedOnboarding: complete }),
    }),
    {
      name: "supportai-business",
    },
  ),
);

interface SidebarState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      open: true,
      setOpen: (open) => set({ open }),
      toggle: () => set((state) => ({ open: !state.open })),
    }),
    {
      name: "supportai-sidebar",
    },
  ),
);

interface ThemeState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

interface TicketState {
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
}

export const useTicketStore = create<TicketState>()((set) => ({
  tickets: [],
  setTickets: (tickets) => set({ tickets }),
  addTicket: (ticket) =>
    set((state) => ({ tickets: [...state.tickets, ticket] })),
  updateTicket: (id, updates) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    })),
}));

interface ConversationState {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
}

export const useConversationStore = create<ConversationState>()((set) => ({
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({ conversations: [...state.conversations, conversation] })),
}));

interface CustomerState {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
}

export const useCustomerStore = create<CustomerState>()((set) => ({
  customers: [],
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) =>
    set((state) => ({ customers: [...state.customers, customer] })),
}));

interface ArticleState {
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
}

export const useArticleStore = create<ArticleState>()((set) => ({
  articles: [],
  setArticles: (articles) => set({ articles }),
  addArticle: (article) =>
    set((state) => ({ articles: [...state.articles, article] })),
  updateArticle: (id, updates) =>
    set((state) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    })),
}));

interface InviteState {
  invites: Invite[];
  setInvites: (invites: Invite[]) => void;
  addInvite: (invite: Invite) => void;
}

export const useInviteStore = create<InviteState>()((set) => ({
  invites: [],
  setInvites: (invites) => set({ invites }),
  addInvite: (invite) =>
    set((state) => ({ invites: [...state.invites, invite] })),
}));

interface AnalyticsState {
  analytics: AnalyticsSnapshot | null;
  setAnalytics: (analytics: AnalyticsSnapshot | null) => void;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  analytics: null,
  setAnalytics: (analytics) => set({ analytics }),
}));

interface AiState {
  config: AiConfig;
  setConfig: (config: AiConfig) => void;
}

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      config: {
        enabled: true,
        model: "gpt-4o",
        autoReply: false,
        confidenceThreshold: 0.8,
      },
      setConfig: (config) => set({ config }),
    }),
    {
      name: "supportai-ai",
    },
  ),
);

// ─── Phase 3: New Stores ───

interface FeedbackState {
  feedback: FeedbackItem[];
  setFeedback: (feedback: FeedbackItem[]) => void;
  addFeedback: (item: FeedbackItem) => void;
}

export const useFeedbackStore = create<FeedbackState>()((set) => ({
  feedback: [],
  setFeedback: (feedback) => set({ feedback }),
  addFeedback: (item) =>
    set((state) => ({ feedback: [...state.feedback, item] })),
}));

interface AuditState {
  logs: AuditLogEntry[];
  setLogs: (logs: AuditLogEntry[]) => void;
  addLog: (log: AuditLogEntry) => void;
}

export const useAuditStore = create<AuditState>()((set) => ({
  logs: [],
  setLogs: (logs) => set({ logs }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
}));

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => {
      const notifs = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return {
        notifications: notifs,
        unreadCount: notifs.filter((n) => !n.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  dismissNotification: (id) =>
    set((state) => {
      const notifs = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: notifs,
        unreadCount: notifs.filter((n) => !n.read).length,
      };
    }),
}));

interface WidgetState {
  config: WidgetConfig | null;
  isOpen: boolean;
  setConfig: (config: WidgetConfig | null) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      config: null,
      isOpen: false,
      setConfig: (config) => set({ config }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: "supportai-widget",
    },
  ),
);

interface AiConfigState {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  personality: "calm" | "professional" | "friendly" | "witty";
  tone: "casual" | "direct" | "empathetic" | "formal";
  config: {
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    personality: "calm" | "professional" | "friendly" | "witty";
    tone: "casual" | "direct" | "empathetic" | "formal";
  };
  updateConfig: (updates: Partial<AiConfigState["config"]>) => void;
  resetConfig: () => void;
  setSystemPrompt: (prompt: string) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  setPersonality: (
    personality: "calm" | "professional" | "friendly" | "witty",
  ) => void;
  setTone: (tone: "casual" | "direct" | "empathetic" | "formal") => void;
}

const defaultAiConfig = {
  systemPrompt:
    "You are a helpful customer support assistant. Be concise, professional, and empathetic.",
  temperature: 0.7,
  maxTokens: 2048,
  personality: "professional" as const,
  tone: "empathetic" as const,
};

export const useAiConfigStore = create<AiConfigState>()(
  persist(
    (set) => ({
      ...defaultAiConfig,
      config: defaultAiConfig,
      updateConfig: (updates) =>
        set((state) => {
          const newConfig = { ...state.config, ...updates };
          return {
            ...newConfig,
            config: newConfig,
          };
        }),
      resetConfig: () => set({ ...defaultAiConfig, config: defaultAiConfig }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setPersonality: (personality) => set({ personality }),
      setTone: (tone) => set({ tone }),
    }),
    {
      name: "supportai-ai-config",
    },
  ),
);

export interface FeatureToggles {
  aiChat: boolean;
  tickets: boolean;
  analytics: boolean;
  teamManagement: boolean;
  knowledgeBase: boolean;
  customers: boolean;
}

interface FeatureToggleState extends FeatureToggles {
  setFeature: (key: keyof FeatureToggles, value: boolean) => void;
  resetToDefaults: () => void;
}

const defaultFeatureToggles: FeatureToggles = {
  aiChat: true,
  tickets: true,
  analytics: true,
  teamManagement: true,
  knowledgeBase: true,
  customers: true,
};

export const useFeatureToggleStore = create<FeatureToggleState>()(
  persist(
    (set) => ({
      ...defaultFeatureToggles,
      setFeature: (key, value) => set({ [key]: value }),
      resetToDefaults: () => set({ ...defaultFeatureToggles }),
    }),
    {
      name: "supportai-feature-toggles",
    },
  ),
);
