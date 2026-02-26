"use client";

import React, { useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import Table from "./Table";
import { ITable } from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import { AxiosResponse } from "axios";
import { Image as KonvaImage } from "react-konva";

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
  const [selectedTableType, setSelectedTableType] = useState(TABLE_TYPES[0]);
  const { user } = useUser();
  const accessToken = token || user?.token;

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  // Оновлення розміру сцени при зміні вікна
  useEffect(() => {
    const updateSize = () => {
      setStageSize({
        width: window.innerWidth * 0.7,
        height: window.innerHeight * 0.7,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const getTableService = () => {
    if (!accessToken) return null;
    return venueServices.venues.tables({ accessToken })(venueId);
  };

  // Завантаження існуючих столів
  useEffect(() => {
    const service = getTableService();
    if (!service) return;
    service
      .getAll()
      .then((res: AxiosResponse) => {
        setTables(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch((err) => console.error("Error load tables", err));
  }, [venueId, accessToken]);

  // Завантаження фону
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = () => setBackground(img);
  };

  const addTable = () => {
    const newTable: ITable = {
      id: `temp-${Date.now()}`, // тимчасовий id
      capacity: selectedTableType.capacity,
      x: 0.5, // координати у відносних одиницях (0-1)
      y: 0.5,
      width: 160,
      height: 160,
      venue_id: Number(venueId),
    };

    setTables((prev) => [...prev, newTable]);
  };

  const handleDragEnd = (updatedTable: ITable) => {
    const xPercent = updatedTable.x / stageSize.width;
    const yPercent = updatedTable.y / stageSize.height;

    setTables((prev) =>
      prev.map((t) =>
        t.id === updatedTable.id ? { ...t, x: xPercent, y: yPercent } : t
      )
    );
  };

  const saveAllTables = async () => {
    const service = getTableService();
    if (!service) return;

    try {
      const responses = await Promise.all(
        tables.map((table) => {
          if (typeof table.id === "string" && table.id.startsWith("temp-")) {
            return service.create({
              ...table,
              venue_id: Number(venueId),
            });
          } else {
            return service.update(table.id, table);
          }
        })
      );

      setTables(responses.map((res) => res.data));
      console.log("Розстановка збережена!");
    } catch (err) {
      console.error("Error saving tables", err);
    }
  };

  if (stageSize.width === 0 || stageSize.height === 0) {
    // Поки не визначено розмір — не рендеримо сцену
    return <div>Завантаження...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ marginBottom: 10 }}>
        <input type="file" accept="image/*" onChange={handleBackgroundUpload} />
        <select
          value={selectedTableType.capacity}
          onChange={(e) =>
            setSelectedTableType(
              TABLE_TYPES.find((t) => t.capacity === Number(e.target.value)) || TABLE_TYPES[0]
            )
          }
          style={{ marginLeft: 10 }}
        >
          {TABLE_TYPES.map((t) => (
            <option key={t.capacity} value={t.capacity}>
              {t.capacity} місця
            </option>
          ))}
        </select>
        <button onClick={addTable} style={{ marginLeft: 10 }}>
          Додати стіл
        </button>
        <button onClick={saveAllTables} style={{ marginLeft: 10 }}>
          Зберегти розстановку
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", borderRadius: "50px"}}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          style={{ border: "1px solid #ccc", margin: "0 auto", display: "block", borderRadius: "50px",overflow: "hidden" }}
        >
          <Layer>
            {background &&
              (() => {
                const desiredWidth = stageSize.width;

                const scale = desiredWidth / background.width;

                const newWidth = background.width * scale;
                const newHeight = background.height * scale;

                return (
                  <KonvaImage
                    image={background}
                    width={newWidth}
                    height={newHeight}
                    x={(stageSize.width - newWidth) / 2}
                    y={(stageSize.height - newHeight) / 2}
                  />
                );
              })()}

            {tables.map((table, idx) => (
              <Table
                key={table.id ?? idx}
                table={{
                  ...table,
                  x: table.x * stageSize.width,
                  y: table.y * stageSize.height,
                }}
                onDragEnd={handleDragEnd}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default TableMapAdmin;