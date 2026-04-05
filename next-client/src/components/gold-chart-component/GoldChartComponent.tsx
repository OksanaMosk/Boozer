"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./GoldChartComponent.module.css";

const MOCK_STATS = {
  total_views: 248590,
  daily: [
    { name: "00:00", value: 120 }, { name: "04:00", value: 80 },
    { name: "08:00", value: 450 }, { name: "12:00", value: 900 },
    { name: "16:00", value: 600 }, { name: "20:00", value: 1100 }
  ],
  weekly: [
    { name: "Mon", value: 2100 }, { name: "Tue", value: 1800 },
    { name: "Wed", value: 100 }, { name: "Thu", value: 2800 },
    { name: "Fri", value: 4100 }, { name: "Sat", value: 4800 }, { name: "Sun", value: 3900 }
  ],
  monthly: [
    { name: "Week 1", value: 12000 }, { name: "Week 2", value: 15500 },
    { name: "Week 3", value: 11000 }, { name: "Week 4", value: 19800 }
  ]
};

type Period = 'daily' | 'weekly' | 'monthly';

export default function GoldChartComponent({ user = true }) {
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.chartContainer}>
      {!user ? (
        <div className={styles.unauthorizedWrapper}>
          <div className={styles.crown}>👑</div>
        </div>
      ) : loading ? (
        <div className={styles.loaderWrapper}>
          <p className={styles.loaderText}>LOADING DATA...</p>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div>
              <p className={styles.label}>Revenue Status</p>
              <h2 className={styles.value}>
                {MOCK_STATS.total_views.toLocaleString()}
              </h2>
            </div>

            <div className={styles.tabs}>
              {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
                <button
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
              <AreaChart data={MOCK_STATS[period]}>
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
            <span className={styles.footerText}>ANALYTICS (30D)</span>
          </div>
        </>
      )}
    </div>
  );
}




// import React, { useState, useEffect } from "react";
// import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
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
//     { name: "Wed", value: 100}, { name: "Thu", value: 2800 },
//     { name: "Fri", value: 4100 }, { name: "Sat", value: 4800 }, { name: "Sun", value: 3900 }
//   ],
//   monthly: [
//     { name: "Week 1", value: 12000 }, { name: "Week 2", value: 15500 },
//     { name: "Week 3", value: 11000 }, { name: "Week 4", value: 19800 }
//   ]
// };
// type Period = 'daily' | 'weekly' | 'monthly';
//
// export default function GoldChartComponent({ user = true }) {
//  const [period, setPeriod] = useState<Period>("daily");
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 800);
//     return () => clearTimeout(timer);
//   }, []);
//
//   const tabStyle = (active:any) => ({
//     background: active ? "rgba(174, 134, 37, 0.25)" : "transparent",
//     border: active ? "1px solid #f9f295" : "1px solid rgba(174, 134, 37, 0.2)",
//     color: active ? "#f9f295" : "rgba(174, 134, 37, 0.6)",
//     padding: "3px 10px",
//     borderRadius: "6px",
//     fontSize: "10px",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     fontWeight: "600",
//     textTransform: "uppercase"
//   });
//
//   return (
//     <div style={{
//       width: "100%",
//       maxWidth: "360px",
//       background: "linear-gradient(165deg, #141414 0%, #050505 100%)",
//       padding: "20px",
//       borderRadius: "16px",
//       border: "1px solid rgba(174, 134, 37, 0.15)",
//       boxShadow: "0 15px 35px rgba(0,0,0,0.8)",
//       fontFamily: "sans-serif"
//     }}>
//
//       {!user ? (
//         <div style={{ textAlign: 'center', padding: ' 10px' }}>
//           <div style={{ fontSize: '20px', marginBottom: '10px' }}>👑</div>
//
//         </div>
//       ) : loading ? (
//           <div style={{height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
//               <p style={{color: '#ae8625', fontSize: '12px', letterSpacing: '2px'}}>LOADING DATA...</p>
//           </div>
//       ) : (
//           <>
//               <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'flex-start',
//                   marginBottom: '5px'
//               }}>
//                   <div>
//               <p style={{ color: '#ae8625', fontSize: '10px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
//                 Revenue Status
//               </p>
//               <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: '500' }}>
//                 {MOCK_STATS.total_views.toLocaleString()}
//               </h2>
//             </div>
//
//             <div style={{ display: 'flex', gap: '5px' }}>
//             {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
//                 <button key={p}
//                         onClick={(e) => {
//                             e.stopPropagation()
//                             setPeriod(p)
//                         }
//                         }
//                         style={tabStyle(period === p)}>
//                   {p === 'daily' ? '1D' : p === 'weekly' ? '7D' : '30D'}
//                 </button>
//               ))}
//             </div>
//           </div>
//
//           <div style={{ width: "100%", height: 50 }}>
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
//                   contentStyle={{ backgroundColor: "#000", border: "1px solid #ae8625", borderRadius: "8px", fontSize: "11px" }}
//                   itemStyle={{ color: "#f9f295" }}
//                   labelStyle={{ color: "rgba(255,215,0,0.5)" }}
//                 />
//
//                 <Area
//                   type="monotone"
//                   dataKey="value"
//                   stroke="#f9f295"
//                   strokeWidth={2.5}
//                   fill="url(#goldFill)"
//                   filter="url(#glow)"
//                   animationDuration={1000}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//
//           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
//              <span style={{ color: 'rgba(174, 134, 37, 0.4)', fontSize: '9px' }}>SYSTEM ONLINE</span>
//              <span style={{ color: 'rgba(174, 134, 37, 0.4)', fontSize: '9px' }}>ANALYTICS (30D)</span>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
