(async function () {
    const { data, error } = await supabaseClient
        .from("site_settings")
        .select("active_theme, effects_enabled")
        .eq("id", 1)
        .single();

    if (error) {
        console.error("Не удалось загрузить тему:", error.message);
        return;
    }

    const isChristmas =
        data.active_theme === "christmas";

    document.body.classList.toggle(
        "christmas-theme",
        isChristmas
    );

    if (!isChristmas || !data.effects_enabled) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = "christmasSnow";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);
    resize();

    const flakes = Array.from({ length: 75 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        speed: Math.random() * 1 + 0.5,
        drift: Math.random() * 0.7 - 0.35
    }));

    function animate() {
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "rgba(255,255,255,0.85)";

        for (const flake of flakes) {
            ctx.beginPath();
            ctx.arc(
                flake.x,
                flake.y,
                flake.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();

            flake.y += flake.speed;
            flake.x += flake.drift;

            if (flake.y > height) {
                flake.y = -5;
                flake.x = Math.random() * width;
            }

            if (flake.x > width) flake.x = 0;
            if (flake.x < 0) flake.x = width;
        }

        requestAnimationFrame(animate);
    }

    animate();
})();