"use client";

import React, { useState, useEffect } from "react";
import styles from "./BoozerStep2OrderBaseInfoComponent.module.css";
import DatePickerComponent from "@/components/date-picker-component/DatePickerComponent";
import venueServices from "@/lib/services/venueService";
import {useUser} from "@/app/contexts/UserProvider";

interface Props {
  venueId: number | string;
  onNext: (orderId: number) => void;
  onBack: () => void;
}

const BoozerStep2OrderBaseInfoComponent: React.FC<Props> = ({venueId, onNext, onBack}) => {
    const [loading, setLoading] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [localDate, setLocalDate] = useState<Date | null>(null);
    const [selecting, setSelecting] = useState<"start" | "end">("start");
    const [message, setMessage] = useState("");
    const [userGeo, setUserGeo] = useState({lat: null as number | null, lng: null as number | null, city: ""});
    const GENDER_CHOICES = ["ANY", "MALE", "FEMALE"];
    const PAYMENT_CHOICES = ["Each pays for themselves", "I pay", "Someone else pays"];
    const BUDGET_CHOICES = ["0-1000", "1000-3000", "3000-5000", "5000+"];
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        guests_count: 2,
        comment: "",
        gender: "ANY",
        payment_type: "Each pays for themselves",
        budget_range: "0-1000"
    });
    const  {user}= useUser()

  useEffect(() => {
    const fetchCityFromIP = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setUserGeo({
          lat: data.latitude,
          lng: data.longitude,
          city: data.city || ""
        });
      } catch (e) {
        console.error("Geo fetch failed", e);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          let city;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            city = data.address.city || data.address.town || data.address.village || "";
          } catch {
            city = "";
          }

          if (!city) {
            await fetchCityFromIP();
          } else {
            setUserGeo({ lat, lng, city });
          }
        },
        () => fetchCityFromIP()
      );
    } else {
      void fetchCityFromIP();
    }
  }, []);

  const handleDateSelect = (value: Date | string) => {
    if (!value) return;
    const dateObj = value instanceof Date ? value : new Date(value);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const selectedDate = new Date(dateObj);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      setMessage("Next days only");
      setLocalDate(null);
      return;
    }
    setMessage("");
    if (isNaN(dateObj.getTime())) return;

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}`;

    if (selecting === "start") {
      setFormData({ ...formData, start_date: formatted, end_date: "" });
      setLocalDate(dateObj);
      setSelecting("end");
    } else {
      if (formatted <= formData.start_date) {
        setFormData({ ...formData, start_date: formatted, end_date: "" });
        setLocalDate(dateObj);
        setSelecting("end");
      } else {
        setFormData({ ...formData, end_date: formatted });
        setLocalDate(dateObj);
        setSelecting("start");
        setIsCalendarOpen(false);
      }
    }
  };

  const handleCalendarOpen = () => {
    setIsCalendarOpen(true);
    if (selecting === "start") {
      setFormData({ ...formData, start_date: "", end_date: "" });
      setLocalDate(null);
    } else if (formData.end_date) {
      const [y, m, d] = formData.end_date.split("-").map(Number);
      setLocalDate(new Date(y, m - 1, d));
    }
  };

  const handleCalendarClose = () => {
    setIsCalendarOpen(false);
    if (selecting === "start") setFormData({ ...formData, start_date: "", end_date: "" });
      setLocalDate(null);
  };
    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!formData.start_date || !formData.end_date) return;
        const payload = {
            ...formData,
            venue_id: venueId,
            user_latitude: userGeo.lat,
            user_longitude: userGeo.lng,
            user_city: userGeo.city,
            status: "DRAFT"
        };
        console.log("PAYLOAD:", payload);
        setLoading(true);
        try {
            if (!user?.token) return
            const response = await venueServices.venues
                .orders({accessToken: user.token})(venueId.toString())
                .create(payload as any);
            if (response.data && response.data.id) {
                onNext(Number(response.data.id));
            }
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.title} >Step 2: Meeting Details</h2>
      <form onSubmit={handleSubmit} className={styles.detailsForm}>
          <div className={styles.top}>
              <div className={styles.calendarWrapper}>
                  <label className={styles.label}>Booking Period</label>
                  {message && (
                      <p className={styles.error}>
                          {message}
                      </p>
                  )}
                  <div className={styles.inputGroup}>
                      <input
                          type="text"
                          className={styles.input}
                          value={formData.start_date ? `${formData.start_date} — ${formData.end_date || '...'}` : ""}
                          placeholder="Select dates"
                          readOnly
                      />
                      <div onClick={handleCalendarOpen} className={styles.icon}>
                          <img src="/images/calendar.png" alt="calendar icon" width={20} height={20}
                               className={styles.img}/>
                      </div>
                  </div>
                  {isCalendarOpen && (
                      <div className={styles.calendarSidebar}>
                          <DatePickerComponent
                              dateValue={localDate}
                              setDateValue={(date) => {
                                  if (date instanceof Date) handleDateSelect(date);
                                  setLocalDate(date);
                              }}
                          />
                          <button type="button" className={styles.closeCal} onClick={handleCalendarClose}>Done</button>
                      </div>
                  )}
              </div>

              <div className={styles.inputGuests}>
                  <label className={styles.label}>Guests</label>
                  <input
                      type="number"
                      min="1"
                      className={styles.input}
                      value={formData.guests_count}
                      onChange={e => setFormData({...formData, guests_count: +e.target.value})}
                  />
              </div>
          </div>

          <div className={styles.selectContainer}>
          <div className={styles.selectWrapper}>
              <label className={styles.label}>Gender Preference</label>
              <select
                  className={styles.select}
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                  {GENDER_CHOICES.map(g => (
                      <option key={g} value={g}>{g}</option>
                  ))}
              </select>
          </div>
              <div className={styles.selectWrapper}>
                  <label className={styles.label}>Payment Type</label>
                  <select
                      className={styles.select}
                      value={formData.payment_type}
                      onChange={e => setFormData({...formData, payment_type: e.target.value})}
                  >
                      {PAYMENT_CHOICES.map(p => (
                          <option key={p} value={p}>{p}</option>
                      ))}
                  </select>
              </div>

              <div className={styles.selectWrapper}>
                  <label className={styles.label}>Budget Range</label>
                  <select
                      className={styles.select}
                      value={formData.budget_range}
                      onChange={e => setFormData({...formData, budget_range: e.target.value})}
                  >
                      {BUDGET_CHOICES.map(b => (
                          <option key={b} value={b}>{b}</option>
                      ))}
                  </select>
              </div>
          </div>

          <div  className={styles.inputPurpose}>
              <label className={styles.label}>Meeting Purpose</label>
              <textarea
                  className={styles.textarea}
                  value={formData.comment}
                  onChange={e => setFormData({...formData, comment: e.target.value})}
              /></div>

        <div className={styles.actions}>
            <div className={styles.buttonPr}>
                <button type="button" onClick={onBack} className={styles.buttonPrev}>Back</button>
            </div>
            <div className={styles.buttonN}>
          <button type="submit" disabled={loading} className={styles.buttonNext}>
            {loading ? "Saving..." : "Next Step"}
          </button>
                </div>
        </div>
      </form>
    </div>
  );
};

export default BoozerStep2OrderBaseInfoComponent
