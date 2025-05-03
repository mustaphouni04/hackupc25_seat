import React from "react";
import { useDrag } from "react-dnd";

export default function PuzzlePiece({
  id,
  row,
  col,
  position,
  size,
  onDrop,
  image,
  totalCols,
  totalRows,
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "puzzlePiece",
    item: { id },
    end: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;
      onDrop(id, offset.x - size / 2, offset.y - size / 2);
    },
    collect: (m) => ({ isDragging: m.isDragging() }),
  }));

  return (
    <div
      ref={drag}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        opacity: isDragging ? 0.5 : 1,
        backgroundImage: `url(${image})`,
        backgroundSize: `${totalCols * 100}% ${totalRows * 100}%`,
        backgroundPosition: `${(col / (totalCols - 1)) * 100}% ${(row / (totalRows - 1)) * 100}%`,
        backgroundRepeat: "no-repeat",
        backgroundClip: "content-box",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        cursor: "grab",
      }}
    />
  );
}




// import React from "react";
// import { useDrag } from "react-dnd";

// export default function PuzzlePiece({ id, image, position, size, onDrop }) {
//   const [{ isDragging }, drag, preview] = useDrag(() => ({
//     type: "puzzlePiece",
//     item: { id },
//     end: (item, monitor) => {
//       const offset = monitor.getClientOffset();
//       if (!offset) return;
//       onDrop(id, offset.x - size / 2, offset.y - size / 2);
//     },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   }));

//   return (
//     <div
//       ref={drag}
//       style={{
//         position: "absolute",
//         left: position.x,
//         top: position.y,
//         width: size,
//         height: size,
//         opacity: isDragging ? 0.5 : 1,
//         cursor: "grab",
//       }}
//     >
//       <img
//         src={image}
//         alt={`piece-${id}`}
//         className="w-full h-full object-cover rounded shadow"
//       />
//     </div>
//   );
// }








// import React from "react";
// import { useDrag } from "react-dnd";

// export default function PuzzlePiece({ id, image, position, size, onDrop }) {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: "puzzlePiece",
//     item: { id },
//     end: (item, monitor) => {
//       const offset = monitor.getClientOffset();
//       if (!offset) return;               // drag cancelled
//       const { x, y } = offset;
//       onDrop(id, x - size / 2, y - size / 2);
//     },
//     collect: (m) => ({ isDragging: m.isDragging() }),
//   }));

//   return (
//     <div
//       ref={drag}
//       style={{
//         position: "absolute",
//         left: position.x,
//         top:  position.y,
//         width: size,
//         height: size,
//         opacity: isDragging ? 0.5 : 1,
//         cursor: "move",
//       }}
//     >
//       <img
//         src={image}
//         alt={`piece-${id}`}
//         className="w-full h-full object-cover rounded shadow"
//       />
//     </div>
//   );
// }









// // src/components/PuzzlePiece.jsx
// import React from "react";
// import { useDrag } from "react-dnd";

// function PuzzlePiece({ id, image }) {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: "puzzlePiece",
//     item: { id },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   }));

//   return (
//     <div
//       ref={drag}
//       className={`w-20 h-20 border rounded-md shadow-md cursor-move ${
//         isDragging ? "opacity-30" : "opacity-100"
//       }`}
//     >
//       <img src={image} alt={`Piece ${id}`} className="w-full h-full object-cover rounded" />
//     </div>
//   );
// }

// export default PuzzlePiece;







