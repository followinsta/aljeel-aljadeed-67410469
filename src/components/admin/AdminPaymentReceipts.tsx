import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, ExternalLink, CheckCircle2, XCircle, Trash2, Clock, MessageCircle } from "lucide-react";

interface PaymentReceipt {
  id: string;
  customer_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  package_name: string | null;
  package_amount: number | null;
  currency: string | null;
  payment_method: string | null;
  receipt_image_url: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const AdminPaymentReceipts = () => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();

    // Realtime subscription
    const channel = supabase
      .channel("payment_receipts_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "payment_receipts" },
        (payload) => {
          const r = payload.new as PaymentReceipt;
          toast.success(`📥 إيصال تحويل جديد من ${r.full_name}`);
          setReceipts((prev) => [r, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchReceipts = async () => {
    const { data, error } = await supabase
      .from("payment_receipts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("خطأ في تحميل الإيصالات");
    } else {
      setReceipts((data || []) as PaymentReceipt[]);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("payment_receipts")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("خطأ في تحديث الحالة");
    } else {
      toast.success("تم التحديث");
      setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا الإيصال؟")) return;
    const { error } = await supabase.from("payment_receipts").delete().eq("id", id);
    if (error) toast.error("خطأ في الحذف");
    else {
      toast.success("تم الحذف");
      setReceipts((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const openTelegram = () => window.open("https://t.me/NEWJEEL", "_blank");

  const openWhatsapp = (phone: string | null, name: string) => {
    if (!phone) {
      toast.error("لا يوجد رقم هاتف للعميل");
      return;
    }
    const clean = phone.replace(/[^\d]/g, "");
    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(`مرحباً ${name}, بخصوص إيصال التحويل الخاص بك`)}`, "_blank");
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle2 className="w-3 h-3 ml-1" />موافق</Badge>;
    if (status === "rejected") return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 ml-1" />مرفوض</Badge>;
    return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 ml-1" />قيد المراجعة</Badge>;
  };

  if (loading) return <div className="text-center py-8">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">إيصالات التحويل</h2>
          <p className="text-sm text-muted-foreground">جميع إيصالات التحويل المرفوعة من العملاء</p>
        </div>
        <Badge variant="outline">{receipts.length} إيصال</Badge>
      </div>

      {receipts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            لا توجد إيصالات حالياً
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {receipts.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Receipt Image */}
                  <div className="bg-secondary/30 p-4 flex items-center justify-center">
                    <a href={r.receipt_image_url} target="_blank" rel="noreferrer" className="block w-full">
                      <img
                        src={r.receipt_image_url}
                        alt="إيصال التحويل"
                        className="w-full h-48 object-contain rounded cursor-pointer hover:opacity-90 transition"
                      />
                      <p className="text-xs text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                        <ExternalLink className="w-3 h-3" /> اضغط لعرض الصورة بالحجم الكامل
                      </p>
                    </a>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{r.full_name}</h3>
                        {r.customer_id && (
                          <p className="text-xs text-primary font-mono">رقم العميل: {r.customer_id}</p>
                        )}
                      </div>
                      {statusBadge(r.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {r.email && (
                        <div>
                          <span className="text-muted-foreground text-xs">البريد:</span>
                          <p className="break-all">{r.email}</p>
                        </div>
                      )}
                      {r.phone && (
                        <div>
                          <span className="text-muted-foreground text-xs">الهاتف:</span>
                          <p>{r.phone}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground text-xs">الباقة:</span>
                        <p className="font-medium">{r.package_name || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">المبلغ:</span>
                        <p className="font-bold text-primary">
                          {r.package_amount?.toLocaleString("ar-SA")} {r.currency === "USD" ? "دولار" : "ريال"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground text-xs">طريقة الدفع:</span>
                        <p>{r.payment_method === "binance_usdt" ? "باينانس USDT (TRC-20)" : "تحويل بنكي"}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground text-xs">التاريخ:</span>
                        <p className="text-xs">{new Date(r.created_at).toLocaleString("ar-SA")}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 flex-1"
                        onClick={openTelegram}
                      >
                        <Send className="w-4 h-4 ml-1" />
                        إكمال الاشتراك عبر تلقرام
                      </Button>
                      {r.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-600/10 hover:bg-green-600/20 text-green-500"
                          onClick={() => openWhatsapp(r.phone, r.full_name)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {r.status !== "approved" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "approved")}>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
                      {r.status !== "rejected" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "rejected")}>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPaymentReceipts;
