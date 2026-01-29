"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Send, 
  Users, 
  Mail, 
  BarChart3,
  Plus,
  Trash2,
  Eye,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  link?: string;
  targetAll: boolean;
  targetRoles: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  readCount: number;
  clickCount: number;
  createdAt: string;
}

interface NotificationStats {
  totalSent: number;
  totalRead: number;
  totalClicked: number;
  avgReadRate: number;
  avgClickRate: number;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    totalRead: 0,
    totalClicked: 0,
    avgReadRate: 0,
    avgClickRate: 0,
  });
  
  // New broadcast form
  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    message: "",
    link: "",
    targetAll: true,
    targetRoles: ["USER"],
    scheduleForLater: false,
    scheduledAt: "",
  });

  // Settings
  const [settings, setSettings] = useState({
    enableNotifications: true,
    enableEmailDigest: true,
    emailFrequency: "daily",
    enablePush: true,
    vapidPublicKey: "",
    vapidPrivateKey: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch broadcasts
      const broadcastsRes = await fetch("/api/admin/notifications/broadcasts");
      if (broadcastsRes.ok) {
        const data = await broadcastsRes.json();
        setBroadcasts(data.broadcasts || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Failed to fetch notification data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!newBroadcast.title || !newBroadcast.message) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBroadcast),
      });

      if (res.ok) {
        toast({
          title: "Success!",
          description: newBroadcast.scheduleForLater 
            ? "Notification scheduled successfully" 
            : "Notification sent to all users",
        });
        setNewBroadcast({
          title: "",
          message: "",
          link: "",
          targetAll: true,
          targetRoles: ["USER"],
          scheduleForLater: false,
          scheduledAt: "",
        });
        fetchData();
      } else {
        throw new Error("Failed to send broadcast");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const deleteBroadcast = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/broadcasts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBroadcasts(prev => prev.filter(b => b.id !== id));
        toast({ title: "Deleted", description: "Broadcast deleted successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete broadcast", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Notification Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Send broadcasts, manage push notifications, and view analytics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{stats.totalSent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read Rate</p>
                <p className="text-2xl font-bold">{stats.avgReadRate.toFixed(1)}%</p>
              </div>
              <Eye className="h-8 w-8 text-green-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{stats.avgClickRate.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{stats.totalClicked}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="broadcast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="broadcast">New Broadcast</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Broadcast Notification
              </CardTitle>
              <CardDescription>
                Send a notification to all users or specific user groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Notification Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., New Feature Announcement"
                      value={newBroadcast.title}
                      onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your notification message..."
                      rows={4}
                      value={newBroadcast.message}
                      onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link (optional)</Label>
                    <Input
                      id="link"
                      placeholder="e.g., /blog/new-feature"
                      value={newBroadcast.link}
                      onChange={(e) => setNewBroadcast({ ...newBroadcast, link: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Where should users go when they click the notification?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-4">
                    <Label>Target Audience</Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">All Users</p>
                        <p className="text-xs text-muted-foreground">Send to everyone</p>
                      </div>
                      <Switch
                        checked={newBroadcast.targetAll}
                        onCheckedChange={(checked) => setNewBroadcast({ ...newBroadcast, targetAll: checked })}
                      />
                    </div>

                    {!newBroadcast.targetAll && (
                      <div className="space-y-2">
                        <Label>Select Roles</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select roles..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">Regular Users</SelectItem>
                            <SelectItem value="EDITOR">Editors</SelectItem>
                            <SelectItem value="ADMIN">Admins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">Schedule for Later</p>
                        <p className="text-xs text-muted-foreground">Send at a specific time</p>
                      </div>
                      <Switch
                        checked={newBroadcast.scheduleForLater}
                        onCheckedChange={(checked) => setNewBroadcast({ ...newBroadcast, scheduleForLater: checked })}
                      />
                    </div>

                    {newBroadcast.scheduleForLater && (
                      <div className="space-y-2">
                        <Label htmlFor="scheduledAt">Schedule Date/Time</Label>
                        <Input
                          id="scheduledAt"
                          type="datetime-local"
                          value={newBroadcast.scheduledAt}
                          onChange={(e) => setNewBroadcast({ ...newBroadcast, scheduledAt: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={sendBroadcast}
                    disabled={isSending}
                  >
                    {isSending ? (
                      "Sending..."
                    ) : newBroadcast.scheduleForLater ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Notification
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast History</CardTitle>
              <CardDescription>
                View past notifications and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : broadcasts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">No broadcasts sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {broadcasts.map((broadcast) => (
                    <div 
                      key={broadcast.id} 
                      className="flex items-start justify-between p-4 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{broadcast.title}</h4>
                          {broadcast.sentAt ? (
                            <Badge variant="secondary" className="text-xs">Sent</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Scheduled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {broadcast.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {broadcast.sentAt 
                              ? `Sent ${formatDistanceToNow(new Date(broadcast.sentAt), { addSuffix: true })}`
                              : `Scheduled for ${new Date(broadcast.scheduledAt!).toLocaleString()}`
                            }
                          </span>
                          <span>•</span>
                          <span>{broadcast.recipientCount} recipients</span>
                          <span>•</span>
                          <span>{broadcast.readCount} read</span>
                          <span>•</span>
                          <span>{broadcast.clickCount} clicks</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteBroadcast(broadcast.id)}
                        title="Delete broadcast"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Enable Notifications</Label>
                    <p className="text-xs text-muted-foreground">Master switch for all notifications</p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Enable browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.enablePush}
                    onCheckedChange={(checked) => setSettings({ ...settings, enablePush: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Digest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Email Digest</Label>
                    <p className="text-xs text-muted-foreground">Send email summaries to users</p>
                  </div>
                  <Switch
                    checked={settings.enableEmailDigest}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableEmailDigest: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Frequency</Label>
                  <Select
                    value={settings.emailFrequency}
                    onValueChange={(value) => setSettings({ ...settings, emailFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
