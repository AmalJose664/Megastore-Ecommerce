import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, ChevronRight, AlertCircle, ShoppingBag, Loader2, ArrowLeft, RefreshCw, Calendar, Tag
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { fetchMyOrders, cancelOrder } from "@/lib/api";
import { toast } from "sonner";

export const Orders = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadOrders = (page: number) => {
    setLoading(true);
    fetchMyOrders(page)
      .then((res) => {
        if (res.success) {
          setOrders(res.data);
          setPagination({
            page: page,
            total: res.pagination?.total || res.data.length,
            pages: res.pagination?.pages || 1,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        toast.error("Failed to load your orders");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/orders");
      return;
    }
    if (user) {
      loadOrders(pagination.page);
    }
  }, [user, authLoading, pagination.page, navigate]);

  const handleCancelOrder = async () => {
    if (!cancellingId) return;
    setCancelLoading(true);
    try {
      const res = await cancelOrder(cancellingId, cancelReason);
      if (res.success) {
        toast.success("Order cancelled successfully");
        setCancellingId(null);
        loadOrders(pagination.page);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Loading your order history...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground antialiased pb-20">
        {/* Header Banner */}
        <section className="relative py-16 px-4 hero-gradient border-b border-border/40">
          <div className="container max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Order Management
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-1">
                  My Orders
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  View order receipts, track shipments, and manage past purchases.
                </p>
              </div>

              <Button
                variant="outline"
                asChild
                className="rounded-xl border-border/60 hover:bg-secondary font-semibold self-start md:self-auto"
              >
                <Link to="/products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="container max-w-5xl mx-auto px-4 py-12">
          {orders.length === 0 ? (
            <Card className="border-border/50 bg-card p-16 text-center shadow-sm rounded-3xl max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">No orders yet</h2>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                You haven't placed any orders yet. Discover our latest collections and start shopping!
              </p>
              <Button
                variant="hero"
                asChild
                className="mt-8 px-8 py-6 rounded-2xl shadow-xl shadow-primary/20"
              >
                <Link to="/products" className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
                  Explore Products <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card
                  key={order._id || order.id}
                  className="border-border/50 bg-card shadow-sm overflow-hidden hover:border-primary/20 transition-all rounded-3xl group"
                >
                  {/* Order Top Bar */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 bg-secondary/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Order Number
                        </p>
                        <p className="text-sm font-mono font-bold text-foreground">
                          #{order.orderNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Date Placed
                        </p>
                        <p className="text-xs font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="text-sm font-bold text-primary">
                          ₹{order.total?.toFixed(2)}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={`capitalize rounded-full px-3 py-1 border-none shadow-sm font-bold tracking-tight text-[10px] ${
                          order.status === "delivered"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : order.status === "cancelled"
                            ? "bg-destructive/10 text-destructive"
                            : order.status === "pending"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex -space-x-3">
                          {order.items?.slice(0, 3).map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="h-12 w-12 rounded-2xl border-2 border-background bg-secondary/50 overflow-hidden shadow-sm ring-1 ring-border/20"
                            >
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-background bg-secondary text-xs font-bold shadow-sm ring-1 ring-border/20">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>

                        <div className="text-sm">
                          <p className="font-bold text-foreground">{order.items?.[0]?.name}</p>
                          {order.items?.length > 1 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              + {order.items.length - 1} additional item{order.items.length > 2 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        {order.status === "pending" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 text-[10px] font-bold uppercase tracking-widest"
                            onClick={() => setCancellingId(order._id || order.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all"
                        >
                          <Link to={`/profile/orders/${order._id || order.id}`}>
                            View Receipt <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 pt-8">
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        pagination.page === i + 1
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-card border border-border/50 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />

      {/* Cancellation Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-card border border-border rounded-[32px] p-8 shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-6">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">Cancel Order?</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              This action cannot be undone. Our warehouse team will stop processing shipment immediately.
            </p>

            <div className="space-y-2 mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-secondary/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option>Changed my mind</option>
                <option>Found a better price</option>
                <option>Ordered by mistake</option>
                <option>Delivery time too long</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-12 font-bold text-xs uppercase tracking-widest"
                onClick={() => setCancellingId(null)}
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-2xl h-12 font-bold text-xs uppercase tracking-widest shadow-lg shadow-destructive/20"
                onClick={handleCancelOrder}
                disabled={cancelLoading}
              >
                {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Orders;
