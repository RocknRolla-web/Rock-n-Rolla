document.addEventListener("DOMContentLoaded", async () => {
    const status = document.getElementById("quizStatus");
    const form = document.getElementById("quizForm");
    const questionList = document.getElementById("quizQuestionList");

    const questionId = document.getElementById("questionId");
    const questionType = document.getElementById("questionType");
    const mediaFile = document.getElementById("mediaFile");
    const mediaPreview = document.getElementById("mediaPreview");
    const questionText = document.getElementById("questionText");
    const correctAnswer = document.getElementById("correctAnswer");
    const explanation = document.getElementById("explanation");
    const displayOrder = document.getElementById("displayOrder");
    const isPublished = document.getElementById("isPublished");

    const saveButton = document.getElementById("saveQuestionBtn");
    const cancelButton = document.getElementById("cancelEditBtn");
    const formTitle = document.getElementById("formTitle");

    const answerInputs = [
        document.getElementById("answer1"),
        document.getElementById("answer2"),
        document.getElementById("answer3"),
        document.getElementById("answer4"),
        document.getElementById("answer5")
    ];

    let questions = [];
    let currentMediaUrl = "";

    function showStatus(message, isError = false) {
        status.textContent = message;
        status.style.color = isError ? "#ff7777" : "#ffbd4a";
    }

    function getMediaTypeLabel(type) {
        return {
            audio: "🎵 Аудио",
            image: "🖼️ Изображение",
            video: "🎬 Видео",
            text: "📝 Текстовый вопрос"
        }[type] || type;
    }

    function updateMediaField() {
        const isText = questionType.value === "text";

        mediaFile.disabled = isText;

        if (isText) {
            mediaFile.value = "";
            currentMediaUrl = "";
            mediaPreview.innerHTML = "";
        } else {
            renderPreview(currentMediaUrl, questionType.value);
        }
    }

    function renderPreview(url, type) {
        mediaPreview.innerHTML = "";

        if (!url || type === "text") return;

        let element;

        if (type === "image") {
            element = document.createElement("img");
            element.alt = "Предпросмотр изображения";
        } else if (type === "video") {
            element = document.createElement("video");
            element.controls = true;
            element.playsInline = true;
        } else {
            element = document.createElement("audio");
            element.controls = true;
        }

        element.src = url;
        element.className = "quiz-preview";
        mediaPreview.appendChild(element);
    }

    function updateCorrectAnswers() {
        const previousValue = correctAnswer.value;
        const answers = answerInputs.map(input => input.value.trim());

        correctAnswer.innerHTML = "";

        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "Выбери правильный ответ";
        correctAnswer.appendChild(emptyOption);

        answers.forEach((answer, index) => {
            if (!answer) return;

            const option = document.createElement("option");
            option.value = answer;
            option.textContent = `${index + 1}. ${answer}`;
            correctAnswer.appendChild(option);
        });

        if (answers.includes(previousValue)) {
            correctAnswer.value = previousValue;
        }
    }

    answerInputs.forEach(input => {
        input.addEventListener("input", updateCorrectAnswers);
    });

    questionType.addEventListener("change", () => {
        mediaFile.value = "";
        updateMediaField();
    });

    mediaFile.addEventListener("change", () => {
        const file = mediaFile.files[0];

        if (!file) {
            renderPreview(currentMediaUrl, questionType.value);
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            showStatus("Файл слишком большой. Максимальный размер — 50 МБ.", true);
            mediaFile.value = "";
            return;
        }

        const validTypes = {
            audio: ["audio/mpeg", "audio/mp3"],
            image: ["image/jpeg", "image/png", "image/webp"],
            video: ["video/mp4", "video/webm"]
        };

        if (
            !validTypes[questionType.value] ||
            !validTypes[questionType.value].includes(file.type)
        ) {
            showStatus("Формат файла не подходит для выбранного типа вопроса.", true);
            mediaFile.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        renderPreview(previewUrl, questionType.value);
    });

    async function checkAdminAccess() {
        const { data: authData, error: authError } =
            await supabaseClient.auth.getUser();

        if (authError || !authData.user) {
            throw new Error("Сначала войди в аккаунт администратора.");
        }

        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("role")
            .eq("user_id", authData.user.id)
            .single();

        if (
            profileError ||
            !profile ||
            !["owner", "admin", "editor"].includes(profile.role)
        ) {
            throw new Error("У тебя нет доступа к управлению квизом.");
        }

        const { data: assurance, error: assuranceError } =
            await supabaseClient.auth.mfa.getAuthenticatorAssuranceLevel();

        if (assuranceError) {
            throw new Error("Не удалось проверить MFA. Попробуй войти заново.");
        }

        if (assurance.currentLevel !== "aal2") {
            throw new Error("Для управления квизом необходимо подтвердить MFA.");
        }
    }

    async function loadQuestions() {
        const { data, error } = await supabaseClient
            .from("quiz_questions")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) throw error;

        questions = data || [];
        renderQuestions();
    }

    function renderQuestions() {
        questionList.innerHTML = "";

        if (questions.length === 0) {
            questionList.innerHTML =
                '<p class="quiz-empty">Пока нет вопросов.</p>';
            return;
        }

        questions.forEach(question => {
            const item = document.createElement("div");
            item.className = "quiz-item";

            const title = document.createElement("div");
            title.className = "quiz-item-title";
            title.textContent = question.question_text;

            const meta = document.createElement("div");
            meta.className = "quiz-item-meta";
            meta.textContent =
                `${getMediaTypeLabel(question.question_type)} · ` +
                `№ ${question.display_order} · ` +
                (question.is_published ? "Опубликован" : "Скрыт");

            const actions = document.createElement("div");
            actions.className = "quiz-item-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Редактировать";
            editButton.addEventListener("click", () => editQuestion(question.id));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Удалить";
            deleteButton.className = "delete-btn";
            deleteButton.addEventListener("click", () => deleteQuestion(question.id));

            actions.append(editButton, deleteButton);
            item.append(title, meta, actions);
            questionList.appendChild(item);
        });
    }

    function resetForm() {
        form.reset();

        questionId.value = "";
        currentMediaUrl = "";
        mediaPreview.innerHTML = "";
        formTitle.textContent = "Новый вопрос";
        saveButton.textContent = "Сохранить вопрос";
        displayOrder.value = Math.max(1, questions.length + 1);
        isPublished.checked = true;

        updateMediaField();
        updateCorrectAnswers();
    }

    function editQuestion(id) {
        const question = questions.find(item => item.id === id);
        if (!question) return;

        questionId.value = question.id;
        questionType.value = question.question_type;
        currentMediaUrl = question.media_url || "";
        questionText.value = question.question_text;
        explanation.value = question.explanation || "";
        displayOrder.value = question.display_order;
        isPublished.checked = question.is_published;

        answerInputs.forEach((input, index) => {
            input.value = question.answers[index] || "";
        });

        updateCorrectAnswers();
        correctAnswer.value = question.correct_answer;

        updateMediaField();

        formTitle.textContent = "Редактирование вопроса";
        saveButton.textContent = "Сохранить изменения";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function uploadMedia(file) {
        const extension = file.name.split(".").pop().toLowerCase();
        const uniqueId = crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const safeName = `${Date.now()}-${uniqueId}.${extension}`;
        const path = `quiz/${safeName}`;

        const { error } = await supabaseClient.storage
            .from("quiz-media")
            .upload(path, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            });

        if (error) throw error;

        const { data } = supabaseClient.storage
            .from("quiz-media")
            .getPublicUrl(path);

        return data.publicUrl;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        saveButton.disabled = true;
        showStatus("Сохраняем вопрос...");

        try {
            const answers = answerInputs.map(input => input.value.trim());

            if (answers.some(answer => !answer)) {
                throw new Error("Заполни все пять вариантов ответа.");
            }

            if (new Set(answers).size !== 5) {
                throw new Error("Варианты ответов должны отличаться друг от друга.");
            }

            if (!answers.includes(correctAnswer.value)) {
                throw new Error("Выбери правильный ответ из пяти вариантов.");
            }

            const existingQuestion = questions.find(
                item => item.id === questionId.value
            );

            let mediaUrl = questionType.value === "text"
                ? ""
                : currentMediaUrl;

            const file = mediaFile.files[0];

            if (questionType.value !== "text" && file) {
                mediaUrl = await uploadMedia(file);
            }

            if (
                questionType.value !== "text" &&
                !mediaUrl &&
                !existingQuestion
            ) {
                throw new Error("Для этого типа вопроса нужно загрузить медиафайл.");
            }

            const questionData = {
                question_type: questionType.value,
                media_url: mediaUrl,
                question_text: questionText.value.trim(),
                answers,
                correct_answer: correctAnswer.value,
                explanation: explanation.value.trim(),
                display_order: Number(displayOrder.value),
                is_published: isPublished.checked,
                updated_at: new Date().toISOString()
            };

            let result;

            if (questionId.value) {
                result = await supabaseClient
                    .from("quiz_questions")
                    .update(questionData)
                    .eq("id", questionId.value);
            } else {
                result = await supabaseClient
                    .from("quiz_questions")
                    .insert(questionData);
            }

            if (result.error) throw result.error;

            showStatus("Вопрос успешно сохранён!");
            resetForm();
            await loadQuestions();

        } catch (error) {
            console.error(error);
            showStatus(error.message || "Не удалось сохранить вопрос.", true);
        } finally {
            saveButton.disabled = false;
        }
    });

    async function deleteQuestion(id) {
        const question = questions.find(item => item.id === id);
        if (!question) return;

        if (!confirm("Точно удалить этот вопрос?")) return;

        try {
            showStatus("Удаляем вопрос...");

            const { error } = await supabaseClient
                .from("quiz_questions")
                .delete()
                .eq("id", id);

            if (error) throw error;

            showStatus("Вопрос удалён.");
            resetForm();
            await loadQuestions();

        } catch (error) {
            console.error(error);
            showStatus(error.message || "Не удалось удалить вопрос.", true);
        }
    }

    cancelButton.addEventListener("click", resetForm);

    try {
        await checkAdminAccess();
        await loadQuestions();
        resetForm();
        showStatus("Доступ подтверждён. Можно управлять вопросами.");
    } catch (error) {
        console.error(error);
        showStatus(error.message || "Ошибка загрузки панели.", true);
        form.querySelectorAll("input, select, textarea, button")
            .forEach(element => element.disabled = true);
    }
});