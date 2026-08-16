"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import Confetti from "./Confetti";
import styles from "./Slideshow.module.css";

export type Slide = {
  src: string;
  alt: string;
};

type SlideshowProps = {
  slides: Slide[];
  musicPlaying: boolean;
  onToggleMusic: () => void;
};

export default function Slideshow({ slides, musicPlaying, onToggleMusic }: SlideshowProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const canBack = index > 0;
  const canNext = index < slides.length - 1;

  const goBack = useCallback(() => {
    setIndex((i) => {
      if (i === 0) return i;
      setDirection(-1);
      return i - 1;
    });
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i >= slides.length - 1) return i;
      setDirection(1);
      return i + 1;
    });
  }, [slides.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack, goNext]);

  if (slides.length === 0) {
    return (
      <div className={styles.deck}>
        <p className={styles.empty}>
          No slides found. Drop numbered images (1.png, 2.png, …) into{" "}
          <code>public/slides</code>.
        </p>
      </div>
    );
  }

  const slide = slides[index];
  const isLastSlide = index === slides.length - 1;

  return (
    <div className={styles.deck}>
      {isLastSlide && <Confetti key={index} />}

      <div className={styles.header}>
        <span className={styles.title}>Secret Surveillance Footage</span>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleMusic}
          aria-label={musicPlaying ? "Mute background music" : "Play background music"}
        >
          {musicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      <div className={styles.stageArea}>
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.src}
            className={styles.slideWrap}
            initial={{ opacity: 0, x: direction >= 0 ? 32 : -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -32 : 32 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 700px) 90vw, 700px"
              className={styles.image}
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.navButton} onClick={goBack} disabled={!canBack}>
          <ChevronLeft size={16} />
          Back
        </button>
        <span className={styles.counter}>
          {index + 1} / {slides.length}
        </span>
        <button type="button" className={styles.navButton} onClick={goNext} disabled={!canNext}>
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
