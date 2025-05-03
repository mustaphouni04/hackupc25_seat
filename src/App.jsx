import React, { useLayoutEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PuzzlePiece from "./components/PuzzlePiece";
import DropSlot from "./components/DropSlot";
import ThreeDModel from "./components/ThreeDModel";
import ChatBot from "./components/ChatBot";
import SecondPage from "./components/SecondPage";
import confetti from "canvas-confetti";

const COLS = 3, ROWS = 2, PIECE = 100, GAP = 10;
const OFFSET_X = 100, OFFSET_Y = 100;
const FULL_IMAGE = "/images/full-image.jfif";
const DESCRIPTION =
  "Steering wheel → Adjust the steering wheel using the lever in the lower-left side of the steering column.";

const pieces = Array.from({ length: COLS * ROWS }, (_, i) => ({
  id: i.toString(),
  row: Math.floor(i / COLS),
  col: i % COLS,
}));
const targetPositions = pieces.reduce((acc, p) => {
  acc[p.id] = {
    x: OFFSET_X + p.col * (PIECE + GAP),
    y: OFFSET_Y + p.row * (PIECE + GAP),
  };
  return acc;
}, {});

export default function App() {
  const canvasRef = useRef(null);
  const [pos, setPos] = useState({});
  const [completed, setCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    const start = {};
    pieces.forEach((p) => {
      start[p.id] = {
        x: Math.random() * (width - PIECE),
        y: Math.random() * (height - PIECE),
      };
    });
    setPos(start);
  }, []);

  const handleDrop = (id, x, y) => {
    setPos((prev) => {
      const next = { ...prev };
      const tgt = targetPositions[id];
      next[id] = Math.hypot(x - tgt.x, y - tgt.y) < 40 ? tgt : { x, y };
      const done = pieces.every((p) =>
        Math.hypot(
          (next[p.id].x ?? 0) - targetPositions[p.id].x,
          (next[p.id].y ?? 0) - targetPositions[p.id].y
        ) < 10
      );
      if (done && !completed) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setCompleted(true);
      }
      return next;
    });
  };

  const handleNextPage = () => {
    setCurrentPage(2);
  };

  const handlePreviousPage = () => {
    setCurrentPage(1);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
        {currentPage === 1 ? (
          <>
            <h1 className="text-3xl font-bold text-center mb-6">Let's Learn</h1>

            {completed ? (
              <div className="flex h-[80vh]">
                <div className="flex-[3_3_0] bg-white rounded-l-2xl shadow-xl overflow-hidden">
                  <ThreeDModel />
                </div>
                <div className="flex-[2_2_0] bg-white rounded-r-2xl shadow-xl overflow-hidden relative">
                  <ChatBot
                    initialBotMessage="Hello! I'm here to help with your PDF."
                    pdfUrl="/CUPRA_Tavascan_Owners_Manual_11_24_GB.pdf"
                    apiKey="AIzaSyCsT-4q31krXmM1LAs7ExD9uL7_MtA2ucE"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-6 h-[80vh]">
                <div
                  ref={canvasRef}
                  className="relative col-span-3 bg-white rounded-2xl shadow-xl h-full overflow-hidden"
                >
                  <>
                    {pieces.map((p) => (
                      <DropSlot
                        key={p.id}
                        index={p.id}
                        left={targetPositions[p.id].x}
                        top={targetPositions[p.id].y}
                        size={PIECE}
                        onDrop={handleDrop}
                      />
                    ))}
                    {pieces.map((p) => (
                      <PuzzlePiece
                        key={p.id}
                        id={p.id}
                        row={p.row}
                        col={p.col}
                        position={pos[p.id] || { x: 0, y: 0 }}
                        size={PIECE}
                        onDrop={handleDrop}
                        image={FULL_IMAGE}
                        totalCols={COLS}
                        totalRows={ROWS}
                      />
                    ))}
                  </>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-4">
                  <h2 className="text-xl font-semibold mb-2">Reference</h2>
                  <div className="flex items-center justify-center p-2">
                    <img
                      src={FULL_IMAGE}
                      alt="reference"
                      className="w-full max-w-xs max-h-60 object-contain opacity-60 rounded-md shadow"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={handleNextPage}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <SecondPage onPreviousPage={handlePreviousPage} />
        )}
      </div>
    </DndProvider>
  );
}
