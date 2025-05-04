// src/App.jsx
import React, { useLayoutEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PuzzlePiece from "./components/PuzzlePiece";
import DropSlot from "./components/DropSlot";
import SecondPage from "./components/SecondPage";
import ThirdPage from "./components/ThirdPage";
import confetti from "canvas-confetti";
import ThreeDModel from "./components/ThreeDModel";
import MyChatbot from "./components/Chatbot";

const COLS = 3;
const ROWS = 2;
const PIECE = 100;
const GAP = 10;
const OFFSET_X = 100;
const OFFSET_Y = 100;
const FULL_IMAGE = "/images/full-image.jfif";

// metadata for 6 pieces
const pieces = Array.from({ length: COLS * ROWS }, (_, i) => ({
  id: i.toString(),
  row: Math.floor(i / COLS),
  col: i % COLS,
}));

// target slots positions
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

  // Debug the API key
  console.log("API Key available:", import.meta.env.VITE_GEMINI_API_KEY ? 
    "Yes (length: " + import.meta.env.VITE_GEMINI_API_KEY.length + ")" : 
    "No");

  // scatter pieces randomly once we measure the canvas
  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    const used = [];
    const rand = () => {
      let x, y, clash;
      do {
        x = Math.random() * (width - PIECE);
        y = Math.random() * (height - PIECE);
        clash = used.some(
          (u) => Math.abs(u.x - x) < PIECE && Math.abs(u.y - y) < PIECE
        );
      } while (clash);
      used.push({ x, y });
      return { x, y };
    };
    const start = {};
    pieces.forEach((p) => (start[p.id] = rand()));
    setPos(start);
  }, []);

  // drop handler
  const handleDrop = (id, x, y) => {
    setPos((prev) => {
      const next = { ...prev };
      const t = targetPositions[id];
      const d = Math.hypot(x - t.x, y - t.y);
      next[id] = d < 40 ? t : { x, y };

      // check completion
      const done = pieces.every((p) => {
        const c = next[p.id];
        const tgt = targetPositions[p.id];
        return Math.hypot(c.x - tgt.x, c.y - tgt.y) < 10;
      });
      if (done && !completed) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setCompleted(true);
      }
      return next;
    });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => prev - 1);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6 space-y-6">
        {currentPage === 1 ? (
          <>
            {/* Header and 3D Preview Row */}
            <div className="grid grid-cols-5 gap-6 items-start">
              {/* Header (Left) */}
              <div className="col-span-3 flex items-center justify-center">
                <h1 className="text-3xl font-bold text-center">Let's Learn</h1>
              </div>

              {/* 3D Preview (Top-Right) */}
              <div className="col-span-2 justify-self-end">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-[450px] h-[200px]">
                  <ThreeDModel modelPath="/models/full.glb" position={[1, 50, 40]}/>
                </div>
              </div>
            </div>

            {completed ? (
              <div className="flex h-[70vh] gap-6">
                <div className="flex-[3_3_0] bg-white rounded-l-2xl shadow-xl overflow-hidden">
                  <ThreeDModel modelPath="/models/full.glb"/>
                </div>
                <div className="flex-[2_2_0] bg-white rounded-r-2xl shadow-xl overflow-hidden">
                  <div className="h-full">
                    <MyChatbot />
                  </div>
                </div>
              </div>
            ) : (
              /* Puzzle and Reference Section */
              <div className="grid grid-cols-5 gap-6 h-[70vh]">
                {/* Puzzle Canvas */}
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

                {/* Reference Panel */}
                <div className="col-span-2 bg-white shadow-xl rounded-2xl p-4 overflow-auto">
                  <h2 className="text-xl font-semibold mb-2">Final Image</h2>
                  <div className="flex items-center justify-center p-1">
                    <img
                      src={FULL_IMAGE}
                      alt="reference"
                      className="w-[500px] h-[350px] object-contain opacity-100 rounded-md shadow-md"
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
        ) : currentPage === 2 ? (
			<SecondPage 
			  onPreviousPage={() => setCurrentPage(1)} 
			  onNextPage={() => setCurrentPage(3)}
			/>
		  ) : (
			<ThirdPage onPreviousPage={() => setCurrentPage(2)} />
		  )}
      </div>
    </DndProvider>
  );
}