import React, { useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import Table from "./Table";
import { ITable } from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";
import { AxiosResponse } from "axios";
import { Image as KonvaImage } from "react-konva";

interface TableMapClientProps {
  venueId: string;
}

const TableMapClient: React.FC<TableMapClientProps> = ({ venueId }) => {
  const [tables, setTables] = useState<ITable[]>([]);
  const [background, setBackground] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

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

  // Завантаження таблиць
  useEffect(() => {
    venueServices.venues.tables({ accessToken: "" })(venueId)
      .getAll()
      .then((res: AxiosResponse) => {
        setTables(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch(console.error);
  }, [venueId]);

  // Завантаження фону (якщо фон зберігається в бекенді)
  useEffect(() => {
    venueServices.venues.layout({ accessToken: "" })(venueId)
      .getBackground()
      .then((url: string) => {
        const img = new Image();
        img.src = url;
        img.onload = () => setBackground(img);
      })
      .catch(console.error);
  }, [venueId]);

  if (stageSize.width === 0 || stageSize.height === 0) return <div>Завантаження...</div>;

  return (
    <Stage width={stageSize.width} height={stageSize.height} style={{ border: "1px solid #ccc" }}>
      <Layer>
        {background && (
          <KonvaImage
            image={background}
            width={stageSize.width}
            height={stageSize.height}
          />
        )}

        {tables.map((table, idx) => (
          <Table
            key={table.id ?? idx}
            table={{
              ...table,
              x: table.x * stageSize.width,
              y: table.y * stageSize.height,
            }}
            draggable={false}
            onClick={() => console.log("Клієнт вибрав стіл", table.id)}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default TableMapClient;