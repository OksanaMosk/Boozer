"use client";

import React from "react";
import styles from "./BoozerProgressBarComponent.module.css";

interface Props {
  currentStep: number;
}

const steps = [
  { id: 1, label: "Venue" },
  { id: 2, label: "Info" },
  { id: 3, label: "Menu" },
  { id: 4, label: "Table" },
  { id: 5, label: "Extra" },
  { id: 6, label: "Route" },
  { id: 7, label: "Finish" },
];

export const BoozerProgressBarComponent: React.FC<Props> = ({ currentStep }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.progressLine}>
        <div
          className={styles.fill}
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => (
          <div key={step.id} className={styles.stepWrapper}>
            <div
              className={`${styles.circle} 
                ${currentStep >= step.id ? styles.active : ""} 
                ${currentStep > step.id ? styles.completed : ""}`}
            >
                <p className={styles.step}>{currentStep > step.id ? "✓" : step.id}</p>
            </div>
            <span className={`${styles.label} ${currentStep >= step.id ? styles.activeLabel : ""}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
