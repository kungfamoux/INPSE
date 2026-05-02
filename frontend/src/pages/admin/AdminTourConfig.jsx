import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Eye, EyeOff, Save, Video } from "lucide-react";
import { toast } from "sonner";

export default function AdminTourConfig() {
  const queryClient = useQueryClient();
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

  const { data: configs = [] } = useQuery({
    queryKey: ["tour-config"],
    queryFn: () => base44.entities.TourPageConfig.list(),
  });

  const { data: galleryItems = [] } = useQuery({
    queryKey: ["gallery-items"],
    queryFn: () => base44.entities.GalleryItem.filter({ is_published: true }, "-created_date", 500),
  });

  const config = configs[0];

  useEffect(() => {
    if (config) setVideoUrl(config.tourVideoUrl || "");
  }, [config?.id]);

  const updateConfigMutation = useMutation({
    mutationFn: (data) => base44.entities.TourPageConfig.update(config.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour-config"] });
      toast.success("Tour config updated");
      setShowHighlightModal(false);
      setEditingHighlight(null);
    },
  });

  const handleAddHighlight = () => {
    setEditingHighlight({
      title: "",
      description: "",
      icon: "Star",
      imageSourceType: "upload",
      imageUrl: "",
      galleryItemId: "",
      sortOrder: (config?.highlights?.length || 0),
      isActive: true,
    });
    setShowHighlightModal(true);
  };

  const handleEditHighlight = (highlight, index) => {
    setEditingHighlight({ ...highlight, index });
    setShowHighlightModal(true);
  };

  const handleSaveHighlight = () => {
    if (!editingHighlight.title || !editingHighlight.description) {
      toast.error("Title and description are required");
      return;
    }

    const highlights = config?.highlights || [];
    const updated = [...highlights];

    if (editingHighlight.index !== undefined) {
      updated[editingHighlight.index] = editingHighlight;
    } else {
      updated.push(editingHighlight);
    }

    updateConfigMutation.mutate({ highlights: updated });
  };

  const handleDeleteHighlight = (index) => {
    const updated = (config?.highlights || []).filter((_, i) => i !== index);
    updateConfigMutation.mutate({ highlights: updated });
  };

  const handleToggleActive = (index) => {
    const highlights = [...(config?.highlights || [])];
    highlights[index].isActive = !highlights[index].isActive;
    updateConfigMutation.mutate({ highlights });
  };

  const handleReorder = (fromIndex, toIndex) => {
    const highlights = [...(config?.highlights || [])];
    const [moved] = highlights.splice(fromIndex, 1);
    highlights.splice(toIndex, 0, moved);
    highlights.forEach((h, i) => (h.sortOrder = i));
    updateConfigMutation.mutate({ highlights });
  };

  if (!config) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No tour configuration found. Create one first.</p>
      </div>
    );
  }

  const highlights = config.highlights || [];

  return (
    <div className="space-y-8">
      {/* Virtual Tour Video Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Virtual Tour Video</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Paste a YouTube or Vimeo link. Both regular watch URLs and embed URLs are supported.
        </p>
        <div className="flex gap-3 items-start">
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
            className="flex-1"
          />
          <Button
            onClick={() => updateConfigMutation.mutate({ tourVideoUrl: videoUrl })}
            disabled={updateConfigMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 shrink-0"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateConfigMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
        {videoUrl && (
          <p className="text-xs text-green-600 mt-2">✓ Video URL saved — will display on the Tour page.</p>
        )}
        {!videoUrl && (
          <p className="text-xs text-gray-400 mt-2">No video set — a placeholder will show on the Tour page.</p>
        )}
      </Card>

      {/* Tour Highlights Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tour Highlights - "What You'll See"</h2>
          <Button onClick={handleAddHighlight} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" /> Add Highlight
          </Button>
        </div>

        <div className="space-y-3">
          {highlights.map((highlight, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
              draggable
              onDragStart={() => setDraggedIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIndex !== null && draggedIndex !== idx) {
                  handleReorder(draggedIndex, idx);
                  setDraggedIndex(null);
                }
              }}
            >
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{highlight.title}</h3>
                  {highlight.imageSourceType === "gallery" && highlight.galleryItemId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Gallery</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{highlight.description}</p>
              </div>

              {highlight.imageSourceType === "gallery" && highlight.galleryItemId ? (
                <img
                  src={galleryItems.find(g => g.id === highlight.galleryItemId)?.image_url}
                  alt={highlight.title}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : highlight.imageUrl ? (
                <img src={highlight.imageUrl} alt={highlight.title} className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Image</div>
              )}

              <button
                onClick={() => handleToggleActive(idx)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                {highlight.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>

              <Button variant="ghost" size="sm" onClick={() => handleEditHighlight(highlight, idx)}>
                Edit
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteHighlight(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Highlight Modal */}
      <Dialog open={showHighlightModal} onOpenChange={setShowHighlightModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingHighlight?.index !== undefined ? "Edit" : "Add"} Highlight</DialogTitle>
          </DialogHeader>

          {editingHighlight && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={editingHighlight.title}
                  onChange={(e) => setEditingHighlight({ ...editingHighlight, title: e.target.value })}
                  placeholder="e.g., Smart Classrooms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={editingHighlight.description}
                  onChange={(e) => setEditingHighlight({ ...editingHighlight, description: e.target.value })}
                  placeholder="Describe this facility..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <Select value={editingHighlight.icon} onValueChange={(val) => setEditingHighlight({ ...editingHighlight, icon: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Building2", "BookOpen", "Library", "TreePine", "Shield", "Star", "MapPin"].map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Source</label>
                  <Select
                    value={editingHighlight.imageSourceType}
                    onValueChange={(val) =>
                      setEditingHighlight({
                        ...editingHighlight,
                        imageSourceType: val,
                        galleryItemId: "",
                        imageUrl: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gallery">Gallery Item</SelectItem>
                      <SelectItem value="upload">Direct URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingHighlight.imageSourceType === "gallery" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Gallery Item</label>
                  <Select value={editingHighlight.galleryItemId} onValueChange={(val) => setEditingHighlight({ ...editingHighlight, galleryItemId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a gallery image..." />
                    </SelectTrigger>
                    <SelectContent>
                      {galleryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.caption || `Image ${item.id.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <Input
                    value={editingHighlight.imageUrl}
                    onChange={(e) => setEditingHighlight({ ...editingHighlight, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHighlightModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveHighlight} className="bg-orange-600 hover:bg-orange-700">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}