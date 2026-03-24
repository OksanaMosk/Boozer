"use client";
import { useState } from "react";
import { ReviewStarsComponent } from "@/components/review-stars-component/ReviewStarsComponent";
import PhotoMultipleUploadComponent from "@/components/photo-multiple-upload-component/PhotoMultipleUploadComponent";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from "./ReviewFormComponent.module.css";

export const ReviewFormComponent = ({ venueId, onSubmit }: any) => {
    const [subRatings, setSubRatings] = useState({
        food: 0,
        service: 0,
        atmosphere: 0,
        cleanliness: 0,
        value: 0
    });
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [createdReview, setCreatedReview] = useState<any>(null); // Тут зберігаємо створений відгук

    const overallRating = Object.values(subRatings).reduce((a, b) => a + b, 0) / 5;

    const handleStarClick = (category: string, value: number) => {
        setSubRatings(prev => ({ ...prev, [category]: value }));
    };

    const handleUploadComplete = (uploadedPhotos: string[]) => {
        console.log("Photos uploaded:", uploadedPhotos);
        setCreatedReview(null);
        setText("");
        setSubRatings({ food: 5, service: 5, atmosphere: 5, cleanliness: 5, value: 5 });
    };

    const handleAddReview = async () => {
        setLoading(true);
        try {
            const res = await onSubmit({
                rating: overallRating,
                sub_ratings: subRatings,
                text
            });
            if (res && res.data) {
                setCreatedReview(res.data);
            } else if (res && res.id) {
                setCreatedReview(res);
            }
        } catch (err) {
            console.error("Create review failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const RatingRow = ({ label, category, value }: any) => (
        <div className={styles.starsRating}>
            <span className={styles.starsLabel}>{label}</span>
            <ReviewStarsComponent
                rating={value}
                interactive={!createdReview} // Блокуємо зірки після відправки
                onStarClick={(val: number) => handleStarClick(category, val)}
            />
        </div>
    );

    // const hasOrder = orders?.some(
    //     (o: any) => o.venue_id.toString() === venueId.toString() && o.status === "CONFIRMED"
    // );

    // if (!hasOrder) {
    //     return <p style={{opacity: 0.6, fontSize: '14px'}}>Submit a review after your confirmed visit.</p>;
    // }

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>Average Rating: {overallRating.toFixed(1)} ✸ </h3>

            <div className={styles.subRatings}>
                <RatingRow label="Food" category="food" value={subRatings.food} />
                <RatingRow label="Service" category="service" value={subRatings.service} />
                <RatingRow label="Atmosphere" category="atmosphere" value={subRatings.atmosphere} />
                <RatingRow label="Cleanliness" category="cleanliness" value={subRatings.cleanliness} />
                <RatingRow label="Value for money" category="value" value={subRatings.value} />
            </div>

            <div className={styles.section}>
                <textarea
                    className={styles.textarea}
                    placeholder="Share your experience..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={!!createdReview}
                />
                {createdReview && (
                    <div style={{ marginTop: "20px" }}>
                        <PhotoMultipleUploadComponent
                            venueId={venueId}
                            newsId={createdReview.id.toString()}
                            maxFiles={7}
                            existingPhotos={[]}
                            onUploadComplete={handleUploadComplete}
                        />
                    </div>
                )}

                <button
                    onClick={handleAddReview}
                    disabled={loading || !!createdReview}
                    className={`${styles.saveBtn} ${(loading || !!createdReview) ? styles.buttonDisabled : ''}`}
                >
                    {loading ? (
                        <div className={styles.loaderWrapper}><LoaderComponent /></div>
                    ) : (
                        createdReview ? "Review Created! Add Photos Above" : "Submit Review"
                    )}
                </button>
            </div>
        </div>
    );
};





// "use client";
// import { useState } from "react";
// import {ReviewStarsComponent} from "@/components/review-stars-component/ReviewStarsComponent";
// import  styles from "./ReviewFormComponent.module.css"
//
// export const ReviewFormComponent = ({ orders, venueId, onSubmit }: any) => {
//  const [subRatings, setSubRatings] = useState({
//         food: 5,
//         service: 5,
//         atmosphere: 5,
//         cleanliness: 5,
//         value: 5
//     });
//     const [text, setText] = useState("");
//     const [rating, setRating] = useState(5);
//    const overallRating = Object.values(subRatings).reduce((a, b) => a + b, 0) / 5;
//
//     const handleStarClick = (category: string, value: number) => {
//         setSubRatings(prev => ({ ...prev, [category]: value }));
//     };
//     const RatingRow = ({ label, category, value }: any) => (
//         <div className={styles.starsRating}>
//             <span className={styles.starsLabel}>{label}</span>
//             <ReviewStarsComponent
//                 rating={value}
//                 interactive={true}
//                 onStarClick={(val: number) => handleStarClick(category, val)}
//             />
//         </div>
//     );
//
//      // const hasOrder = orders?.some(
//     //     (o: any) => o.venue_id.toString() === venueId.toString() && o.status === "CONFIRMED"
//     // );
//
//     // if (!hasOrder) {
//     //     return <p style={{opacity: 0.6, fontSize: '14px'}}>Submit a review after your confirmed visit.</p>;
//     // }
//
//     return (
//          <div className={styles.wrapper}>
//             <h3 className={styles.title}>Average Rating: {overallRating.toFixed(1)} ✸ </h3>
//
//             <div className={styles.subRatings}>
//                 <RatingRow label="Food" category="food" value={subRatings.food} />
//                 <RatingRow label="Service" category="service" value={subRatings.service} />
//                 <RatingRow label="Atmosphere" category="atmosphere" value={subRatings.atmosphere} />
//                 <RatingRow label="Cleanliness" category="cleanliness" value={subRatings.cleanliness} />
//                 <RatingRow label="Value for money" category="value" value={subRatings.value} />
//             </div>
//
//              <div className={styles.section}>
//                  <textarea className={styles.textarea}
//                  placeholder="Share your experience..."
//                  value={text}
//                  onChange={(e) => setText(e.target.value)}
//              />
//                  <button className={styles.saveBtn}
//                          onClick={() => {
//                              onSubmit({rating: overallRating, sub_ratings: subRatings, text});
//                              setText("");
//                          }}>
//                      Submit Review
//                  </button>
//              </div>
//         </div>
//     )
// };