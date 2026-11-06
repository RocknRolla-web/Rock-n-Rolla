/* Rock'n'Rolla — интерфейс сайта */
(function () {
     /* --- Клики по кнопкам/ссылкам --- */
document.addEventListener("click", function (e) {
    var t = e.target.closest("a, button");

    if (t && window.RNR && typeof window.RNR.click === "function") {
        window.RNR.click();
    }
});

    /* --- Fallback для картинок --- */
    function markBroken(img) {
      var holder = img.closest(".thumb") || img.parentElement;
      if (img.dataset.fallback === "text") { img.remove(); return; }
      if (holder) { holder.classList.add("broken"); img.remove(); }
    }
    Array.prototype.forEach.call(document.images, function (img) {
      img.addEventListener("error", function () { markBroken(img); });
      if (img.complete && img.naturalWidth === 0) markBroken(img);
    });

    /* --- Мобильное меню --- */
    var burger = document.getElementById("burger");
    var nav = document.getElementById("nav");
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });

    /* --- Плавный скролл --- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 68, behavior: "smooth" });
      });
    });

    /* --- Появление при скролле --- */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });

    /* --- Анимация цифр HUD --- */
    var counters = document.querySelectorAll(".hud-num[data-count]");
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var node = en.target;
        cio.unobserve(node);
        var end = parseInt(node.dataset.count, 10);
        var suffix = node.dataset.suffix || "";
        var t0 = performance.now();
        (function step(now) {
          var p = Math.min((now - t0) / 1200, 1);
          node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (n) { cio.observe(n); });

/* --- Галерея --- */
var grid = document.getElementById("galleryGrid");
var available = [];

async function loadGallery() {
  if (!grid) return;

  grid.innerHTML = '<div class="gallery-empty">ЗАГРУЗКА...</div>';

  var result = await supabaseClient
    .from("gallery_media")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (result.error) {
    console.error("Ошибка загрузки галереи:", result.error);
    grid.innerHTML = '<div class="gallery-empty">Не удалось загрузить галерею.</div>';
    return;
  }

  available = result.data.map(function (item) {
    var url = supabaseClient.storage
      .from("gallery")
      .getPublicUrl(item.file_path).data.publicUrl;

    return {
      src: url,
      title: item.title || "",
      type: item.media_type
    };
  });

  grid.innerHTML = "";

  if (!available.length) {
    grid.innerHTML =
      '<div class="gallery-empty"><span class="pixel amber">NO PHOTOS YET</span><span>Фотографии с игр скоро появятся здесь.</span></div>';
    return;
  }

  var photoIndex = 0;

  available.forEach(function (item, idx) {
    var card = document.createElement("div");
    card.className = "shot reveal in";

    if (item.type === "video") {
      var video = document.createElement("video");
      video.src = item.src;
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      video.className = "gallery-video";
      card.appendChild(video);
    } else {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-photo";

      var img = document.createElement("img");
      img.src = item.src;
      img.alt = item.title || "Фото с квиза Rock'n'Rolla";
      img.loading = "lazy";

      button.appendChild(img);

      var currentPhotoIndex = photoIndex;
      photoIndex++;

      button.addEventListener("click", function () {
        openLb(currentPhotoIndex);
      });

      card.appendChild(button);
    }

    var number = document.createElement("span");
    number.className = "shot-num pixel";
    number.textContent = String(idx + 1).padStart(2, "0");
    card.appendChild(number);

    if (item.title) {
      var caption = document.createElement("span");
      caption.className = "gallery-caption";
      caption.textContent = item.title;
      card.appendChild(caption);
    }

    grid.appendChild(card);
  });
}

loadGallery();

/* --- Lightbox --- */
var lb = document.getElementById("lightbox");
var lbImg = document.getElementById("lbImg");
var cur = 0;

function getPhotos() {
  return available.filter(function (item) {
    return item.type === "image";
  });
}

function openLb(i) {
  var photos = getPhotos();
  if (!photos.length || !lb || !lbImg) return;

  cur = i;
  lbImg.src = photos[cur].src;
  lb.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeLb() {
  if (!lb || !lbImg) return;

  lb.classList.add("hidden");
  lbImg.src = "";
  document.body.style.overflow = "";
}

function move(step) {
  var photos = getPhotos();
  if (!photos.length) return;

  cur = (cur + step + photos.length) % photos.length;
  lbImg.src = photos[cur].src;
}

document.getElementById("lbClose").addEventListener("click", closeLb);
document.getElementById("lbPrev").addEventListener("click", function (e) {
  e.stopPropagation();
  move(-1);
});
document.getElementById("lbNext").addEventListener("click", function (e) {
  e.stopPropagation();
  move(1);
});

lb.addEventListener("click", function (e) {
  if (e.target === lb) closeLb();
});

document.addEventListener("keydown", function (e) {
  if (lb.classList.contains("hidden")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") move(-1);
  if (e.key === "ArrowRight") move(1);
});
})();