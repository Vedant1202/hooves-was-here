"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LockOpen } from "lucide-react";
import Slideshow, { type Slide } from "./Slideshow";
import ConfirmPopup from "./ConfirmPopup";
import styles from "./PasswordGate.module.css";

const ANSWER = "dance";
const CODE_LENGTH = ANSWER.length;
const MAX_TRIES = 3;
const WRONG_FLASH_MS = 1500;
const UNLOCK_HOLD_MS = 700;

type GateStatus =
  | "idle"
  | "wrong"
  | "unlocking"
  | "confirm1"
  | "confirm2"
  | "confirm3"
  | "confirm4"
  | "unlocked"
  | "locked";

const CONFIRM_STEPS: { status: GateStatus; message: string; cta: string }[] = [
  { status: "confirm1", message: "Do you really want to see the secret?", cta: "Yes" },
  { status: "confirm2", message: "Do you really really want to see the secret?", cta: "Yes, really" },
  { status: "confirm3", message: "But are you sure you want to see the secret?", cta: "Yes, I'm sure" },
  { status: "confirm4", message: "Fine since you're so sure huh?!", cta: "Show me" },
];

function nextConfirmStatus(status: GateStatus): GateStatus {
  const idx = CONFIRM_STEPS.findIndex((s) => s.status === status);
  if (idx === -1 || idx === CONFIRM_STEPS.length - 1) return "unlocked";
  return CONFIRM_STEPS[idx + 1].status;
}

type PasswordGateProps = {
  slides: Slide[];
  musicSrc: string | null;
};

export default function PasswordGate({ slides, musicSrc }: PasswordGateProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [triesLeft, setTriesLeft] = useState(MAX_TRIES);
  const [status, setStatus] = useState<GateStatus>("idle");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setMusicPlaying(true);
    const onPause = () => setMusicPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const gateVisible =
    status === "idle" || status === "wrong" || status === "locked" || status === "unlocking";

  const inputsDisabled =
    status === "wrong" || status === "unlocking" || status === "unlocked" || status === "locked";

  const evaluate = (attempt: string) => {
    if (attempt.toLowerCase() === ANSWER) {
      setStatus("unlocking");
      setTimeout(() => setStatus("confirm1"), UNLOCK_HOLD_MS);
      return;
    }

    const remaining = triesLeft - 1;
    setTriesLeft(remaining);

    if (remaining <= 0) {
      setStatus("locked");
      return;
    }

    setStatus("wrong");
    setTimeout(() => {
      setValue("");
      setStatus("idle");
      hiddenInputRef.current?.focus();
    }, WRONG_FLASH_MS);
  };

  const handleChange = (raw: string) => {
    if (status !== "idle") return;
    const next = raw.replace(/[^a-zA-Z]/g, "").slice(0, CODE_LENGTH);
    setValue(next);
    if (next.length === CODE_LENGTH) {
      evaluate(next);
    }
  };

  const handleConfirm = () => {
    const next = nextConfirmStatus(status);
    if (next === "unlocked") {
      audioRef.current?.play().catch(() => {});
    }
    setStatus(next);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const iconState = status === "unlocking" || status === "unlocked" ? "unlocked" : status === "wrong" || status === "locked" ? "wrong" : "idle";
  const currentConfirmStep = CONFIRM_STEPS.find((s) => s.status === status);

  return (
    <div className={styles.stage}>
      {musicSrc && (
        <audio ref={audioRef} src={musicSrc} loop preload="auto" className={styles.hiddenAudio} />
      )}

      <AnimatePresence>
        {gateVisible && (
          <motion.div
            className={styles.gate}
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              className={`${styles.iconWrap} ${iconState === "unlocked" ? styles.unlocked : ""} ${iconState === "wrong" ? styles.wrong : ""}`}
              animate={iconState === "unlocked" ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {iconState === "unlocked" ? <LockOpen size={36} /> : <Lock size={36} />}
            </motion.div>

            <h1 className={styles.heading}>Enter password to access secret evidence</h1>
            <p className={styles.hint}>
              Hint:{" "}
              <strong>
                what activity did you first meet the strongest biggest most
                dangerous-looking no-cute no-floof best known man in the
                world?
              </strong>
            </p>

            <div
              className={styles.codeRow}
              onClick={() => hiddenInputRef.current?.focus()}
            >
              {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                const isActive = focused && index === value.length && status === "idle";
                return (
                  <div
                    key={index}
                    className={`${styles.box} ${status === "wrong" ? styles.wrong : ""} ${isActive ? styles.active : ""}`}
                  >
                    {value[index]?.toUpperCase() ?? ""}
                  </div>
                );
              })}
              <input
                ref={hiddenInputRef}
                className={styles.hiddenInput}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={CODE_LENGTH}
                value={value}
                disabled={inputsDisabled}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => handleChange(e.target.value)}
                aria-label="Secret password"
              />
            </div>

            <p
              className={`${styles.status} ${status === "wrong" ? styles.wrong : ""} ${status === "locked" ? styles.locked : ""}`}
            >
              {status === "locked"
                ? "Access denied — no attempts remaining. Refresh to retry."
                : status === "wrong"
                  ? `Incorrect. ${triesLeft} ${triesLeft === 1 ? "try" : "tries"} left.`
                  : `${triesLeft} ${triesLeft === 1 ? "try" : "tries"} remaining`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.reveal}
        initial={{ opacity: 0 }}
        animate={{ opacity: gateVisible ? 0 : 1 }}
        transition={{ duration: 1, delay: gateVisible ? 0 : 0.3 }}
      >
        <AnimatePresence mode="wait">
          {currentConfirmStep && (
            <ConfirmPopup
              key={currentConfirmStep.status}
              message={currentConfirmStep.message}
              cta={currentConfirmStep.cta}
              onConfirm={handleConfirm}
            />
          )}
          {status === "unlocked" && (
            <Slideshow
              key="slideshow"
              slides={slides}
              musicPlaying={musicPlaying}
              onToggleMusic={toggleMusic}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
