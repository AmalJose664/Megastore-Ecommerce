import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ShoppingBag, ArrowRight, Package, Loader2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { fetchOrderDetails } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId)
        .then((res) => {
          if (res.success) {
            setOrder(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to load order details:", err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex items-center justify-center py-16 px-4 hero-gradient">
        <div className="container max-w-xl flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/25"
          >
            <Check className="h-12 w-12 text-primary-foreground stroke-[3]" />
          </motion.div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Payment Successful!
          </h1>
          <p className="mt-3 text-muted-foreground text-lg leading-relaxed max-w-md">
            Thank you for your purchase. Your order has been placed and is now being processed.
          </p>

          {loading ? (
            <div className="my-8 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Fetching receipt details...</span>
            </div>
          ) : order ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-8 rounded-2xl bg-card border border-border/50 shadow-elevated p-6 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Order Number
                  </p>
                  <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                    {order.orderNumber}
                  </p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold px-3 py-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 inline-block" />
                  {order.paymentStatus?.toUpperCase() || "PAID"}
                </Badge>
              </div>

              {/* Items List */}
              <div className="space-y-3 py-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Order Items ({order.items?.length || 0})
                </p>
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border/40"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-foreground truncate max-w-[200px]">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Total Paid</span>
                <span className="text-xl font-display font-bold text-primary">
                  ₹{order.total?.toFixed(2)}
                </span>
              </div>
            </motion.div>
          ) : null}

          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button
              variant="hero"
              asChild
              className="px-8 py-6 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              <Link to="/products" className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Continue Shopping
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="px-8 py-6 rounded-2xl border-border/60 hover:bg-secondary font-semibold"
            >
              <Link to="/orders" className="flex items-center gap-2">
                <Package className="h-5 w-5" /> View My Orders
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderSuccess;
