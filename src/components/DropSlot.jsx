import React from "react";
import { useDrop } from "react-dnd";

export default function DropSlot({ index, left, top, size, onDrop }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "puzzlePiece",
    drop: (item) => onDrop(item.id, left, top),
    collect: (m) => ({
      isOver: m.isOver(),
      canDrop: m.canDrop(),
    }),
  }));

  const border = isOver && canDrop ? "2px solid #22c55e" : "2px dashed #ddd";

  return (
    <div
      ref={drop}
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        border,
        borderRadius: 8,
        background: "transparent",
        pointerEvents: "all",
      }}
    />
  );
}

