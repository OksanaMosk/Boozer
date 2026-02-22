// "use client";
//
// import React, { useEffect, useState } from "react";
// import userService from "@/lib/services/userService";
// import venueService from "@/lib/services/venueService";
// import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
// import { IVenue } from "@/models/IVenue";
// import styles from "./VenueManagementComponent.module.css";
// import { useUser } from "@/app/contexts/UserProvider";
//
//
// const VenueManagementComponent = () => {
//   const [venues, setVenues] = useState<IVenue[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//
//   const { user } = useUser();
//
//   useEffect(() => {
//
//
//     const loadVenues = async () => {
//       try {
//           if (!user?.id || !user?.token) return;
//         setLoading(true);
//         const response = await userService.getUserVenues(user.id, {
//           accessToken: user.token,
//         });
//
//         const venuesData = response.data?.venues || response.data || [];
//         setVenues(venuesData);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load venues");
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     void loadVenues();
//   }, [user]);
//
//   const handleStatusChange = async (venueId: string, newStatus: string) => {
//     if (!user?.token) return;
//
//     try {
//       await venueService.venues.update(
//         venueId,
//         { status: newStatus },
//         { accessToken: user.token }
//       );
//
//       setVenues((prev) =>
//         prev.map((venue) =>
//           venue.id === venueId ? { ...venue, status: newStatus } : venue
//         )
//       );
//     } catch {
//       alert("Error updating status on server");
//     }
//   };
//
//   const handleDelete = async (venueId: string) => {
//     if (!confirm("Are you sure you want to delete this venue?")) return;
//     if (!user?.token) return;
//
//     try {
//       await venueService.venues.delete(venueId, {
//         accessToken: user.token,
//       });
//
//       setVenues((prev) =>
//         prev.filter((venue) => venue.id !== venueId)
//       );
//     } catch {
//       alert("Error deleting venue on server");
//     }
//   };
//
//   if (loading)
//     return (
//       <div style={{ display: "flex", justifyContent: "center", marginTop: 70 }}>
//         <LoaderComponent />
//       </div>
//     );
//
//   if (error) return <p className={styles.error}>{error}</p>;
//
//   return (
//     <div>
//       <h3>Venues of User {user?.id}</h3>
//
//       {venues.length > 0 ? (
//         <table className={styles.table}>
//           <thead>
//             <tr>
//               <th>Id</th>
//               <th>Name</th>
//               <th>City</th>
//               <th>Country</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//
//           <tbody>
//             {venues.map((venue) => (
//               <tr key={venue.id} className={styles.tableRow}>
//                 <td>{venue.id}</td>
//                 <td>{venue.name}</td>
//                 <td>{venue.city}</td>
//                 <td>{venue.country}</td>
//
//                 <td
//                   className={
//                     venue.status === "active"
//                       ? styles.statusActive
//                       : styles.statusInactive
//                   }
//                 >
//                   {venue.status}
//                 </td>
//
//                 <td className={styles.actions}>
//                   <select
//                     value={venue.status}
//                     onChange={(e) =>
//                       handleStatusChange(venue.id!, e.target.value)
//                     }
//                   >
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                     <option value="pending">Pending</option>
//                   </select>
//
//                   <button
//                     onClick={() => handleDelete(venue.id!)}
//                     className={styles.deleteButton}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No venues found for this user.</p>
//       )}
//     </div>
//   );
// };
//
// export default VenueManagementComponent;
