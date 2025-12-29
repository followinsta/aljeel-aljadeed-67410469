import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, Quote } from "lucide-react";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  location: string | null;
  created_at: string;
}

const Testimonials = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24 pt-32">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium">آراء عملائنا</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              ماذا يقول <span className="text-gradient-gold">المستثمرون</span> عنا
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              آلاف المستثمرين حققوا أحلامهم معنا. اقرأ تجاربهم الحقيقية
            </p>
          </div>

          {/* Comments Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">جاري تحميل التعليقات...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد تعليقات حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (comment.rating || 5)
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-foreground mb-4 leading-relaxed">
                    {comment.content}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">
                      {comment.author_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{comment.author_name}</p>
                      {comment.location && (
                        <p className="text-xs text-muted-foreground">{comment.location}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Testimonials;
