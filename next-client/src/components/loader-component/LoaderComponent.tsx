"use client"

import styles from "./LoaderComponent.module.css"

export const LoaderComponent = ({ fillColor = "#00b8b8", centerColor = "#003333" }) => {
    return (
        <div className={styles.container}>
            <svg width="200" height="200" viewBox="0 0 200 200">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <g>
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 100 100"
                        to="360 100 100"
                        dur="10s"
                        repeatCount="indefinite"
                    />
                    {[...Array(8)].map((_, i) => {
                        const angle = (i * 45 * Math.PI) / 180;
                        const x = 100 + Math.cos(angle) * 50;
                        const y = 100 + Math.sin(angle) * 50;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="14"
                                fill={fillColor}
                                filter="url(#glow)"
                                className="loader"
                            />
                        );
                    })}
                </g>

                <circle
                    r="14"

                    fill={centerColor }
                    filter="url(#glow)"
                    className="loader-run"
                >
                    <animate
                        attributeName="cx"
                        values="150;135.36;100;64.64;50;64.64;100;135.36;150"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="cy"
                        values="100;135.36;150;135.36;100;64.64;50;64.64;100"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </div>
    );
};