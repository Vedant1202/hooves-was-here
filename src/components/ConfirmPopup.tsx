"use client";

import { motion } from "framer-motion";
import styles from "./ConfirmPopup.module.css";

type ConfirmPopupProps = {
  message: string;
  cta: string;
  onConfirm: () => void;
};

export default function ConfirmPopup({ message, cta, onConfirm }: ConfirmPopupProps) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <p className={styles.message}>{message}</p>
      <button type="button" className={styles.button} onClick={onConfirm}>
        {cta}
      </button>
    </motion.div>
  );
}
