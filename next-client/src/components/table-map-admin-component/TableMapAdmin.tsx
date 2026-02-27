"use client";

import React, { useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import Table from "./Table";
import { ITable } from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import { AxiosResponse } from "axios";
import { Image as KonvaImage } from "react-konva";
import styles from "./TableMapAdmin.module.css";
import {supabase} from "@/lib/constants/supabaseClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8888";

const TABLE_TYPES = [
  { capacity: 2 },
  { capacity: 4 },
  { capacity: 6 },
  { capacity: 8 },
];

interface TableMapAdminProps {
  venueId: string;
  token?: string;
}

const TableMapAdmin: React.FC<TableMapAdminProps> = ({ venueId, token }) => {
    const [tables, setTables] = useState<ITable[]>([]);
    const [background, setBackground] = useState<HTMLImageElement | null>(null);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [selectedTableType, setSelectedTableType] = useState(TABLE_TYPES[0])
    const [selectedFileName, setSelectedFileName] = React.useState("");
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [stageSize, setStageSize] = useState({width: 0, height: 0});

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        table: ITable;
    } | null>(null);
    const {user} = useUser();
    const accessToken = token || user?.token;

  const getTableService = () => accessToken ? venueServices.venues.tables({ accessToken })(venueId) : null;
  const getLayoutService = () => user?.token ? venueServices.venues.background({ accessToken: user.token })(venueId) : null;

    useEffect(() => {
        const service = getLayoutService();
        if (!service) return;
        service.getBackground()
            .then(res => {
                if (res.data.url) {
                    const img = new Image();
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || BASE_URL;
                    img.src = res.data.url.startsWith("http") ? res.data.url : `${baseUrl}${res.data.url}`;
                    img.onload = () => setBackground(img);
                }
            })
            .catch(console.error);
    }, [venueId, accessToken]);


    useEffect(() => {
        const service = getTableService();
        setTables([]);
        if (!service) return;
        service.getAll()
            .then((res: AxiosResponse) => {
                const venueTables = res.data.data
                console.log("Filtered tables for venue:", venueTables);
                setTables(venueTables);
            })
            .catch(console.error);
    }, [venueId, accessToken]);



    useEffect(() => {
        const updateSize = () => setStageSize({width: window.innerWidth * 0.7, height: window.innerHeight * 0.7});
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        if (contextMenu) {
            window.addEventListener("click", handleClick);
        }
        return () => window.removeEventListener("click", handleClick);
    }, [contextMenu]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setContextMenu(null);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setBackgroundFile(file);
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => setBackground(img);
  if (file) setSelectedFileName(file.name);

  };

  const uploadToSupabase = async (file: File) => {
  if (!supabase) return null;

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!;
  const filePath = `venues/${venueId}/background_tables.jpg`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading to Supabase:", error);
    return null;
  }

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return `${data.publicUrl}?t=${Date.now()}`;
};

  const addTable = () => {
    const newTable: ITable = {
       id: `temp-${venueId}-${Date.now()}`,
      capacity: selectedTableType.capacity,
      x: 0.5,
      y: 0.5,
      width: 160,
      height: 160,
      venue: Number(venueId),
    };
    setTables(prev => [...prev, newTable]);
  };

  const handleDragEnd = (updatedTable: ITable) => {
    setTables(prev =>
      prev.map(t => t.id === updatedTable.id
        ? { ...t, x: updatedTable.x / stageSize.width, y: updatedTable.y / stageSize.height }
        : t
      )
    );
  };

  const saveAll = async () => {
  const tableService = getTableService();
  if (!tableService) return;

  try {
      if (backgroundFile) {
          const publicUrl = await uploadToSupabase(backgroundFile);
          if (!publicUrl) return;
          const layoutService = getLayoutService();
          if (!layoutService) return new Error("Layout service недоступний");
          await layoutService.uploadBackground(publicUrl);
      }

      const responses = await Promise.all(
          tables.map(table => {
              if (typeof table.id === "string" && table.id.startsWith("temp-")) {
                  return tableService.create({
                      ...table,
                      venue: Number(venueId),
                  });
              } else {
                  return tableService.update(String(table.id), table);
              }
          })
      );

      setTables(responses.map(res => res.data));
      setBackgroundFile(null);
      setSaveStatus("Save successful");
      setTimeout(() => setSaveStatus(null), 3000);
  } catch (err) {
      setSaveStatus("Save failed ❌");
      setTimeout(() => setSaveStatus(null), 3000);
  }
  };

    const handleDelete = async (table: ITable) => {
        setContextMenu(null);
        await new Promise(resolve => setTimeout(resolve, 150));
        const tableService = getTableService();
        if (!tableService) return;
        try {
            if (typeof table.id === "string" && table.id.startsWith("temp-")) {
                setTables(prev => prev.filter(t => t.id !== table.id));
            } else {
                await tableService.delete(String(table.id));
                setTables(prev => prev.filter(t => t.id !== table.id));
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };
    if (stageSize.width === 0 || stageSize.height === 0) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.photoWrapper} >
                    <label htmlFor="background-upload" className={styles.inputFile}>
                    Choose Hall
                </label>
                    <input
                        id="background-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        style={{display: "none"}}
                    />
                    <span className={styles.photoSpan} >{selectedFileName || "No file chosen"}</span></div>
                <select
                    name="tableCapacity"
                    value={selectedTableType.capacity}
                    onChange={e =>
                  setSelectedTableType(TABLE_TYPES.find(t => t.capacity === Number(e.target.value)) || TABLE_TYPES[0])
                }
                    className={styles.select}
          >
              {TABLE_TYPES.map(t => (
                  <option key={t.capacity} value={t.capacity}>{t.capacity} seats</option>
              ))}
                </select>
                <div className={styles.hintMessage}>
                    <button className={styles.button} onClick={addTable}>Add Table</button>
                    <p className={styles.hintText}>
                        💡 To delete - right-click on it
                    </p>
                </div>
                <div  className={styles.hintMessage}>
                    <button className={styles.button} onClick={saveAll}>Save All</button>
                    {saveStatus && <div className={styles.saveStatus}>{saveStatus}</div>}</div>
            </div>
            
        <div className={styles.stageWrapper}>
            <Stage width={stageSize.width} height={stageSize.height} className={styles.stage}>
                <Layer>
                    {background && <KonvaImage image={background} width={stageSize.width} height={stageSize.height}/>}
                    {tables.map(table => (
                        <Table
                            key={`${venueId}-${table.id}`}
                            table={{...table, x: table.x * stageSize.width, y: table.y * stageSize.height}}
                            draggable
                            onDragEnd={handleDragEnd}
                            onContextMenu={(e, tbl) => {
                                e.evt.preventDefault()

                                setContextMenu({
                                    x: e.evt.clientX,
                                    y: e.evt.clientY,
                                    table: tbl,
                                })
                            }}

                        />
                    ))}
                </Layer>
            </Stage>
            {contextMenu && (
                <div
                    className={styles.contextMenu}
                    style={{
                        position: "fixed",
                        top: contextMenu.y,
                        left: contextMenu.x,
                    }}
                >
                    <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(contextMenu.table)}
                    >
                        🗑 Delete
                    </button>
                </div>
            )}
        </div>
    </div>
  )
};

export default TableMapAdmin;