"use client";

import React, { useState, useEffect, useCallback } from "react";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 20;
const OBJECT_SIZE = 30;

type FallingObject = { x: number; y: number; speed: number };

const CatchGame: React.FC = () => {
  const [basketPosition, setBasketPosition] = useState(GAME_WIDTH / 2 - BASKET_WIDTH / 2);
  const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const spawnObject = useCallback(() => {
    const speed = Math.random() * 2 + 2; // Speeds between 2 and 4
    setFallingObjects((prev) => [
      ...prev,
      { x: Math.random() * (GAME_WIDTH - OBJECT_SIZE), y: 0, speed },
    ]);
  }, []);

  const moveBasket = (direction: "left" | "right") => {
    setBasketPosition((prev) => {
      const newX =
        direction === "left"
          ? Math.max(0, prev - 30)
          : Math.min(GAME_WIDTH - BASKET_WIDTH, prev + 30);
      return newX;
    });
  };

  const updateObjects = () => {
    setFallingObjects((prevObjects) =>
      prevObjects
        .map((obj) => ({ ...obj, y: obj.y + obj.speed }))
        .filter((obj) => obj.y < GAME_HEIGHT + OBJECT_SIZE) // Remove objects that are off-screen
    );
  };

  const checkCollisions = useCallback(() => {
    setFallingObjects((prevObjects) =>
      prevObjects.filter((obj) => {
        const caught =
          obj.y + OBJECT_SIZE >= GAME_HEIGHT - BASKET_HEIGHT &&
          obj.x + OBJECT_SIZE > basketPosition &&
          obj.x < basketPosition + BASKET_WIDTH;

        if (caught) {
          setScore((prev) => prev + 1);
        } else if (obj.y >= GAME_HEIGHT) {
          setMissed((prev) => prev + 1);
        }

        return !caught;
      })
    );
  }, [basketPosition]);

  const restartGame = () => {
    setBasketPosition(GAME_WIDTH / 2 - BASKET_WIDTH / 2);
    setFallingObjects([]);
    setScore(0);
    setMissed(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (missed >= 3) {
      setGameOver(true);
      return;
    }

    const gameInterval = setInterval(() => {
      updateObjects();
      checkCollisions();
    }, 50);

    const objectInterval = setInterval(spawnObject, 1000);

    return () => {
      clearInterval(gameInterval);
      clearInterval(objectInterval);
    };
  }, [spawnObject, checkCollisions, missed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveBasket("left");
      if (e.key === "ArrowRight") moveBasket("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#333",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h1>Catch the Falling Objects</h1>
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Controls:</strong> Arrow Keys to Move
        </p>
      </div>
      <h2>Score: {score}</h2>
      <h3>Missed: {missed}/3</h3>
      {gameOver && <h3>Game Over! Press &quot;Restart&quot; to play again.</h3>}
      <div
        style={{
          position: "relative",
          width: `${GAME_WIDTH}px`,
          height: `${GAME_HEIGHT}px`,
          backgroundColor: "#111",
          border: "2px solid #fff",
          overflow: "hidden",
        }}
      >
        {/* Basket */}
        <div
          style={{
            position: "absolute",
            left: basketPosition,
            top: GAME_HEIGHT - BASKET_HEIGHT,
            width: `${BASKET_WIDTH}px`,
            height: `${BASKET_HEIGHT}px`,
            backgroundColor: "blue",
          }}
        />
        {/* Falling Objects */}
        {fallingObjects.map((obj, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: obj.x,
              top: obj.y,
              width: `${OBJECT_SIZE}px`,
              height: `${OBJECT_SIZE}px`,
              backgroundColor: "red",
              borderRadius: "50%",
            }}
          />
        ))}
      </div>
      <button
        onClick={restartGame}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Restart
      </button>
    </div>
  );
};

export default CatchGame;
