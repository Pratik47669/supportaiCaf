import { EmptyState } from "@/components/EmptyState";
import { SkeletonTable } from "@/components/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCustomer,
  useGetCustomers,
  useUpdateCustomer,
} from "@/hooks/useCustomerQueries";
import { useAddCustomerNote, useAddCustomerTag } from "@/hooks/useQueries";
import { useAuthStore } from "@/store";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Plus,
  Search,
  StickyNote,
  Tag,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function CustomersPage() {
  const { businessId } = useAuthStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const bId = businessId ? BigInt(businessId) : null;

  const { data: customers = [], isLoading } = useGetCustomers(bId ?? BigInt(0));
  const createCustomer = useCreateCustomer();
  const _updateCustomer = useUpdateCustomer();
  const addCustomerNote = useAddCustomerNote();
  const addCustomerTag = useAddCustomerTag();

  if (!bId) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm">
            Manage your customer relationships
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg border p-12 text-center">
          <Users className="text-muted-foreground mx-auto size-12 mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">
            Complete Onboarding
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            You need to finish onboarding and create a business before you can
            manage customers.
          </p>
          <Button asChild>
            <Link to="/onboarding">Complete Onboarding</Link>
          </Button>
        </div>
      </div>
    );
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddTag = (customerId: bigint) => {
    if (!newTag.trim()) return;
    addCustomerTag.mutate({ customerId, tag: newTag.trim() });
    setNewTag("");
  };

  const handleSaveNote = (customerId: bigint) => {
    if (!newNote.trim()) return;
    addCustomerNote.mutate({ customerId, text: newNote.trim() });
    setNewNote("");
  };

  const openDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm">
            Manage your customer relationships
          </p>
        </div>
        <Button
          data-ocid="customers.add_button"
          onClick={() => {
            if (!bId) return;
            createCustomer.mutate({
              businessId: bId,
              name: "New Customer",
              email: "customer@example.com",
            });
          }}
        >
          <Plus className="mr-2 size-4" />
          Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          data-ocid="customers.search_input"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState type="users" />
      ) : (
        <div className="space-y-3">
          {filtered.map((customer, index) => (
            <motion.div
              key={customer.id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="glass cursor-pointer transition-all hover:shadow-md"
                onClick={() => openDetail(customer)}
                data-ocid={`customers.item.${index + 1}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
                        <Users className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {customer.name}
                        </CardTitle>
                        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" />
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      data-ocid={`customers.expand_button.${index + 1}`}
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRow(
                          expandedRow === customer.id.toString()
                            ? null
                            : customer.id.toString(),
                        );
                      }}
                    >
                      {expandedRow === customer.id.toString() ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedRow === customer.id.toString() && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="space-y-4 pt-0">
                        {/* Tags */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Tag className="text-muted-foreground size-4" />
                            <span className="text-sm font-medium">Tags</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(customer.tags || []).map((tag: string) => (
                              <Badge
                                key={`tag-${tag}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            <div className="flex items-center gap-1">
                              <Input
                                data-ocid={`customers.tag_input.${index + 1}`}
                                placeholder="Add tag..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="h-7 w-32 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddTag(customer.id);
                                  }
                                }}
                              />
                              <Button
                                data-ocid={`customers.add_tag_button.${index + 1}`}
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => handleAddTag(customer.id)}
                              >
                                <Plus className="size-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StickyNote className="text-muted-foreground size-4" />
                            <span className="text-sm font-medium">Notes</span>
                          </div>
                          <Textarea
                            data-ocid={`customers.notes_input.${index + 1}`}
                            placeholder="Add notes about this customer..."
                            defaultValue={
                              customer.notes
                                ?.map((n: { text: string }) => n.text)
                                .join("\n") || ""
                            }
                            onChange={(e) => setNewNote(e.target.value)}
                            className="min-h-[80px] text-sm"
                          />
                          <Button
                            data-ocid={`customers.save_notes_button.${index + 1}`}
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveNote(customer.id)}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass-lg max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="text-muted-foreground size-4" />
                  {selectedCustomer.email}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {(selectedCustomer.tags || []).map((tag: string) => (
                    <Badge key={`detail-tag-${tag}`} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {(!selectedCustomer.tags ||
                    selectedCustomer.tags.length === 0) && (
                    <span className="text-muted-foreground text-sm">
                      No tags
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Notes</span>
                <p className="text-muted-foreground text-sm">
                  {selectedCustomer.notes || "No notes"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
