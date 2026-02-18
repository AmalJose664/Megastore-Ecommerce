import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard,
  Lock,
  Check,
  ChevronLeft,
  Truck,
  Package,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setOrderComplete(true);
      clearCart();
    }
  };

  if (orderComplete) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="container flex flex-col items-center justify-center py-24 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10"
            >
              <Check className="h-12 w-12 text-success" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold">Order Confirmed!</h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              Thank you for your purchase. We've sent a confirmation email with
              your order details.
            </p>
            <div className="mt-8 flex gap-4">
              <Button variant="hero" asChild>
                <Link to="/products">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/account/orders">View Orders</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="container flex flex-col items-center justify-center py-24 text-center">
            <Package className="mb-6 h-16 w-16 text-muted-foreground" />
            <h1 className="font-display text-3xl font-bold">
              Your cart is empty
            </h1>
            <p className="mt-3 text-muted-foreground">
              Add some items to your cart before checking out.
            </p>
            <Button variant="hero" className="mt-6" asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const steps = [
    { number: 1, title: "Shipping" },
    { number: 2, title: "Payment" },
    { number: 3, title: "Review" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Back Link */}
          <Link
            to="/cart"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="mt-6 font-display text-3xl font-bold">Checkout</h1>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    step >= s.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                </div>
                <span
                  className={`ml-2 hidden text-sm font-medium sm:block ${
                    step >= s.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-px w-8 sm:w-16 ${
                      step > s.number ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl bg-card p-6 shadow-soft"
                  >
                    <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                      <Truck className="h-5 w-5" />
                      Shipping Information
                    </h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          required
                          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium">Address</label>
                        <input
                          type="text"
                          required
                          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">City</label>
                        <input
                          type="text"
                          required
                          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Postal Code</label>
                        <input
                          type="text"
                          required
                          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl bg-card p-6 shadow-soft"
                  >
                    <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This is a demo checkout. No real payment will be processed.
                    </p>
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          required
                          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            required
                            className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">CVC</label>
                          <input
                            type="text"
                            placeholder="123"
                            required
                            className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl bg-card p-6 shadow-soft"
                  >
                    <h2 className="font-display text-xl font-semibold">
                      Review Your Order
                    </h2>
                    <div className="mt-6 space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-4"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-6 flex gap-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </Button>
                  )}
                  <Button type="submit" variant="hero" className="flex-1">
                    {step === 3 ? "Place Order" : "Continue"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-xl bg-card p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-success">Free</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  Secure SSL Encrypted Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
