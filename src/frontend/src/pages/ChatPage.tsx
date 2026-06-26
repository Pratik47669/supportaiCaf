import { ChatMessageRole, FeedbackRating } from "@/backend";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateConversation,
  useGetConversations,
  useGetMessages,
  useSendMessage,
} from "@/hooks/useChatQueries";
import { useAddFeedback } from "@/hooks/useFeedbackQueries";
import { useAuthStore } from "@/store";
import {
  Loader2,
  MessageSquarePlus,
  Plus,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ChatPage() {
  const { businessId } = useAuthStore();
  const [input, setInput] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    bigint | null
  >(null);

  const bId = businessId ? BigInt(businessId) : null;

  const { data: conversations = [], isLoading: conversationsLoading } =
    useGetConversations(bId);
  const { data: messages = [], isLoading: messagesLoading } = useGetMessages(
    selectedConversationId,
  );
  const sendMessage = useSendMessage();
  const addFeedback = useAddFeedback();
  const createConversation = useCreateConversation();

  // Auto-select first conversation when list loads
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const handleSelectConversation = (id: bigint) => {
    setSelectedConversationId(id);
  };

  const handleCreateConversation = async () => {
    if (!bId) {
      toast.error("No business selected");
      return;
    }
    try {
      const conv = await createConversation.mutateAsync({
        businessId: bId,
        title: "New Conversation",
      });
      setSelectedConversationId(conv.id);
      toast.success("Conversation created");
    } catch {
      toast.error("Failed to create conversation");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let conversationId = selectedConversationId;

    if (!conversationId) {
      if (!bId) {
        toast.error("No business selected");
        return;
      }
      try {
        const conv = await createConversation.mutateAsync({
          businessId: bId,
          title: "New Conversation",
        });
        conversationId = conv.id;
        setSelectedConversationId(conv.id);
      } catch {
        toast.error("Failed to create conversation");
        return;
      }
    }

    sendMessage.mutate(
      {
        conversationId,
        content: input.trim(),
        role: ChatMessageRole.user,
      },
      {
        onSuccess: () => {
          // Backend auto-generates AI responses, so messages will refresh
        },
        onError: () => {
          toast.error("Failed to send message");
        },
      },
    );
    setInput("");
  };

  const handleFeedback = (messageId: bigint, isPositive: boolean) => {
    if (!selectedConversationId) return;
    addFeedback.mutate(
      {
        messageId,
        conversationId: selectedConversationId,
        rating: isPositive
          ? FeedbackRating.thumbsUp
          : FeedbackRating.thumbsDown,
      },
      {
        onSuccess: () => toast.success("Feedback recorded"),
        onError: () => toast.error("Failed to record feedback"),
      },
    );
  };

  const isLoading = conversationsLoading || messagesLoading;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Chat</h1>
            <p className="text-muted-foreground text-sm">
              Chat with your AI support assistant
            </p>
          </div>
          <Button
            data-ocid="chat.new_conversation_button"
            size="sm"
            onClick={handleCreateConversation}
            disabled={createConversation.isPending || !bId}
          >
            <Plus className="mr-2 size-4" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Conversation selector */}
      {conversations.length > 0 && (
        <div className="border-b bg-muted/30 px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {conversations.map((conv) => (
              <Button
                key={conv.id.toString()}
                data-ocid={`chat.conversation.tab.${conv.id.toString()}`}
                variant={
                  selectedConversationId === conv.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleSelectConversation(conv.id)}
              >
                {conv.title || "Conversation"}
              </Button>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <SkeletonLoader count={5} />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <MessageSquarePlus className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">
              No messages yet. Send your first message below.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isUser = msg.role === ChatMessageRole.user;
                return (
                  <motion.div
                    key={msg.id.toString()}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: index === messages.length - 1 ? 0 : 0,
                    }}
                    data-ocid={`chat.message.item.${index + 1}`}
                  >
                    <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
                      {isUser ? (
                        <User className="size-4" />
                      ) : (
                        <Sparkles className="size-4 text-primary" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] ${isUser ? "whatsapp-bubble-user" : "whatsapp-bubble-ai"}`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {new Date(
                            Number(msg.timestamp) / 1_000_000,
                          ).toLocaleTimeString()}
                        </span>
                        {!isUser && (
                          <div className="flex items-center gap-1">
                            <Button
                              data-ocid={`chat.thumbs_up.button.${index + 1}`}
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={() => handleFeedback(msg.id, true)}
                              disabled={addFeedback.isPending}
                            >
                              <ThumbsUp className="size-3" />
                            </Button>
                            <Button
                              data-ocid={`chat.thumbs_down.button.${index + 1}`}
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={() => handleFeedback(msg.id, false)}
                              disabled={addFeedback.isPending}
                            >
                              <ThumbsDown className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {sendMessage.isPending && (
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-primary/10 flex size-8 items-center justify-center rounded-full">
                  <Loader2 className="size-4 animate-spin text-primary" />
                </div>
                <div className="whatsapp-bubble-ai">
                  <p className="text-muted-foreground text-sm">Thinking...</p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t bg-card p-4">
        <div className="flex items-end gap-2">
          <Textarea
            data-ocid="chat.message_input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            data-ocid="chat.send_button"
            size="icon"
            className="size-10 shrink-0"
            onClick={handleSend}
            disabled={
              !input.trim() ||
              sendMessage.isPending ||
              createConversation.isPending
            }
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
