
async function loadPublicEvents() {
    const container = document.getElementById("gamesGrid");

    if (!container) return;

    try {
        const { data: allEvents, error } = await supabaseClient
            .from("events")
            .select("*")
            .eq("is_published", true)
            .order("event_date", { ascending: true });

        if (error) throw error;

        const now = new Date();

        // Оставляем прошедшие игры до полуночи следующего дня по Минску
        const events = (allEvents || []).filter(event => {
            const date = new Date(event.event_date);

            const parts = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Europe/Minsk",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).formatToParts(date);

            const year = Number(parts.find(p => p.type === "year").value);
            const month = Number(parts.find(p => p.type === "month").value);
            const day = Number(parts.find(p => p.type === "day").value);

            const nextMidnight =
                Date.UTC(year, month - 1, day + 1) - 3 * 60 * 60 * 1000;

            return now.getTime() < nextMidnight;
        });

        container.innerHTML = "";

        if (events.length === 0) {
            container.innerHTML = "<p>ПОКА НЕТ БЛИЖАЙШИХ ИГР. СЛЕДИТЕ ЗА ОБНОВЛЕНИЯМИ!</p>";
            return;
        }

        events.forEach(event => {
            const date = new Date(event.event_date);

            const formattedDate = new Intl.DateTimeFormat("ru-RU", {
                weekday: "short",
                day: "numeric",
                month: "long",
                timeZone: "Europe/Minsk"
            }).format(date).toUpperCase();

            const formattedTime = new Intl.DateTimeFormat("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Minsk"
            }).format(date);

            const card = document.createElement("article");
            card.className = "game-card";

            const thumb = document.createElement("div");
            thumb.className = "thumb";

            const img = document.createElement("img");
            img.src = event.cover_image_url || "images/game1.jpg";
            img.alt = event.title || "Мероприятие";
            img.loading = "lazy";

            thumb.appendChild(img);

            const body = document.createElement("div");
            body.className = "game-body";

            const tag = document.createElement("span");
            tag.className = "tag";

            const title = document.createElement("h3");
            title.textContent = event.title || "Новое мероприятие";

            const description = document.createElement("p");
            description.textContent = event.description || "";

            const meta = document.createElement("ul");
            meta.className = "meta";

            function addMeta(label, value) {
                if (!value) return;

                const li = document.createElement("li");
                const b = document.createElement("b");
                const span = document.createElement("span");

                b.textContent = label;
                span.textContent = value;

                li.append(b, span);
                meta.appendChild(li);
            }

            addMeta("ДАТА", formattedDate);
            addMeta("МЕСТО", event.location);
            addMeta("ВРЕМЯ", formattedTime);

            body.append(tag, title);

            if (event.description) {
                body.appendChild(description);
            }

            body.appendChild(meta);

            if (event.registration_url) {
                const link = document.createElement("a");
                link.className = "btn btn-primary";
                link.href = event.registration_url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = "ЗАПИСАТЬСЯ";

                body.appendChild(link);
            }

            card.append(thumb, body);
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Ошибка загрузки мероприятий:", error);
        container.innerHTML = "<p>НЕ УДАЛОСЬ ЗАГРУЗИТЬ МЕРОПРИЯТИЯ.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadPublicEvents);


async function loadPublicFame() {
    const container = document.getElementById("fameGrid");

    if (!container) return;

    try {
        const { data, error } = await supabaseClient
            .from("hall_of_fame")
            .select("*")
            .eq("is_published", true)
            .order("display_order", { ascending: true })
            .limit(4);

        if (error) throw error;

        container.replaceChildren();

        if (!data || data.length === 0) {
            container.textContent = "ПОКА НЕТ ОПУБЛИКОВАННЫХ ПОБЕДИТЕЛЕЙ.";
            return;
        }

        data.forEach((winner, index) => {
            const card = document.createElement("article");
            card.className = "fame-card";

            const rank = document.createElement("div");
            rank.className = "rank";
            rank.textContent = "#" + String(index + 1).padStart(2, "0");

            const thumb = document.createElement("div");
            thumb.className = "thumb square";

            const img = document.createElement("img");
            img.src = winner.photo_url || "images/winner1.jpg";
            img.alt = winner.winner_name || "Победитель";
            img.loading = "lazy";

            thumb.appendChild(img);

            const title = document.createElement("h3");
            title.textContent = winner.winner_name || winner.title || "ПОБЕДИТЕЛЬ";

            const score = document.createElement("p");
            score.className = "score";
            score.textContent = "HIGH SCORE • " + (winner.score ?? 0) + " PTS";

            card.append(rank, thumb, title, score);

            if (winner.description) {
                const description = document.createElement("p");
                description.textContent = winner.description;
                card.appendChild(description);
            }

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Ошибка загрузки Hall of Fame:", error);
        container.textContent = "НЕ УДАЛОСЬ ЗАГРУЗИТЬ ПОБЕДИТЕЛЕЙ.";
    }
}

document.addEventListener("DOMContentLoaded", loadPublicFame);
