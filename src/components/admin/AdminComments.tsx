import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  location: string | null;
  is_approved: boolean;
  created_at: string;
}

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    content: "",
    rating: 5,
    location: "",
    is_approved: true,
  });

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل التعليقات");
    } else {
      setComments(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const commentData = {
      author_name: formData.author_name,
      content: formData.content,
      rating: formData.rating,
      location: formData.location || null,
      is_approved: formData.is_approved,
    };

    const { error } = await supabase.from("comments").insert([commentData]);

    if (error) {
      toast.error("خطأ في إضافة التعليق");
    } else {
      toast.success("تم إضافة التعليق بنجاح");
      fetchComments();
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;

    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      toast.error("خطأ في حذف التعليق");
    } else {
      toast.success("تم حذف التعليق بنجاح");
      fetchComments();
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("comments")
      .update({ is_approved: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("خطأ في تحديث حالة التعليق");
    } else {
      toast.success("تم تحديث حالة التعليق");
      fetchComments();
    }
  };

  const resetForm = () => {
    setFormData({
      author_name: "",
      content: "",
      rating: 5,
      location: "",
      is_approved: true,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">إدارة التعليقات ({comments.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إضافة تعليق
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة تعليق جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>اسم المستثمر</Label>
                <Input
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData({ ...formData, author_name: e.target.value })
                  }
                  placeholder="اسم المستثمر"
                  required
                />
              </div>

              <div>
                <Label>المحتوى</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="نص التعليق"
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label>الموقع</Label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="مثال: الرياض، السعودية"
                />
              </div>

              <div>
                <Label>التقييم (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_approved}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_approved: checked })
                  }
                />
                <Label>موافق عليه</Label>
              </div>

              <Button type="submit" className="w-full">
                إضافة
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد تعليقات حالياً. قم بإضافة تعليق جديد.
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{comment.author_name}</h3>
                        {comment.location && (
                          <span className="text-sm text-muted-foreground">
                            - {comment.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < comment.rating
                                ? "fill-primary text-primary"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {comment.content}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            comment.is_approved
                              ? "bg-accent/20 text-accent"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {comment.is_approved ? "موافق عليه" : "قيد المراجعة"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleApproval(comment.id, comment.is_approved)
                      }
                    >
                      {comment.is_approved ? "إلغاء الموافقة" : "موافقة"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminComments;
