"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Rect, Group } from "react-konva";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./BoozerStep4TableSelectionComponent.module.css";
import Table from "@/components/table-map-admin-component/Table";
import { ITable } from "@/models/IVenue";
import { AxiosResponse } from "axios";

interface Props {
  venueId: string;
  orderId: number;
  onNext: () => void;
  onBack: () => void;
}

const BoozerStep4TableSelectionComponent: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
    const { user } = useUser();
    const accessToken = user?.token;

    const [allTables, setAllTables] = useState<ITable[]>([]);
    const [reservedTableIds, setReservedTableIds] = useState<Set<number>>(new Set());
    const [background, setBackground] = useState<HTMLImageElement | null>(null);
    const [selectedTableIds, setSelectedTableIds] = useState<Set<number>>(new Set());
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [orderInfo, setOrderInfo] = useState<{ guests: number } | null>(null);

    // Initial Load
    useEffect(() => {
        if (!accessToken) return;
        const initData = async () => {
            try {
                const [orderRes, bgRes, tablesRes]: AxiosResponse[] = await Promise.all([
                    venueServices.venues.orders({ accessToken })(venueId).get(orderId),
                    venueServices.venues.background({ accessToken })(venueId).getBackground(),
                    venueServices.venues.tables({ accessToken })(venueId).getAll()
                ]);

                setOrderInfo({ guests: orderRes.data.guests_count || 0 });
                if (orderRes.data.start_date) {
                    setStartTime(`${orderRes.data.start_date}T18:00`);
                    setEndTime(`${orderRes.data.start_date}T20:00`);
                }
                if (bgRes.data.url) {
                    const img = new Image();
                    img.src = bgRes.data.url.startsWith("http") ? bgRes.data.url : `${process.env.NEXT_PUBLIC_BASE_URL}${bgRes.data.url}`;
                    img.onload = () => setBackground(img);
                }
                setAllTables(tablesRes.data.data || []);
            } catch (err) {
                setMessage("Error loading floor plan");
            }
        };
        void initData();
    }, [venueId, orderId, accessToken]);

    // Check availability
    const checkReserved = useCallback(async () => {
        if (!accessToken || !startTime || !endTime) return;
        try {
            const res: AxiosResponse = await venueServices.venues.bookings({ accessToken })(venueId)("").getAllByVenue({
                lower: new Date(startTime).toISOString(),
                upper: new Date(endTime).toISOString()
            });
            const bookingsData = res.data.data || res.data || [];
            const reservedIds = new Set<number>(
                bookingsData
                    .filter((b: any) => b.is_active !== false)
                    .map((b: any) => Number(b.table))
            );
            setReservedTableIds(reservedIds);

            setSelectedTableIds(prev => {
                const next = new Set(prev);
                let changed = false;
                next.forEach(id => {
                    if (reservedIds.has(id)) {
                        next.delete(id);
                        changed = true;
                    }
                });
                if (changed) setMessage("❌ Some selected tables were just reserved.");
                return next;
            });
        } catch (err) {
            console.error("Failed to fetch reserved tables", err);
        }
    }, [accessToken, venueId, startTime, endTime]);

    useEffect(() => {
        const timer = setTimeout(checkReserved, 500);
        return () => clearTimeout(timer);
    }, [startTime, endTime, checkReserved]);

    useEffect(() => {
        const updateSize = () => setStageSize({ width: window.innerWidth * 0.8, height: window.innerHeight * 0.6 });
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const totalSelectedCapacity = useMemo(() => {
        return allTables
            .filter(t => selectedTableIds.has(Number(t.id)))
            .reduce((sum, t) => sum + Number(t.capacity), 0);
    }, [allTables, selectedTableIds]);

    const handleTableClick = (table: ITable) => {
        const tid = Number(table.id);
        if (reservedTableIds.has(tid)) return setMessage("This table is RESERVED");

        setSelectedTableIds(prev => {
            const next = new Set(prev);
            if (next.has(tid)) next.delete(tid);
            else next.add(tid);
            return next;
        });
        setMessage("");
    };

    const handleConfirmTable = async () => {
        const requiredGuests = orderInfo?.guests || 0;
        if (selectedTableIds.size === 0 || totalSelectedCapacity < requiredGuests) {
            setMessage(`⚠️ You need to select tables for at least ${requiredGuests} guests.`);
            return;
        }

        setIsSubmitting(true);
        setMessage("");
        try {
            if (!accessToken) return;
            const payload = {
                order: orderId,
                tables: Array.from(selectedTableIds),
                time_range: {
                    lower: new Date(startTime).toISOString(),
                    upper: new Date(endTime).toISOString()
                }
            };

           await venueServices.venues.bookings({ accessToken })(venueId)("").bulkCreate(payload);
            onNext();
        } catch (err: any) {
            const backendError = err.response?.data?.non_field_errors?.[0] ||
                               err.response?.data?.detail ||
                               "Error booking tables";
            setMessage(backendError);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (allTables.length > 0) {
            const statusReport = allTables.map(table => ({
                id: table.id,
                capacity: table.capacity,
                status: reservedTableIds.has(Number(table.id)) ? "❌ RESERVED" : "✅ AVAILABLE"
            }));
            console.table(statusReport);
        }
    }, [allTables, reservedTableIds]);

    if (stageSize.width === 0) return <div className={styles.loader}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.timePickerRow}>
                <div className={styles.inputGroup}><label>From:</label><input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
                <div className={styles.inputGroup}><label>To:</label><input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
            </div>

            <div className={styles.stageWrapper}>
                <Stage width={stageSize.width} height={stageSize.height}>
                    <Layer>
                        {background && <KonvaImage image={background} width={stageSize.width} height={stageSize.height} />}
                        {allTables.map(table => {
                            const tid = Number(table.id);
                            const isReserved = reservedTableIds.has(tid);
                            const isSelected = selectedTableIds.has(tid);
                            const tX = Number(table.x) * stageSize.width;
                            const tY = Number(table.y) * stageSize.height;

                            return (
                                <Group key={tid}>
                                    <Table
                                        table={{ ...table, x: tX, y: tY }}
                                        onClick={() => handleTableClick(table)}
                                        isSelected={isSelected}
                                    />
                                    {isReserved && (
                                        <Group x={tX} y={tY}>
                                            <Rect width={75} height={22} fill="red" opacity={0.9} cornerRadius={4} />
                                            <Text text="RESERVED" fill="white" fontSize={10} padding={6} fontStyle="bold" />
                                        </Group>
                                    )}
                                </Group>
                            );
                        })}
                    </Layer>
                </Stage>
            </div>

            <div className={styles.footer}>
                <button onClick={onBack} disabled={isSubmitting}>Back</button>
                <div className={styles.centerSection}>
                    <div className={styles.capacityCounter}>
                        Seats: <span style={{ color: totalSelectedCapacity >= (orderInfo?.guests || 0) ? '#22c55e' : '#f59e0b' }}>
                            {totalSelectedCapacity} / {orderInfo?.guests}
                        </span>
                    </div>
                    {message && <p className={styles.errorMessage}>{message}</p>}
                    <button
                        className={styles.nextBtn}
                        onClick={handleConfirmTable}
                        disabled={!selectedTableIds.size || totalSelectedCapacity < (orderInfo?.guests || 0) || isSubmitting}
                    >
                        {isSubmitting ? "Holding..." : "Confirm All Tables ➔"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BoozerStep4TableSelectionComponent;




// "use client";
//
// import React, { useEffect, useState } from "react";
// import { Stage, Layer, Image as KonvaImage } from "react-konva";
// import venueServices from "@/lib/services/venueService";
// import { useUser } from "@/app/contexts/UserProvider";
// import styles from "./BoozerStep4TableSelectionComponent.module.css";
// import Table from "@/components/table-map-admin-component/Table";
// import { ITable, IOrder } from "@/models/IVenue";
// import {AxiosResponse} from "axios";
//
// interface Props {
//   venueId: string;
//   orderId: number;
//   onNext: () => void;
//   onBack: () => void;
// }
//
// const BoozerStep4TableSelectionComponent: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
//     const { user } = useUser();
//     const accessToken = user?.token;
//
//     const [tables, setTables] = useState<ITable[]>([]);
//     const [background, setBackground] = useState<HTMLImageElement | null>(null);
//     const [selectedTableId, setSelectedTableId] = useState<string | number | null>(null);
//     const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [orderData, setOrderData] = useState<IOrder | null>(null);
//     const [message, setMessage] = useState("");
//     const [startTime, setStartTime] = useState("");
//     const [endTime, setEndTime] = useState("");
//
//     useEffect(() => {
//         if (!accessToken) return;
//         venueServices.venues.orders({ accessToken })(venueId).get(orderId)
//             .then(res => {
//                 const data = res.data;
//                 setOrderData(data);
//                 if (data.start_date) {
//                     setStartTime(`${data.start_date}T18:00`);
//                     setEndTime(`${data.start_date}T20:00`);
//                 }
//             })
//             .catch(() => setMessage("Error loading order details"));
//
//         venueServices.venues.background({ accessToken })(venueId).getBackground()
//             .then(res => {
//                 if (res.data.url) {
//                     const img = new Image();
//                     img.src = res.data.url.startsWith("http") ? res.data.url : `${process.env.NEXT_PUBLIC_BASE_URL}${res.data.url}`;
//                     img.onload = () => setBackground(img);
//                 }
//             });
//
//         venueServices.venues.tables({accessToken})(venueId).getAll()
//             .then((res: AxiosResponse) => {
//                 setTables(Array.isArray(res.data.data) ? res.data.data : []);
//             })
//             .catch(console.error);
//     }, [venueId, orderId, accessToken]);
//
//     useEffect(() => {
//         const updateSize = () => setStageSize({ width: window.innerWidth * 0.8, height: window.innerHeight * 0.6 });
//         updateSize();
//         window.addEventListener("resize", updateSize);
//         return () => window.removeEventListener("resize", updateSize);
//     }, []);
//
//     const handleConfirmTable = async () => {
//         if (!selectedTableId || !accessToken || !orderData) return;
//         const start = new Date(startTime);
//         const end = new Date(endTime);
//         const orderStart = new Date(orderData.start_date);
//         const orderEnd = new Date(orderData.end_date);
//
//         if (start.toDateString() !== orderStart.toDateString()) {
//             setMessage(`Booking must be on the order date: ${orderData.start_date}`);
//             return;
//         }
//
//         if (start >= end) {
//             setMessage("Start time must be before end time");
//             return;
//         }
//
//         setIsSubmitting(true);
//         setMessage("");
//
//         try {
//             await venueServices.venues.bookings({ accessToken })(venueId)(String(selectedTableId)).create({
//                 order: orderId,
//                 table: selectedTableId,
//                 time_range: {
//                     lower: start.toISOString(),
//                     upper: end.toISOString()
//                 }
//             });
//             onNext();
//         } catch (err: any) {
//             console.error("Booking error", err);
//             setMessage(err.response?.data?.detail || "This table is already booked for this time.");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//
//     if (stageSize.width === 0) return <div>Loading floor plan...</div>;
//
//     return (
//         <div className={styles.container}>
//             <div className={styles.header}>
//                 <h2>Step 4: Pick Your Spot</h2>
//                 {orderData && (
//                     <p className={styles.orderInfo}>
//                         Order Period: <strong>{orderData.start_date}</strong> to <strong>{orderData.end_date}</strong>
//                     </p>
//                 )}
//             </div>
//
//             <div className={styles.timePickerRow}>
//                 <div className={styles.inputGroup}>
//                     <label>From:</label>
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </div>
//                 <div className={styles.inputGroup}>
//                     <label>To:</label>
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </div>
//             </div>
//
//             <div className={styles.stageWrapper}>
//                 <Stage width={stageSize.width} height={stageSize.height}>
//                     <Layer>
//                         {background && (
//                             <KonvaImage image={background} width={stageSize.width} height={stageSize.height} />
//                         )}
//                         {tables.map(table => (
//                             <Table
//                                 key={table.id}
//                                 table={{
//                                     ...table,
//                                     x: table.x * stageSize.width,
//                                     y: table.y * stageSize.height
//                                 }}
//                                 draggable={false}
//                                 onClick={() => table.id && setSelectedTableId(table.id)}
//                                 isSelected={selectedTableId === table.id}
//                             />
//                         ))}
//                     </Layer>
//                 </Stage>
//             </div>
//
//             <div className={styles.footer}>
//                 <button onClick={onBack} disabled={isSubmitting}>Back</button>
//                 <div className={styles.selectionInfo}>
//                     {selectedTableId ? `Selected Table #${selectedTableId}` : "Please select a table"}
//                 </div>
//                 <button
//                     className={styles.nextBtn}
//                     onClick={handleConfirmTable}
//                     disabled={!selectedTableId || isSubmitting || !startTime || !endTime}
//                 >
//                     {isSubmitting ? "Holding..." : "Confirm Booking ➔"}
//                 </button>
//             </div>
//             {message && <p className={styles.errorMessage}>{message}</p>}
//         </div>
//     );
// };
//
// export default BoozerStep4TableSelectionComponent;
//
