"use client";

import React from "react";
import { Image as KonvaImage, Ellipse, Group } from "react-konva";
import { ITable } from "@/models/IVenue";

interface TableProps {
    table: ITable;
    draggable?: boolean;
    onDragEnd?: (updatedTable: ITable) => void;
    onClick?: (table: ITable) => void;
    onContextMenu?: (e: any, table: ITable) => void;
    isSelected?: boolean;
}

const Table: React.FC<TableProps> = ({ table, draggable = false, onDragEnd, onClick, onContextMenu, isSelected}) => {
  const { x, y, capacity } = table;

  const getImageSrc = (capacity: number) => {
    switch (capacity) {
      case 2: return "/images/tables/table2.png";
      case 4: return "/images/tables/table4.png";
      case 6: return "/images/tables/table6.png";
      case 8: return "/images/tables/table8.png";
      default: return "/images/tables/table2.png"
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
    <Group x={x} y={y}>

  {isSelected && (
      <Ellipse
          x={desiredSize / 2}
          y={desiredSize / 2}
          radiusX={desiredSize / 2}
          radiusY={desiredSize / 2}
          stroke="#926F34"
          strokeWidth={3}
          dash={[6, 4]}
      />
  )}

  <KonvaImage
    ref={imageRef}
    width={desiredSize}
    height={desiredSize}
    image={image || undefined}
    draggable={draggable}
    shadowColor="black"
    shadowBlur={5}
    shadowOpacity={0.3}
    shadowOffset={{ x: 2, y: 2 }}
    onDragEnd={(e) =>
      draggable && onDragEnd
        ? onDragEnd({ ...table, x: e.target.x(), y: e.target.y() })
        : undefined
    }
    onClick={() => onClick && onClick(table)}
    onContextMenu={(e) => onContextMenu && onContextMenu(e, table)}
  />

</Group>
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
//     table: ITable;
//     draggable?: boolean;
//     onDragEnd?: (updatedTable: ITable) => void;
//     onClick?: (table: ITable) => void;
//     onContextMenu?: (e: any, table: ITable) => void;
//     isSelected?: boolean;
// }
//
// const Table: React.FC<TableProps> = ({ table, draggable = false, onDragEnd, onClick, onContextMenu, isSelected}) => {
//   const { x, y, capacity } = table;
//
//   const getImageSrc = (capacity: number) => {
//     switch (capacity) {
//       case 2: return "/images/tables/table2.png";
//       case 4: return "/images/tables/table4.png";
//       case 6: return "/images/tables/table6.png";
//       case 8: return "/images/tables/table8.png";
//       default: return "/images/tables/table2.png"
//     }
//   };
//
//   const imageSrc = getImageSrc(capacity || 2);
//   const imageRef = React.useRef<any>(null);
//   const [image, setImage] = React.useState<HTMLImageElement | null>(null);
//
//   React.useEffect(() => {
//     const img = new Image();
//     img.src = imageSrc;
//     img.onload = () => setImage(img);
//   }, [imageSrc]);
//
//   const desiredSize = table.width || 160;
//
//   return (
//     <KonvaImage
//       ref={imageRef}
//       x={x}
//       y={y}
//       width={desiredSize}
//       height={desiredSize}
//       image={image || undefined}
//       draggable={draggable}
//
//       shadowColor={isSelected ? "gold" : "black"}
//       shadowBlur={isSelected ? 20 : 5}
//       shadowOpacity={isSelected ? 0.8 : 0.3}
//       shadowOffset={{ x: 2, y: 2 }}
//       stroke={isSelected ? "gold" : "transparent"}
//       strokeWidth={isSelected ? 5 : 0}
//
//       onDragEnd={(e) => draggable && onDragEnd
//         ? onDragEnd({ ...table, x: e.target.x(), y: e.target.y() })
//         : undefined
//       }
//       onClick={() => onClick && onClick(table)}
//       onContextMenu={(e) => onContextMenu && onContextMenu(e, table)}
//     />
//   );
// };
//
// export default Table;


