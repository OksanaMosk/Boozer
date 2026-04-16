"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./GoldChartComponent.module.css";

interface IChartData {
  name: string;
  value: number;
}

interface IStats {
  total_views: number;
  daily: IChartData[];
  weekly: IChartData[];
  monthly: IChartData[];
}

type Period = 'daily' | 'weekly' | 'monthly';

interface Props {
  user?: boolean;
  stats: IStats | null; // Сюди прийдуть ваші реальні статси
}

export default function GoldChartComponent({ user = true, stats }: Props) {
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(!stats);

  useEffect(() => {
    if (stats) {
      setLoading(false);
    }
  }, [stats]);

  return (
    <div className={styles.chartContainer}>
      {!user ? (
        <div className={styles.unauthorizedWrapper}>
          <div className={styles.crown}>👑</div>
          <p className={styles.loaderText}>ACCESS DENIED</p>
        </div>
      ) : loading || !stats ? (
        <div className={styles.loaderWrapper}>
          <p className={styles.loaderText}>LOADING DATA...</p>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div>
              <p className={styles.label}>Traffic Overview</p>
              <h2 className={styles.value}>
                {(stats.total_views || 0).toLocaleString()}
              </h2>
            </div>

            <div className={styles.tabs}>
              {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
                <button
                    aria-label="Show analytics"
                    key={p}
                    onClick={(e) => {
                    e.stopPropagation();
                    setPeriod(p);
                  }}
                  className={`${styles.tabButton} ${period === p ? styles.tabButtonActive : ""}`}
                >
                  {p === 'daily' ? '1D' : p === 'weekly' ? '7D' : '30D'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats[period] || []}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ae8625" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #ae8625",
                    borderRadius: "8px",
                    fontSize: "11px"
                  }}
                  itemStyle={{ color: "#f9f295" }}
                  labelStyle={{ color: "rgba(255,215,0,0.5)" }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f9f295"
                  strokeWidth={3}
                  fill="url(#goldFill)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.footer}>
            <span className={styles.footerText}>SYSTEM ONLINE</span>
            <span className={styles.footerText}>
              ANALYTICS ({period === 'daily' ? '24H' : period === 'weekly' ? '7D' : '30D'})
            </span>
          </div>
        </>
      )}
    </div>
  );
}






// "use client";
//
// import React, { useState, useEffect } from "react";
// import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
// import styles from "./GoldChartComponent.module.css";
//
// const MOCK_STATS = {
//   total_views: 248590,
//   daily: [
//     { name: "00:00", value: 120 }, { name: "04:00", value: 80 },
//     { name: "08:00", value: 450 }, { name: "12:00", value: 900 },
//     { name: "16:00", value: 600 }, { name: "20:00", value: 1100 }
//   ],
//   weekly: [
//     { name: "Mon", value: 2100 }, { name: "Tue", value: 1800 },
//     { name: "Wed", value: 100 }, { name: "Thu", value: 2800 },
//     { name: "Fri", value: 4100 }, { name: "Sat", value: 4800 }, { name: "Sun", value: 3900 }
//   ],
//   monthly: [
//     { name: "Week 1", value: 12000 }, { name: "Week 2", value: 15500 },
//     { name: "Week 3", value: 11000 }, { name: "Week 4", value: 19800 }
//   ]
// };
//
// type Period = 'daily' | 'weekly' | 'monthly';
//
// export default function GoldChartComponent({ user = true }) {
//   const [period, setPeriod] = useState<Period>("daily");
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 800);
//     return () => clearTimeout(timer);
//   }, []);
//
//   return (
//     <div className={styles.chartContainer}>
//       {!user ? (
//         <div className={styles.unauthorizedWrapper}>
//           <div className={styles.crown}>👑</div>
//         </div>
//       ) : loading ? (
//         <div className={styles.loaderWrapper}>
//           <p className={styles.loaderText}>LOADING DATA...</p>
//         </div>
//       ) : (
//         <>
//           <div className={styles.header}>
//             <div>
//               <p className={styles.label}>Revenue Status</p>
//               <h2 className={styles.value}>
//                 {MOCK_STATS.total_views.toLocaleString()}
//               </h2>
//             </div>
//
//             <div className={styles.tabs}>
//               {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
//                 <button
//                   key={p}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setPeriod(p);
//                   }}
//                   className={`${styles.tabButton} ${period === p ? styles.tabButtonActive : ""}`}
//                 >
//                   {p === 'daily' ? '1D' : p === 'weekly' ? '7D' : '30D'}
//                 </button>
//               ))}
//             </div>
//           </div>
//
//           <div className={styles.chartWrapper}>
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={MOCK_STATS[period]}>
//                 <defs>
//                   <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#ae8625" stopOpacity={0.5} />
//                     <stop offset="100%" stopColor="#000" stopOpacity={0} />
//                   </linearGradient>
//                   <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
//                     <feGaussianBlur stdDeviation="3" result="blur" />
//                     <feComposite in="SourceGraphic" in2="blur" operator="over" />
//                   </filter>
//                 </defs>
//
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#000",
//                     border: "1px solid #ae8625",
//                     borderRadius: "8px",
//                     fontSize: "11px"
//                   }}
//                   itemStyle={{ color: "#f9f295" }}
//                   labelStyle={{ color: "rgba(255,215,0,0.5)" }}
//                 />
//
//                 <Area
//   type="monotone"
//   dataKey="value"
//   stroke="#f9f295"
//   strokeWidth={3}
//   fill="url(#goldFill)"
//   animationDuration={1500}
// />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//
//           <div className={styles.footer}>
//             <span className={styles.footerText}>SYSTEM ONLINE</span>
//             <span className={styles.footerText}>ANALYTICS (30D)</span>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
//
