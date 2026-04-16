"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Tent, Box, Truck } from "lucide-react";

const useCases = [
  {
    icon: <ShoppingBag />,
    title: "Retail Shops",
    desc: "Quick help for stock arrangement, cleaning, or peak-hour customer support.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop"
  },
  {
    icon: <Tent />,
    title: "Events & Festivals",
    desc: "Short-term staff for ticket checking, setup, and crowd coordination.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop"
  },
  {
    icon: <Box />,
    title: "Warehouses",
    desc: "Micro-labor for packing, sorting, and inventory counts during busy weeks.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop"
  },
  {
    icon: <Truck />,
    title: "Delivery Help",
    desc: "Extra hands for loading/unloading larger shipments in your local area.",
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=800&auto=format&fit=crop"
  }
];

export const UseCases = () => {
  return (
    <section id="use-cases" className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-500 font-bold text-sm uppercase tracking-widest">Relatable Scenarios</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3">
            Designed for real-world tasks
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative h-[400px] rounded-[2rem] overflow-hidden border border-white/10"
            >
              <img 
                src={uc.image} 
                alt={uc.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-40 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white mb-4 shadow-lg">
                  {uc.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{uc.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {uc.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
