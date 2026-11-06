
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
