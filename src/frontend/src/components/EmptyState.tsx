import {
  FileText,
  Inbox,
  MessageSquare,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

interface EmptyStateProps {
  type: "inbox" | "search" | "documents" | "users" | "tickets" | "messages";
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const icons = {
  inbox: Inbox,
  search: Search,
  documents: FileText,
  users: Users,
  tickets: Ticket,
  messages: MessageSquare,
};

const defaultTitles = {
  inbox: "No items yet",
  search: "No results found",
  documents: "No documents",
  users: "No users",
  tickets: "No tickets",
  messages: "No messages",
};

const defaultDescriptions = {
  inbox: "Items will appear here once they are created.",
  search: "Try adjusting your search terms or filters.",
  documents: "Documents will appear here once they are added.",
  users: "Users will appear here once they are added.",
  tickets: "Tickets will appear here once they are created.",
  messages: "Messages will appear here once the conversation starts.",
};

export function EmptyState({
  type,
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = icons[type];

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-muted/50 mb-4 flex size-16 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-8" />
      </div>
      <h3 className="text-lg font-semibold">{title || defaultTitles[type]}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
        {description || defaultDescriptions[type]}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
