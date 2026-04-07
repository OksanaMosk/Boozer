'use client';

import {useState, useEffect, useCallback} from "react";
import styles from "./PaginationNewsComponent.module.css";

type PaginationProps = {
    totalPages: number;
    currentPage: number;
    onPageChangeAction: (page: number) => void;
};

export const PaginationNewsComponent = ({totalPages, currentPage, onPageChangeAction}: PaginationProps) => {
    const [pageRange, setPageRange] = useState<number[]>([]);

    const computePageRange = useCallback(() => {
        const pages: number[] = [];
        const maxPagesToShow = 10;
        const half = Math.floor(maxPagesToShow / 2);
        let startPage = currentPage - half;
        let endPage = currentPage + half;

        if (startPage < 1) {
            startPage = 1;
            endPage = Math.min(totalPages, maxPagesToShow);
        }
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        setPageRange(pages);
    }, [currentPage, totalPages]);

    useEffect(() => {
        computePageRange();
    }, [computePageRange]);

    const handlePrevPage = () => currentPage > 1 && onPageChangeAction(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages && onPageChangeAction(currentPage + 1);


    return (
        <div className={styles.paginationContainer}>
            <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className={`${styles.paginationNav} ${currentPage <= 1 ? styles.disabledNav : ""}`}
                aria-label="Previous page"
            >
                ⇦
            </button>

            {pageRange.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChangeAction(page)}
                    className={`${styles.paginationButton} ${
                        currentPage === page ? styles.paginationButtonActive : styles.paginationButtonInactive
                    }`}
                    aria-current={currentPage === page ? "page" : undefined}
                    aria-label={`Page ${page}`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className={`${styles.paginationNav} ${currentPage >= totalPages ? styles.disabledNav : ""}`}
                aria-label="Next page"
            >
                ⇨
            </button>
        </div>
    );
};