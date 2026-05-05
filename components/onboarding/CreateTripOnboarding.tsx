"use client";
import { useState } from "react";
import Button from "@/components/ui/Button/Button";
import styles from "./CreateTripOnboarding.module.css";
import CreateTripModal from "@/components/trips/CreateTripModal";

export default function CreateTripOnboarding({
  onCreate,
}: {
  onCreate: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleCreateTrip() {
    // await createTrip(values);
    window.dispatchEvent(new Event("tripCreated"));
    onCreate();
    setIsModalOpen(false);
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.visualSection}>
          <div className={styles.glow}></div>

          <div className={styles.heroCard}>
            <div className={styles.pattern}></div>

            <div className={styles.heroContent}>
              <div className={styles.iconCircle}>✈</div>

              <div className={styles.progressLines}>
                <span></span>
                <span className={styles.activeLine}></span>
                <span></span>
              </div>
            </div>
          </div>

          <div className={styles.floatingCardRight}>
            <div className={styles.floatingInner}>🖼</div>
          </div>

          <div className={styles.floatingCardLeft}>
            <div className={styles.floatingInner}>🗺</div>
          </div>
        </div>

        <div className={styles.textSection}>
          <h1>Start your first journey</h1>
          <p>
            Capture your adventures, expenses, notes, and memories in one place.
            Your travel story begins with a single trip.
          </p>
        </div>

        <div className={styles.actions}>
          <Button onClick={() => setIsModalOpen(true)}>Create Trip</Button>

          {/* <button className={styles.linkButton} type="button">
            Need inspiration? Browse destinations
          </button> */}
        </div>
      </div>
      <CreateTripModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
    </>
  );
}
