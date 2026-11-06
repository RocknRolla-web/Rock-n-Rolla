
(function () {
    async function trackVisit() {
        try {
            let visitorId = localStorage.getItem("rocknrolla_visitor_id");

            if (!visitorId) {
                visitorId = "visitor_" +
                    Date.now().toString(36) + "_" +
                    Math.random().toString(36).substring(2, 15);

                localStorage.setItem("rocknrolla_visitor_id", visitorId);
            }

            const pagePath = window.location.pathname;

            const { error } = await supabaseClient
                .from("site_visits")
                .insert({
                    page_path: pagePath,
                    session_id: visitorId
                });

            if (error) {
                console.error("Ошибка записи посещения:", error);
            } else {
                console.log("Посещение успешно записано!");
            }

        } catch (error) {
            console.error("Ошибка счётчика:", error);
        }
    }

    if (typeof supabaseClient !== "undefined") {
        trackVisit();
    } else {
        console.error("Supabase ещё не загружен!");
    }
})();
