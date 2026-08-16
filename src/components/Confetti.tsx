"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import styles from "./Confetti.module.css";

const EMOJIS = ["❤️", "💋", "😘", "😍", "🥰", "💕"];
const PIECE_COUNT = 50;

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type Piece = {
  id: number;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
};

export default function Confetti() {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, id) => ({
        id,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        left: random(0, 100),
        size: random(1.1, 2.2),
        duration: random(3.2, 5.6),
        delay: random(0, 1.4),
        drift: random(-60, 60),
        spin: random(-180, 180),
      })),
    []
  );

  return (
    <div className={styles.layer} aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={styles.piece}
          style={
            {
              left: `${piece.left}%`,
              fontSize: `${piece.size}rem`,
              animationDuration: `${piece.duration}s`,
              animationDelay: `${piece.delay}s`,
              "--drift": `${piece.drift}px`,
              "--spin": `${piece.spin}deg`,
            } as CSSProperties
          }
        >
          {piece.emoji}
        </span>
      ))}
    </div>
  );
}
