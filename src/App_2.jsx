import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PuzzlePiece      from "./components/PuzzlePiece";
import DropSlot         from "./components/DropSlot";
import SecondPage       from "./components/SecondPage";
import ThirdPage        from "./components/ThirdPage";
import ThreeDModel      from "./components/ThreeDModel";
import MyChatbot        from "./components/Chatbot";
import confetti         from "canvas-confetti";

/* ---------- constants --------------------------------------------------- */
const COLS = 3, ROWS = 2, PIECE = 100, GAP = 10;
const OFFSET_X = 100, OFFSET_Y = 100;

const imageList = [
  "/images/steering.jpeg",
  "/images/seat.jpeg",
  "/images/charger.jpeg",
];

const modelList = [
  "/models/steering_wheel.glb",
  "/models/front_seats.glb",
  "/models/charger.glb",
];

const modelListFull = [
  "/models/steering_wheel.glb",
  "/models/steering_wheel_front_seats.glb",
  "/models/steering_wheel_front_seats_charger.glb",
];

const pieces = Array.from({ length: COLS * ROWS }, (_, i) => ({
  id  : i.toString(),
  row : Math.floor(i / COLS),
  col : i % COLS,
}));

const targetPositions = pieces.reduce((acc, p) => {
  acc[p.id] = {
    x: OFFSET_X + p.col * (PIECE + GAP),
    y: OFFSET_Y + p.row * (PIECE + GAP),
  };
  return acc;
}, {});

/* ---------- component --------------------------------------------------- */
export default function App() {
  const canvasRef                 = useRef(null);
  const [pos, setPos]             = useState({});
  const [currentIndex, setIndex]  = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentPage, setPage]    = useState(1);

  /* scatter helper */
  const scatterPieces = () => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    const used  = [];
    const rand  = () => {
      let x, y, clash;
      do {
        x = Math.random() * (width  - PIECE);
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
  };

  /* initial scatter when component mounts */
  useLayoutEffect(scatterPieces, []);

  /* when we choose a new puzzle -> mark as not completed */
  useEffect(() => {
    setCompleted(false);
  }, [currentIndex]);

  /* whenever we can actually SEE the canvas (page 1 & not completed) → scatter */
  useEffect(() => {
    if (currentPage === 1 && completed === false) {
      scatterPieces();
    }
  }, [currentPage, completed]);

  /* drop handler */
  const handleDrop = (id, x, y) => {
    setPos((prev) => {
      const next = { ...prev };
      const t    = targetPositions[id];
      const d    = Math.hypot(x - t.x, y - t.y);
      next[id]   = d < 40 ? t : { x, y };

      /* check completion */
      const done = pieces.every((p) => {
        const c   = next[p.id];
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

  /* navigation helpers */
  const nextPuzzle = () => setIndex((i) => (i + 1) % imageList.length);

  /* ---------- render ---------------------------------------------------- */
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6 space-y-6">

        {/* ---------------- page 1 ---------------- */}
        {currentPage === 1 && (
          <>
            {/* header & top-right preview */}
            <div className="grid grid-cols-5 gap-6 items-start">
              <div className="col-span-3 flex justify-center">
                <h1 className="text-3xl font-bold text-center">Let's Learn</h1>
              </div>
              <div className="col-span-2 justify-self-end">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-[450px] h-[200px]">
                  <ThreeDModel modelPath={modelListFull[currentIndex]} position={[1, 50, 40]} />
                </div>
              </div>
            </div>

            {/* puzzle OR completed view */}
            {completed ? (
              <>
                {/* completed layout */}
                <div className="flex h-[70vh] gap-6">
                  <div className="flex-[3_3_0] bg-white rounded-l-2xl shadow-xl overflow-hidden">
                    <ThreeDModel modelPath={modelList[currentIndex]} />
                  </div>
                  <div className="flex-[2_2_0] bg-white rounded-r-2xl shadow-xl p-2 flex flex-col">
                    <MyChatbot />
                  </div>
                </div>

                {/* previous button cycles puzzle */}
                <div className="flex justify-start mt-4">
                  <button
                    onClick={nextPuzzle}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition"
                  >
                    Previous
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* puzzle layout */}
                <div className="grid grid-cols-5 gap-6 h-[70vh]">
                  <div
                    ref={canvasRef}
                    className="relative col-span-3 bg-white rounded-2xl shadow-xl h-full overflow-hidden"
                  >
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
                        image={imageList[currentIndex]}
                        totalCols={COLS}
                        totalRows={ROWS}
                      />
                    ))}
                  </div>

                  <div className="col-span-2 bg-white shadow-xl rounded-2xl p-4 overflow-auto">
                    <h2 className="text-xl font-semibold mb-2">Final Image</h2>
                    <div className="flex justify-center p-1">
                      <img
                        src={imageList[currentIndex]}
                        alt="reference"
                        className="w-[500px] h-[350px] object-contain rounded-md shadow-md"
                      />
                    </div>
                  </div>
                </div>

                {/* next page */}
                <div className="flex justify-start mt-4">
                  <button
                    onClick={() => setPage(2)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ---------------- page 2 ---------------- */}
        {currentPage === 2 && (
          <SecondPage
            onPreviousPage={() => setPage(1)}
            onNextPage      ={() => setPage(3)}
          />
        )}

        {/* ---------------- page 3 ---------------- */}
        {currentPage === 3 && (
          <ThirdPage onPreviousPage={() => setPage(2)} />
        )}
      </div>
    </DndProvider>
  );
}
