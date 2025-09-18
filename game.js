// Espera a que el DOM esté cargado para empezar
document.addEventListener('DOMContentLoaded', () => {
    // Módulos de Matter.js que usaremos
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body, Vertices } = Matter;

    // --- Configuración del Escenario ---
    const canvasWidth = 400; // Ancho reducido para adaptarse a móviles
    const canvasHeight = 600; // Altura mantenida para un formato vertical

    // Crear el motor de física
    const engine = Engine.create();
    const world = engine.world;

    // Crear el renderizador que dibujará en el canvas
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: false, // Para que las figuras tengan colores sólidos
            background: '#ffffff'
        }
    });

    Render.run(render);

    // Crear y ejecutar el corredor que actualiza el motor
    const runner = Runner.create();
    Runner.run(runner, engine);

    // --- Creación de los Cuerpos (Figuras y Límites) ---

    // Crear el suelo y las paredes para que las figuras no se caigan
    const wallOptions = {
        isStatic: true, // Estático: no se mueve por la gravedad
        render: { fillStyle: '#f0f2f5' } // Color que coincide con el fondo
    };
    Composite.add(world, [
        // Suelo
        Bodies.rectangle(canvasWidth / 2, canvasHeight, canvasWidth, 50, wallOptions),
        // Pared izquierda
        Bodies.rectangle(0, canvasHeight / 2, 50, canvasHeight, wallOptions),
        // Pared derecha
        Bodies.rectangle(canvasWidth, canvasHeight / 2, 50, canvasHeight, wallOptions)
    ]);

    // Paleta de colores para las figuras
    const colores = [
        '#ff6347', '#4682b4', '#9370db', '#ffa500', '#3cb371',
        '#ee82ee', '#20b2aa', '#cd5c5c', '#ffd700', '#6a5acd'
    ];

    // Función para obtener un color aleatorio
    const getRandomColor = () => colores[Math.floor(Math.random() * colores.length)];

    // Función para obtener una posición X aleatoria dentro del canvas
    const getRandomX = () => Math.random() * (canvasWidth - 100) + 50;

    // Crear las 10 figuras geométricas
    const figuras = [];

    // 1. Cuadrado
    figuras.push(Bodies.rectangle(getRandomX(), 100, 80, 80, { render: { fillStyle: getRandomColor() } }));

    // 2. Círculo
    figuras.push(Bodies.circle(getRandomX(), 100, 40, { render: { fillStyle: getRandomColor() } }));

    // 3. Rectángulo (simulando el óvalo)
    figuras.push(Bodies.rectangle(getRandomX(), 100, 100, 60, { render: { fillStyle: getRandomColor() } }));

    // 4. Triángulo
    figuras.push(Bodies.polygon(getRandomX(), 100, 3, 50, { render: { fillStyle: getRandomColor() } }));

    // 5. Trapecio
    figuras.push(Bodies.trapezoid(getRandomX(), 100, 80, 80, 0.8, { render: { fillStyle: getRandomColor() } }));

    // 6. Rombo (un cuadrado rotado)
    const rombo = Bodies.rectangle(getRandomX(), 100, 70, 70, { render: { fillStyle: getRandomColor() } });
    Body.rotate(rombo, Math.PI / 4);
    figuras.push(rombo);

    // 7. Pentágono
    figuras.push(Bodies.polygon(getRandomX(), 50, 5, 45, { render: { fillStyle: getRandomColor() } }));

    // 8. Hexágono
    figuras.push(Bodies.polygon(getRandomX(), 50, 6, 50, { render: { fillStyle: getRandomColor() } }));

    // 9. Estrella
    const starVertices = Vertices.fromPath('50 0 61 35 98 35 68 57 79 91 50 70 21 91 32 57 2 35 39 35');
    figuras.push(Bodies.fromVertices(getRandomX(), 50, [starVertices], {
        render: { fillStyle: getRandomColor() }
    }, true));

    // 10. Cruz (cuerpo compuesto)
    const parteVertical = Bodies.rectangle(0, 0, 30, 90);
    const parteHorizontal = Bodies.rectangle(0, 0, 90, 30);
    const cruz = Body.create({
        parts: [parteVertical, parteHorizontal],
        render: { fillStyle: getRandomColor() }
    });
    Body.setPosition(cruz, { x: getRandomX(), y: 50 });
    figuras.push(cruz);

    // Añadir todas las figuras al mundo
    Composite.add(world, figuras);

    // --- Interacción del Usuario ---

    // Añadir control del ratón para poder arrastrar las figuras
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false // No mostrar la línea de arrastre
            }
        }
    });

    Composite.add(world, mouseConstraint);

    // Mantener el renderizador sincronizado con el ratón
    render.mouse = mouse;

    // --- Lógica mejorada para rotar al hacer clic ---
    let startBody = null;
    let startPos = null;

    Events.on(mouseConstraint, 'mousedown', (event) => {
        // Guarda la figura y la posición al iniciar el clic
        startBody = mouseConstraint.body;
        startPos = event.mouse.position;
    });

    Events.on(mouseConstraint, 'mouseup', (event) => {
        if (startBody) {
            const endPos = event.mouse.position;
            // Calcula la distancia que se movió el mouse
            const distance = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y);

            // Si el mouse casi no se movió y la figura es la misma, es un "clic"
            if (mouseConstraint.body === startBody && distance < 5) {
                // Rotamos la figura 45 grados sobre su propio eje
                Body.rotate(startBody, Math.PI / 4);
            }
        }
        // Limpia las variables
        startBody = null;
        startPos = null;
    });

    // Ajustar el canvas al tamaño de la ventana
    function resizeCanvas() {
        // Esta función puede expandirse en el futuro para un redimensionamiento dinámico
        // Por ahora, el tamaño fijo funciona bien para el objetivo.
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Llamada inicial
});
