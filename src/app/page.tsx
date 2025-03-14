"use client";

import { AppMain } from "@/components/AppMain";
import styles from "@/app/page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Scenario Reduction</h1>
        <AppMain />
      </main>
      <a
        href="https://github.com/privet-kitty/scenario-reduction"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.githubLink}
      >
        GitHub Repository
      </a>
    </div>
  );
}
