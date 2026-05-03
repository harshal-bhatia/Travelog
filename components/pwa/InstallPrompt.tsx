"use client";

import { useEffect, useState } from "react";
import styles from "./InstallPrompt.module.css";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    function handlePrompt(e: Event) {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      const main = document.getElementById("main-content");
      if (!main) return;

      const rect = main.getBoundingClientRect();
      const center = rect.left + rect.width / 2;

      document.documentElement.style.setProperty(
        "--install-center",
        `${center}px`,
      );
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem("pwa-install-dismissed", "1");
    setDismissed(true);
    setPrompt(null);
  }

  if (!prompt || dismissed || isInstalled) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.icon}>
        <span className="material-symbols-outlined">install_mobile</span>
      </div>
      <div className={styles.text}>
        <p className={styles.title}>Install Travelog</p>
        <p className={styles.sub}>Use offline, anytime — no internet needed</p>
      </div>
      <button className={styles.installBtn} onClick={handleInstall}>
        Install
      </button>
      <button
        className={styles.closeBtn}
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
