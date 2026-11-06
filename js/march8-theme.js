
(async function () {
    const { data, error } = await supabaseClient
        .from("site_settings")
        .select("active_theme, effects_enabled")
        .eq("id", 1)
        .single();

    if (error || !data) {
        console.error("Не удалось загрузить настройки темы:", error);
        return;
    }

    if (data.active_theme !== "march8") return;

    document.body.classList.add("march8-theme");

    if (!data.effects_enabled) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = "march8Petals";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    let width;
    let height;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const flowers = Array.from({ length: 35 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 5,
        speed: Math.random() * 0.8 + 0.5,
        drift: Math.random() * 0.8 - 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.02 - 0.01,
        color: [
            "#ff9ecb",
            "#ffb6d9",
            "#f47fb5",
            "#ffd1e6"
        ][Math.floor(Math.random() * 4)]
    }));

    function drawFlower(flower) {
        ctx.save();

        ctx.translate(flower.x, flower.y);
        ctx.rotate(flower.rotation);
        ctx.fillStyle = flower.color;

        // Пять маленьких лепестков
        for (let i = 0; i < 5; i++) {
            ctx.rotate((Math.PI * 2) / 5);

            ctx.beginPath();
            ctx.ellipse(
                0,
                -flower.size * 0.65,
                flower.size * 0.35,
                flower.size * 0.65,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Серединка цветка
        ctx.beginPath();
        ctx.arc(0, 0, flower.size * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "#ffe58a";
        ctx.fill();

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        flowers.forEach(flower => {
            flower.y += flower.speed;
            flower.x += flower.drift;
            flower.rotation += flower.rotationSpeed;

            if (flower.y > height + 20) {
                flower.y = -20;
                flower.x = Math.random() * width;
            }

            if (flower.x > width + 20) flower.x = -20;
            if (flower.x < -20) flower.x = width + 20;

            drawFlower(flower);
        });

        requestAnimationFrame(animate);
    }

    animate();
})();
