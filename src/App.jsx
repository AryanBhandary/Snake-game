import { useState, useEffect, useRef } from "react";
import "./App.css";

const BOARD_SIZE = 20;
const INITIAL_SPEED = 150;

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

function App() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [nextDirection, setNextDirection] = useState(DIRECTIONS.ArrowRight);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [score, setScore] = useState(0);

  const moveRef = useRef(direction);
  moveRef.current = direction;

  // Handle keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (DIRECTIONS[e.key]) {
        const newDir = DIRECTIONS[e.key];
        const curDir = moveRef.current;
        if (newDir.x !== -curDir.x || newDir.y !== -curDir.y) {
          setNextDirection(newDir);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Snake movement
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setDirection(nextDirection);

      setSnake((prev) => {
        const newHead = {
          x: prev[0].x + nextDirection.x,
          y: prev[0].y + nextDirection.y,
        };

        // Collision
        if (
          newHead.x < 0 ||
          newHead.y < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y >= BOARD_SIZE ||
          prev.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true);
          return prev;
        }

        let newSnake = [newHead, ...prev];

        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1);
          generateFood(newSnake);
          setSpeed((sp) => (sp > 50 ? sp - 5 : sp));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [nextDirection, food, speed, gameOver]);

  const generateFood = (snakeCells) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (snakeCells.some((seg) => seg.x === newFood.x && seg.y === newFood.y));
    setFood(newFood);
  };

  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection(DIRECTIONS.ArrowRight);
    setNextDirection(DIRECTIONS.ArrowRight);
    setFood({ x: 5, y: 5 });
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  return (
    <div className="App">
      <h1>Snake Game</h1>
      <div className="score">Score: {score}</div>

      <div className="board">
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const isSnake = snake.some((seg) => seg.x === col && seg.y === row);
            const isHead = snake[0].x === col && snake[0].y === row;
            const isFood = food.x === col && food.y === row;
            return (
              <div
                key={`${row}-${col}`}
                className={`cell ${isSnake ? "snake" : ""} ${
                  isHead ? "head" : ""
                } ${isFood ? "food" : ""}`}
              />
            );
          })
        )}
      </div>

      {gameOver && (
        <div className="overlay">
          <h2>Game Over!</h2>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App;
