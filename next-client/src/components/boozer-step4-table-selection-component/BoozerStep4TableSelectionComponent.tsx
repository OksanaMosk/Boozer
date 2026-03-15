"use client";

import React, {useEffect, useState, useCallback, useMemo} from "react";
import {Stage, Layer, Image as KonvaImage, Text, Rect, Group} from "react-konva";
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";
import styles from "./BoozerStep4TableSelectionComponent.module.css";
import Table from "@/components/table-map-admin-component/Table";
import {ITable} from "@/models/IVenue";
import {AxiosResponse} from "axios";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import DatePickerComponent from "@/components/date-picker-component/DatePickerComponent";


interface Props {
    venueId: string;
    orderId: number;
    onNext: () => void;
    onBack: () => void;
}

const mergeDateAndTime = (date: Date | null, timeString: string): Date | null => {
    if (!date || !timeString) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
};

const BoozerStep4TableSelectionComponent: React.FC<Props> = ({venueId, orderId, onNext, onBack}) => {
    const {user} = useUser();
    const accessToken = user?.token;

    const [allTables, setAllTables] = useState<ITable[]>([]);
    const [reservedTableIds, setReservedTableIds] = useState<Set<number>>(new Set());
    const [selectedTableIds, setSelectedTableIds] = useState<Set<number>>(new Set());
    const [background, setBackground] = useState<HTMLImageElement | null>(null);
    const [orderInfo, setOrderInfo] = useState<{ guests: number } | null>(null);
    const [orderLimits, setOrderLimits] = useState<{ start: Date; end: Date } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [startTimeStr, setStartTimeStr] = useState("18:00");
    const [endTimeStr, setEndTimeStr] = useState("20:00");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [stageSize, setStageSize] = useState({width: 0, height: 0});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    if (!user) return <p className={styles.errorText}>Please log in.</p>;

    useEffect(() => {
        if (!accessToken) return;
        const initData = async () => {
            try {
                const [orderRes, bgRes, tablesRes]: AxiosResponse[] = await Promise.all([
                    venueServices.venues.orders({accessToken})(venueId).get(orderId),
                    venueServices.venues.background({accessToken})(venueId).getBackground(),
                    venueServices.venues.tables({accessToken})(venueId).getAll()
                ]);
                setOrderInfo({guests: orderRes.data.guests_count || 0});
                if (orderRes.data.start_date && orderRes.data.end_date) {
                    const sLimit = new Date(orderRes.data.start_date);
                    const eLimit = new Date(orderRes.data.end_date);
                    setOrderLimits({start: sLimit, end: eLimit});
                    setSelectedDate(sLimit);
                }
                if (bgRes.data.url) {
                    const img = new Image();
                    img.src = bgRes.data.url.startsWith("http") ? bgRes.data.url : `${process.env.NEXT_PUBLIC_BASE_URL}${bgRes.data.url}`;
                    img.onload = () => setBackground(img);
                }
                setAllTables(tablesRes.data.data || []);
            } catch (err) {
                setMessage("Error loading data");
            }
        };
        void initData();
    }, [venueId, orderId, accessToken]);

    const handleDateSelect = (dateObj: Date) => {
        if (!orderLimits) return;
        const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const s = new Date(orderLimits.start.getFullYear(), orderLimits.start.getMonth(), orderLimits.start.getDate());
        const e = new Date(orderLimits.end.getFullYear(), orderLimits.end.getMonth(), orderLimits.end.getDate());

        if (d < s || d > e) {
            setMessage(`Please choose a day between ${s.toLocaleDateString()} and ${e.toLocaleDateString()}`);
            return;
        }

        setSelectedDate(dateObj);
        setIsCalendarOpen(false);
        setMessage("");
        setSelectedTableIds(new Set());
    };

    useEffect(() => {
        if (selectedDate) {
            const startObj = mergeDateAndTime(selectedDate, startTimeStr);
            const endObj = mergeDateAndTime(selectedDate, endTimeStr);
            if (startObj && endObj) {
                setStartTime(startObj.toISOString());
                setEndTime(endObj.toISOString());
            }
        }
    }, [selectedDate, startTimeStr, endTimeStr]);

    const checkReserved = useCallback(async () => {
        if (!accessToken || !startTime || !endTime) return;

        try {
            const res: AxiosResponse = await venueServices.venues.bookings({accessToken})(venueId)("").getAllByVenue({
                lower: startTime,
                upper: endTime
            });
            const bookingsData = res.data || [];
            const reservedIds = new Set<number>(
                bookingsData
                    .filter((b: any) => {
                        // 1. Відсікаємо тільки те, що точно ВІЛЬНЕ (видалені, скасовані, прострочені)
                        const inactiveStatuses = ["CANCELLED", "EXPIRED", "REFUNDED"];

                        if (!b.is_active || inactiveStatuses.includes(b.status)) {
                            return false; // Ці столи малюємо ВІЛЬНИМИ
                        }
                        let bookingStart, bookingEnd;
                        try {
                            const range = typeof b.time_range === 'string' ? JSON.parse(b.time_range) : b.time_range;
                            bookingStart = new Date(range.lower);
                            bookingEnd = new Date(range.upper);
                        } catch (e) {
                            return false;
                        }
                        const selectedStart = new Date(startTime);
                        const selectedEnd = new Date(endTime);
                        return bookingStart < selectedEnd && bookingEnd > selectedStart;
                    })
                    // .filter((b: any) => {
                    //     if (!b.is_active || b.status !== "CONFIRMED") {
                    //         return false;
                    //     }
                    //     let bookingStart, bookingEnd;
                    //     try {
                    //         const range = typeof b.time_range === 'string' ? JSON.parse(b.time_range) : b.time_range;
                    //         bookingStart = new Date(range.lower);
                    //         bookingEnd = new Date(range.upper);
                    //     } catch (e) {
                    //         return false;
                    //     }
                    //     const selectedStart = new Date(startTime);
                    //     const selectedEnd = new Date(endTime);
                    //     return bookingStart < selectedEnd && bookingEnd > selectedStart;
                    // })
                    .map((b: any) => Number(b.table))
            );
            setReservedTableIds(reservedIds);
        } catch (err) {
            console.error("Failed to fetch reserved tables", err);
        }
    }, [accessToken, venueId, startTime, endTime]);

    useEffect(() => {
        const timer = setTimeout(checkReserved, 500);
        return () => clearTimeout(timer);
    }, [startTime, endTime, checkReserved]);
    //

    useEffect(() => {
        if (!allTables.length || !reservedTableIds.size) return; // чекаємо обидва

        console.log("Таблиця столиків та статусів (актуальна після бронювань):");
        console.table(
            allTables.map(table => {
                const tid = Number(table.id);
                return {
                    TableID: tid,
                    OrderID: orderId,
                    Status: reservedTableIds.has(tid) ? "ЗАЙНЯТИЙ" : "ВІЛЬНИЙ"
                };
            })
        );
    }, [allTables, reservedTableIds, orderId]);

    useEffect(() => {
        const updateSize = () => setStageSize({width: window.innerWidth * 0.7, height: window.innerHeight * 0.7});
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
            setMessage(`Select tables for at least ${requiredGuests} guests.`);
            return;
        }
        setIsSubmitting(true);
        try {
            if (!accessToken) return;
            const payload = {
                order: orderId,
                tables: Array.from(selectedTableIds),
                time_range: {lower: startTime, upper: endTime}
            };
            console.log("PAYLOAD4:", payload);
            await venueServices.venues.bookings({accessToken})(venueId)("").bulkCreate(payload);
            onNext();
        } catch (err: any) {
            setMessage(err.response?.data?.detail || "Booking error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (stageSize.width === 0) return <div className={styles.loader}><LoaderComponent/></div>;

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.headerInfo}>
                <h2 className={styles.title}>Step 4:</h2>
                <div className={styles.wrapperTitle}>
                    <h4 className={styles.bigText}>Table</h4>
                    <p className={styles.smallText}>Select</p>
                </div>
                {orderLimits && (
                    <p className={styles.orderHint}>
                        Your booking
                        period: <span>{orderLimits.start.toLocaleDateString()} — {orderLimits.end.toLocaleDateString()}</span>
                    </p>
                )}
            </div>

            <div className={styles.controlsRow}>
                <div className={styles.calendarWrapper}>
                    <label className={styles.label}>Select Day:</label>
                    <div className={styles.inputGroup} onClick={() => setIsCalendarOpen(true)}>
                        <input
                            type="text"
                            className={styles.input}
                            value={selectedDate ? selectedDate.toLocaleDateString() : "Choose a day"}
                            readOnly
                        />
                        <div className={styles.icon}>
                            <img src="/images/calendar.png" alt="calendar icon" width={20} className={styles.icon}/>
                        </div>
                    </div>
                    {isCalendarOpen && (
                        <div className={styles.calendarSidebar}>
                            <DatePickerComponent
                                dateValue={selectedDate}
                                setDateValue={(d: any) => {
                                    if (d instanceof Date) {
                                        handleDateSelect(d);
                                    } else if (typeof d === 'function') {
                                        setSelectedDate(d(selectedDate));
                                    }
                                }}
                            />
                            <button type="button" className={styles.closeCal}
                                    onClick={() => setIsCalendarOpen(false)}>Done
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.timePickerRow}>
                    <div className={styles.inputGroupTime}>
                        <label className={styles.label}>From:</label>
                        <input type="time" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)}
                               className={styles.input}/>
                    </div>
                    <div className={styles.inputGroupTime}>
                        <label className={styles.label}>To:</label>
                        <input type="time" value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)}
                               className={styles.input}/>
                    </div>
                </div>
            </div>

            {selectedDate && (
                <p className={styles.orderHint}>
                    Booking for <span>{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</span> from <span>{startTimeStr}</span> to <span>{endTimeStr}</span>
                </p>
            )}

            <div className={styles.stageWrapper}>
                <Stage width={stageSize.width} height={stageSize.height} className={styles.stage}>
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
                                    <Table table={{...table, x: tX, y: tY}} onClick={() => handleTableClick(table)}
                                           isSelected={isSelected}/>
                                    {isReserved && (
                                        <Group x={tX+45} y={tY+65}>
                                            <Rect
                                                width={70}
                                                height={22}
                                                fill="#bf8282"

                                                  cornerRadius={12}
                                            />
                                            <Text text="RESERVED" fill="white" fontSize={10} padding={6}
                                                  fontStyle="bold"/>
                                        </Group>
                                    )}
                                </Group>
                            );
                        })}
                    </Layer>
                </Stage>
            </div>
            <div className={styles.capacity}>
                <p className={styles.orderSeats}>Seats:</p>
                 <span className={
                        totalSelectedCapacity >= (orderInfo?.guests || 0)
                            ? styles.seatsOk
                            : styles.seatsWarning
                    }
                >
                    {totalSelectedCapacity} / {orderInfo?.guests || 0}
                </span>
            </div>
            <div className={styles.actions}>
                <button className={styles.buttonPrev} onClick={onBack} disabled={isSubmitting}>Back</button>
                <button
                    className={styles.buttonNext}
                    onClick={handleConfirmTable}
                    disabled={!selectedTableIds.size || totalSelectedCapacity < (orderInfo?.guests || 0) || isSubmitting}
                >
                    {isSubmitting ? <div className={`authButton ${styles.loaderWrapper}`}>
                        <LoaderComponent/>
                    </div> : "Next"}
                </button>
            </div>
            {message && <p className={styles.errorMessage}>{message}</p>}
        </div>
    );
};

export default BoozerStep4TableSelectionComponent;



// "use client";
//
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { Stage, Layer, Image as KonvaImage, Text, Rect, Group } from "react-konva";
// import venueServices from "@/lib/services/venueService";
// import { useUser } from "@/app/contexts/UserProvider";
// import styles from "./BoozerStep4TableSelectionComponent.module.css";
// import Table from "@/components/table-map-admin-component/Table";
// import { ITable } from "@/models/IVenue";
// import { AxiosResponse } from "axios";
// import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
// import DatePickerComponent from "@/components/date-picker-component/DatePickerComponent";
//
//
// interface Props {
//   venueId: string;
//   orderId: number;
//   onNext: () => void;
//   onBack: () => void;
// }
//
// const mergeDateAndTime = (date: Date | null, timeString: string): Date | null => {
//     if (!date || !timeString) return null;
//     const [hours, minutes] = timeString.split(':').map(Number);
//     const newDate = new Date(date);
//     newDate.setHours(hours, minutes, 0, 0);
//     return newDate;
// };
//
// const BoozerStep4TableSelectionComponent: React.FC<Props> = ({ venueId, orderId, onNext, onBack }) => {
//     const { user } = useUser();
//     const accessToken = user?.token;
//
//     const [allTables, setAllTables] = useState<ITable[]>([]);
//     const [reservedTableIds, setReservedTableIds] = useState<Set<number>>(new Set());
//     const [selectedTableIds, setSelectedTableIds] = useState<Set<number>>(new Set());
//     const [background, setBackground] = useState<HTMLImageElement | null>(null);
//     const [orderInfo, setOrderInfo] = useState<{ guests: number } | null>(null);
//     const [orderLimits, setOrderLimits] = useState<{ start: Date; end: Date } | null>(null);
//     const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//     const [isCalendarOpen, setIsCalendarOpen] = useState(false);
//     const [startTimeStr, setStartTimeStr] = useState("18:00");
//     const [endTimeStr, setEndTimeStr] = useState("20:00");
//     const [startTime, setStartTime] = useState("");
//     const [endTime, setEndTime] = useState("");
//     const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [message, setMessage] = useState("");
//     if (!user) return <p className={styles.errorText}>Please log in.</p>;
//
//     useEffect(() => {
//         if (!accessToken) return;
//         const initData = async () => {
//             try {
//                 const [orderRes, bgRes, tablesRes]: AxiosResponse[] = await Promise.all([
//                     venueServices.venues.orders({ accessToken })(venueId).get(orderId),
//                     venueServices.venues.background({ accessToken })(venueId).getBackground(),
//                     venueServices.venues.tables({ accessToken })(venueId).getAll()
//                 ]);
//
//                 setOrderInfo({ guests: orderRes.data.guests_count || 0 });
//
//                 if (orderRes.data.start_date && orderRes.data.end_date) {
//                     const sLimit = new Date(orderRes.data.start_date);
//                     const eLimit = new Date(orderRes.data.end_date);
//                     setOrderLimits({ start: sLimit, end: eLimit });
//                     setSelectedDate(sLimit);
//                 }
//
//                 if (bgRes.data.url) {
//                     const img = new Image();
//                     img.src = bgRes.data.url.startsWith("http") ? bgRes.data.url : `${process.env.NEXT_PUBLIC_BASE_URL}${bgRes.data.url}`;
//                     img.onload = () => setBackground(img);
//                 }
//                 setAllTables(tablesRes.data.data || []);
//             } catch (err) {
//                 setMessage("Error loading data");
//             }
//         };
//         void initData();
//     }, [venueId, orderId, accessToken]);
//
//     const handleDateSelect = (dateObj: Date) => {
//         if (!orderLimits) return;
//         const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
//         const s = new Date(orderLimits.start.getFullYear(), orderLimits.start.getMonth(), orderLimits.start.getDate());
//         const e = new Date(orderLimits.end.getFullYear(), orderLimits.end.getMonth(), orderLimits.end.getDate());
//
//         if (d < s || d > e) {
//             setMessage(`Please choose a day between ${s.toLocaleDateString()} and ${e.toLocaleDateString()}`);
//             return;
//         }
//
//         setSelectedDate(dateObj);
//         setIsCalendarOpen(false);
//         setMessage("");
//         setSelectedTableIds(new Set());
//     };
//
//     useEffect(() => {
//         if (selectedDate) {
//             const startObj = mergeDateAndTime(selectedDate, startTimeStr);
//             const endObj = mergeDateAndTime(selectedDate, endTimeStr);
//             if (startObj && endObj) {
//                 setStartTime(startObj.toISOString());
//                 setEndTime(endObj.toISOString());
//             }
//         }
//     }, [selectedDate, startTimeStr, endTimeStr]);
//
//     const checkReserved = useCallback(async () => {
//         if (!accessToken || !startTime || !endTime) return;
//         try {
//             const res:AxiosResponse = await venueServices.venues.bookings({ accessToken })(venueId)("").getAllByVenue({
//                 lower: startTime,
//                 upper: endTime
//             });
//             const bookingsData = res.data.data || res.data || [];
//             const reservedIds = new Set<number>(
//                 bookingsData.filter((b: any) => b.is_active !== false).map((b: any) => Number(b.table))
//             );
//               console.log(bookingsData)
//             setReservedTableIds(reservedIds);
//         } catch (err) {
//             console.error("Failed to fetch reserved tables", err);
//         }
//     }, [accessToken, venueId, startTime, endTime]);
//
//     useEffect(() => {
//         const timer = setTimeout(checkReserved, 500);
//         return () => clearTimeout(timer);
//     }, [startTime, endTime, checkReserved]);
//     //
//
//    useEffect(() => {
//     if (!allTables.length || !reservedTableIds.size) return; // чекаємо обидва
//
//     console.log("Таблиця столиків та статусів (актуальна після бронювань):");
//     console.table(
//         allTables.map(table => {
//             const tid = Number(table.id);
//             return {
//                 TableID: tid,
//                 OrderID: orderId,
//                 Status: reservedTableIds.has(tid) ? "ЗАЙНЯТИЙ" : "ВІЛЬНИЙ"
//             };
//         })
//     );
// }, [allTables, reservedTableIds, orderId]);
//
//     useEffect(() => {
//         const updateSize = () => setStageSize({width: window.innerWidth * 0.7, height: window.innerHeight * 0.7});
//         updateSize();
//         window.addEventListener("resize", updateSize);
//         return () => window.removeEventListener("resize", updateSize);
//     }, []);
//
//     const totalSelectedCapacity = useMemo(() => {
//         return allTables
//             .filter(t => selectedTableIds.has(Number(t.id)))
//             .reduce((sum, t) => sum + Number(t.capacity), 0);
//     }, [allTables, selectedTableIds]);
//
//     const handleTableClick = (table: ITable) => {
//         const tid = Number(table.id);
//         if (reservedTableIds.has(tid)) return setMessage("This table is RESERVED");
//
//         setSelectedTableIds(prev => {
//             const next = new Set(prev);
//             if (next.has(tid)) next.delete(tid);
//             else next.add(tid);
//             return next;
//         });
//         setMessage("");
//     };
//
//     const handleConfirmTable = async () => {
//         const requiredGuests = orderInfo?.guests || 0;
//         if (selectedTableIds.size === 0 || totalSelectedCapacity < requiredGuests) {
//             setMessage(`Select tables for at least ${requiredGuests} guests.`);
//             return;
//         }
//         setIsSubmitting(true);
//         try {
//               if (!accessToken) return;
//             const payload = {
//                 order: orderId,
//                 tables: Array.from(selectedTableIds),
//                 time_range: { lower: startTime, upper: endTime }
//             };
//             await venueServices.venues.bookings({ accessToken })(venueId)("").bulkCreate(payload);
//             onNext();
//         } catch (err: any) {
//             setMessage(err.response?.data?.detail || "Booking error");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//
//     if (stageSize.width === 0) return <div className={styles.loader}><LoaderComponent/></div>;
//
//     return (
//         <div className={styles.tableWrapper}>
//             <div className={styles.headerInfo}>
//                  <h2 className={styles.title}>Step 4:</h2>
//                 <div className={styles.wrapperTitle}>
//                     <h4 className={styles.bigText}>Table</h4>
//                     <p className={styles.smallText}>Select</p>
//                 </div>
//                 {orderLimits && (
//                     <p className={styles.orderHint}>
//                         Your booking period: <span>{orderLimits.start.toLocaleDateString()} — {orderLimits.end.toLocaleDateString()}</span>
//                     </p>
//                 )}
//             </div>
//
//             <div className={styles.controlsRow}>
//                 <div className={styles.calendarWrapper}>
//                     <label className={styles.label}>Select Day:</label>
//                     <div className={styles.inputGroup} onClick={() => setIsCalendarOpen(true)}>
//                         <input
//                             type="text"
//                             className={styles.input}
//                             value={selectedDate ? selectedDate.toLocaleDateString() : "Choose a day"}
//                             readOnly
//                         />
//                         <div className={styles.icon}>
//                             <img src="/images/calendar.png" alt="calendar icon" width={20} className={styles.icon}/>
//                         </div>
//                     </div>
//                     {isCalendarOpen && (
//                         <div className={styles.calendarSidebar}>
//                             <DatePickerComponent
//                                 dateValue={selectedDate}
//                                 setDateValue={(d: any) => {
//                                     if (d instanceof Date) {
//                                         handleDateSelect(d);
//                                     } else if (typeof d === 'function') {
//                                         setSelectedDate(d(selectedDate));
//                                     }
//                                 }}
//                             />
//                             <button type="button" className={styles.closeCal}
//                                     onClick={() => setIsCalendarOpen(false)}>Done
//                             </button>
//                         </div>
//                     )}
//                 </div>
//
//                 <div className={styles.timePickerRow}>
//                     <div className={styles.inputGroupTime}>
//                         <label className={styles.label}>From:</label>
//                         <input type="time" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)}
//                                className={styles.input}/>
//                     </div>
//                     <div className={styles.inputGroupTime}>
//                         <label className={styles.label}>To:</label>
//                         <input type="time" value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)}
//                                className={styles.input}/>
//                     </div>
//                 </div>
//             </div>
//
//             {selectedDate && (
//                 <p className={styles.orderHint}>
//                     Booking for <span>{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</span> from <span>{startTimeStr}</span> to <span>{endTimeStr}</span>
//                 </p>
//             )}
//
//             <div className={styles.stageWrapper}>
//                 <Stage width={stageSize.width} height={stageSize.height} className={styles.stage}>
//                     <Layer>
//                         {background && <KonvaImage image={background} width={stageSize.width} height={stageSize.height} />}
//                         {allTables.map(table => {
//                             const tid = Number(table.id);
//                             const isReserved = reservedTableIds.has(tid);
//                             const isSelected = selectedTableIds.has(tid);
//                             const tX = Number(table.x) * stageSize.width;
//                             const tY = Number(table.y) * stageSize.height;
//
//                             return (
//                                 <Group key={tid}>
//                                     <Table table={{...table, x: tX, y: tY}} onClick={() => handleTableClick(table)}
//                                            isSelected={isSelected}/>
//                                     {isReserved && (
//                                         <Group x={tX+45} y={tY+65}>
//                                             <Rect
//                                                 width={70}
//                                                 height={22}
//                                                 fill="#bf8282"
//
//                                                   cornerRadius={12}
//                                             />
//                                             <Text text="RESERVED" fill="white" fontSize={10} padding={6}
//                                                   fontStyle="bold"/>
//                                         </Group>
//                                     )}
//                                 </Group>
//                             );
//                         })}
//                     </Layer>
//                 </Stage>
//             </div>
//             <div className={styles.capacity}>
//                 <p className={styles.orderSeats}>Seats:</p>
//                  <span className={
//                         totalSelectedCapacity >= (orderInfo?.guests || 0)
//                             ? styles.seatsOk
//                             : styles.seatsWarning
//                     }
//                 >
//                     {totalSelectedCapacity} / {orderInfo?.guests || 0}
//                 </span>
//             </div>
//             <div className={styles.actions}>
//                 <button className={styles.buttonPrev} onClick={onBack} disabled={isSubmitting}>Back</button>
//                 <button
//                     className={styles.buttonNext}
//                     onClick={handleConfirmTable}
//                     disabled={!selectedTableIds.size || totalSelectedCapacity < (orderInfo?.guests || 0) || isSubmitting}
//                 >
//                     {isSubmitting ? <div className={`authButton ${styles.loaderWrapper}`}>
//                         <LoaderComponent/>
//                     </div> : "Next"}
//                 </button>
//             </div>
//             {message && <p className={styles.errorMessage}>{message}</p>}
//         </div>
//     );
// };
//
// export default BoozerStep4TableSelectionComponent;








// "use client";
//
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { Stage, Layer, Image as KonvaImage, Text, Rect, Group } from "react-konva";
// import venueServices from "@/lib/services/venueService";
// import { useUser } from "@/app/contexts/UserProvider";
// import styles from "./BoozerStep4TableSelectionComponent.module.css";
// import Table from "@/components/table-map-admin-component/Table";
// import { ITable } from "@/models/IVenue";
// import { AxiosResponse } from "axios";
// import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
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
//     const [allTables, setAllTables] = useState<ITable[]>([]);
//     const [reservedTableIds, setReservedTableIds] = useState<Set<number>>(new Set());
//     const [background, setBackground] = useState<HTMLImageElement | null>(null);
//     const [selectedTableIds, setSelectedTableIds] = useState<Set<number>>(new Set());
//     const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [message, setMessage] = useState("");
//     const [startTime, setStartTime] = useState("");
//     const [endTime, setEndTime] = useState("");
//     const [orderInfo, setOrderInfo] = useState<{ guests: number } | null>(null);
//     if (!user) {
//         return <p className={styles.errorText}>Please log in.</p>;
//     }
//     useEffect(() => {
//         if (!accessToken) return;
//         const initData = async () => {
//             try {
//                 const [orderRes, bgRes, tablesRes]: AxiosResponse[] = await Promise.all([
//                     venueServices.venues.orders({ accessToken })(venueId).get(orderId),
//                     venueServices.venues.background({ accessToken })(venueId).getBackground(),
//                     venueServices.venues.tables({ accessToken })(venueId).getAll()
//                 ]);
//
//                 setOrderInfo({ guests: orderRes.data.guests_count || 0 });
//                 if (orderRes.data.start_date) {
//                     setStartTime(`${orderRes.data.start_date}T18:00`);
//                     setEndTime(`${orderRes.data.start_date}T20:00`);
//                 }
//                 if (bgRes.data.url) {
//                     const img = new Image();
//                     img.src = bgRes.data.url.startsWith("http") ? bgRes.data.url : `${process.env.NEXT_PUBLIC_BASE_URL}${bgRes.data.url}`;
//                     img.onload = () => setBackground(img);
//                 }
//                 setAllTables(tablesRes.data.data || []);
//             } catch (err) {
//                 setMessage("Error loading floor plan");
//             }
//         };
//         void initData();
//     }, [venueId, orderId, accessToken]);
//
//     const checkReserved = useCallback(async () => {
//         if (!accessToken || !startTime || !endTime) return;
//         try {
//             const res: AxiosResponse = await venueServices.venues.bookings({ accessToken })(venueId)("").getAllByVenue({
//                 lower: new Date(startTime).toISOString(),
//                 upper: new Date(endTime).toISOString()
//             });
//             const bookingsData = res.data.data || res.data || [];
//             const reservedIds = new Set<number>(
//                 bookingsData
//                     .filter((b: any) => b.is_active !== false)
//                     .map((b: any) => Number(b.table))
//             );
//             setReservedTableIds(reservedIds);
//
//             setSelectedTableIds(prev => {
//                 const next = new Set(prev);
//                 let changed = false;
//                 next.forEach(id => {
//                     if (reservedIds.has(id)) {
//                         next.delete(id);
//                         changed = true;
//                     }
//                 });
//                 if (changed) setMessage("Some selected tables were just reserved.");
//                 return next;
//             });
//         } catch (err) {
//             console.error("Failed to fetch reserved tables", err);
//         }
//     }, [accessToken, venueId, startTime, endTime]);
//
//     useEffect(() => {
//         const timer = setTimeout(checkReserved, 500);
//         return () => clearTimeout(timer);
//     }, [startTime, endTime, checkReserved]);
//
//     useEffect(() => {
//         const updateSize = () => setStageSize({ width: window.innerWidth * 0.8, height: window.innerHeight * 0.6 });
//         updateSize();
//         window.addEventListener("resize", updateSize);
//         return () => window.removeEventListener("resize", updateSize);
//     }, []);
//
//     const totalSelectedCapacity = useMemo(() => {
//         return allTables
//             .filter(t => selectedTableIds.has(Number(t.id)))
//             .reduce((sum, t) => sum + Number(t.capacity), 0);
//     }, [allTables, selectedTableIds]);
//
//     const handleTableClick = (table: ITable) => {
//         const tid = Number(table.id);
//         if (reservedTableIds.has(tid)) return setMessage("This table is RESERVED");
//
//         setSelectedTableIds(prev => {
//             const next = new Set(prev);
//             if (next.has(tid)) next.delete(tid);
//             else next.add(tid);
//             return next;
//         });
//         setMessage("");
//     };
//
//     const handleConfirmTable = async () => {
//         const requiredGuests = orderInfo?.guests || 0;
//         if (selectedTableIds.size === 0 || totalSelectedCapacity < requiredGuests) {
//             setMessage(`You need to select tables for at least ${requiredGuests} guests.`);
//             return;
//         }
//
//         setIsSubmitting(true);
//         setMessage("");
//         try {
//             if (!accessToken) return;
//             const payload = {
//                 order: orderId,
//                 tables: Array.from(selectedTableIds),
//                 time_range: {
//                     lower: new Date(startTime).toISOString(),
//                     upper: new Date(endTime).toISOString()
//                 }
//             };
//
//            await venueServices.venues.bookings({ accessToken })(venueId)("").bulkCreate(payload);
//             onNext();
//         } catch (err: any) {
//             const backendError = err.response?.data?.non_field_errors?.[0] ||
//                                err.response?.data?.detail ||
//                                "Error booking tables";
//             setMessage(backendError);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//
//     useEffect(() => {
//         if (allTables.length > 0) {
//             const statusReport = allTables.map(table => ({
//                 id: table.id,
//                 capacity: table.capacity,
//                 status: reservedTableIds.has(Number(table.id)) ? "❌ RESERVED" : "✅ AVAILABLE"
//             }));
//             console.table(statusReport);
//         }
//     }, [allTables, reservedTableIds]);
//
//     if (stageSize.width === 0) return <div className={styles.loader}>Loading...</div>;
//
//     return (
//         <div className={styles.tableWrapper}>
//             <div className={styles.wrapperTitle}>
//                 <h4 className={styles.bigText}>Table</h4>
//                 <p className={styles.smallText}>Select</p>
//             </div>
//             <div className={styles.timePickerRow}>
//                 <div className={styles.inputGroup}><label>From:</label><input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
//                 <div className={styles.inputGroup}><label>To:</label><input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
//             </div>
//
//             <div className={styles.stageWrapper}>
//                 <Stage width={stageSize.width} height={stageSize.height}>
//                     <Layer>
//                         {background && <KonvaImage image={background} width={stageSize.width} height={stageSize.height} />}
//                         {allTables.map(table => {
//                             const tid = Number(table.id);
//                             const isReserved = reservedTableIds.has(tid);
//                             const isSelected = selectedTableIds.has(tid);
//                             const tX = Number(table.x) * stageSize.width;
//                             const tY = Number(table.y) * stageSize.height;
//
//                             return (
//                                 <Group key={tid}>
//                                     <Table
//                                         table={{ ...table, x: tX, y: tY }}
//                                         onClick={() => handleTableClick(table)}
//                                         isSelected={isSelected}
//                                     />
//                                     {isReserved && (
//                                         <Group x={tX} y={tY}>
//                                             <Rect width={75} height={22} fill="red" opacity={0.9} cornerRadius={4} />
//                                             <Text text="RESERVED" fill="white" fontSize={10} padding={6} fontStyle="bold" />
//                                         </Group>
//                                     )}
//                                 </Group>
//                             );
//                         })}
//                     </Layer>
//                 </Stage>
//             </div>
//
//             <div className={styles.footer}>
//                 <button onClick={onBack} disabled={isSubmitting}>Back</button>
//                 <div className={styles.centerSection}>
//                     <div className={styles.capacityCounter}>
//                         Seats: <span style={{ color: totalSelectedCapacity >= (orderInfo?.guests || 0) ? '#22c55e' : '#f59e0b' }}>
//                             {totalSelectedCapacity} / {orderInfo?.guests}
//                         </span>
//                     </div>
//                     {message && <p className={styles.errorMessage}>{message}</p>}
//                     <button
//                         className={styles.nextBtn}
//                         onClick={handleConfirmTable}
//                         disabled={!selectedTableIds.size || totalSelectedCapacity < (orderInfo?.guests || 0) || isSubmitting}
//                     >
//                         {isSubmitting ?
//                             <div className={`authButton ${styles.loaderWrapper}`}>
//                                 <LoaderComponent/>
//                             </div> : "Book Tables"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default BoozerStep4TableSelectionComponent;

