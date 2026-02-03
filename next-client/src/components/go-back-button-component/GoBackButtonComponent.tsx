'use client';

import { useRouter } from 'next/navigation';
import styles from './GoBackButtonComponent.module.css';

export const GoBackButtonComponent = () => {
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