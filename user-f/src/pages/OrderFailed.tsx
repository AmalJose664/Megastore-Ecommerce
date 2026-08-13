import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ShoppingBag, ArrowLeft, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { fetchOrderDetails } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export const OrderFailed = () => {
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
            initial={{ scale: 0, rotate: 20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20 shadow-xl shadow-destructive/10"
          >
            <XCircle className="h-12 w-12 text-destructive stroke-[2.5]" />
          </motion.div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Payment Cancelled
          </h1>
          <p className="mt-3 text-muted-foreground text-lg leading-relaxed max-w-md">
            Your transaction was not completed. No charges were made to your account.
          </p>

          {loading ? (
            <div className="my-8 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Fetching order details...</span>
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
                    Order Reference
                  </p>
                  <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                    {order.orderNumber}
                  </p>
                </div>
                <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-bold px-3 py-1 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1 inline-block" />
                  UNPAID
                </Badge>
              </div>

              <div className="py-2 text-sm text-muted-foreground">
                <p>
                  You can retry payment for this order or modify your cart items to try again.
                </p>
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Amount Due</span>
                <span className="text-xl font-display font-bold text-foreground">
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
              <Link to="/checkout" className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" /> Retry Checkout
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="px-8 py-6 rounded-2xl border-border/60 hover:bg-secondary font-semibold"
            >
              <Link to="/cart" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" /> Return to Cart
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderFailed;
