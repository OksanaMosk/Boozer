'use client';

import { useRouter } from 'next/navigation';
import styles from './ButtonGoBackComponent.module.css';

export const ButtonGoBackComponent = () => {
    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    };
    return (
        <button className={styles.button} onClick={handleGoBack}>
        Go back
    </button>
);
};