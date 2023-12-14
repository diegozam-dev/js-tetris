import {
  BLOCK_SIZE,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  EVENT_MOVEMENTS,
  PIECES,
} from './consts';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

function createBoard(width, height) {
  return Array(height)
    .fill()
    .map(() => Array(width).fill(0));
}

let dropCounter = 0;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > 500) {
    piece.position.y++;

    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      deleteRow();
    }

    dropCounter = 0;
  }

  if (isGameOver()) {
    alert('Game Over');
    board.forEach((row) => row.fill(0));
  }

  draw();
  window.requestAnimationFrame(update);
}

function draw() {
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        ctx.fillStyle = 'yellow';
      } else {
        ctx.fillStyle = '#111';
      }

      ctx.fillRect(x, y, 1, 1);
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });
}

const piece = {
  position: { x: getRandomInitialPosition(), y: 0 },
  shape: getRandomPiece(),
};

function getRandomPiece() {
  pieceIndex = Math.floor(Math.random() * PIECES.length);
  return PIECES[pieceIndex];
}

function getRandomInitialPosition() {
  return Math.floor(Math.random() * (BOARD_WIDTH / 2) + 2);
}

document.addEventListener('keydown', (e) => {
  e.preventDefault();

  if (e.key === EVENT_MOVEMENTS.left) {
    piece.position.x--;
    if (checkCollision()) {
      piece.position.x++;
    }
  }

  if (e.key === EVENT_MOVEMENTS.right) {
    piece.position.x++;
    if (checkCollision()) {
      piece.position.x--;
    }
  }

  if (e.key === EVENT_MOVEMENTS.down) {
    piece.position.y++;
    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      deleteRow();
    }
  }

  if (e.key === EVENT_MOVEMENTS.up) {
    rotatePiece();
  }
});

function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      );
    });
  });
}

function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    });
  });

  piece.position.x = getRandomInitialPosition();
  piece.position.y = 0;
  piece.shape = getRandomPiece();
}

function deleteRow() {
  board.forEach((row) => {
    if (row.every((value) => value === 1)) {
      row.fill(0);
    }
  });
}

function rotatePiece() {
  let movedPiece = Array(piece.shape[0].length)
    .fill()
    .map(() => Array(piece.shape.length).fill());

  for (i = 0; i < piece.shape[0].length; i++) {
    let y = 0;

    for (j = piece.shape.length - 1; j >= 0; j--) {
      movedPiece[i][y] = piece.shape[j][i];
      y++;
    }
  }

  piece.shape = movedPiece;

  // Evita que al rotar la pieza esta salga del tablero
  while (true) {
    if (checkCollision()) piece.position.x--;
    else break;
  }
}

function isGameOver() {
  if (checkCollision()) {
    return piece.position.y === 0;
  }
}

update();
