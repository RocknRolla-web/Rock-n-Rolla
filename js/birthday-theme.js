
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

    if (data.active_theme !== "birthday") return;

    document.body.classList.add("birthday-theme");

    if (!data.effects_enabled) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = "birthdayConfetti";
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

    const colors = [
        "#ff5c8a",
        "#ffca55",
        "#65d6ff",
        "#a78bfa",
        "#65e6a5"
    ];

    // Редкое и ненавязчивое конфетти
    const confetti = Array.from({ length: 25 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 5 + 4,
        speed: Math.random() * 0.6 + 0.3,
        drift: Math.random() * 0.5 - 0.25,
        rotation: Math.random() * Math.PI,
        rotationSpeed: Math.random() * 0.025 - 0.012,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    // Небольшое количество серпантина
    const streamers = Array.from({ length: 5 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height - height,
        length: Math.random() * 70 + 65,
        speed: Math.random() * 0.45 + 0.3,
        drift: Math.random() * 0.4 - 0.2,
        wave: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    function drawConfetti(piece) {
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.65);
        ctx.restore();
    }

    function drawStreamer(item, time) {
        ctx.save();

        ctx.beginPath();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";

        for (let i = 0; i <= item.length; i += 2) {
            const x = item.x
    + Math.sin(i * 0.16 + item.wave + time * 0.001) * 10
    + Math.sin(i * 0.07 + item.wave) * 4;
            const y = item.y + i;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
        ctx.restore();
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        confetti.forEach(piece => {
            piece.y += piece.speed;
            piece.x += piece.drift;
            piece.rotation += piece.rotationSpeed;

            if (piece.y > height + 15) {
                piece.y = -15;
                piece.x = Math.random() * width;
            }

            if (piece.x > width + 10) piece.x = -10;
            if (piece.x < -10) piece.x = width + 10;

            drawConfetti(piece);
        });

        streamers.forEach(item => {
            item.y += item.speed;
            item.x += item.drift;

            if (item.y > height + item.length) {
                item.y = -item.length - Math.random() * height;
                item.x = Math.random() * width;
            }

            if (item.x > width + 10) item.x = -10;
            if (item.x < -10) item.x = width + 10;

            drawStreamer(item, time);
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();
