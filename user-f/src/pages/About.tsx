import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ShieldCheck, Truck, Headphones, Award, Heart, ArrowRight, ShoppingBag, CheckCircle2, Star
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "1,200+", label: "Curated Products" },
  { value: "99.8%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Dedicated Support" },
];

const values = [
  {
    icon: Award,
    title: "Uncompromising Quality",
    description: "Every item in our collection is carefully inspected and sourced from certified partners to guarantee extraordinary standards.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Transparent",
    description: "We prioritize your security with bank-grade 256-bit encryption, safe payment gateways, and transparent buyer protection.",
  },
  {
    icon: Truck,
    title: "Express Logistics",
    description: "Enjoy lightning-fast dispatch with end-to-end tracking so your purchases arrive promptly and in perfect condition.",
  },
  {
    icon: Headphones,
    title: "24/7 Premium Support",
    description: "Our dedicated support team is always on standby to assist you with inquiries, sizing, order tracking, and returns.",
  },
];

const milestones = [
  {
    year: "2023",
    title: "The Vision Begins",
    description: "Launched with a mission to create a modern, elegant, and effortless online shopping experience.",
  },
  {
    year: "2024",
    title: "Global Reach",
    description: "Expanded our fulfillment network and reached over 20,000 delighted shoppers worldwide.",
  },
  {
    year: "2025",
    title: "Next-Gen Integration",
    description: "Introduced smart checkout systems, dynamic cart merging, and instant order tracking.",
  },
  {
    year: "2026",
    title: "Excellence Redefined",
    description: "Recognized as a leading destination for premium online retail with unmatched customer satisfaction.",
  },
];

export const About = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground antialiased pb-20">
        {/* Hero Section */}
        <section className="relative py-24 px-4 hero-gradient overflow-hidden border-b border-border/40">
          <div className="container max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" /> Our Story & Legacy
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground leading-tight"
            >
              Crafting Exceptional <br className="hidden md:inline" /> Shopping Experiences
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              We believe online shopping should be intuitive, inspiring, and transparent. Discover our commitment to quality, innovation, and customer satisfaction.
            </motion.p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="container max-w-6xl mx-auto px-4 -mt-10 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-card border border-border/60 shadow-xl backdrop-blur-xl text-center"
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs md:text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Values Section */}
        <section className="container max-w-6xl mx-auto px-4 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              What Sets Us Apart
            </h2>
            <p className="text-muted-foreground mt-3 text-base">
              Built on principles of integrity, quality design, and customer delight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((val, idx) => {
              const IconComponent = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex items-start gap-6 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {val.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Timeline / Journey Section */}
        <section className="bg-secondary/20 py-24 border-y border-border/40">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Milestones</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
                Our Journey So Far
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((ms, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold mb-4">
                      {ms.year}
                    </span>
                    <h4 className="font-display font-bold text-lg text-foreground">{ms.title}</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ms.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="container max-w-4xl mx-auto px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-secondary border border-primary/20 shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
                Ready to Experience Excellence?
              </h2>
              <p className="text-muted-foreground mt-4 text-base md:text-lg max-w-xl mx-auto">
                Explore our catalog of premium products crafted for quality and convenience.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="hero"
                  asChild
                  className="px-8 py-6 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                  <Link to="/products" className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" /> Explore Products
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="px-8 py-6 rounded-2xl border-border/60 hover:bg-secondary font-semibold"
                >
                  <Link to="/categories" className="flex items-center gap-2">
                    Browse Categories <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
