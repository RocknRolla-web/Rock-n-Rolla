/* ===== Rock'n'Rolla — achievements system ===== */

(function () {
    "use strict";

    var STORAGE_KEY = "rnr_achievements_v1";

    var state = {
        unlocked: [],
        quizAttempts: 0,
        visitedPages: [],
        viewedPhotos: 0
    };

    function loadState() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

            if (saved && typeof saved === "object") {
                state.unlocked = Array.isArray(saved.unlocked) ? saved.unlocked : [];
                state.quizAttempts = Number(saved.quizAttempts) || 0;
                state.visitedPages = Array.isArray(saved.visitedPages) ? saved.visitedPages : [];
                state.viewedPhotos = Number(saved.viewedPhotos) || 0;
            }
        } catch (error) {
            console.warn("Не удалось загрузить достижения:", error);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.warn("Не удалось сохранить достижения:", error);
        }
    }

    function getAchievement(id) {
        return (window.RNR_ACHIEVEMENTS || []).find(function (item) {
            return item.id === id;
        });
    }

    function showNotification(achievement) {
        var old = document.querySelector(".rnr-achievement-notification");

        if (old) old.remove();

        var notification = document.createElement("div");
        notification.className = "rnr-achievement-notification";

        var image = document.createElement("img");
        image.src = achievement.image;
        image.alt = achievement.title;

        var content = document.createElement("div");
        content.className = "rnr-achievement-notification-content";

        var label = document.createElement("span");
        label.textContent = "ДОСТИЖЕНИЕ ПОЛУЧЕНО";

        var title = document.createElement("strong");
        title.textContent = achievement.title;

        content.appendChild(label);
        content.appendChild(title);

        notification.appendChild(image);
        notification.appendChild(content);

        document.body.appendChild(notification);

        requestAnimationFrame(function () {
            notification.classList.add("show");
        });

        var soundFiles = {
            common: "sounds/achievement-common.mp3",
            rare: "sounds/achievement-rare.mp3",
            legendary: "sounds/achievement-legendary.mp3"
        };

        var sound = new Audio(soundFiles[achievement.rarity] || soundFiles.common);
        sound.volume = 0.6;
        sound.play().catch(function () {});

        setTimeout(function () {
            notification.classList.remove("show");

            setTimeout(function () {
                notification.remove();
            }, 400);
        }, 4500);
    }

    function unlock(id) {
        if (state.unlocked.includes(id)) return false;

        var achievement = getAchievement(id);
        if (!achievement) return false;

        state.unlocked.push(id);
        saveState();
        showNotification(achievement);

        checkSecretHunter();

        return true;
    }

    function checkSecretHunter() {
        var secretIds = (window.RNR_ACHIEVEMENTS || [])
            .filter(function (item) {
                return item.secret === true && item.id !== "secret_hunter";
            })
            .map(function (item) {
                return item.id;
            });

        var allSecretsUnlocked = secretIds.every(function (id) {
            return state.unlocked.includes(id);
        });

        if (allSecretsUnlocked && secretIds.length > 0) {
            unlock("secret_hunter");
        }
    }

    function awardQuizResult(correct, total) {
        state.quizAttempts++;
        saveState();

        if (state.quizAttempts >= 1) {
            unlock("first_token");
        }

        if (state.quizAttempts >= 3) {
            unlock("repeat_player");
        }

        if (total > 0 && correct === total) {
            unlock("absolute_hearing");
        }

        if (total > 0 && correct === 0) {
            unlock("all_wrong");
        }
    }

    function trackPage() {

	// ===== ДЕНЬ РОЖДЕНИЯ ROCK'N'ROLLA =====

var today = new Date();

if (
    today.getMonth() === 5 &&
    today.getDate() === 25
) {
    unlock("rnr_birthday");
}
        var path = window.location.pathname.split("/").pop().toLowerCase();

        var pageMap = {
            "": "home",
            "index.html": "home",
            "news-public.html": "news",
            "news-detail.html": "news-detail",
            "all-time.html": "results",
            "gallery.html": "gallery"
        };

        var page = pageMap[path];


        if (!page) return;

        if (!state.visitedPages.includes(page)) {
            state.visitedPages.push(page);
            saveState();
        }

        var requiredPages = ["home", "news", "results", "gallery"];

        if (requiredPages.every(function (item) {
            return state.visitedPages.includes(item);
        })) {
            unlock("researcher");
        }

        if (page === "news-detail") {
            unlock("news_reader");
        }
    }

    function trackPhoto() {
        state.viewedPhotos++;
        saveState();

        if (state.viewedPhotos >= 1) {
            unlock("photographer");
        }
    }

    function trackContacts() {
        unlock("connected");
    }

    function getAchievements() {
        return (window.RNR_ACHIEVEMENTS || []).map(function (item) {
            return Object.assign({}, item, {
                unlocked: state.unlocked.includes(item.id)
            });
        });
    }

    function getProgress() {
        return {
            unlocked: state.unlocked.length,
            total: (window.RNR_ACHIEVEMENTS || []).length
        };
    }

    loadState();

    window.RNRAchievements = {
        unlock: unlock,
        awardQuizResult: awardQuizResult,
        trackPage: trackPage,
        trackPhoto: trackPhoto,
        trackContacts: trackContacts,
        getAchievements: getAchievements,
        getProgress: getProgress
    };

    document.addEventListener("DOMContentLoaded", function () {
    trackPage();

    /* ===== Секретная комбинация Konami ===== */

    var konamiCode = [
        "arrowup", "arrowup",
        "arrowdown", "arrowdown",
        "arrowleft", "arrowright",
        "arrowleft", "arrowright",
        "b", "a"
    ];

    var konamiPosition = 0;

    document.addEventListener("keydown", function (event) {
        if (
            event.target.matches("input, textarea, select") ||
            event.target.isContentEditable
        ) {
            return;
        }

        var pressedKey = event.key.toLowerCase();

        if (pressedKey === konamiCode[konamiPosition]) {
            konamiPosition++;
        } else {
            konamiPosition = pressedKey === konamiCode[0] ? 1 : 0;
        }

        if (konamiPosition === konamiCode.length) {
            unlock("konami_code");
            konamiPosition = 0;
        }
    });

    // Достижение за открытие контактов
    var contactsButton = document.getElementById("contactsButton");

    if (contactsButton) {
        contactsButton.addEventListener("click", function () {
            trackContacts();
        });
    }

    // Достижение за просмотр фотографии
    var gallery = document.querySelector("main");

    if (gallery && window.location.pathname.toLowerCase().includes("gallery")) {
        gallery.addEventListener("click", function (event) {
            if (event.target && event.target.tagName === "IMG") {
                trackPhoto();
            }
        });
    }
});
})();