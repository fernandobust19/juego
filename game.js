// game.js
// Lógica inicial para el juego de figuras geométricas


const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// Configuración del tablero
const COLS = 10;
const ROWS = 20;
let CELL_SIZE = 30;

function updateCellSize() {
    // Calcula el tamaño de celda según el canvas y el número de filas/columnas
    CELL_SIZE = Math.floor(Math.min(canvas.width / COLS, canvas.height / ROWS));
}

window.addEventListener('resize', () => {
    updateCellSize();
    drawBoard();
});
window.addEventListener('orientationchange', () => {
    updateCellSize();
    drawBoard();
});
updateCellSize();

// Colores para las figuras
const COLORS = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22', '#1abc9c'];

// Figuras geométricas básicas (tipo Tetris y otras)
const SHAPES = [
    // Cuadrado
    [
        [1, 1],
        [1, 1]
    ],
    // Línea
    [
        [1, 1, 1, 1]
    ],
    // L
    [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    // Z
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    // T
    [
        [1, 1, 1],
        [0, 1, 0]
    ],
    // Triángulo
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    // S
    [
        [0, 1, 1],
        [1, 1, 0]
    ]
];

// Tablero vacío
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Figura actual
let current = null;
let currentColor = null;
let currentX = 0;
let currentY = 0;
let placedFigures = 0;

function randomShape() {
    const idx = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[idx].map(row => [...row]),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
}

function spawnFigure() {
    const { shape, color } = randomShape();
    current = shape;
    currentColor = color;
    currentX = Math.floor((COLS - current[0].length) / 2);
    currentY = 0;
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeStyle = '#222';
    ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateCellSize();
    // Dibujar tablero
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawCell(x, y, board[y][x]);
            }
        }
    }
    // Dibujar figura actual
    if (current) {
        for (let y = 0; y < current.length; y++) {
            for (let x = 0; x < current[y].length; x++) {
                if (current[y][x]) {
                    drawCell(currentX + x, currentY + y, currentColor);
                }
            }
        }
    }
}

function canMove(dx, dy, shape = current) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                let nx = currentX + x + dx;
                let ny = currentY + y + dy;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
                if (ny >= 0 && board[ny][nx]) return false;
            }
        }
    }
    return true;
}

function mergeToBoard() {
    for (let y = 0; y < current.length; y++) {
        for (let x = 0; x < current[y].length; x++) {
            if (current[y][x]) {
                board[currentY + y][currentX + x] = currentColor;
            }
        }
    }
    placedFigures++;
}

function rotate(shape) {
    // Rotar matriz 90°
    return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
}

function tryRotate() {
    const rotated = rotate(current);
    if (canMove(0, 0, rotated)) {
        current = rotated;
        drawBoard();
    }
}

function drop() {
    if (canMove(0, 1)) {
        currentY++;
    } else {
        mergeToBoard();
        if (placedFigures < 20) {
            spawnFigure();
        } else {
            setTimeout(() => alert('¡Has acomodado 20 figuras!'), 100);
        }
    }
    drawBoard();
}

function gameLoop() {
    if (placedFigures < 20) {
        drop();
        setTimeout(gameLoop, 500);
    }
}

canvas.addEventListener('click', tryRotate);

// Iniciar juego
spawnFigure();
drawBoard();
gameLoop();

// Redibujar al cambiar tamaño
window.addEventListener('resize', drawBoard);
window.addEventListener('orientationchange', drawBoard);
