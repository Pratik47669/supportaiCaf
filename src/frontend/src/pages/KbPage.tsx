import {
  BookOpen,
  ChevronLeft,
  Clock,
  Edit3,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { SidebarLayout } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateArticle,
  useDeleteArticle,
  useGetArticle,
  useGetArticles,
  useUpdateArticle,
} from "@/hooks/useKbQueries";
import { useAuthStore } from "@/store";
import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  "Getting Started",
  "Account & Billing",
  "Integrations",
  "API Documentation",
  "Troubleshooting",
  "Best Practices",
];

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const header = tableRows[0];
    const headers = header
      .split("|")
      .map((h) => h.trim())
      .filter(Boolean);
    const bodyRows = tableRows.slice(2);
    elements.push(
      <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {headers.map((h) => (
                <th
                  key={`th-${h}`}
                  className="px-3 py-2 text-left font-semibold text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row) => {
              const cells = row
                .split("|")
                .map((c) => c.trim())
                .filter(Boolean);
              return (
                <tr key={`tr-${row}`} className="border-b last:border-0">
                  {cells.map((cell) => (
                    <td
                      key={`td-${cell}`}
                      className="px-3 py-2 text-muted-foreground"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>,
    );
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      inTable = true;
      tableRows.push(trimmed);
      return;
    }
    if (inTable) {
      flushTable();
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${trimmed}`}
          className="mt-6 mb-3 font-display text-xl font-semibold text-foreground"
        >
          {trimmed.replace("## ", "")}
        </h2>,
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${trimmed}`}
          className="mt-8 mb-4 font-display text-2xl font-bold text-foreground"
        >
          {trimmed.replace("# ", "")}
        </h1>,
      );
    } else if (trimmed.startsWith("- ")) {
      elements.push(
        <li
          key={`li-${trimmed}`}
          className="ml-5 list-disc text-muted-foreground"
        >
          {parseInline(trimmed.replace("- ", ""))}
        </li>,
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <li
          key={`oli-${trimmed}`}
          className="ml-5 list-decimal text-muted-foreground"
        >
          {parseInline(trimmed.replace(/^\d+\.\s/, ""))}
        </li>,
      );
    } else if (trimmed === "") {
      elements.push(
        <div key={`sp-${idx}-${elements.length}`} className="h-2" />,
      );
    } else {
      elements.push(
        <p
          key={`p-${trimmed}`}
          className="mb-2 text-muted-foreground leading-relaxed"
        >
          {parseInline(trimmed)}
        </p>,
      );
    }
  });

  if (inTable) flushTable();

  return <div className="space-y-1">{elements}</div>;
}

function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);

    const boldIdx = boldMatch
      ? remaining.indexOf(boldMatch[0])
      : Number.POSITIVE_INFINITY;
    const codeIdx = codeMatch
      ? remaining.indexOf(codeMatch[0])
      : Number.POSITIVE_INFINITY;

    if (
      boldIdx === Number.POSITIVE_INFINITY &&
      codeIdx === Number.POSITIVE_INFINITY
    ) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (boldIdx < codeIdx) {
      if (boldIdx > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldIdx)}</span>);
      }
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {boldMatch![1]}
        </strong>,
      );
      remaining = remaining.slice(boldIdx + boldMatch![0].length);
    } else {
      if (codeIdx > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, codeIdx)}</span>);
      }
      parts.push(
        <code
          key={key++}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
        >
          {codeMatch![1]}
        </code>,
      );
      remaining = remaining.slice(codeIdx + codeMatch![0].length);
    }
  }

  return <>{parts}</>;
}

function ArticleForm({
  article,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  article?: import("@/backend").KnowledgeBaseArticle;
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [category, setCategory] = useState(article?.category || CATEGORIES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, category });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="article-title">Title</Label>
        <Input
          id="article-title"
          data-ocid="kb.article_title_input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter article title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="article-category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            id="article-category"
            data-ocid="kb.article_category_select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="article-content">Content</Label>
        <Textarea
          id="article-content"
          data-ocid="kb.article_content_textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your article content using Markdown..."
          rows={12}
          required
          className="font-mono text-sm"
        />
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="kb.form_cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          data-ocid="kb.form_save_button"
        >
          {isSubmitting
            ? "Saving..."
            : article
              ? "Update Article"
              : "Create Article"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function KbPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewingArticleId, setViewingArticleId] = useState<bigint | null>(null);
  const [editingArticle, setEditingArticle] = useState<
    import("@/backend").KnowledgeBaseArticle | null
  >(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<
    import("@/backend").KnowledgeBaseArticle | null
  >(null);

  const { businessId } = useAuthStore();
  const bId = businessId ? BigInt(businessId) : null;

  const { data: fetchedArticles, isLoading } = useGetArticles(bId ?? BigInt(0));
  const { data: viewingArticle } = useGetArticle(viewingArticleId);
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  if (!bId) {
    return (
      <SidebarLayout>
        <div className="flex-1 overflow-auto">
          <header className="bg-card border-b px-6 py-4">
            <div>
              <h1 className="font-display text-xl font-semibold">
                Knowledge Base
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage help articles and documentation
              </p>
            </div>
          </header>
          <div className="p-6">
            <div className="bg-muted/50 rounded-lg border p-12 text-center">
              <FileText className="text-muted-foreground mx-auto size-12 mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Complete Onboarding
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                You need to finish onboarding and create a business before you
                can manage knowledge base articles.
              </p>
              <Button asChild>
                <Link to="/onboarding">Complete Onboarding</Link>
              </Button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const articles = fetchedArticles || [];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...CATEGORIES];
  const categoryCounts = CATEGORIES.map((cat) => ({
    name: cat,
    count: articles.filter((a) => a.category === cat).length,
  }));

  const handleCreate = (data: {
    title: string;
    content: string;
    category: string;
  }) => {
    if (!bId) {
      toast.error("No business selected");
      return;
    }
    createArticle.mutate(
      { businessId: bId, ...data },
      {
        onSuccess: () => {
          toast.success("Article created successfully");
          setIsCreateOpen(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to create article",
          );
        },
      },
    );
  };

  const handleUpdate = (data: {
    title: string;
    content: string;
    category: string;
  }) => {
    if (!editingArticle) return;
    updateArticle.mutate(
      { articleId: editingArticle.id, ...data },
      {
        onSuccess: () => {
          toast.success("Article updated successfully");
          setEditingArticle(null);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to update article",
          );
        },
      },
    );
  };

  const handleDelete = () => {
    if (!articleToDelete) return;
    deleteArticle.mutate(articleToDelete.id, {
      onSuccess: () => {
        toast.success("Article deleted");
        setIsDeleteDialogOpen(false);
        setArticleToDelete(null);
        if (viewingArticleId === articleToDelete.id) {
          setViewingArticleId(null);
        }
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete article",
        );
      },
    });
  };

  const openDeleteDialog = (
    article: import("@/backend").KnowledgeBaseArticle,
  ) => {
    setArticleToDelete(article);
    setIsDeleteDialogOpen(true);
  };

  if (viewingArticleId) {
    const article =
      viewingArticle || articles.find((a) => a.id === viewingArticleId);
    if (!article) {
      setViewingArticleId(null);
      return null;
    }

    return (
      <SidebarLayout>
        <div className="flex-1 overflow-auto">
          <header className="bg-card border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewingArticleId(null)}
                  data-ocid="kb.back_button"
                  aria-label="Back to articles"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <div>
                  <h1 className="font-display text-xl font-semibold">
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{article.category}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      Updated {formatDate(article.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingArticle(article)}
                  data-ocid="kb.edit_article_button"
                >
                  <Edit3 className="size-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(article)}
                  data-ocid="kb.delete_article_button"
                >
                  <Trash2 className="size-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </header>

          <div className="max-w-3xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardContent className="pt-6">
                  {renderMarkdown(article.content)}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex-1 overflow-auto">
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold">
                Knowledge Base
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage help articles and documentation
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button data-ocid="kb.create_article_button">
                  <Plus className="size-4 mr-1" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Article</DialogTitle>
                  <DialogDescription>
                    Write a knowledge base article for your team and customers.
                  </DialogDescription>
                </DialogHeader>
                <ArticleForm
                  onSubmit={handleCreate}
                  onCancel={() => setIsCreateOpen(false)}
                  isSubmitting={createArticle.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Search and filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                data-ocid="kb.search_input"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  data-ocid={`kb.category_filter.${cat.toLowerCase().replace(/\s+/g, "_")}`}
                >
                  {cat === "all" ? "All" : cat}
                  {cat !== "all" && (
                    <span className="ml-1 text-xs opacity-70">
                      {categoryCounts.find((c) => c.name === cat)?.count || 0}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Articles grid */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div
              className="bg-muted/50 rounded-lg border p-12 text-center"
              data-ocid="kb.empty_state"
            >
              <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                No articles found
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first knowledge base article."}
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                data-ocid="kb.empty_create_button"
              >
                <Plus className="size-4 mr-1" />
                Create Article
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id.toString()}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className="group cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => setViewingArticleId(article.id)}
                      data-ocid={`kb.article.item.${index + 1}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="font-display text-base leading-snug line-clamp-2">
                            {article.title}
                          </CardTitle>
                          <BookOpen className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDate(article.updatedAt)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.content.slice(0, 160)}
                          {article.content.length > 160 ? "..." : ""}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingArticle}
        onOpenChange={(open) => !open && setEditingArticle(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Update your knowledge base article.
            </DialogDescription>
          </DialogHeader>
          {editingArticle && (
            <ArticleForm
              article={editingArticle}
              onSubmit={handleUpdate}
              onCancel={() => setEditingArticle(null)}
              isSubmitting={updateArticle.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{articleToDelete?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              data-ocid="kb.delete_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteArticle.isPending}
              data-ocid="kb.delete_confirm_button"
            >
              {deleteArticle.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
