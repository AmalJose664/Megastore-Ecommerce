import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

const Cart = () => {
  const { items, removeItem, updateQuantity, subtotal, totalItems, clearCart } =
    useCart();

  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <CartDrawer />
        <main className="min-h-screen bg-background">
          <div className="container flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold">
              Your cart is empty
            </h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              Looks like you haven't added any items to your cart yet. Start
              shopping to fill it up!
            </p>
            <Button variant="hero" size="lg" className="mt-8" asChild>
              <Link to="/products">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">Shopping Cart</h1>
              <p className="mt-1 text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <Button variant="ghost" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 rounded-xl bg-card p-4 shadow-soft sm:gap-6 sm:p-6"
                  >
                    <Link to={`/products/${item.product.id}`}>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-24 w-24 rounded-lg object-cover sm:h-32 sm:w-32"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            to={`/products/${item.product.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        {/* Quantity */}
                        <div className="flex items-center rounded-lg border border-input">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                Math.max(0, item.quantity - 1)
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="text-lg font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <Link to="/products">
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-xl bg-card p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold">
                  Order Summary
                </h2>

                {/* Promo Code */}
                <div className="mt-6">
                  <label className="text-sm font-medium">Promo Code</label>
                  <div className="mt-2 flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Enter code"
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <Button variant="secondary">Apply</Button>
                  </div>
                </div>

                {/* Summary */}
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

                {shipping > 0 && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="mt-6 w-full"
                  asChild
                >
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
