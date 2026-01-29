"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  X,
  Menu,
  Settings,
  Layers,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  iconColor: string | null;
  gradient: string | null;
  description: string | null;
  itemType: string;
  position: number;
  isEnabled: boolean;
  openInNewTab: boolean;
  sectionId: string | null;
  parentId: string | null;
  children?: MenuItem[];
}

interface MenuSection {
  id: string;
  name: string;
  slug: string;
  location: string;
  position: number;
  isEnabled: boolean;
  icon: string | null;
  iconColor: string | null;
  items: MenuItem[];
}

// Icon options for the dropdown
const iconOptions = [
  "Database", "Layers", "FileText", "GraduationCap", "Users", "BookOpen",
  "Dna", "Microscope", "Beaker", "Network", "TrendingUp", "Sparkles",
  "Home", "Settings", "Mail", "Phone", "Globe", "Link", "Star", "Heart",
  "Info", "HelpCircle", "MessageCircle", "Bell", "Search", "Filter",
  "Tag", "Folder", "File", "Image", "Video", "Music", "Download", "Upload"
];

const colorOptions = [
  { label: "Blue", value: "text-blue-400" },
  { label: "Purple", value: "text-purple-400" },
  { label: "Emerald", value: "text-emerald-400" },
  { label: "Orange", value: "text-orange-400" },
  { label: "Rose", value: "text-rose-400" },
  { label: "Cyan", value: "text-cyan-400" },
  { label: "Pink", value: "text-pink-400" },
  { label: "Amber", value: "text-amber-400" },
  { label: "Teal", value: "text-teal-400" },
  { label: "Violet", value: "text-violet-400" },
];

const gradientOptions = [
  { label: "Blue to Purple", value: "from-blue-500/10 to-purple-500/10" },
  { label: "Purple to Pink", value: "from-purple-500/10 to-pink-500/10" },
  { label: "Emerald to Teal", value: "from-emerald-500/10 to-teal-500/10" },
  { label: "Orange to Amber", value: "from-orange-500/10 to-amber-500/10" },
  { label: "Rose to Pink", value: "from-rose-500/10 to-pink-500/10" },
  { label: "Cyan to Blue", value: "from-cyan-500/10 to-blue-500/10" },
];

export default function MenuConfigurationPage() {
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuData();
  }, [activeTab]);

  async function fetchMenuData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/menus?location=${activeTab}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch menu data");
      const data = await response.json();
      setSections(data.sections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSection(sectionData: Partial<MenuSection>) {
    try {
      setSaving(true);
      const method = editingSection ? "PUT" : "POST";
      const response = await fetch("/api/admin/menus/sections", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...sectionData,
          id: editingSection?.id,
          location: activeTab,
        }),
      });

      if (!response.ok) throw new Error("Failed to save section");
      
      setSuccess("Section saved successfully!");
      setShowSectionModal(false);
      setEditingSection(null);
      fetchMenuData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveItem(itemData: Partial<MenuItem>) {
    try {
      setSaving(true);
      const method = editingItem ? "PUT" : "POST";
      const response = await fetch("/api/admin/menus/items", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...itemData,
          id: editingItem?.id,
          sectionId: selectedSectionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to save menu item");
      
      setSuccess("Menu item saved successfully!");
      setShowItemModal(false);
      setEditingItem(null);
      fetchMenuData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSection(sectionId: string) {
    if (!confirm("Are you sure you want to delete this section and all its items?")) return;
    
    try {
      const response = await fetch(`/api/admin/menus/sections?id=${sectionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete section");
      
      setSuccess("Section deleted successfully!");
      fetchMenuData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      const response = await fetch(`/api/admin/menus/items?id=${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete item");
      
      setSuccess("Menu item deleted successfully!");
      fetchMenuData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  async function handleToggleEnabled(type: "section" | "item", id: string, currentValue: boolean) {
    try {
      const endpoint = type === "section" ? "/api/admin/menus/sections" : "/api/admin/menus/items";
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, isEnabled: !currentValue }),
      });

      if (!response.ok) throw new Error("Failed to update");
      fetchMenuData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  async function handleInitializeDefaults() {
    if (!confirm("This will add default menu items. Continue?")) return;
    
    try {
      setSaving(true);
      const response = await fetch("/api/admin/menus/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ location: activeTab }),
      });

      if (!response.ok) throw new Error("Failed to initialize defaults");
      
      setSuccess("Default menu items added!");
      fetchMenuData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Menu className="w-7 h-7 text-primary" />
            Menu Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize header and footer navigation menus
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInitializeDefaults}
            disabled={saving}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-colors"
          >
            Load Defaults
          </button>
          <button
            onClick={() => {
              setEditingSection(null);
              setShowSectionModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("header")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "header"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Header Menu
          </span>
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "footer"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Footer Menu
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Menu className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            No menu sections configured for {activeTab}
          </p>
          <button
            onClick={handleInitializeDefaults}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Initialize Default Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onEditSection={() => {
                setEditingSection(section);
                setShowSectionModal(true);
              }}
              onDeleteSection={() => handleDeleteSection(section.id)}
              onToggleSection={() => handleToggleEnabled("section", section.id, section.isEnabled)}
              onAddItem={() => {
                setSelectedSectionId(section.id);
                setEditingItem(null);
                setShowItemModal(true);
              }}
              onEditItem={(item) => {
                setSelectedSectionId(section.id);
                setEditingItem(item);
                setShowItemModal(true);
              }}
              onDeleteItem={(itemId) => handleDeleteItem(itemId)}
              onToggleItem={(itemId, isEnabled) => handleToggleEnabled("item", itemId, isEnabled)}
            />
          ))}
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <SectionModal
          section={editingSection}
          onSave={handleSaveSection}
          onClose={() => {
            setShowSectionModal(false);
            setEditingSection(null);
          }}
          saving={saving}
        />
      )}

      {/* Item Modal */}
      {showItemModal && (
        <ItemModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setShowItemModal(false);
            setEditingItem(null);
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

// Section Card Component
function SectionCard({
  section,
  onEditSection,
  onDeleteSection,
  onToggleSection,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItem,
}: {
  section: MenuSection;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onToggleSection: () => void;
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItem: (itemId: string, isEnabled: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`bg-white/5 rounded-xl border ${section.isEnabled ? "border-white/10" : "border-red-500/30 opacity-60"}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-white/10 rounded" title={isExpanded ? "Collapse section" : "Expand section"} aria-label={isExpanded ? "Collapse section" : "Expand section"}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
          <div>
            <h3 className="font-semibold">{section.name}</h3>
            <p className="text-xs text-muted-foreground">
              {section.items.length} items • Position: {section.position}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSection}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={section.isEnabled ? "Disable section" : "Enable section"}
          >
            {section.isEnabled ? (
              <Eye className="w-4 h-4 text-green-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-red-400" />
            )}
          </button>
          <button
            onClick={onEditSection}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Edit section"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDeleteSection}
            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onAddItem}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Item
          </button>
        </div>
      </div>

      {/* Section Items */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {section.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items in this section
            </p>
          ) : (
            section.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 bg-white/5 rounded-lg ${
                  !item.isEnabled && "opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      {item.openInNewTab && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                      <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{item.itemType}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.href}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleItem(item.id, item.isEnabled)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title={item.isEnabled ? "Disable item" : "Enable item"}
                    aria-label={item.isEnabled ? "Disable item" : "Enable item"}
                  >
                    {item.isEnabled ? (
                      <Eye className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </button>
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Edit item"
                    aria-label="Edit item"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                    title="Delete item"
                    aria-label="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Section Modal Component
function SectionModal({
  section,
  onSave,
  onClose,
  saving,
}: {
  section: MenuSection | null;
  onSave: (data: Partial<MenuSection>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    name: section?.name || "",
    slug: section?.slug || "",
    position: section?.position || 0,
    icon: section?.icon || "",
    iconColor: section?.iconColor || "",
    isEnabled: section?.isEnabled ?? true,
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {section ? "Edit Section" : "Add Section"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg" title="Close" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Section Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: section ? formData.slug : generateSlug(e.target.value),
                })}
                required
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Discover"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., discover"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="sectionPosition" className="block text-sm font-medium mb-2">Position</label>
              <input
                id="sectionPosition"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label htmlFor="sectionIcon" className="block text-sm font-medium mb-2">Icon</label>
              <select
                id="sectionIcon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                title="Select section icon"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">None</option>
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sectionIconColor" className="block text-sm font-medium mb-2">Icon Color</label>
              <select
                id="sectionIconColor"
                value={formData.iconColor}
                onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                title="Select icon color"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Default</option>
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>{color.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isEnabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="w-4 h-4 rounded border-input"
            />
            <label htmlFor="isEnabled" className="text-sm">Section is visible</label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Item Modal Component
function ItemModal({
  item,
  onSave,
  onClose,
  saving,
}: {
  item: MenuItem | null;
  onSave: (data: Partial<MenuItem>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    label: item?.label || "",
    href: item?.href || "",
    icon: item?.icon || "",
    iconColor: item?.iconColor || "",
    gradient: item?.gradient || "",
    description: item?.description || "",
    itemType: item?.itemType || "link",
    position: item?.position || 0,
    isEnabled: item?.isEnabled ?? true,
    openInNewTab: item?.openInNewTab ?? false,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <h2 className="text-xl font-bold">
            {item ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Label *</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Blog"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL *</label>
              <input
                type="text"
                value={formData.href}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                required
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., /blog"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="itemType" className="block text-sm font-medium mb-2">Type</label>
              <select
                id="itemType"
                value={formData.itemType}
                onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                title="Select menu item type"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="link">Link</option>
                <option value="dropdown">Dropdown</option>
                <option value="mega">Mega Menu</option>
                <option value="divider">Divider</option>
              </select>
            </div>
            <div>
              <label htmlFor="itemPosition" className="block text-sm font-medium mb-2">Position</label>
              <input
                id="itemPosition"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="itemIcon" className="block text-sm font-medium mb-2">Icon</label>
              <select
                id="itemIcon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                title="Select item icon"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">None</option>
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="itemIconColor" className="block text-sm font-medium mb-2">Icon Color</label>
              <select
                id="itemIconColor"
                value={formData.iconColor}
                onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                title="Select item icon color"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Default</option>
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>{color.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="itemGradient" className="block text-sm font-medium mb-2">Gradient</label>
              <select
                id="itemGradient"
                value={formData.gradient}
                onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                title="Select hover gradient"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">None</option>
                {gradientOptions.map((grad) => (
                  <option key={grad.value} value={grad.value}>{grad.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Short description for mega menu items"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="itemEnabled"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="itemEnabled" className="text-sm">Visible</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="openNewTab"
                checked={formData.openInNewTab}
                onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="openNewTab" className="text-sm">Open in new tab</label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
