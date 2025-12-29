import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  location: string | null;
}

const TestimonialsSection = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

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
  };

  const scrollToIndex = (index: number) => {
    if (sliderRef.current) {
      const cardWidth = 320;
      const gap = 24;
      sliderRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: "smooth"
      });
    }
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, comments.length - 3);
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    scrollToIndex(newIndex);
  };

  if (comments.length === 0) return null;

  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium">آراء عملائنا</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ماذا يقول <span className="text-gradient-gold">المستثمرون</span> عنا
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            آلاف المستثمرين حققوا أحلامهم معنا. اقرأ تجاربهم الحقيقية
          </p>
          <Link to="/testimonials">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              عرض جميع الآراء
            </Button>
          </Link>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= comments.length - 3}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Testimonials Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex-shrink-0 w-80 bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300"
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
              <p className="text-foreground mb-4 leading-relaxed line-clamp-4">
                {comment.content}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">
                  {comment.author_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{comment.author_name}</p>
                  {comment.location && (
                    <p className="text-xs text-muted-foreground">{comment.location}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(Math.ceil(comments.length / 3))].map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i * 3)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / 3) === i
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
