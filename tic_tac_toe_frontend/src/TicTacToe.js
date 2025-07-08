import React, { useState } from "react";

// Color theme constants
const COLORS = {
  primary: "#2196F3",
  secondary: "#FFFFFF",
  accent: "#4CAF50",
};

/**
 * Utility function to check for a winner or draw
 * Returns:
 *   { winner: "X"|"O"|null, winningLine: [index,...]|null, isDraw: true|false }
 */
function calculateGameStatus(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], winningLine: [a, b, c], isDraw: false };
    }
  }
  const isDraw = squares.every(Boolean);
  return { winner: null, winningLine: null, isDraw };
}

// Simple AI that picks a random empty square
function getAIMove(squares) {
  const emptyIndices = squares
    .map((val, idx) => (val ? null : idx))
    .filter((v) => v !== null);
  if (emptyIndices.length === 0) return null;
  // (Optional: Enhance to block or win, but out of minimal feature scope)
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// PUBLIC_INTERFACE
export default function TicTacToe() {
  /**
   * Core game state and mode selection
   */
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState(null); // null, "2p", or "ai"
  const [status, setStatus] = useState("");
  const [aiThinking, setAIThinking] = useState(false);

  // Reset board for new game/session
  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setStatus("");
    setAIThinking(false);
  };

  // Handles a move (either by human or AI)
  const handleSquareClick = (idx) => {
    if (calculateGameStatus(squares).winner || aiThinking || squares[idx]) return;

    const newSquares = squares.slice();
    newSquares[idx] = xIsNext ? "X" : "O";
    setSquares(newSquares);

    const { winner, isDraw } = calculateGameStatus(newSquares);
    if (winner) {
      setStatus(`Winner: ${winner}`);
    } else if (isDraw) {
      setStatus("It's a draw!");
    } else {
      setXIsNext(!xIsNext);

      // If vs AI and it's now O's turn (AI is always O)
      if (mode === "ai" && !xIsNext) {
        setAIThinking(true);
        // Brief delay for realism
        setTimeout(() => {
          const aiIdx = getAIMove(newSquares);
          if (aiIdx != null) {
            const aiSquares = newSquares.slice();
            aiSquares[aiIdx] = "O";
            setSquares(aiSquares);

            const { winner: aiWinner, isDraw: aiDraw } =
              calculateGameStatus(aiSquares);
            if (aiWinner) {
              setStatus(`Winner: ${aiWinner}`);
            } else if (aiDraw) {
              setStatus("It's a draw!");
            } else {
              setXIsNext(true);
              setStatus("");
            }
          }
          setAIThinking(false);
        }, 400);
      } else {
        setStatus("");
      }
    }
  };

  // Select mode UI
  if (!mode) {
    return (
      <div style={styles.container}>
        <h2 style={{ color: COLORS.primary, marginBottom: 12 }}>Tic Tac Toe</h2>
        <div style={{ color: COLORS.accent, marginBottom: 18 }}>
          Choose Mode:
        </div>
        <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
          <button style={{ ...styles.button, background: COLORS.primary, color: COLORS.secondary }}
            onClick={() => setMode("2p")}>
            2-Player
          </button>
          <button style={{ ...styles.button, background: COLORS.accent, color: COLORS.secondary }}
            onClick={() => setMode("ai")}>
            Play vs Computer
          </button>
        </div>
      </div>
    );
  }

  // Game board render
  const { winner, winningLine, isDraw } = calculateGameStatus(squares);

  function renderSquare(idx) {
    // Highlight if part of winning line
    let squareStyle = { ...styles.square };
    if (winningLine && winningLine.includes(idx)) {
      squareStyle = {
        ...squareStyle,
        background: COLORS.accent,
        color: COLORS.secondary,
      };
    }
    return (
      <button
        key={idx}
        style={squareStyle}
        onClick={() => handleSquareClick(idx)}
        disabled={Boolean(squares[idx]) || winner || (mode === "ai" && aiThinking)}
        aria-label={`cell-${idx}`}
      >
        {squares[idx]}
      </button>
    );
  }

  let message = "";
  if (winner) {
    message = `Winner: ${winner}`;
  } else if (isDraw) {
    message = "Draw!";
  } else if (mode === "ai" && aiThinking) {
    message = "Computer thinking...";
  } else if (mode === "ai") {
    message = xIsNext ? "Your Turn (X)" : "Computer's Turn (O)";
  } else {
    message = `Turn: ${xIsNext ? "X" : "O"}`;
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={{ fontWeight: 600, fontSize: 22, color: COLORS.primary }}>
          Tic Tac Toe
        </div>
        <div style={{ marginTop: 4, fontSize: 15, color: COLORS.accent }}>
          {message}
        </div>
      </div>
      <div style={styles.boardWrapper}>
        <div style={styles.board}>
          {Array(3)
            .fill(null)
            .map((_, row) => (
              <div style={styles.boardRow} key={row}>
                {Array(3)
                  .fill(null)
                  .map((_, col) => renderSquare(row * 3 + col))}
              </div>
            ))}
        </div>
      </div>
      <div style={styles.actions}>
        <button
          style={{ ...styles.button, background: COLORS.primary, color: COLORS.secondary }}
          onClick={resetGame}
        >
          {winner || isDraw ? "Restart" : "Reset"}
        </button>
        <button
          style={{ ...styles.button, background: COLORS.accent, color: COLORS.secondary }}
          onClick={() => {
            setMode(null);
            resetGame();
          }}
        >
          Change Mode
        </button>
      </div>
    </div>
  );
}

// Component styles (CSS-in-JS for encapsulation)
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "var(--bg-primary)",
    padding: 12,
  },
  topBar: {
    width: "100%",
    maxWidth: 330,
    textAlign: "center",
    marginBottom: 16,
  },
  boardWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "20px 0",
    width: "100vw",
    maxWidth: 330,
  },
  board: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    boxShadow: "0 2px 16px 0 rgba(33,150,243,0.09)",
    borderRadius: 16,
    background: "var(--bg-secondary)",
    padding: 18,
    width: 276,
    minWidth: 225,
  },
  boardRow: {
    display: "flex",
    flexDirection: "row",
    gap: 0,
  },
  square: {
    width: 64,
    height: 64,
    fontSize: 32,
    color: "#282c34",
    textAlign: "center",
    border: "1.5px solid #e9ecef",
    background: "#fff",
    outline: "none",
    borderRadius: 8,
    margin: 3,
    cursor: "pointer",
    transition: "background 0.21s, color 0.21s, box-shadow 0.21s",
    boxShadow: "none",
  },
  actions: {
    marginTop: 14,
    display: "flex",
    gap: 14,
    justifyContent: "center",
  },
  button: {
    padding: "10px 20px",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s, color 0.3s, opacity 0.2s",
    boxShadow: "0 2px 8px rgba(76,175,80,0.09)",
  },
};
