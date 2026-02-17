"use client"

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import userService from "@/lib/services/userService";
import {useRouter} from "next/navigation";
import {LoaderComponent} from "@/components/loader-component/LoaderComponent";
import { IUser } from "@/models/IUser";
import styles from './AdminUserManagementComponent.module.css';

const AdminUserManagementComponent = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [role, setRole] = useState<string | undefined>();
    const [is_active, setIsActive] = useState<boolean | undefined>();
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const router = useRouter();
 const { data: session } = useSession();


    useEffect(() => {
         (async () => {
      if (!session?.user?.accessToken) {
        console.error("No access token available!");
        return;
      }

      try {
        setLoading(true);
                const sortableKeys: (keyof IUser)[] = ['id', 'email', 'role', 'is_active'];
                const keySortBy: keyof IUser | undefined = sortBy && sortableKeys.includes(sortBy as keyof IUser)
                    ? (sortBy as keyof IUser)
                    : undefined;

          const filters = {
              role,
              is_active,
              sort_by: keySortBy,
              sort_order: sortOrder
          };
          const allUsers = await userService.getAll(filters, {accessToken: session.user.accessToken});
          setUsers(allUsers);

      } catch (err: unknown) {
          if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Failed to load user data");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [role, is_active, sortBy, sortOrder]);

    const handleToggleActiveUser = async (userId: string, isActive: boolean) => {
        try {
             if (!session?.user?.accessToken) {
        console.error("No access token available!");
        return;
      }
            await userService.toggleActive(userId, isActive, { accessToken: session.user.accessToken });
            setUsers(prev =>
                prev.map(u => u.id && String(u.id) === userId ? {...u, is_active: isActive} : u)
            );
        } catch (err) {
            console.error(`Error ${isActive ? "unblocking" : "blocking"} user`, err);
        }
    };

    const handleChangeRole = async (userId: string, role: "visitor" | "venue_admin" | "admin") => {
        try {
             if (!session?.user?.accessToken) {
        console.error("No access token available!");
        return;
      }
            await userService.changeRole(userId, role,{ accessToken: session.user.accessToken });
            setUsers(prev => prev.map(u =>
                u.id !== undefined && String(u.id) === userId ? {...u, role} : u
            ));
        } catch (err) {
            console.error("Error changing role type", err);
        }
    };



    const handleDeleteUser = async (userId: number | undefined) => {
        if (userId === undefined) {
            alert("User ID is undefined");
            return;
        }

        try {
             if (!session?.user?.accessToken) {
        console.error("No access token available!");
        return;
      }
            await userService.delete(String(userId), { accessToken: session.user.accessToken });
            setUsers(users.filter(user => String(user.id) !== String(userId)));
            alert('User deleted successfully');
        } catch {
            alert('Error deleting user');
        }
    };


    if (loading) return <div style={{display: "flex", justifyContent: "center", marginTop: 50}}>
        <LoaderComponent/>
    </div>;

    if (error) return <p>{error}</p>;

    return (
        <section className={styles.userManagement}>
            <h2 className={styles.subtitle}>Manage Users</h2>

            <div className={styles.filters}>
                <select onChange={e => setRole(e.target.value)} value={role} className={styles.bigSelect}>
                    <option value="">All Roles</option>
                    <option value="visitor">Visitor</option>
                    <option value="venue_admin">Venue Admin</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    onChange={e => {
                        const value = e.target.value;
                        if (value === "") setIsActive(undefined)
                        else setIsActive(value === "true");
                    }}
                    value={
                        is_active === null || is_active === undefined
                            ? ""
                            : is_active
                                ? "true"
                                : "false"
                    }
                    className={styles.bigSelect}
                >
                    <option value="">All Users</option>
                    <option value="true">Active</option>
                    <option value="false">Blocked</option>
                </select>
                <select onChange={e => setSortBy(e.target.value)} value={sortBy} className={styles.bigSelect}>
                    <option value="id">ID</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                </select>
                <select onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')} value={sortOrder}
                        className={styles.bigSelect}>
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                </select>
            </div>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>User ID</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Actions</th>
                    <th>Venues</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                    users.map(user => (
                        <tr key={user.id}>
                            <td className={styles.user}>{user.id}</td>
                            <td className={styles.user}>{user.email}</td>
                            <td className={styles.user}>{user.profile?.name} {user.profile?.surname}</td>

                            <td>
                                <select className={styles.select}
                                        value={user.role}
                                        onChange={e => handleChangeRole(String(user.id), e.target.value as "visitor" | "venue_admin" | "admin")}
                                >
                                    <option value="visitor">Visitor</option>
                                    <option value="venue_admin">Venue Admin</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>

                            <td className={styles.statusActive}>{user.is_active ? "Yes" : "No"}</td>
                            <td className={styles.actions}>
                                {user.is_active ? (
                                    <button onClick={() => handleToggleActiveUser(String(user.id), false)}
                                            className={styles.blockButton}>Block</button>
                                ) : (
                                    <button onClick={() => handleToggleActiveUser(String(user.id), true)}
                                            className={styles.unblockButton}>Unblock</button>
                                )}
                                <button onClick={() => handleDeleteUser(Number(user.id))}
                                        className={styles.deleteButton}>Delete
                                </button>
                            </td>
                            <td>
                                <button
                                    onClick={() => router.push(`/venue-admin/${user.id}`)}
                                    className={styles.viewVenuesButton}
                                >
                               Venues
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7}>No users found</td>
                    </tr>
                )}
                </tbody>
            </table>
        </section>
    );
};

export default AdminUserManagementComponent;
