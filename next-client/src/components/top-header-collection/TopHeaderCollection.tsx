import venueServices from "@/lib/services/venueService";
import React, { useEffect, useRef, useState } from "react";
import styles from "./TopHeaderCollection.module.css";

interface Props {
  collection: any;
  token: string;
  onUpdate: () => void;
}

const TopHeaderCollection = ({ collection, token, onUpdate }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(collection.name);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleRename = async () => {
    const trimmedName = newName.trim();

    if (!trimmedName || trimmedName === collection.name) {
      setNewName(collection.name);
      setIsEditing(false);
      return;
    }

    try {
      setError(null);
      await venueServices.collections({ accessToken: token }).update(collection.id, {
        name: trimmedName,
        category: trimmedName
      });
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setNewName(collection.name);
      setIsEditing(false);
      setError(err.response?.data?.message || "Failed to rename");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete OFFICIAL top "${collection.name}"?`)) return;

    try {
      setError(null);
      await venueServices.collections({ accessToken: token }).delete(collection.id);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleRename();
    if (e.key === "Escape") {
      setNewName(collection.name);
      setIsEditing(false);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.titleContainer}>
        {isEditing ? (
          <input
            ref={inputRef}
            className={styles.input}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <h4 className={styles.title} onClick={() => setIsEditing(true)}>
            {collection.name}
          </h4>
        )}{collection.is_staff_top && <span className={styles.badge}>OFFICIAL STAFF TOP</span>}
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={() => setIsEditing(true)}>
          Edit Name
        </button>
        <button className={styles.deleteBtn} onClick={handleDelete}>
          Delete TOP
        </button>
      </div>
    </div>
  );
};

export default TopHeaderCollection;
