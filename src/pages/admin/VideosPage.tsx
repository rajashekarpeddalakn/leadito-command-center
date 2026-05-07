import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Play, Upload, FileVideo, Image as ImageIcon, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import videoService from "@/service/video";
import { confirmAction } from "@/lib/alerts";

const empty: any = { title: "", description: "", videoUrl: "", thumbnailUrl: "", isActive: true, display_order: 0 };

export default function VideosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

  // File refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos(1, false);
  }, []);

  const fetchVideos = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setFetching(true);

      const data = await videoService.listVideos({ page: pageNum, limit: 12 });

      const newItems = data.items || [];
      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      const pag = data.pagination || { totalPages: 1, totalItems: 0 };
      setPagination(pag);
      setHasMore(pageNum < pag.totalPages);
      setPage(pageNum);
    } catch (error) {
      toast.error("Failed to fetch videos");
    } finally {
      setFetching(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !fetching && !loadingMore && page < pagination.totalPages) {
          fetchVideos(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetching, loadingMore, page, pagination.totalPages]);

  const save = async () => {
    if (!editing.title) return toast.error("Title is required");

    setLoading(true);
    try {
      const payload = {
        ...editing,
        videoFile,
        thumbnailFile: thumbFile,
        display_order: Number(editing.display_order) || 0
      };

      if (editing.id) {
        await videoService.updateVideo(editing.id, payload);
        toast.success("Video updated");
      } else {
        await videoService.createVideo(payload);
        toast.success("Video created");
      }

      setOpen(false);
      setEditing(empty);
      setVideoFile(null);
      setThumbFile(null);
      fetchVideos(1, false); // Reset to page 1
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    const confirmed = await confirmAction({
      title: "Delete Video",
      text: "Are you sure you want to remove this video from the marketing gallery?",
      confirmButtonText: "Delete",
      isDestructive: true
    });
    if (!confirmed) return;
    try {
      await videoService.deleteVideo(id);
      toast.success("Deleted");
      fetchVideos(1, false); // Reset to page 1
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader title="Videos" description={`Manage marketing videos (${pagination.totalItems} total). Optimized scroll activated.`}
        action={
          <Dialog open={open} onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
              setEditing(empty);
              setVideoFile(null);
              setThumbFile(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(empty); setVideoFile(null); setThumbFile(null); }}>
                <Plus className="w-4 h-4 mr-2" />Add video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editing.id ? "Edit" : "Add"} video</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Platform Overview" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Briefly describe the video content..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Video Content</Label>
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors bg-accent/20"
                    >
                      {videoFile ? (
                        <div className="flex flex-col items-center">
                          <FileVideo className="w-8 h-8 text-primary" />
                          <span className="text-[10px] mt-1 truncate max-w-[120px]">{videoFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs font-medium">Upload MP4</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="video/mp4"
                        ref={videoInputRef}
                        className="hidden"
                        onChange={e => setVideoFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Thumbnail</Label>
                    <div
                      onClick={() => thumbInputRef.current?.click()}
                      className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors bg-accent/20"
                    >
                      {thumbFile ? (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 text-primary" />
                          <span className="text-[10px] mt-1 truncate max-w-[120px]">{thumbFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs font-medium">Upload Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={thumbInputRef}
                        className="hidden"
                        onChange={e => setThumbFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Display order</Label>
                    <Input type="number" value={editing.display_order} onChange={e => setEditing({ ...editing, display_order: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={editing.isActive} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                <Button onClick={save} disabled={loading} className="gradient-primary border-0">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing.id ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {fetching ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
          <p className="animate-pulse">Fetching your videos...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((v, idx) => (
              <div key={v.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${(idx % 12) * 50}ms` }}>
                <VideoCard v={v} onEdit={() => { setEditing(v); setOpen(true); }} onDelete={() => remove(v.id)} />
              </div>
            ))}
            {!items.length && (
              <Card className="col-span-full py-20 text-center border-dashed border-2 bg-accent/10">
                <div className="max-w-xs mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-bold text-xl mb-1">No videos found</h4>
                  <p className="text-muted-foreground text-sm mb-6">Start by adding your first marketing video to the system.</p>
                  <Button onClick={() => setOpen(true)} className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Video
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Scroll Target Sentinel */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center w-full">
            {loadingMore && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loading more content...</span>
              </div>
            )}
            {!hasMore && items.length > 0 && (
              <div className="flex flex-col items-center gap-2 opacity-40">
                <div className="h-px w-20 bg-border" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">End of Collection</span>
                <div className="h-px w-20 bg-border" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Video Card with built-in preview modal ──────────────────────────────────
function VideoCard({ v, onEdit, onDelete }: { v: any; onEdit: () => void; onDelete: () => void }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      {/* Fullscreen video preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-0">
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            {previewOpen && v.videoUrl && (
              <video
                src={v.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                style={{ display: "block" }}
              />
            )}
            {previewOpen && !v.videoUrl && (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/60 gap-3">
                <Video className="w-12 h-12" />
                <span className="text-sm">No video URL available</span>
              </div>
            )}
          </div>
          <div className="bg-background px-4 py-3">
            <p className="font-semibold text-sm">{v.title}</p>
            {v.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{v.description}</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Card */}
      <Card className="shadow-card overflow-hidden group border-border/40 hover:border-primary/40 transition-all duration-300">
        {/* Thumbnail / preview area */}
        <div className="aspect-video bg-muted relative cursor-pointer" onClick={() => setPreviewOpen(true)}>
          {v.thumbnailUrl ? (
            <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/20">
              <Video className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}

          {/* Dark overlay + centered play button */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg border-2 border-white/40">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Always-visible small play badge */}
          <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Play className="w-3 h-3 text-white fill-white ml-0.5" />
          </div>

          {!v.isActive && (
            <div className="absolute top-0 left-0 w-full h-full bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-destructive text-destructive-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">Inactive</span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-sm leading-tight truncate flex-1 mr-1">{v.title}</h3>
            <span className="text-[9px] font-bold text-muted-foreground/50 border border-border px-1 rounded uppercase shrink-0">#{v.display_order}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{v.description || "No description."}</p>
          <div className="flex gap-1.5 mt-2 pt-2 border-t border-border/40">
            <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 h-7 w-7" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <div className="flex-1" />
            <Button size="sm" variant="outline" className="h-7 text-xs px-2 hover:bg-primary hover:text-primary-foreground transition-colors" onClick={onEdit}>
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
