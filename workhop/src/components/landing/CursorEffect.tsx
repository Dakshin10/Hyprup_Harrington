"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorEffect() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovered(
        el.tagName === "BUTTON" ||
        el.tagName === "A" ||
        el.closest("button") !== null ||
        el.closest("a") !== null
      );
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <>
      {/* Glow blob */}
      <motion.div
        className="fixed pointer-events-none z-[999] rounded-full"
        style={{
          width: hovered ? 48 : 32,
          height: hovered ? 48 : 32,
          background: hovered
            ? "radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)",
          transform: `translate(${pos.x - (hovered ? 24 : 16)}px, ${pos.y - (hovered ? 24 : 16)}px)`,
          transition: "width 0.15s, height 0.15s, background 0.15s",
          mixBlendMode: "screen",
        }}
      />
      {/* Dot */}
      <motion.div
        className="fixed pointer-events-none z-[999] rounded-full bg-primary-500"
        style={{
          width: 6,
          height: 6,
          transform: `translate(${pos.x - 3}px, ${pos.y - 3}px)`,
          opacity: 0.9,
        }}
      />
    </>
  );
}
