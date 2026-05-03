"use client";

import { useState } from "react";
import styles from "./Tabs.module.css";

export default function Tabs({ tabs }: { tabs: string[] }) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div>
      <div className={styles.tabHeader}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={active === tab ? styles.active : styles.tab}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
