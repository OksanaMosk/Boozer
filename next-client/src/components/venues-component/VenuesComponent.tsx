'use client';

import React from 'react';
import Link from "next/link";
import VenueComponent from "@/components/venue-component/VenueComponent";
import {PaginationComponent} from "@/components/pagination-component/PaginationComponent";
import {ButtonScrollTopComponent} from "@/components/button-scroll-top-component/ButtonScrollTopComponent";
import {ICar} from "@/models/ICar";
import styles from "./VenuesComponent.module.css";

interface CarListComponentProps {
    cars: ICar[];
    totalPages: number;
}

const VenuesComponent: React.FC<CarListComponentProps> = ({cars, totalPages}) => {
    return (
        <div className={styles.carsListContainer}>
            <ul className={styles.list}>
                {cars.map((car) => (
                    <li key={car.id}>
                        <Link
                            href={`/venues/${car.id}`}
                            className={styles.link}
                        >
                            <VenueComponent car={car}/>
                        </Link>
                    </li>
                ))}
            </ul>

            <PaginationComponent totalPages={totalPages}/>
            <ButtonScrollTopComponent/>
        </div>
    );
};

export default VenuesComponent;





