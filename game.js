// game.js
// Lógica inicial para el juego de figuras geométricas


const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');


// --- NUEVA LÓGICA: piezas estáticas y arrastrables ---

// Configuración del tablero circular (pecera)
const PECERA_RADIO = () => canvas.width / 2 * 0.95; // 95% del radio del canvas
const PECERA_CX = () => canvas.width / 2;
const PECERA_CY = () => canvas.height / 2;

// Estructura de figura: { tipo, color, x, y, enTablero }
let figuras = [];

// Inicializar 15 figuras en la pecera y 5 fuera
function inicializarFiguras() {
    figuras = [];
    // Tipos posibles
    const tipos = ['circulo', 'cuadrado', 'octagono', 'estrella', 'ele'];
    const colores = [
        '#FFB300', // amarillo
        '#FF7043', // naranja
        '#29B6F6', // azul
        '#AB47BC', // violeta
        '#66BB6A', // verde
        '#EC407A', // rosa
        '#FFA726', // naranja claro
        '#26C6DA', // celeste
        '#D4E157', // lima
        '#8D6E63', // marrón
    ];
    // 15 en la pecera
    for (let i = 0; i < 15; i++) {
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const color = colores[Math.floor(Math.random() * colores.length)];
        // Posición aleatoria dentro del círculo
        let r = Math.random() * (PECERA_RADIO() - 30);
        let theta = Math.random() * 2 * Math.PI;
        let x = PECERA_CX() + r * Math.cos(theta);
        let y = PECERA_CY() + r * Math.sin(theta);
        figuras.push({ tipo, color, x, y, enTablero: true });
    }
    // 5 fuera de la pecera (abajo)
    for (let i = 0; i < 5; i++) {
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const color = colores[Math.floor(Math.random() * colores.length)];
        let x = 40 + i * 60;
        let y = canvas.height - 30;
        figuras.push({ tipo, color, x, y, enTablero: false });
    }
}

function drawPecera() {
    // Fondo circular
    ctx.save();
    ctx.beginPath();
    ctx.arc(PECERA_CX(), PECERA_CY(), PECERA_RADIO(), 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(80,180,255,0.13)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#4fc3f7';
    ctx.stroke();
    ctx.restore();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPecera();
    // Aquí se dibujarán las figuras (en el siguiente paso)
}

inicializarFiguras();
drawBoard();
