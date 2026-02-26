"use client";

import React from "react";
import { Image as KonvaImage } from "react-konva";
import { ITable } from "@/models/IVenue";

interface TableProps {
  table: ITable;
  draggable?: boolean;
  onDragEnd?: (updatedTable: ITable) => void;
  onClick?: (table: ITable) => void;
}

const Table: React.FC<TableProps> = ({ table, draggable = false, onDragEnd, onClick }) => {
  const { x, y, capacity } = table;

  const getImageSrc = (capacity: number) => {
    switch (capacity) {
      case 2: return "/images/tables/table2.png";
      case 4: return "/images/tables/table4.png";
      case 6: return "/images/tables/table6.png";
      case 8: return "/images/tables/table8.png";
      default: return "/images/tables/table2.png";
    }
  };

  const imageSrc = getImageSrc(capacity || 2);
  const imageRef = React.useRef<any>(null);
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setImage(img);
  }, [imageSrc]);

  const desiredSize = table.width || 160;

  return (
    <KonvaImage
      ref={imageRef}
      x={x}
      y={y}
      width={desiredSize}
      height={desiredSize}
      image={image || undefined}
      draggable={draggable}
      onDragEnd={(e) => draggable && onDragEnd
        ? onDragEnd({ ...table, x: e.target.x(), y: e.target.y() })
        : undefined
      }
      onClick={() => onClick && onClick(table)}
    />
  );
};

export default Table;





// "use client";
//
// import React from "react";
// import { Image as KonvaImage } from "react-konva";
// import { ITable } from "@/models/IVenue";
//
// interface TableProps {
//   table: ITable;
//   onDragEnd: (updatedTable: ITable) => void;
// }
//
// const Table: React.FC<TableProps> = ({ table, onDragEnd }) => {
//   const { x, y, width, height, capacity } = table;
//
//   const getImageSrc = (capacity: number) => {
//     switch (capacity) {
//       case 2:
//         return "/images/tables/table2.png";
//       case 4:
//         return "/images/tables/table4.png";
//       case 6:
//         return "/images/tables/table6.png";
//       case 8:
//         return "/images/tables/table8.png";
//       default:
//         return "/images/tables/table2.png";
//     }
//   };
//
//   const imageSrc = getImageSrc(capacity);
//   const imageRef = React.useRef<any>(null);
//   const [image, setImage] = React.useState<HTMLImageElement | null>(null);
// console.log("Loading table image:", imageSrc, image);
//   React.useEffect(() => {
//     const img = new Image();
//     img.src = imageSrc;
//     img.onload = () => setImage(img);
//   }, [imageSrc]);
// const desiredSize = 160;
//   return (
//     <KonvaImage
//       ref={imageRef}
//       x={x}
//       y={y}
//       width={desiredSize}
//       height={desiredSize}
//       image={image || undefined}
//       draggable
//       onDragEnd={(e) =>
//           onDragEnd({ ...table, x: e.target.x(), y: e.target.y() })
//       }
//     />
//   );
// };
//
// export default Table;