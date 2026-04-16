"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import userService from "@/lib/services/userService";
import { IUser } from "@/models/IUser";
import { LoaderComponent } from "@/components/loader-component/LoaderComponent";
import styles from './AdminUserManagementComponent.module.css';

interface IUserWithMessage extends IUser {
  message?: string;
}
interface AdminUserManagementProps {
    activeTab: string;
    setGlobalError: (msg: string) => void;
}

const AdminUserManagementComponent: React.FC<AdminUserManagementProps> = ({activeTab, setGlobalError}) => {
    const [users, setUsers] = useState<IUserWithMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : "");
    const [role, setRole] = useState<string | undefined>(params.get("role") || undefined);
    const [is_active, setIsActive] = useState<boolean | undefined>(params.get("is_active") === "true" ? true : params.get("is_active") === "false" ? false : undefined);
    const [sortBy, setSortBy] = useState<string>(params.get("ordering")?.replace('-', '') || "id");
    const [sortOrder, setSortOrder] = useState<string>(params.get("ordering")?.startsWith('-') ? "desc" : "asc");

    const router = useRouter();
    const {data: session} = useSession();
    const accessToken = session?.user?.accessToken;

    const handleApiError = (err: any, userId?: string, fallbackMsg?: string) => {
        const isAuthError =
            err?.message === "Please Sign In" ||
            err?.status === 401 ||
            err?.response?.status === 401;

        if (isAuthError) {
            setGlobalError("Your session expired. Please Sign In again.");
            return;
        }

        if (userId) {
            updateUserMessage(userId, fallbackMsg || "Action failed");
        } else {
            setError(err instanceof Error ? err.message : "Failed to load user data");
        }
    };

    useEffect(() => {
        if (!accessToken || activeTab !== "users_control") return;
        let isCancelled = false;
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
                const filters = {role, is_active, ordering};
                const allUsers = await userService.getAll(filters, {accessToken});
                if (!isCancelled) setUsers(allUsers.map(u => ({...u, message: ""})));
            } catch (err: any) {
                if (!isCancelled) handleApiError(err);

            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        void fetchUsers();

        return () => {
            isCancelled = true;
        };
    }, [role, is_active, sortBy, sortOrder, accessToken, activeTab]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (role) params.set("role", role); else params.delete("role");
        if (is_active !== undefined) params.set("is_active", String(is_active)); else params.delete("is_active");

        const ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
        params.set("ordering", ordering);
        router.push(`?${params.toString()}`, {scroll: false});
    }, [role, is_active, sortBy, sortOrder, router]);

    const updateUserMessage = (userId: string, msg: string) => {
        setUsers(prev =>
            prev.map(u => u.id && String(u.id) === userId ? {...u, message: msg} : u)
        );
    };

    const handleToggleActiveUser = async (userId: string, isActive: boolean) => {
        if (userId === String(session?.user?.id)) return;
        if (!session?.user?.accessToken) return;

        try {
            await userService.toggleActive(userId, isActive, {accessToken: session.user.accessToken});
            setUsers(prev =>
                prev.map(u => u.id && String(u.id) === userId ? {
                    ...u,
                    is_active: isActive,
                    message: `User ${isActive ? "unblocked" : "blocked"}`
                } : u)
            );
        } catch (err: any) {
            handleApiError(err, userId, `Error ${isActive ? "unblocking" : "blocking"} user`);
        }
    };

    const handleChangeRole = async (userId: string, role: "visitor" | "venue_admin" | "admin") => {
        if (!session?.user?.accessToken) return;

        try {
            await userService.changeRole(userId, role, {accessToken: session.user.accessToken});
            setUsers(prev =>
                prev.map(u => u.id && String(u.id) === userId ? {...u, role} : u)
            );
        } catch (err: any) {
            handleApiError(err, userId, "Error changing role");
        }
    };

    const handleDeleteUser = async (userId: number | undefined) => {
        if (!userId || !session?.user?.accessToken) return;

        const idStr = String(userId);
        if (idStr === String(session?.user?.id)) {
            updateUserMessage(idStr, "You cannot delete yourself!");
            return;
        }

        try {
            await userService.delete(idStr, {accessToken: session.user.accessToken});
            setUsers(prev => prev.filter(u => String(u.id) !== idStr));
        } catch (err: any) {
            handleApiError(err, idStr, "Error deleting user");
        }
    };

    if (loading)
        return <div style={{display: "flex", justifyContent: "center", marginTop: 70}}><LoaderComponent/></div>;

    if (error) return <p className={styles.titleLog}>{error}</p>;

    return (
        <section className={styles.userManagement}>
            <h2 className={styles.subtitle}>Manage Users</h2>

            <div className={styles.filters}>
                <select onChange={e => setRole(e.target.value)}
                        value={role || ""}
                        aria-label="Change role"
                        className={styles.bigSelect}
                >
                    <option value="">All Roles</option>
                    <option value="visitor">Visitor</option>
                    <option value="venue_admin">Venue Admin</option>
                    <option value="admin">Admin</option>
                </select>

                <select
                    aria-label="Change active status"
                    onChange={e => {
                        const value = e.target.value;
                        setIsActive(value === "" ? undefined : value === "true");
                    }}
                    value={is_active === undefined ? "" : is_active ? "true" : "false"}
                    className={styles.bigSelect}
                >
                    <option value="">All Users</option>
                    <option value="true">Active</option>
                    <option value="false">Blocked</option>
                </select>

                <select onChange={e => setSortBy(e.target.value)} value={sortBy}
                        aria-label="Sort by"
                        className={styles.bigSelect}>
                    <option value="id">ID</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                    <option value="is_active">Status</option>
                </select>

                <select onChange={e => setSortOrder(e.target.value)}
                        value={sortOrder}
                        className={styles.bigSelect}
                        aria-label="Sort by"
                >
                    <option value="asc">Ascending (↑)</option>
                    <option value="desc">Descending (↓)</option>
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
                {users.length > 0 ? users.map(user => (
                    <tr key={user.id}>
                        <td className={styles.user}>{user.id}</td>
                        <td className={styles.user}>{user.email}</td>
                        <td className={styles.user}>{user.profile?.name} {user.profile?.surname}</td>

                        <td>
                            <select
                                aria-label="Change role"
                                className={styles.select}
                                value={user.role}
                                disabled={String(user.id) === String(session?.user?.id)}
                                onChange={e => handleChangeRole(String(user.id), e.target.value as any)}
                            >
                                <option value="visitor">Visitor</option>
                                <option value="venue_admin">Venue Admin</option>
                                <option value="admin">Admin</option>
                            </select>
                        </td>

                        <td className={styles.statusActive}>{user.is_active ? "Yes" : "No"}</td>
                        <td className={styles.actions}>
                            {user.is_active ? (
                                <button
                                    onClick={() => handleToggleActiveUser(String(user.id), false)}
                                    className={styles.blockButton}
                                    disabled={String(user.id) === String(session?.user?.id)}
                                >Block</button>
                            ) : (
                                <button
                                    onClick={() => handleToggleActiveUser(String(user.id), true)}
                                    className={styles.unblockButton}
                                    disabled={String(user.id) === String(session?.user?.id)}
                                >Unblock</button>
                            )}
                            <button
                                onClick={() => handleDeleteUser(Number(user.id))}
                                className={styles.deleteButton}
                                disabled={String(user.id) === String(session?.user?.id)}
                            >Delete
                            </button>
                        </td>

                        <td>
                            <button
                                onClick={() => router.push(`/venue-admin/${String(user.id)}`)}
                                className={styles.viewVenuesButton}
                            >Venues
                            </button>
                        </td>
                    </tr>
                )) : (
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
