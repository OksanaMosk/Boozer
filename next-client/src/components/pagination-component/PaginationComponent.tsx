'use client';

import {useSearchParams, useRouter} from "next/navigation";
import {useState, useEffect, useCallback} from "react";
import styles from "./PaginationComponent.module.css";

type PaginationProps = {
    totalPages: number;
};

export const PaginationComponent = ({totalPages}: PaginationProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentPage = Number(searchParams.get("page") || "1");
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

    const updatePageQuery = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
    };

    const handlePageChange = (page: number) => updatePageQuery(page);
    const handlePrevPage = () => currentPage > 1 && updatePageQuery(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages && updatePageQuery(currentPage + 1);

    return (
        <div className={styles.paginationContainer}>
            <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className={`${styles.paginationNav} ${currentPage <= 1 ? "cursor-not-allowed" : ""}`}
                aria-label="Previous page"
            >
                &#8678;
            </button>

            {pageRange.map((page) => (
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.paginationButton} ${
                        currentPage === page ? styles.paginationButtonActive : styles.paginationButtonInactive
                    }`}
                    aria-current={currentPage === page ? "page" : undefined}
                    aria-label={`Page ${page}`}
                >{page}
                </button>
            ))}

            <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className={`${styles.paginationNav} ${currentPage >= totalPages ? "cursor-not-allowed" : ""}`}
                aria-label="Next page"
            >
                &#8680;
            </button>
        </div>
    );
};
