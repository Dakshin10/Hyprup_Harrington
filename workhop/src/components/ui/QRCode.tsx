"use client";

import { motion } from "framer-motion";

// Deterministic pseudo-random grid from a string seed
function seededGrid(seed: string, size: number): boolean[][] {
  // Simple hash: sum of char codes drives an LCG
  let h = seed.split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xfffffff, 7);
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      // Always fill the three finder corners (top-left, top-right, bottom-left)
      const isFinderTL = r < 3 && c < 3;
      const isFinderTR = r < 3 && c >= size - 3;
      const isFinderBL = r >= size - 3 && c < 3;
      if (isFinderTL || isFinderTR || isFinderBL) {
        row.push(true);
      } else {
        h = (h * 1664525 + 1013904223) & 0xfffffff;
        row.push((h >> 12) % 2 === 0);
      }
    }
    grid.push(row);
  }
  return grid;
}

interface QRCodeProps {
  value: string;     // job ID or any seed string
  size?: number;     // grid dimension (default 11)
  pixelSize?: number;// px per cell (default 18)
  label?: string;    // caption below QR
}

export const QRCode = ({ value, size = 11, pixelSize = 18, label }: QRCodeProps) => {
  const grid = seededGrid(value, size);
  const totalPx = size * pixelSize;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="relative"
      >
        {/* Outer frame */}
        <div
          className="bg-white rounded-2xl border-4 border-brand-border shadow-xl p-3"
          style={{ width: totalPx + 28, height: totalPx + 28 }}
        >
          <svg
            width={totalPx}
            height={totalPx}
            viewBox={`0 0 ${totalPx} ${totalPx}`}
            className="block"
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={c * pixelSize}
                  y={r * pixelSize}
                  width={pixelSize - 1}
                  height={pixelSize - 1}
                  rx={1}
                  fill={cell ? "#1f2937" : "transparent"}
                />
              ))
            )}
            {/* Finder pattern overlays — top-left */}
            <rect x={0} y={0} width={pixelSize * 3} height={pixelSize * 3} rx={3} fill="none" stroke="#ea580c" strokeWidth={2} />
            {/* top-right */}
            <rect x={(size - 3) * pixelSize} y={0} width={pixelSize * 3} height={pixelSize * 3} rx={3} fill="none" stroke="#ea580c" strokeWidth={2} />
            {/* bottom-left */}
            <rect x={0} y={(size - 3) * pixelSize} width={pixelSize * 3} height={pixelSize * 3} rx={3} fill="none" stroke="#ea580c" strokeWidth={2} />
          </svg>
        </div>

        {/* Scan animation */}
        <motion.div
          animate={{ top: ["14%", "86%", "14%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
          style={{ top: "14%" }}
        />
      </motion.div>

      {label && (
        <p className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider text-center">
          {label}
        </p>
      )}
    </div>
  );
};
