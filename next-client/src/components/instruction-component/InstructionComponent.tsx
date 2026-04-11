import styles from "./InstructionComponent.module.css";

export default function InstructionComponent() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Guidelines</h1>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Age Confirmation</h2>
        <p className={styles.text}>
          By accessing and using this application, you confirm that you are at least
          18 years old. If you do not meet this requirement, please leave the
          application immediately.
        </p>

        <h2 className={styles.sectionTitle}>General Disclaimer</h2>
        <p className={styles.text}>
          This platform is provided for entertainment and social interaction
          purposes only. The administration does not take responsibility for user
          actions, agreements, or outcomes resulting from interactions within the
          platform.
        </p>

        <h2 className={styles.sectionTitle}>Safety First</h2>
        <p className={styles.text}>
          Your safety is your responsibility. Always remain cautious when interacting
          with other users. Never share personal, financial, or sensitive information
          with strangers.
        </p>

        <p className={styles.warningText}>
          ⚠ Avoid meeting unknown individuals in isolated, unsafe, or unfamiliar
          locations. If you choose to meet someone, do so in a public place and inform
          someone you trust about your plans.
        </p>

        <h2 className={styles.sectionTitle}>How to Use the Platform</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            Browse available offers or profiles carefully.
          </li>
          <li className={styles.listItem}>
            Verify all details before making any decisions.
          </li>
          <li className={styles.listItem}>
            Communicate respectfully and responsibly.
          </li>
          <li className={styles.listItem}>
            Follow local laws and regulations at all times.
          </li>
        </ul>

        <h2 className={styles.sectionTitle}>User Responsibility</h2>
        <p className={styles.text}>
          By continuing to use this application, you agree that you are solely
          responsible for your actions, decisions, and interactions with others.
        </p>

        <div className={styles.warningBox}>
          ⚠ Always prioritize your personal safety and use common sense at all times.
        </div>
      </div>
    </div>
  );
}