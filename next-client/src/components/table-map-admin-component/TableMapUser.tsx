"use client";

import React, { useEffect, useState } from "react";
import { Stage, Layer, Text } from "react-konva";
import Table from "./Table";
import { ITable } from "@/models/IVenue";
import venueServices from "@/lib/services/venueService";
import { useUser } from "@/app/contexts/UserProvider";
import { AxiosResponse } from "axios";

interface TableMapUserProps {
  venueId: string;
  token?: string;
}

const TableMapUser: React.FC<TableMapUserProps> = ({ venueId, token }) => {
  const [tables, setTables] = useState<ITable[]>([]);
  const { user } = useUser();
  const accessToken = token || user?.token;

  const getTableService = () => {
    if (!accessToken) return null;
    return venueServices.venues.tables({ accessToken })(venueId);
  };

  useEffect(() => {
    const service = getTableService();
    if (!service) return;
    service
      .getAll()
      .then((res: AxiosResponse) => {
          setTables(res.data)
      })
      .catch((err) => console.error("Error load tables", err));
  }, [venueId, accessToken]);

  const handleTableClick = (table: ITable) => {
    alert(`Ви обрали ${table.name}`);
    // Тут можна додати логіку бронювання
  };

  return (
    <Stage width={800} height={600}>
      <Layer>
        {tables.map((table) => (
          <React.Fragment key={table.id}>
            <Table
              table={table}
              onDragEnd={() => {}}
              // Відключаємо draggable для користувача
            />
            <Text
              x={table.x - table.width / 2}
              y={table.y - table.height / 2 - 15}
              text={table.name}
              fontSize={14}
              fill="black"
            />
          </React.Fragment>
        ))}
      </Layer>
    </Stage>
  );
};

export default TableMapUser;