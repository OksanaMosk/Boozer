"use client";

import React from "react";
import Image from "next/image";
import {ICar} from "@/models/ICar";
import styles from "./CarComponent.module.css";

interface Props {
    car: ICar;
}

const CarComponent: React.FC<Props> = ({car}) => {

    return (
        <div
            className={styles.cardWrapper}>
            <div className={styles.carItem}>
                {car.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={car.photos[0].photo}
                        alt={`${car.brand} ${car.model}`}
                        width={250}
                        height={120}
                        className={styles.carPoster}
                    />
                ) : (
                    <div className={styles.noPoster}>
                        <Image
                            src='/images/noPoster.png'
                            alt="No poster"
                            className={styles.placeholder}
                            width={250}
                            height={120}
                        />
                    </div>
                )}
                <div className={styles.right}>
                    <span className={styles.label}>Price:  </span>{" "}
                    <span className={styles.value}>
              {car.price} <strong>{car.currency}</strong>
            </span>
                </div>
            </div>

            <div className={styles.carInfoWrapper}>
                <div className={styles.carInfo}>
                    <h2 className={styles.carTitle}>
                        {car.brand} {car.model}{" "} {car.year}
                    </h2>

                    <div className={styles.about}>
                        <div className={styles.imageContainer}>
                            <img
                                src="/images/speed.png"
                                alt="speed"
                                width={24}
                                height={24}
                                className={styles.img}
                            />
                            <p className={styles.imgAbout}>Max speed </p>
                            <p className={styles.value}>{car.max_speed} km/h</p>
                        </div>

                        <div className={styles.imageContainer}>
                            <img
                                src="/images/seat.png"
                                alt="seat"
                                width={24}
                                height={24}
                                className={styles.img}
                            />
                            <p className={styles.imgAbout}>Seats</p>
                            <p className={styles.value}>{car.seats_count}</p>
                        </div>

                        <div className={styles.imageContainer}>
                            <img
                                src="/images/engine.png"
                                alt="Engine Volume"
                                width={24}
                                height={24}
                                className={styles.img}
                            />
                            <p className={styles.imgAbout}>Engine</p>
                            <p className={styles.value}>{car.engine_volume} L</p>
                        </div>

                        <div className={styles.imageContainer}>
                            <img
                                src="/images/fuel.png"
                                alt="fuel"
                                width={24}
                                height={24}
                                className={styles.img}
                            />
                            <p className={styles.imgAbout}>Fuel Type</p>
                            <p className={styles.value}>{car.fuel_type}</p>
                        </div>
                    </div>
                    <hr className={styles.tagline}></hr>
                    <div className={styles.footerRow}>
                        <div className={styles.row}>
                            <span className={styles.value}>{car.location}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Id:  </span>{" "}
                            <span className={styles.value}> {car.id}</span>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.value}>{car.condition}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarComponent;

