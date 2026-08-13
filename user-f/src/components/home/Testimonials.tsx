import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { fetchTestimonials } from "@/lib/api";

export function Testimonials() {
  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });

  const testimonials = data?.success ? data.data : [];

  if (isLoading) {
    return (
      <section className="bg-secondary/30 py-16 lg:py-24">
        <div className="container">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  // Fallback to empty array if no data, or show nothing
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-secondary/30 py-16 lg:py-24">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold lg:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-2 text-muted-foreground">
            Real stories from real customers
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={testimonial._id || testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-xl bg-card p-6 shadow-soft"
            >
              {/* Quote Icon */}
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="mt-4 text-muted-foreground">{testimonial.content}</p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={testimonial.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
