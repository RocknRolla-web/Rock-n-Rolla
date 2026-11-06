
(async function () {
    try {
        const { data, error } = await supabaseClient
            .from("site_settings")
            .select("active_theme")
            .eq("id", 1)
            .single();

        if (error || !data) {
            console.error("Не удалось загрузить тему:", error);
            return;
        }

        const theme = data.active_theme;
        const themes = {
            christmas: {
                css: "css/christmas.css",
                script: "js/christmas-theme.js"
            },
            march8: {
                css: "css/march8.css",
                script: "js/march8-theme.js"
            },
            birthday: {
                css: "css/birthday.css",
                script: "js/birthday-theme.js"
            }
        };

        document.body.classList.remove(
            "christmas-theme",
            "march8-theme",
            "birthday-theme"
        );

        if (theme === "classic") return;

        const selected = themes[theme];

        if (!selected) {
            console.warn("Неизвестная тема:", theme);
            return;
        }

        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = selected.css;
        document.head.appendChild(css);

        const script = document.createElement("script");
        script.src = selected.script;
        script.onerror = () => {
            console.error("Не удалось загрузить эффекты темы:", selected.script);
        };
        document.body.appendChild(script);

    } catch (error) {
        console.error("Ошибка загрузки темы:", error);
    }
})();
