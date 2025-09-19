// Espera a que el DOM esté cargado para empezar
document.addEventListener('DOMContentLoaded', () => {
    // Módulos de Matter.js que usaremos
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body, Vertices } = Matter;

    // --- Configuración del Escenario ---
    // Crear el motor de física
    const engine = Engine.create({
        // Aumentamos las iteraciones para hacer la simulación más estable y rígida,
        // lo que previene la deformación de las figuras.
        positionIterations: 10,
        velocityIterations: 8
    });
    const world = engine.world;

    // Crear el renderizador que dibujará en el canvas
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            // El tamaño se establecerá dinámicamente para ser adaptable
            wireframes: false, // Para que las figuras tengan colores sólidos
            background: '#ffffff'
        }
    });

    Render.run(render);

    // Crear y ejecutar el corredor que actualiza el motor
    const runner = Runner.create();
    Runner.run(runner, engine);

    // --- Creación de los Cuerpos ---
    // Variables para guardar las paredes y poder actualizarlas
    let ground, wallLeft, wallRight;
    const wallThickness = 50; // Grosor de las paredes invisibles

    // Paleta de colores para las figuras
    const colores = [
        '#ff6347', '#4682b4', '#9370db', '#ffa500', '#3cb371',
        '#ee82ee', '#20b2aa', '#cd5c5c', '#ffd700', '#6a5acd'
    ];

    // Función para obtener un color aleatorio
    const getRandomColor = () => colores[Math.floor(Math.random() * colores.length)];

    // Función para obtener una posición X aleatoria dentro del canvas actual
    const getRandomX = () => Math.random() * (render.options.width - 100) + 50;


    // Crear las 10 figuras geométricas
    const figuras = [];

    // Función para crear una figura geométrica aleatoria
    function crearFiguraAleatoria() {
        const tipo = Math.floor(Math.random() * 10);
        const color = getRandomColor();
        const sombra = {
            fillStyle: color,
            shadowColor: color,
            shadowBlur: 24,
            strokeStyle: '#fff',
            lineWidth: 2
        };
        // Propiedades físicas pesadas y poco elásticas
        const fisica = {
            render: sombra,
            density: 0.08, // más pesado
            restitution: 0.05, // poco rebote
            friction: 0.8, // mucha fricción
            frictionAir: 0.08 // fricción con el aire
        };
        switch (tipo) {
            case 0: // Cuadrado
                return Bodies.rectangle(getRandomX(), 80, 80, 80, fisica);
            case 1: // Círculo
                return Bodies.circle(getRandomX(), 80, 40, fisica);
            case 2: // Rectángulo
                return Bodies.rectangle(getRandomX(), 80, 100, 60, fisica);
            case 3: // Triángulo
                return Bodies.fromVertices(getRandomX(), 80, [
                    { x: 0, y: -45 }, { x: 45, y: 45 }, { x: -45, y: 45 }
                ], fisica, true);
            case 4: // Pentágono
                return Bodies.polygon(getRandomX(), 80, 5, 45, fisica);
            case 5: // Hexágono
                return Bodies.polygon(getRandomX(), 80, 6, 40, fisica);
            case 6: // Octágono
                return Bodies.polygon(getRandomX(), 80, 8, 38, fisica);
            case 7: // Estrella
                // Estrella de 5 puntas
                const star = [];
                for (let i = 0; i < 10; i++) {
                    const r = i % 2 === 0 ? 40 : 18;
                    const a = Math.PI * 2 * i / 10 - Math.PI / 2;
                    star.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
                }
                return Bodies.fromVertices(getRandomX(), 80, [star], fisica, true);
            case 8: // L
                return Bodies.fromVertices(getRandomX(), 80, [[
                    { x: -40, y: -40 }, { x: 0, y: -40 }, { x: 0, y: 40 }, { x: 40, y: 40 }, { x: 40, y: 80 }, { x: -40, y: 80 }
                ]], fisica, true);
            case 9: // Trapecio
                return Bodies.fromVertices(getRandomX(), 80, [[
                    { x: -40, y: 40 }, { x: 40, y: 40 }, { x: 25, y: -40 }, { x: -25, y: -40 }
                ]], fisica, true);
        }
    }

    // Crear las 10 figuras iniciales
    for (let i = 0; i < 10; i++) {
        figuras.push(crearFiguraAleatoria());
    }

    // Agregar las figuras al mundo
    Composite.add(world, figuras);

    // Botón para crear una nueva figura
    document.getElementById('btn-nueva-figura').onclick = () => {
        const nueva = crearFiguraAleatoria();
        Composite.add(world, nueva);
    };

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
    function setupResponsiveCanvas() {
        // Ajustar el tamaño del renderizador al de la ventana
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        render.options.width = window.innerWidth;
        render.options.height = window.innerHeight;

        // Eliminar paredes viejas si existen
        if (ground) {
            Composite.remove(world, [ground, wallLeft, wallRight]);
        }

        // Crear nuevas paredes con las dimensiones de la ventana
        const wallOptions = { isStatic: true, render: { visible: false } };
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        ground = Bodies.rectangle(newWidth / 2, newHeight + (wallThickness / 2), newWidth, wallThickness, wallOptions);
        wallLeft = Bodies.rectangle(-(wallThickness / 2), newHeight / 2, wallThickness, newHeight, wallOptions);
        wallRight = Bodies.rectangle(newWidth + (wallThickness / 2), newHeight / 2, wallThickness, newHeight, wallOptions);

        Composite.add(world, [ground, wallLeft, wallRight]);
    }

    window.addEventListener('resize', setupResponsiveCanvas);
    setupResponsiveCanvas(); // Llamada inicial para configurar el escenario
});
