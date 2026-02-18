import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-elevated"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-xl font-semibold">
                Your Cart ({totalItems})
              </h2>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    Your cart is empty
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Looks like you haven't added any items yet.
                  </p>
                  <Button
                    variant="hero"
                    className="mt-6"
                    onClick={closeCart}
                    asChild
                  >
                    <Link to="/products">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <motion.li
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 rounded-lg bg-secondary/50 p-3"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium leading-tight">
                              {item.product.name}
                            </h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                              ${item.product.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-auto flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <span className="ml-auto font-semibold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={closeCart}
                    asChild
                  >
                    <Link to="/checkout">Checkout</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={closeCart}
                    asChild
                  >
                    <Link to="/cart">View Cart</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
