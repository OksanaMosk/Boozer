"use client";

import React, { useEffect, useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import styles from "./BoozerStep4TableSelectionComponent.module.css";
import Table from "@/components/table-map-admin-component/Table";
import { ITable, IOrder } from "@/models/IVenue";
import {AxiosResponse} from "axios";

interface Props {
  venueId: string;
  orderId: number;
  onNext: () => void;
  onBack: () => void;
}

const BoozerStep4TableSelectionComponent: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
    const { user } = useUser();
    const accessToken = user?.token;

    const [tables, setTables] = useState<ITable[]>([]);
    const [background, setBackground] = useState<HTMLImageElement | null>(null);
    const [selectedTableId, setSelectedTableId] = useState<string | number | null>(null);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderData, setOrderData] = useState<IOrder | null>(null);
    const [message, setMessage] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    useEffect(() => {
        if (!accessToken) return;
        venueServices.venues.orders({ accessToken })(venueId).get(orderId)
            .then(res => {
                const data = res.data;
                setOrderData(data);
                if (data.start_date) {
                    setStartTime(`${data.start_date}T18:00`);
                    setEndTime(`${data.start_date}T20:00`);
                }
            })
            .catch(() => setMessage("Error loading order details"));

        venueServices.venues.background({ accessToken })(venueId).getBackground()
            .then(res => {
                if (res.data.url) {
                    const img = new Image();
                    img.src = res.data.url.startsWith("http") ? res.data.url : `${process.env.NEXT_PUBLIC_BASE_URL}${res.data.url}`;
                    img.onload = () => setBackground(img);
                }
            });

        venueServices.venues.tables({accessToken})(venueId).getAll()
            .then((res: AxiosResponse) => {
                setTables(Array.isArray(res.data.data) ? res.data.data : []);
            })
            .catch(console.error);
    }, [venueId, orderId, accessToken]);

    useEffect(() => {
        const updateSize = () => setStageSize({ width: window.innerWidth * 0.8, height: window.innerHeight * 0.6 });
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const handleConfirmTable = async () => {
        if (!selectedTableId || !accessToken || !orderData) return;
        const start = new Date(startTime);
        const end = new Date(endTime);
        const orderStart = new Date(orderData.start_date);
        const orderEnd = new Date(orderData.end_date);

        if (start.toDateString() !== orderStart.toDateString()) {
            setMessage(`Booking must be on the order date: ${orderData.start_date}`);
            return;
        }

        if (start >= end) {
            setMessage("Start time must be before end time");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        try {
            await venueServices.venues.bookings({ accessToken })(venueId)(String(selectedTableId)).create({
                order: orderId,
                table: selectedTableId,
                time_range: {
                    lower: start.toISOString(),
                    upper: end.toISOString()
                }
            });
            onNext();
        } catch (err: any) {
            console.error("Booking error", err);
            setMessage(err.response?.data?.detail || "This table is already booked for this time.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (stageSize.width === 0) return <div>Loading floor plan...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Step 4: Pick Your Spot</h2>
                {orderData && (
                    <p className={styles.orderInfo}>
                        Order Period: <strong>{orderData.start_date}</strong> to <strong>{orderData.end_date}</strong>
                    </p>
                )}
            </div>

            <div className={styles.timePickerRow}>
                <div className={styles.inputGroup}>
                    <label>From:</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>To:</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.stageWrapper}>
                <Stage width={stageSize.width} height={stageSize.height}>
                    <Layer>
                        {background && (
                            <KonvaImage image={background} width={stageSize.width} height={stageSize.height} />
                        )}
                        {tables.map(table => (
                            <Table
                                key={table.id}
                                table={{
                                    ...table,
                                    x: table.x * stageSize.width,
                                    y: table.y * stageSize.height
                                }}
                                draggable={false}
                                onClick={() => table.id && setSelectedTableId(table.id)}
                                isSelected={selectedTableId === table.id}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>

            <div className={styles.footer}>
                <button onClick={onBack} disabled={isSubmitting}>Back</button>
                <div className={styles.selectionInfo}>
                    {selectedTableId ? `Selected Table #${selectedTableId}` : "Please select a table"}
                </div>
                <button
                    className={styles.nextBtn}
                    onClick={handleConfirmTable}
                    disabled={!selectedTableId || isSubmitting || !startTime || !endTime}
                >
                    {isSubmitting ? "Holding..." : "Confirm Booking ➔"}
                </button>
            </div>
            {message && <p className={styles.errorMessage}>{message}</p>}
        </div>
    );
};

export default BoozerStep4TableSelectionComponent;






//
// "use client";
//
// import React, { useEffect, useState } from "react";
// import { Stage, Layer, Image as KonvaImage } from "react-konva";
// import venueServices from "@/lib/services/venueService";
// import { useUser } from "@/app/contexts/UserProvider";
// import styles from "./BoozerStep4TableSelectionComponent.module.css";
// import Table from "@/components/table-map-admin-component/Table";
// import {ITable} from "@/models/IVenue";
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
//     const [tables, setTables] = useState<ITable[]>([]);
//     const [background, setBackground] = useState<HTMLImageElement | null>(null);
//     const [selectedTableId, setSelectedTableId] = useState<string | number | null>(null);
//     const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
//     const [isSubmitting, setIsSubmitting] = useState(false);
//
//     const { user } = useUser();
//     const accessToken = user?.token;
//
//     useEffect(() => {
//         if (!accessToken) return;
//         venueServices.venues.background({ accessToken })(venueId).getBackground()
//             .then(res => {
//                 if (res.data.url) {
//                     const img = new Image();
//                     img.src = res.data.url.startsWith("http") ? res.data.url : `${process.env.NEXT_PUBLIC_BASE_URL}${res.data.url}`;
//                     img.onload = () => setBackground(img);
//                 }
//             });
//     }, [venueId, accessToken]);
//
//     useEffect(() => {
//         if (!accessToken) return;
//         venueServices.venues.tables({ accessToken })(venueId).getAll()
//       .then((res: AxiosResponse) => {
//         setTables(Array.isArray(res.data.data) ? res.data.data : []);
//       })
//       .catch(console.error);
//     }, [venueId, accessToken]);
//
//     useEffect(() => {
//         const updateSize = () => setStageSize({ width: window.innerWidth * 0.8, height: window.innerHeight * 0.6 });
//         updateSize();
//         window.addEventListener("resize", updateSize);
//         return () => window.removeEventListener("resize", updateSize);
//     }, []);
//
//     const handleConfirmTable = async () => {
//         if (!selectedTableId || !accessToken) return;
//         setIsSubmitting(true);
//         try {
//             await fetch(`/api/venues/${venueId}/tables/${selectedTableId}/bookings/`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${accessToken}`
//                 },
//                 body: JSON.stringify({
//                     order: orderId,
//                     time_range: {
//                         lower: new Date().toISOString(),
//                         upper: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
//                     }
//                 })
//             });
//             onNext();
//         } catch (err) {
//             console.error("Booking error", err);
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
//                 <p>Click on a table to select it</p>
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
//                                 onClick={() => {
//                                     if (table.id){
//                                     setSelectedTableId(table.id)}
//                                 }}
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
//                     disabled={!selectedTableId || isSubmitting}
//                 >
//                     {isSubmitting ? "Holding..." : "Next: Extra Services ➔"}
//                 </button>
//             </div>
//         </div>
//     );
// };
//
// export default BoozerStep4TableSelectionComponent;
