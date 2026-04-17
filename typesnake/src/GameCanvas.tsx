import React, { useEffect, useRef, useState } from "react";
import "./GameCanvas.css";

type Point = { x: number; y: number };

const CELL_SIZE = 20;
const WIDTH = 400;
const HEIGHT = 400;

export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [snake, setSnake] = useState<Point[]>([{ x: 5, y: 5 }]);
    const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
    const [apple, setApple] = useState<Point>({ x: 10, y: 10 });
    const [poison, setPoison] = useState<Point>({ x: 15, y: 15 });
    const [gameOver, setGameOver] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");

    // Tema değiştirme
    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    // Oyunu yeniden başlat
    const restartGame = () => {
        setSnake([{ x: 5, y: 5 }]);
        setDirection({ x: 1, y: 0 });
        setApple({ x: 10, y: 10 });
        setPoison({ x: 15, y: 15 });
        setGameOver(false);
    };

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        const interval = setInterval(() => {
            if (gameOver) return;

            const newHead = {
                x: snake[0].x + direction.x,
                y: snake[0].y + direction.y,
            };

            // Çarpışma kontrolü
            if (
                newHead.x < 0 ||
                newHead.y < 0 ||
                newHead.x >= WIDTH / CELL_SIZE ||
                newHead.y >= HEIGHT / CELL_SIZE ||
                snake.some((s) => s.x === newHead.x && s.y === newHead.y)
            ) {
                setGameOver(true);
                return;
            }

            let newSnake = [newHead, ...snake];

            // Elma yeme
            if (newHead.x === apple.x && newHead.y === apple.y) {
                setApple({
                    x: Math.floor(Math.random() * (WIDTH / CELL_SIZE)),
                    y: Math.floor(Math.random() * (HEIGHT / CELL_SIZE)),
                });
            } else if (newHead.x === poison.x && newHead.y === poison.y) {
                // Zehir yeme → yılanı kısalt
                newSnake = newSnake.slice(0, -2);
                setPoison({
                    x: Math.floor(Math.random() * (WIDTH / CELL_SIZE)),
                    y: Math.floor(Math.random() * (HEIGHT / CELL_SIZE)),
                });
                if (newSnake.length === 0) {
                    setGameOver(true);
                    return;
                }
            } else {
                newSnake.pop(); // normal hareket
            }

            setSnake(newSnake);

            // Çizim
            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            // Duvarlar siyah çerçeve
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.strokeRect(0, 0, WIDTH, HEIGHT);

            ctx.fillStyle = "green";
            newSnake.forEach((s) =>
                ctx.fillRect(s.x * CELL_SIZE, s.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            );

            ctx.fillStyle = "red";
            ctx.fillRect(apple.x * CELL_SIZE, apple.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            ctx.fillStyle = "blue";
            ctx.fillRect(poison.x * CELL_SIZE, poison.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            if (gameOver) {
                ctx.fillStyle = theme === "light" ? "black" : "white";
                ctx.font = "30px Arial";
                ctx.fillText("Oyun bitti", WIDTH / 2 - 70, HEIGHT / 2);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [snake, direction, apple, poison, gameOver, theme]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") setDirection({ x: 0, y: -1 });
            if (e.key === "ArrowDown") setDirection({ x: 0, y: 1 });
            if (e.key === "ArrowLeft") setDirection({ x: -1, y: 0 });
            if (e.key === "ArrowRight") setDirection({ x: 1, y: 0 });
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return (
        <div className={`game-container ${theme}`}>
            <h1>TypeSnake</h1>
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
            {gameOver && (
                <button onClick={restartGame} className="btn">
                    Yeniden Başlat
                </button>
            )}
            <button onClick={toggleTheme} className="btn">
                Tema Değiştir
            </button>
        </div>
    );
}