"use client";

import React, { useState, useEffect } from "react";
import './DatePickerComponent.scss';

interface CalendarProps {
    dateValue: Date | null;
    setDateValue: React.Dispatch<React.SetStateAction<Date | null>>;
    darkMode?: boolean;
    readOnly?: boolean;
    yearRange?: [number, number];
}

const isValidYear = (year: number) => year > 1926 && year < 2026;

export const DatePickerComponent: React.FC<CalendarProps> = ({
                                                                 dateValue,
                                                                 setDateValue,
                                                                 darkMode = false,
                                                                 readOnly = false,
                                                                 yearRange,
                                                             }) => {
    const selectedDate = dateValue ?? new Date();
    const [animation, setAnimation] = useState('');
    const [yeardrawer, setYeardrawer] = useState(false);
    const [darkModeValue, setDarkModeValue] = useState(darkMode);
    const [yearsArray, setYearsArray] = useState<number[]>([]);

    const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        setDarkModeValue(darkMode);
    }, [darkMode]);

    const generateYearlyArray = (startYear: number, endYear: number): number[] => {
        const years: number[] = [];
        for (let y = startYear; y <= endYear; y++) years.push(y);
        return years;
    };

    useEffect(() => {
        if (yearRange && isValidYear(yearRange[0]) && isValidYear(yearRange[1])) {
            const start = Math.min(yearRange[0], yearRange[1]);
            const end = Math.max(yearRange[0], yearRange[1]);
            setYearsArray(generateYearlyArray(start, end));
        } else {
            const currentYear = new Date().getFullYear();
            setYearsArray(generateYearlyArray(currentYear - 50, currentYear));
        }
    }, [yearRange]);

    const handlePrevMonth = () => {
        if (readOnly) return;
        setAnimation('fade');
        setDateValue(prev => {
            const base = prev ?? new Date();
            const year = base.getFullYear();
            const month = base.getMonth();
            const day = base.getDate();
            const prevMonthLastDay = new Date(year, month, 0).getDate();
            const newMonth = month === 0 ? 11 : month - 1;
            const newYear = month === 0 ? year - 1 : year;
            const newDay = Math.min(day, prevMonthLastDay);
            return new Date(newYear, newMonth, newDay);
        });
        setTimeout(() => setAnimation(''), 500);
    };

    const handleNextMonth = () => {
        if (readOnly) return;
        setAnimation('fade');
        setDateValue(prev => {
            const base = prev ?? new Date();
            const year = base.getFullYear();
            const month = base.getMonth();
            const day = base.getDate();
            const nextMonthLastDay = new Date(year, month + 2, 0).getDate();
            const newMonth = (month + 1) % 12;
            const newYear = month === 11 ? year + 1 : year;
            const newDay = Math.min(day, nextMonthLastDay);
            return new Date(newYear, newMonth, newDay);
        });
        setTimeout(() => setAnimation(''), 500);
    };

    const handleSelectedDate = (day: number | null) => {
        if (readOnly || day === null) return;
        const base = dateValue ?? new Date();
        setDateValue(new Date(base.getFullYear(), base.getMonth(), day));
    };

    const handleSelectedYear = (year: number | null) => {
        if (readOnly || year === null) return;
        const base = dateValue ?? new Date();
        setDateValue(new Date(year, base.getMonth(), base.getDate()));
        setYeardrawer(false);
    };

    const toggleYearDrawer = () => {
        if (readOnly) return;
        setYeardrawer(prev => !prev);
    };

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray: (number | null)[] = [
        ...Array(firstDayOfMonth).fill(null),
        ...Array.from({length: daysInMonth}, (_, i) => i + 1)
    ];

    const currDate = new Date();

    return (
        <div className={`cal-container${darkModeValue ? "darkmode" : ''}`}>
            <div className="cal-header">
                <h3
                    className={`cal-header-title ${yeardrawer ? 'rotate' : 'rotatereverse'}`}
                    onClick={toggleYearDrawer}
                >
                    {selectedDate.toLocaleString('en-US', {month: 'long'})} {selectedDate.getFullYear()}
                    {!readOnly && (
                        <svg width="25" height="25" fill={darkMode ? "white" : "#616161"} viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z" stroke="none"></path>
                        </svg>
                    )}
                </h3>
                {!readOnly && !yeardrawer && (
                    <div className='cal-header-btn'>
                        <button className="prev-month" onClick={handlePrevMonth}>
                            <svg width="12" height="16" viewBox="0 0 8 12" fill="none">
                                <path d="M7 11L1 6L7 1" stroke={darkMode ? "white" : "#616161"} strokeWidth="2"/>
                            </svg>
                        </button>
                        <button className="next-month" onClick={handleNextMonth}>
                            <svg width="12" height="16" viewBox="0 0 8 12" fill="none">
                                <path d="M1 11L7 6L1 1" stroke={darkMode ? "white" : "#616161"} strokeWidth="2"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {yeardrawer ? (
                <div className='cal-years-group'>
                    {yearsArray.map((y, idx) => (
                        <button
                            key={idx}
                            className={`cal-year-cell${y === selectedDate.getFullYear() ? ' selected' : ''}`}
                            onClick={() => handleSelectedYear(y)}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="cal-group">
                    <div className='cal-group-header'>
                        {weekdaysShort.map((day, idx) => (
                            <span key={idx} className="cal-group-header-weeks">{day}</span>
                        ))}
                    </div>
                    <div className='cal-group-days'>
                        <div className={`calendar-grid ${animation}`}>
                            {daysArray.map((day, idx) => (
                                <button
                                    key={idx}
                                    className={`${
                                        day === null ? 'calendar-cell-null' : 'calendar-cell'
                                    }${day === selectedDate.getDate() ? ' selected' : ''}${
                                        day === currDate.getDate() &&
                                        month === currDate.getMonth() &&
                                        year === currDate.getFullYear() &&
                                        day !== selectedDate.getDate()
                                            ? ' today'
                                            : ''
                                    }`}
                                    onClick={() => handleSelectedDate(day)}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default DatePickerComponent;

