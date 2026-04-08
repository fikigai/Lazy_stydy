/**
 * КОНСТАНТИ ТА СТАН ГРИ
 */
const board = document.getElementById("chess-board");
const resetBtn = document.getElementById("reset-btn");
const statusDisplay = document.getElementById("status"); // Додай цей елемент в HTML для виводу стану

const startPosition = {
  "0_0": "♜",
  "0_1": "♞",
  "0_2": "♝",
  "0_3": "♛",
  "0_4": "♚",
  "0_5": "♝",
  "0_6": "♞",
  "0_7": "♜",
  "1_0": "♟︎",
  "1_1": "♟︎",
  "1_2": "♟︎",
  "1_3": "♟︎",
  "1_4": "♟︎",
  "1_5": "♟︎",
  "1_6": "♟︎",
  "1_7": "♟︎",
  "6_0": "♙",
  "6_1": "♙",
  "6_2": "♙",
  "6_3": "♙",
  "6_4": "♙",
  "6_5": "♙",
  "6_6": "♙",
  "6_7": "♙",
  "7_0": "♖",
  "7_1": "♘",
  "7_2": "♗",
  "7_3": "♕",
  "7_4": "♔",
  "7_5": "♗",
  "7_6": "♘",
  "7_7": "♖",
};

let currentTurn = "white";
let draggedPiece = null;
let sourceCell = null;

/**
 * ПЕРЕВІРКА ТИПУ ФІГУРИ
 */
const isWhite = (s) => ["♔", "♕", "♖", "♗", "♘", "♙"].includes(s);
const getPieceName = (s) => {
  const map = {
    "♙": "p",
    "♙": "p",
    "♖": "r",
    "♜": "r",
    "♘": "n",
    "♞": "n",
    "♗": "b",
    "♝": "b",
    "♕": "q",
    "♛": "q",
    "♔": "k",
    "♚": "k",
    "♟︎": "p",
  };
  return map[s] || "";
};

/**
 * ОСНОВНА ЛОГІКА ХОДІВ (МАТЕМАТИКА)
 */
function canPieceMove(pieceType, r1, c1, r2, c2, targetPiece) {
  const dr = r2 - r1;
  const dc = c2 - c1;
  const white = isWhite(pieceType);
  const name = getPieceName(pieceType);

  // Спільне: не можна бити своїх
  if (targetPiece && isWhite(targetPiece) === white) return false;

  switch (name) {
    case "p": // Пішак
      const dir = white ? -1 : 1;
      if (dc === 0 && !targetPiece) {
        // Прямо
        if (dr === dir) return true;
        if (
          dr === 2 * dir &&
          r1 === (white ? 6 : 1) &&
          !getPieceAt(r1 + dir, c1)
        )
          return true;
      }
      return Math.abs(dc) === 1 && dr === dir && !!targetPiece; // Взяття

    case "r": // Тура
      return (dr === 0 || dc === 0) && isPathClear(r1, c1, r2, c2);

    case "n": // Кінь
      return (
        (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
        (Math.abs(dr) === 1 && Math.abs(dc) === 2)
      );

    case "b": // Слон
      return Math.abs(dr) === Math.abs(dc) && isPathClear(r1, c1, r2, c2);

    case "q": // Ферзь
      return (
        (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) &&
        isPathClear(r1, c1, r2, c2)
      );

    case "k": // Король
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  }
  return false;
}

/**
 * ДОПОМІЖНІ ПЕРЕВІРКИ
 */
function isPathClear(r1, c1, r2, c2) {
  const stepR = r2 === r1 ? 0 : r2 > r1 ? 1 : -1;
  const stepC = c2 === c1 ? 0 : c2 > c1 ? 1 : -1;
  let r = r1 + stepR;
  let c = c1 + stepC;
  while (r !== r2 || c !== c2) {
    if (getPieceAt(r, c)) return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

function getPieceAt(r, c) {
  const cell = document.getElementById(`cell_${r}_${c}`);
  return cell ? cell.firstChild : null;
}

/**
 * ПІДСВІЧУВАННЯ ТА ВІЗУАЛ
 */
function highlightValidMoves(cellFrom) {
  const piece = cellFrom.firstChild;
  const r1 = parseInt(cellFrom.dataset.row);
  const c1 = parseInt(cellFrom.dataset.col);

  document.querySelectorAll(".chess-board__cell").forEach((cell) => {
    const r2 = parseInt(cell.dataset.row);
    const c2 = parseInt(cell.dataset.col);
    const target = cell.firstChild ? cell.firstChild.textContent : null;

    if (canPieceMove(piece.textContent, r1, c1, r2, c2, target)) {
      cell.classList.add("valid-move"); // Додай цей клас у SCSS (наприклад, зелене коло)
    }
  });
}

function clearHighlights() {
  document
    .querySelectorAll(".valid-move")
    .forEach((c) => c.classList.remove("valid-move"));
}

/**
 * ОБРОБКА ПОДІЙ (DRAG & DROP)
 */
function addDragListeners(piece) {
  piece.addEventListener("dragstart", (e) => {
    const whitePiece = isWhite(piece.textContent);
    if (
      (currentTurn === "white" && !whitePiece) ||
      (currentTurn === "black" && whitePiece)
    ) {
      e.preventDefault();
      return;
    }
    draggedPiece = e.target;
    sourceCell = e.target.parentElement;
    highlightValidMoves(sourceCell);
    setTimeout(() => piece.classList.add("dragging"), 0);
  });

  piece.addEventListener("dragend", () => {
    piece.classList.remove("dragging");
    clearHighlights();
  });
}

function addDropListeners(cell) {
  cell.addEventListener("dragover", (e) => e.preventDefault());

  cell.addEventListener("drop", (e) => {
    e.preventDefault();
    const r1 = parseInt(sourceCell.dataset.row),
      c1 = parseInt(sourceCell.dataset.col);
    const r2 = parseInt(cell.dataset.row),
      c2 = parseInt(cell.dataset.col);
    const target = cell.firstChild ? cell.firstChild.textContent : null;

    if (
      draggedPiece &&
      canPieceMove(draggedPiece.textContent, r1, c1, r2, c2, target)
    ) {
      // Взяття фігури
      if (cell.firstChild) cell.removeChild(cell.firstChild);

      cell.appendChild(draggedPiece);

      // Перевірка на перетворення пішака
      checkPromotion(draggedPiece, r2);

      // Зміна ходу
      currentTurn = currentTurn === "white" ? "black" : "white";
      updateStatus();
    }
  });
}

function checkPromotion(piece, row) {
  const name = getPieceName(piece.textContent);
  const white = isWhite(piece.textContent);
  if (name === "p" && (row === 0 || row === 7)) {
    piece.textContent = white ? "♕" : "♛"; // Автоматично у ферзя для спрощення
  }
}

function updateStatus() {
  if (statusDisplay) {
    statusDisplay.textContent = `Хід: ${currentTurn === "white" ? "Білих" : "Чорних"}`;
  }
}

/**
 * ІНІЦІАЛІЗАЦІЯ
 */
function createBoard(position) {
  board.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement("div");
      cell.className = `chess-board__cell chess-board__cell--${(row + col) % 2 === 0 ? "light" : "dark"}`;
      cell.id = `cell_${row}_${col}`;
      cell.dataset.row = row;
      cell.dataset.col = col;

      const pieceSymbol = position[`${row}_${col}`];
      if (pieceSymbol) {
        const pieceSpan = document.createElement("span");
        pieceSpan.className = `chess-board__piece ${isWhite(pieceSymbol) ? "chess-board__piece--white" : "chess-board__piece--black"}`;
        pieceSpan.textContent = pieceSymbol;
        pieceSpan.setAttribute("draggable", true);
        addDragListeners(pieceSpan);
        cell.appendChild(pieceSpan);
      }
      addDropListeners(cell);
      board.appendChild(cell);
    }
  }
}

resetBtn.addEventListener("click", () => {
  currentTurn = "white";
  updateStatus();
  createBoard(startPosition);
});

// Перший запуск
createBoard(startPosition);
