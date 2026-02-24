"use client";

import React from "react";
import {useDroppable} from "@dnd-kit/core";

interface DroppableCategoryProps {
    id: string;
    children: React.ReactNode;
}

const DroppableCategory: React.FC<DroppableCategoryProps> = ({id, children}) => {
    const {setNodeRef} = useDroppable({id});

    return <div ref={setNodeRef} id={id}>{children}</div>;
};

export default DroppableCategory;