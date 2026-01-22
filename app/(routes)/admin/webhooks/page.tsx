"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Webhook as WebhookIcon, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Webhook {
  id: string;
  name: string;
  description?: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  _count?: {
    deliveries: number;
  };
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/admin/webhooks");
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/webhooks/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Webhook deleted successfully",
        });
        fetchWebhooks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Webhook ${!currentStatus ? "activated" : "deactivated"}`,
        });
        fetchWebhooks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      });
    }
  };

  const testWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/webhooks/${id}/test`, {
        method: "POST",
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Test webhook sent successfully",
        });
      } else {
        throw new Error("Failed to send test webhook");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Webhooks
          </h1>
          <p className="text-muted-foreground">
            Send real-time notifications to external systems when events occur
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Webhook
        </Button>
      </div>

      {/* Webhooks List */}
      <div className="grid gap-4">
        {webhooks.length === 0 ? (
          <div className="text-center py-12 glass-effect rounded-lg">
            <WebhookIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Webhooks</h3>
            <p className="text-muted-foreground mb-4">
              Create your first webhook to receive real-time event notifications
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Webhook
            </Button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div key={webhook.id} className="glass-effect rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{webhook.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        webhook.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {webhook.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                  {webhook.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {webhook.description}
                    </p>
                  )}

                  {/* Webhook URL */}
                  <div className="mb-3 font-mono text-sm bg-black/20 p-3 rounded break-all">
                    {webhook.url}
                  </div>

                  {/* Events */}
                  <div className="mb-3">
                    <div className="text-sm text-muted-foreground mb-2">
                      Subscribed Events:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-sm text-muted-foreground">
                    {webhook._count?.deliveries || 0} deliveries •{" "}
                    Created {new Date(webhook.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testWebhook(webhook.id)}
                    title="Send test webhook"
                  >
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(webhook.id, webhook.isActive)}
                    title={webhook.isActive ? "Deactivate" : "Activate"}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteWebhook(webhook.id)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                    title="Delete webhook"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateWebhookDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchWebhooks();
          }}
        />
      )}
    </div>
  );
}

// Create Webhook Dialog
function CreateWebhookDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["tool.created"]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const availableEvents = [
    { value: "tool.created", label: "Tool Created" },
    { value: "tool.updated", label: "Tool Updated" },
    { value: "tool.deleted", label: "Tool Deleted" },
    { value: "course.created", label: "Course Created" },
    { value: "course.updated", label: "Course Updated" },
    { value: "course.deleted", label: "Course Deleted" },
    { value: "post.created", label: "Post Created" },
    { value: "post.published", label: "Post Published" },
    { value: "subscriber.new", label: "New Subscriber" },
    { value: "subscriber.unsubscribed", label: "Unsubscribed" },
  ];

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          url,
          events,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Success",
          description: `Webhook created! Secret: ${data.secret}`,
        });
        onSuccess();
      } else {
        throw new Error("Failed to create");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Create Webhook</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Production Webhook"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Sends notifications to our CRM..."
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Webhook URL *</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com/webhook"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Events to Subscribe *</label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <label
                  key={event.value}
                  className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={events.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Creating..." : "Create Webhook"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
