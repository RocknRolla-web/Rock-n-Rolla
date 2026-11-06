
/* Rock'n'Rolla Quiz — игровая логика */
(function () {
  var questions = [];
  var index = 0;
  var score = 0;
  var answered = false;
  var quizCompleted = false;
  var el = {};

  function $(id) {
    return document.getElementById(id);
  }

  function clickSound() {
    if (window.RNR && window.RNR.click) window.RNR.click();
  }

  function fallback(text) {
    var d = document.createElement("div");
    d.className = "media-fallback";

    var label = document.createElement("span");
    label.className = "pixel";
    label.textContent = "НЕТ ФАЙЛА";

    var message = document.createElement("span");
    message.textContent = text;

    d.append(label, message);
    return d;
  }

  function mediaBlock(q) {
    var box = document.createElement("div");

    // Текстовый вопрос не требует медиафайла
    if (q.type === "text" || !q.file) return box;

    if (q.type === "image") {
      var img = document.createElement("img");
      img.className = "q-img";
      img.alt = "Кадр вопроса";
      img.src = q.file;

      img.onerror = function () {
        box.replaceChildren(
          fallback("Изображение пока не загружено")
        );
      };

      box.appendChild(img);
      return box;
    }

    
if (q.type === "video") {
    var player = document.createElement("div");
    player.className = "custom-video-player";

    var video = document.createElement("video");
    video.className = "q-video";
    video.playsInline = true;
    video.preload = "metadata";
    video.src = q.file;

    var controls = document.createElement("div");
    controls.className = "custom-video-controls";

    var playButton = document.createElement("button");
    playButton.className = "video-play";
    playButton.textContent = "▶";

    var time = document.createElement("span");
    time.className = "video-time";
    time.textContent = "0:00 / 0:00";

    var progress = document.createElement("input");
    progress.className = "video-progress";
    progress.type = "range";
    progress.min = "0";
    progress.max = "100";
    progress.value = "0";

    var volume = document.createElement("input");
    volume.className = "video-volume";
    volume.type = "range";
    volume.min = "0";
    volume.max = "1";
    volume.step = "0.05";
    volume.value = "1";

    var fullscreen = document.createElement("button");
    fullscreen.className = "video-fullscreen";
    fullscreen.textContent = "⛶";

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";
        var minutes = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return minutes + ":" + String(secs).padStart(2, "0");
    }

    playButton.onclick = function () {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    video.onplay = function () {
        playButton.textContent = "Ⅱ";
    };

    video.onpause = function () {
        playButton.textContent = "▶";
    };

    video.ontimeupdate = function () {
        if (video.duration) {
            progress.value = (video.currentTime / video.duration) * 100;
            time.textContent =
                formatTime(video.currentTime) + " / " +
                formatTime(video.duration);
        }
    };

    video.onloadedmetadata = function () {
        time.textContent =
            formatTime(0) + " / " + formatTime(video.duration);
    };

    progress.oninput = function () {
        if (video.duration) {
            video.currentTime = (progress.value / 100) * video.duration;
        }
    };

    volume.oninput = function () {
        video.volume = Number(volume.value);
    };

    fullscreen.onclick = function () {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (player.requestFullscreen) {
            player.requestFullscreen();
        }
    };

    video.onerror = function () {
        box.replaceChildren(fallback("Видео пока не загружено"));
    };

    controls.append(
        playButton,
        time,
        progress,
        volume,
        fullscreen
    );

    player.append(video, controls);
    box.appendChild(player);

    return box;
}


    if (q.type === "audio") {
      var audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.className = "q-audio";
      audio.setAttribute("playsinline", "");

      var source = document.createElement("source");
      source.src = q.file;
      source.type = "audio/mpeg";
      audio.appendChild(source);

      var player = document.createElement("div");
      player.className = "custom-audio";

      var playButton = document.createElement("button");
      playButton.className = "audio-play";
      playButton.type = "button";
      playButton.textContent = "▶";
      playButton.setAttribute("aria-label", "Воспроизвести");

      var info = document.createElement("div");
      info.className = "audio-info";

      var title = document.createElement("div");
      title.className = "audio-title";
      title.textContent = "AUDIO PLAYER";

      var timeline = document.createElement("input");
      timeline.className = "audio-timeline";
      timeline.type = "range";
      timeline.min = "0";
      timeline.max = "100";
      timeline.value = "0";

      var time = document.createElement("div");
      time.className = "audio-time";

      var currentTime = document.createElement("span");
      currentTime.textContent = "0:00";

      var duration = document.createElement("span");
      duration.textContent = "0:00";

      time.append(currentTime, duration);
      info.append(title, timeline, time);

      var volume = document.createElement("input");
      volume.className = "audio-volume";
      volume.type = "range";
      volume.min = "0";
      volume.max = "1";
      volume.step = "0.01";
      volume.value = "1";
      volume.setAttribute("aria-label", "Громкость");

      player.append(playButton, info, volume);
      box.append(player, audio);

      function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        var minutes = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);

        return minutes + ":" + String(secs).padStart(2, "0");
      }

      playButton.addEventListener("click", function () {
        if (audio.paused) {
          audio.play().catch(function () {
            playButton.textContent = "▶";
          });
        } else {
          audio.pause();
        }
      });

      audio.addEventListener("play", function () {
        playButton.textContent = "Ⅱ";
        playButton.setAttribute("aria-label", "Пауза");
      });

      audio.addEventListener("pause", function () {
        playButton.textContent = "▶";
        playButton.setAttribute("aria-label", "Воспроизвести");
      });

      audio.addEventListener("loadedmetadata", function () {
        duration.textContent = formatTime(audio.duration);
      });

      audio.addEventListener("timeupdate", function () {
        currentTime.textContent = formatTime(audio.currentTime);

        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          timeline.value = (audio.currentTime / audio.duration) * 100;
        }
      });

      timeline.addEventListener("input", function () {
        if (Number.isFinite(audio.duration)) {
          audio.currentTime =
            (Number(timeline.value) / 100) * audio.duration;
        }
      });

      volume.addEventListener("input", function () {
        audio.volume = Number(volume.value);
      });

      audio.addEventListener("ended", function () {
        playButton.textContent = "▶";
        timeline.value = "0";
      });

      audio.onerror = function () {
        box.replaceChildren(
          fallback("Аудиофайл пока не загружен")
        );
      };

      return box;
    }

    return box;
  }

  function render() {
    if (!questions.length) {
      el.text.textContent = "Вопросы пока не загружены.";
      el.media.replaceChildren();
      el.answers.replaceChildren();
      return;
    }

    var q = questions[index];
    answered = false;

    el.counter.textContent =
      "QUESTION " + (index + 1) + " / " + questions.length;

    el.score.textContent = "SCORE " + score;

    el.progress.style.width =
      (index / questions.length) * 100 + "%";

    el.text.textContent = q.question;

    el.media.replaceChildren(mediaBlock(q));

    el.explain.classList.add("hidden");
    el.next.classList.add("hidden");
    el.answers.replaceChildren();

    q.answers.forEach(function (answer) {
      var b = document.createElement("button");

      b.className = "answer";
      b.type = "button";
      b.textContent = answer;

      b.addEventListener("click", function () {
        choose(b, answer, q);
      });

      el.answers.appendChild(b);
    });
  }

  function choose(btn, value, q) {
    if (answered) return;

    answered = true;
    clickSound();

    var correct = value === q.correct;

    if (correct) score++;

    el.score.textContent = "SCORE " + score;

    Array.prototype.forEach.call(
      el.answers.children,
      function (b) {
        b.disabled = true;

        if (b.textContent === q.correct) {
          b.classList.add("correct");
        }
      }
    );

    if (!correct) {
      btn.classList.add("wrong");
    }

    el.explain.replaceChildren();

    var resultLabel = document.createElement("span");
    resultLabel.className = "pixel " + (correct ? "green" : "red");
    resultLabel.textContent = correct ? "CORRECT!" : "WRONG!";

    var explanationText = document.createElement("span");
    explanationText.textContent = q.explanation || "";

    el.explain.append(resultLabel, explanationText);
    el.explain.classList.remove("hidden");

    el.next.textContent =
      index === questions.length - 1
        ? "ПОКАЗАТЬ РЕЗУЛЬТАТ"
        : "СЛЕДУЮЩИЙ ВОПРОС";

    el.next.classList.remove("hidden");
  }

  function next() {
    clickSound();

    if (index < questions.length - 1) {
      index++;
      render();
    } else {
      finish();
    }
  }

  function finish() {
      if (quizCompleted) return;
    quizCompleted = true;

    if (window.RNRAchievements) {
        window.RNRAchievements.awardQuizResult(score, questions.length);
    }
    el.progress.style.width = "100%";

    el.game.classList.add("hidden");
    el.result.classList.remove("hidden");

    el.resScore.textContent =
      score + " / " + questions.length;

    var percentage = Math.round(
      (score / questions.length) * 100
    );

    var title = "TRY AGAIN";
    var text = "";

    if (percentage < 40) {
      title = "TRY AGAIN";
      text =
        "Не очень, но у тебя всё впереди! Ждём на реальной игре!";
    } else if (percentage < 70) {
      title = "NOT BAD";
      text =
        "Неплохо! Ещё немного практики — и будет отлично!";
    } else if (percentage < 100) {
      title = "ALMOST PERFECT";
      text = "Очень хороший результат! Ждём на реальной игре!";
    } else {
      title = "ROCK'N'ROLLA LEGEND";
      text =
        "Идеальный результат!!! Ждём на реальной игре!";
    }

    el.resTitle.textContent = title;
    el.resText.textContent = text;
  }

  function start() {
    clickSound();

    if (!questions.length) {
      el.text.textContent = "Пока нет опубликованных вопросов.";
      return;
    }

    index = 0;
    score = 0;

    quizCompleted = false;

    el.start.classList.add("hidden");
    el.result.classList.add("hidden");
    el.game.classList.remove("hidden");

    render();
  }

  async function loadQuestions() {
    // Если Supabase подключён, загружаем вопросы из базы
    if (typeof supabaseClient !== "undefined") {
      var result = await supabaseClient
        .from("quiz_questions")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (result.error) {
        console.error("Ошибка загрузки вопросов:", result.error);
      } else if (result.data && result.data.length) {
        questions = result.data.map(function (q) {
          return {
            type: q.question_type,
            file: q.media_url || "",
            question: q.question_text,
            answers: q.answers,
            correct: q.correct_answer,
            explanation: q.explanation || ""
          };
        });

        return;
      }
    }

    // Резервный вариант — старые вопросы из questions.js
    questions = (window.QUIZ_QUESTIONS || []).map(function (q) {
      return {
        type: q.type,
        file: q.file || "",
        question: q.question,
        answers: q.answers,
        correct: q.correct,
        explanation: q.explanation || ""
      };
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    el = {
      start: $("quizStart"),
      game: $("quizGame"),
      result: $("quizResult"),

      counter: $("qCounter"),
      score: $("qScore"),
      progress: $("qProgress"),

      text: $("qText"),
      media: $("qMedia"),
      answers: $("qAnswers"),
      explain: $("qExplain"),
      next: $("nextBtn"),

      resScore: $("resScore"),
      resTitle: $("resTitle"),
      resText: $("resText")
    };

    if (!el.start) return;

    var startBtn = $("startBtn");
    var restartBtn = $("restartBtn");

    if (startBtn) startBtn.disabled = true;
    if (restartBtn) restartBtn.disabled = true;

    try {
      await loadQuestions();
    } catch (error) {
      console.error("Не удалось загрузить вопросы:", error);
    }

    if (startBtn) {
      startBtn.disabled = false;
      startBtn.addEventListener("click", start);
    }

    if (restartBtn) {
      restartBtn.disabled = false;
      restartBtn.addEventListener("click", start);
    }

    if (el.next) {
      el.next.addEventListener("click", next);
    }
  });
})();
