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
import { createClient } from "@supabase/supabase-js";

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
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null); // для локальних змін
  const [selectedTableType, setSelectedTableType] = useState(TABLE_TYPES[0]);
  const { user } = useUser();
  const accessToken = token || user?.token;
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
    const client = createClient(supabaseUrl, supabaseKey);
    setSupabase(client);
  }, []);

  const getTableService = () => accessToken ? venueServices.venues.tables({ accessToken })(venueId) : null;
  const getLayoutService = () => user?.token ? venueServices.venues.background({ accessToken: user.token })(venueId) : null;

  // --- Завантажити фон ---
  useEffect(() => {
    const service = getLayoutService();
    if (!service) return;
    service.getBackground()
      .then(res => {
        if (res.data.url) {
  const img = new Image();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || BASE_URL; // BASE_URL = "http://localhost:8888"
  img.src = res.data.url.startsWith("http") ? res.data.url : `${baseUrl}${res.data.url}`;
  img.onload = () => setBackground(img);
}
      })
      .catch(console.error);
  }, [venueId, accessToken]);


  useEffect(() => {
    const service = getTableService();
    if (!service) return;
    service.getAll()
      .then((res: AxiosResponse) => {
        setTables(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch(console.error);
  }, [venueId, accessToken]);

  // --- Розмір сцени ---
  useEffect(() => {
    const updateSize = () => setStageSize({ width: window.innerWidth * 0.7, height: window.innerHeight * 0.7 });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // --- Обробка завантаження локального фону ---
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setBackgroundFile(file); // зберігаємо локально для подальшого батча
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => setBackground(img);
  };

  const uploadToSupabase = async (file: File) => {
    if (!supabase) return null;
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!;
    const fileName = `bg_tables_${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file, { cacheControl: "3600", upsert: true });
    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError);
      return null;
    }
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // --- Додати стіл ---
  const addTable = () => {
    const newTable: ITable = {
      id: `temp-${Date.now()}`,
      capacity: selectedTableType.capacity,
      x: 0.5,
      y: 0.5,
      width: 160,
      height: 160,
      venue_id: Number(venueId),
    };
    setTables(prev => [...prev, newTable]);
  };

  // --- Перетягування столів ---
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
    let publicUrl: string | null = null;
    if (backgroundFile) {
      publicUrl = await uploadToSupabase(backgroundFile);
      if (!publicUrl) return  new Error("Не вдалося завантажити фон у Supabase");

      const layoutService = getLayoutService();
      if (!layoutService) return  new Error("Layout service не доступний");

      await layoutService.uploadBackground(publicUrl);
    }

    const responses = await Promise.all(
      tables.map(table => {
        if (typeof table.id === "string" && table.id.startsWith("temp-")) {
          return tableService.create({ ...table, venue_id: Number(venueId) });
        } else {
          return tableService.update(String(table.id), table);
        }
      })
    );

    setTables(responses.map(res => res.data));
    setBackgroundFile(null); // скидаємо локальний файл
    console.log("Фон і розстановка столів збережені і доступні глобально!");
  } catch (err) {
    console.error("Помилка при збереженні:", err);
  }
};
  if (stageSize.width === 0 || stageSize.height === 0) return <div>Завантаження...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <input type="file" accept="image/*" onChange={handleBackgroundUpload} />
        <select
          value={selectedTableType.capacity}
          onChange={e =>
            setSelectedTableType(TABLE_TYPES.find(t => t.capacity === Number(e.target.value)) || TABLE_TYPES[0])
          }
        >
          {TABLE_TYPES.map(t => (
            <option key={t.capacity} value={t.capacity}>{t.capacity} місця</option>
          ))}
        </select>
        <button onClick={addTable}>Додати стіл</button>
        <button onClick={saveAll}>Зберегти все</button>
      </div>

      <div className={styles.stageWrapper}>
        <Stage width={stageSize.width} height={stageSize.height} className={styles.stage}>
          <Layer>
            {background && <KonvaImage image={background} width={stageSize.width} height={stageSize.height} />}
            {tables.map(table => (
              <Table
                key={table.id}
                table={{ ...table, x: table.x * stageSize.width, y: table.y * stageSize.height }}
                draggable
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




// "use client";
//
// import React, { useEffect, useState } from "react";
// import { Stage, Layer } from "react-konva";
// import Table from "./Table";
// import { ITable } from "@/models/IVenue";
// import venueServices from "@/lib/services/venueService";
// import { useUser } from "@/app/contexts/UserProvider";
// import { AxiosResponse } from "axios";
// import { Image as KonvaImage } from "react-konva";
// import styles from "./TableMapAdmin.module.css";
// import {createClient} from "@supabase/supabase-js";
//
// const BASE_URL = "http://localhost:8888";
//
// const TABLE_TYPES = [
//   { capacity: 2 },
//   { capacity: 4 },
//   { capacity: 6 },
//   { capacity: 8 },
// ];
//
// interface TableMapAdminProps {
//   venueId: string;
//   token?: string;
// }
//
// const TableMapAdmin: React.FC<TableMapAdminProps> = ({ venueId, token }) => {
//   const [tables, setTables] = useState<ITable[]>([]);
//   const [background, setBackground] = useState<HTMLImageElement | null>(null);
//   const [selectedTableType, setSelectedTableType] = useState(TABLE_TYPES[0]);
//   const { user } = useUser();
//   const accessToken = token || user?.token;
//   const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
// const [supabase, setSupabase] = useState<any>(null);
//
// useEffect(() => {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
//   const client = createClient(supabaseUrl, supabaseKey);
//   setSupabase(client);
// }, []);
//
//   const getTableService = () => {
//     if (!accessToken) return null;
//     return venueServices.venues.tables({ accessToken })(venueId);
//   };
//
//   const getLayoutService = () => {
//     if (!user?.token) return null;
//     return venueServices.venues.background({accessToken:user.token})(venueId);
//   };
//
//   useEffect(() => {
//     const service = getLayoutService();
//     if (!service) return;
//
//     service.getBackground().then((res) => {
//       const url = `${BASE_URL}${res.data.url}`;
//       const img = new Image();
//       img.src = url;
//       img.onload = () => setBackground(img);
//     }).catch(console.error);
//   }, [venueId, accessToken]);
// -
//   useEffect(() => {
//     const service = getTableService();
//     if (!service) return;
//
//     service.getAll().then((res: AxiosResponse) => {
//       setTables(Array.isArray(res.data.data) ? res.data.data : []);
//     }).catch(console.error);
//   }, [venueId, accessToken]);
//
//
//   useEffect(() => {
//     const updateSize = () => {
//       setStageSize({
//         width: window.innerWidth * 0.7,
//         height: window.innerHeight * 0.7,
//       });
//     };
//     updateSize();
//     window.addEventListener("resize", updateSize);
//     return () => window.removeEventListener("resize", updateSize);
//   }, []);
//
//   const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   if (!e.target.files?.[0]) return;
//   const file = e.target.files[0];
//
//   try {
//     const publicUrl = await uploadToSupabase(file);
//     if (!publicUrl) return;
//
//     const img = new Image();
//     img.src = publicUrl;
//     img.onload = () => setBackground(img);
//   } catch (err) {
//     console.error("Помилка завантаження фону", err);
//   }
// };
//
//   const uploadToSupabase = async (file: File) => {
//   if (!supabase) return null;
//
//   const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!;
//   const fileName = `bg_tables_${Date.now()}.jpg`;
//
//   const { error: uploadError } = await supabase.storage
//     .from(bucketName)
//     .upload(fileName, file, { cacheControl: "3600", upsert: true });
//
//   if (uploadError) {
//     console.error("Error uploading to Supabase:", uploadError);
//     return null;
//   }
//
//   const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
//   return data.publicUrl;
// };
//
//
//   // --- Додати стіл ---
//   const addTable = () => {
//     const newTable: ITable = {
//       id: `temp-${Date.now()}`,
//       capacity: selectedTableType.capacity,
//       x: 0.5, // координати в % від сцени
//       y: 0.5,
//       width: 160,
//       height: 160,
//       venue_id: Number(venueId),
//     };
//     setTables(prev => [...prev, newTable]);
//   };
//
//   // --- Перетягування столів ---
//   const handleDragEnd = (updatedTable: ITable) => {
//     setTables(prev =>
//       prev.map(t =>
//         t.id === updatedTable.id
//           ? { ...t, x: updatedTable.x / stageSize.width, y: updatedTable.y / stageSize.height }
//           : t
//       )
//     );
//   };
//
//   // --- Зберегти всі столи ---
//   const saveAllTables = async () => {
//     const service = getTableService();
//     if (!service) return;
//
//     try {
//       const responses = await Promise.all(
//         tables.map(table => {
//           if (typeof table.id === "string" && table.id.startsWith("temp-")) {
//             return service.create({ ...table, venue_id: Number(venueId) });
//           } else {
//             return service.update(String(table.id), table);
//           }
//         })
//       );
//       setTables(responses.map(res => res.data));
//       console.log("Розстановка збережена!");
//     } catch (err) {
//       console.error(err);
//     }
//   };
//
//   if (stageSize.width === 0 || stageSize.height === 0) return <div>Завантаження...</div>;
//
//   // --- JSX ---
//   return (
//     <div className={styles.container}>
//       <div className={styles.controls}>
//         <input type="file" accept="image/*" onChange={handleBackgroundUpload} />
//         <select
//           value={selectedTableType.capacity}
//           onChange={e =>
//             setSelectedTableType(TABLE_TYPES.find(t => t.capacity === Number(e.target.value)) || TABLE_TYPES[0])
//           }
//         >
//           {TABLE_TYPES.map(t => (
//             <option key={t.capacity} value={t.capacity}>{t.capacity} місця</option>
//           ))}
//         </select>
//         <button onClick={addTable}>Додати стіл</button>
//
//         <button onClick={saveAllTables}>Зберегти розстановку</button>
//       </div>
//
//       <div className={styles.stageWrapper}>
//         <Stage width={stageSize.width} height={stageSize.height} className={styles.stage}>
//           <Layer>
//             {background && <KonvaImage image={background} width={stageSize.width} height={stageSize.height} />}
//             {tables.map(table => (
//               <Table
//                 key={table.id}
//                 table={{
//                   ...table,
//                   x: table.x * stageSize.width,
//                   y: table.y * stageSize.height,
//                 }}
//                 draggable
//                 onDragEnd={handleDragEnd}
//               />
//             ))}
//           </Layer>
//         </Stage>
//       </div>
//     </div>
//   );
// };
//
// export default TableMapAdmin;