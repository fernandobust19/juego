// --- Interacción: arrastrar, soltar y rotar figuras ---
let dragging = null;
let offsetX = 0;
let offsetY = 0;

canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('touchstart', onPointerDown, { passive: false });
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove, { passive: false });
canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('mouseleave', onPointerUp);
canvas.addEventListener('touchend', onPointerUp);

function getPointerPos(evt) {
    if (evt.touches && evt.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.touches[0].clientX - rect.left,
            y: evt.touches[0].clientY - rect.top
        };
    } else {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
}

function figuraEnPunto(x, y) {
    // Busca la figura más cercana bajo el puntero
    for (let i = figuras.length - 1; i >= 0; i--) {
        const f = figuras[i];
        if (Math.hypot(f.x - x, f.y - y) < 32) return i;
    }
    return -1;
}

function onPointerDown(evt) {
    evt.preventDefault();
    const pos = getPointerPos(evt);
    const idx = figuraEnPunto(pos.x, pos.y);
    if (idx !== -1) {
        // Si es doble click/tap rápido, rotar
        if (evt.detail === 2 || (evt.touches && evt.touches.length === 2)) {
            rotarFigura(idx);
            drawBoard();
            return;
        }
        dragging = idx;
        offsetX = figuras[idx].x - pos.x;
        offsetY = figuras[idx].y - pos.y;
        // Llevar figura al frente
        const f = figuras.splice(idx, 1)[0];
        figuras.push(f);
        drawBoard();
    }
}

function onPointerMove(evt) {
    if (dragging === null) return;
    evt.preventDefault();
    const pos = getPointerPos(evt);
    const f = figuras[dragging];
    let newX = pos.x + offsetX;
    let newY = pos.y + offsetY;
    // Limitar dentro de la olla (boquete)
    const radioFigura = 28;
    let ang = Math.atan2(newY - PECERA_CY(), newX - PECERA_CX());
    if (ang < 0) ang += 2 * Math.PI;
    const angMin = Math.PI * 0.17;
    const angMax = Math.PI * 1.83;
    let dist = Math.hypot(newX - PECERA_CX(), newY - PECERA_CY());
    if (ang < angMin || ang > angMax || dist + radioFigura > PECERA_RADIO()) {
        // No dejar salir
        return;
    }
    // Checar colisión con otras figuras
    for (let i = 0; i < figuras.length; i++) {
        if (i === dragging) continue;
        let d = Math.hypot(figuras[i].x - newX, figuras[i].y - newY);
        if (d < radioFigura * 1.7) return;
    }
    f.x = newX;
    f.y = newY;
    drawBoard();
}

function onPointerUp(evt) {
    dragging = null;
}

function rotarFigura(idx) {
    // Agrega un ángulo de rotación a la figura
    if (!figuras[idx].rot) figuras[idx].rot = 0;
    figuras[idx].rot += Math.PI / 2;
}
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

// Inicializar 20 figuras dentro de la pecera, bien distribuidas y sin salir del borde
function inicializarFiguras() {
    figuras = [];
    const tipos = ['circulo', 'cuadrado', 'octagono', 'estrella', 'ele'];
    const colores = [
        '#FFB300', '#FF7043', '#29B6F6', '#AB47BC', '#66BB6A',
        '#EC407A', '#FFA726', '#26C6DA', '#D4E157', '#8D6E63',
    ];
    const radioFigura = 28; // radio máximo de cada figura
    const total = 20;
    let intentos = 0;
    while (figuras.length < total && intentos < 1000) {
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const color = colores[Math.floor(Math.random() * colores.length)];
        // Posición aleatoria dentro del círculo, dejando margen para no salir
        let r = Math.random() * (PECERA_RADIO() - radioFigura - 6);
        let theta = Math.random() * 2 * Math.PI;
        let x = PECERA_CX() + r * Math.cos(theta);
        let y = PECERA_CY() + r * Math.sin(theta);
        // Verificar que no se salga del borde
        if (Math.hypot(x - PECERA_CX(), y - PECERA_CY()) + radioFigura > PECERA_RADIO()) {
            intentos++;
            continue;
        }
        // Verificar que no se superponga mucho con otras figuras
        let overlap = figuras.some(f => Math.hypot(f.x - x, f.y - y) < radioFigura * 1.7);
        if (overlap) {
            intentos++;
            continue;
        }
        figuras.push({ tipo, color, x, y, enTablero: true });
        intentos = 0;
    }
}

function drawPecera() {
    // Fondo circular con boquete arriba (olla)
    ctx.save();
    // Dibuja la "pecera" (olla) con boquete
    ctx.beginPath();
    // Arco inferior (de 30° a 330°)
    ctx.arc(PECERA_CX(), PECERA_CY(), PECERA_RADIO(), Math.PI * 0.17, Math.PI * 1.83, false);
    ctx.lineTo(PECERA_CX() + PECERA_RADIO() * Math.cos(Math.PI * 1.83), PECERA_CY() + PECERA_RADIO() * Math.sin(Math.PI * 1.83));
    ctx.lineTo(PECERA_CX() + PECERA_RADIO() * Math.cos(Math.PI * 0.17), PECERA_CY() + PECERA_RADIO() * Math.sin(Math.PI * 0.17));
    ctx.closePath();
    ctx.fillStyle = 'rgba(80,180,255,0.13)';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#4fc3f7';
    ctx.stroke();
    // Borde superior (boquete)
    ctx.beginPath();
    ctx.arc(PECERA_CX(), PECERA_CY(), PECERA_RADIO(), Math.PI * 0.17, Math.PI * 1.83, false);
    ctx.lineWidth = 13;
    ctx.strokeStyle = '#b3e5fc';
    ctx.shadowColor = '#b3e5fc';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPecera();
    // Dibujar figuras
    for (const f of figuras) {
        drawFigura(f);
    }
// Dibuja una figura geométrica bonita según su tipo
function drawFigura(fig) {
    const size = 28;
    ctx.save();
    ctx.translate(fig.x, fig.y);
    ctx.rotate(fig.rot || 0);
    ctx.shadowColor = '#222a';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 3;
    switch (fig.tipo) {
        case 'circulo':
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, 2 * Math.PI);
            ctx.fillStyle = fig.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            break;
        case 'cuadrado':
            ctx.beginPath();
            ctx.moveTo(-size, -size);
            ctx.lineTo(size, -size);
            ctx.lineTo(size, size);
            ctx.lineTo(-size, size);
            ctx.closePath();
            ctx.fillStyle = fig.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            break;
        case 'octagono':
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                let angle = Math.PI / 4 * i;
                let px = size * 0.95 * Math.cos(angle);
                let py = size * 0.95 * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = fig.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            break;
        case 'estrella':
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                let angle = Math.PI / 5 * i;
                let r = i % 2 === 0 ? size : size * 0.45;
                let px = r * Math.cos(angle - Math.PI / 2);
                let py = r * Math.sin(angle - Math.PI / 2);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = fig.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            break;
        case 'ele':
            ctx.beginPath();
            ctx.moveTo(-size * 0.7, -size * 0.7);
            ctx.lineTo(size * 0.2, -size * 0.7);
            ctx.lineTo(size * 0.2, -size * 0.1);
            ctx.lineTo(size * 0.7, -size * 0.1);
            ctx.lineTo(size * 0.7, size * 0.7);
            ctx.lineTo(-size * 0.7, size * 0.7);
            ctx.closePath();
            ctx.fillStyle = fig.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            break;
    }
    ctx.restore();
}
}

inicializarFiguras();
drawBoard();
