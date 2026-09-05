/* ================================================================
   MONTHSARY LOVE LETTER — SCRIPT.JS (fully editable from the page)
   ================================================================
   Nothing in here needs to be edited to customize your letter —
   open the website, click "✎ Edit", and change names, the letter,
   the 12 months, photos, reasons, and captions directly on the page.
   Everything is saved to this browser via localStorage.
   ================================================================ */

const STORAGE_KEY = "monthsary_site_data_v1";
const MAX_IMAGE_DIMENSION = 1100;   // px, longest side after compression
const IMAGE_QUALITY = 0.72;         // JPEG quality used when compressing uploads

/* ---------------------------------------------------------------
   DEFAULT CONTENT — shown the very first time, before any editing.
   Feel free to change these too, but you don't need to: everything
   below is editable straight from the website.
   --------------------------------------------------------------- */
function makeDefaultState() {
  return {
    opening: {
      eyebrow: "a little something for you",
      monthsary: "20th",
      message: "20 months, countless memories, and a love story still being written…",
      monthsaryNumberWord: "20 months"
    },
    letter: {
      to: "My Love",
      body:
        "One year ago, our story began — two people who didn't know they were about to become each other's favorite part of every day.\n\n" +
        "Since then, every month has felt like its own little chapter: some quiet and comfortable, some exciting and new, all of them ours.\n\n" +
        "Thank you for showing up, laughing with me, and choosing us even on the ordinary days. Those are my favorite ones, honestly.\n\n" +
        "Here's to everything we've already lived, and to everything we haven't gotten to yet.",
      date: "August 8, 2026",
      signature: "Me"
    },
    months: [
      { title: "The Beginning",       message: "The first hello, and the feeling that this one might be different.", image: null, caption: "" },
      { title: "Getting Closer",      message: "Late-night texts turning into late-night calls.", image: null, caption: "" },
      { title: "More Memories",       message: "Our first real adventure together — and the first of many.", image: null, caption: "" },
      { title: "Getting Comfortable", message: "Meeting the people who matter most to each of us.", image: null, caption: "" },
      { title: "Little Rituals",      message: "Our own routines started forming, just for us.", image: null, caption: "" },
      { title: "Half a Year",         message: "Six months in, and it already felt like home.", image: null, caption: "" },
      { title: "Through the Rough",   message: "The first real challenge — and choosing each other through it.", image: null, caption: "" },
      { title: "Rediscovering Us",    message: "Falling for new sides of each other all over again.", image: null, caption: "" },
      { title: "Quiet Comfort",       message: "The kind of love that doesn't need a reason to feel good.", image: null, caption: "" },
      { title: "Growing Together",    message: "Learning, growing, and becoming better — side by side.", image: null, caption: "" },
      { title: "Almost There",        message: "Counting down, and it still feels new.", image: null, caption: "" },
      { title: "One Beautiful Year",  message: "This month down. Here's to all the ones still coming.", image: null, caption: "" },
      { title: "New Chapters",        message: "Past the one-year mark, and still writing new pages together.", image: null, caption: "" },
      { title: "Familiar & New",      message: "Comfortable as ever, and still finding new things to love.", image: null, caption: "" },
      { title: "Steady Ground",       message: "Through the busy weeks and the slow ones, still us.", image: null, caption: "" },
      { title: "Little Adventures",   message: "More trips, more firsts, more reasons to smile.", image: null, caption: "" },
      { title: "Deeper Still",        message: "Falling deeper, little by little, month by month.", image: null, caption: "" },
      { title: "A Year and a Half",   message: "18 months in, and still one of my favorite chapters.", image: null, caption: "" },
      { title: "Nineteen",            message: "19 months in, and still falling for you all over again.", image: null, caption: "" },
      { title: "Twenty",              message: "20 months in, and it still feels like the best decision I ever made.", image: null, caption: "" }
    ],
    gallery: [
      { image: null, caption: "First Date" },
      { image: null, caption: "First Picture Together" },
      { image: null, caption: "Random Memories" },
      { image: null, caption: "Favorite Moment" },
      { image: null, caption: "Our Best Day" }
    ],
    reasons: [
      "Your smile", "Your kindness", "The way you make me laugh",
      "How you always make things feel better", "Our little conversations",
      "The memories we create", "The way you understand me", "Your patience",
      "Your presence", "Your support", "The little things you do",
      "Simply because you're you"
    ],
    polaroids: [
      { image: null, caption: "This moment ❤️" },
      { image: null, caption: "One of my favorite memories." },
      { image: null, caption: "Us." }
    ],
    final: {
      small: "20 months down…",
      main: "…and hopefully, a lifetime to go. ❤️",
      signature: "Me"
    }
  };
}

let state = loadState();
let isEditing = true; // start in edit mode so first-time visitors can fill things in

/* ================================================================
   STORAGE
   ================================================================ */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefaultState();
    const parsed = JSON.parse(raw);
    const defaults = makeDefaultState();
    // Merge with defaults so new fields introduced later don't break old saves
    const merged = deepMerge(defaults, parsed);
    // Months are special-cased: a visitor's saved data might predate a later
    // update that added more months (e.g. a save from when the site only had
    // 12 months). The generic array-merge above takes the saved array as-is,
    // which would silently cap the site back down to however many months
    // existed when that save was made. Instead, always match the CURRENT
    // number of months defined in makeDefaultState(), keeping any edits the
    // visitor already made (matched by position) and filling in fresh
    // defaults for any months that didn't exist yet in their saved copy.
    merged.months = defaults.months.map((def, i) => {
      const saved = Array.isArray(parsed.months) ? parsed.months[i] : null;
      return saved ? { ...def, ...saved } : def;
    });
    return merged;
  } catch (err) {
    console.warn("Could not load saved data, starting fresh.", err);
    return makeDefaultState();
  }
}

function deepMerge(base, incoming) {
  if (Array.isArray(base)) return Array.isArray(incoming) ? incoming : base;
  if (typeof base === "object" && base !== null) {
    const out = { ...base };
    for (const key in incoming || {}) {
      out[key] = key in base ? deepMerge(base[key], incoming[key]) : incoming[key];
    }
    return out;
  }
  return incoming !== undefined ? incoming : base;
}

let saveTimer = null;
function scheduleAutosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(false), 700);
}

function saveState(showToast = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (showToast) showToastMessage("Saved ❤️");
  } catch (err) {
    console.error("Save failed:", err);
    showToastMessage("Storage is full — try removing a photo or two.");
  }
}

/* ================================================================
   PATH HELPERS (for data-bind="months.0.title" style paths)
   ================================================================ */
function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split(".");
  let target = obj;
  for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
  target[keys[keys.length - 1]] = value;
}

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  applyEditMode();
  setupControlBar();
  setupLanding();
  setupEnvelope();
  setupReplay();
  setupHiddenImageInput();
  setupLightbox();
  setupLoveQuestion();
  setupMusic();
  setupScrollReveal();
  setupGlobalDelegation();
  startFloatingHearts();
});

function renderAll() {
  bindSimpleEditables();
  renderTimeline();
  renderGallery();
  renderReasons();
  renderPolaroids();
}

/* ================================================================
   SIMPLE data-bind ELEMENTS (single fields, not lists)
   ================================================================ */
function bindSimpleEditables() {
  document.querySelectorAll("[data-bind]").forEach(el => {
    const path = el.dataset.bind;
    const value = getPath(state, path);
    setEditableText(el, value || "");
  });
}

function setEditableText(el, value) {
  el.innerText = value;
  updateEmptyState(el, value);
}

function updateEmptyState(el, value) {
  if (!value || !value.trim()) el.dataset.empty = "true";
  else delete el.dataset.empty;
}

/* Any typing in a bound field updates state + triggers autosave.
   One delegated listener — no risk of duplicate listeners after re-render. */
document.addEventListener("input", e => {
  const el = e.target.closest("[data-bind].editable");
  if (!el) return;
  const path = el.dataset.bind;
  const text = el.innerText;
  setPath(state, path, text);
  updateEmptyState(el, text);
  scheduleAutosave();
});

/* ================================================================
   EDIT MODE / PREVIEW MODE
   ================================================================ */
function applyEditMode() {
  document.body.classList.toggle("editing", isEditing);
  document.querySelectorAll(".editable").forEach(el => {
    el.contentEditable = isEditing ? "true" : "false";
  });
  const btn = document.getElementById("editToggleBtn");
  btn.textContent = isEditing ? "Preview ❤️" : "✎ Back to Edit";
  btn.classList.toggle("active", isEditing);
}

function setupControlBar() {
  document.getElementById("editToggleBtn").addEventListener("click", () => {
    isEditing = !isEditing;
    applyEditMode();
  });

  document.getElementById("saveBtn").addEventListener("click", () => saveState(true));

  document.getElementById("clearBtn").addEventListener("click", () => {
    const sure = confirm("Clear ALL your entered text and photos? This cannot be undone.");
    if (!sure) return;
    localStorage.removeItem(STORAGE_KEY);
    state = makeDefaultState();
    renderAll();
    isEditing = true;
    applyEditMode();
    showToastMessage("All data cleared");
  });
}

/* ================================================================
   LANDING → ENVELOPE
   ================================================================ */
function setupLanding() {
  const landing = document.getElementById("landingScreen");
  const envelopeScreen = document.getElementById("envelopeScreen");
  const btn = document.getElementById("openLetterBtn");

  btn.addEventListener("click", () => {
    landing.classList.add("fade-out");
    window.dispatchEvent(new Event("monthsary:leavingLanding"));
    setTimeout(() => {
      landing.hidden = true;
      envelopeScreen.hidden = false;
    }, 550);
  });
}

/* ================================================================
   ENVELOPE ANIMATION
   Fixed: the envelope screen is only ever shown/hidden via the
   `hidden` attribute (display:none), never left as a transparent
   layer sitting on top of the page. Once it's hidden, it cannot
   block clicks on anything underneath.
   ================================================================ */
function setupEnvelope() {
  const envelope = document.getElementById("envelope");
  const envelopeScreen = document.getElementById("envelopeScreen");
  const flap = envelope.querySelector(".envelope-flap");
  const main = document.getElementById("mainContent");

  let finished = false;
  const finishOpening = () => {
    if (finished) return; // transitionend + fallback timeout can both fire — only run this once
    finished = true;
    envelopeScreen.hidden = true;   // fully removed from layout, no leftover overlay
    main.hidden = false;
    window.scrollTo(0, 0);
    revealVisibleSections();
  };

  const openEnvelope = () => {
    if (envelope.classList.contains("opened")) return;
    finished = false;
    // Fire this first and synchronously, inside the click handler itself —
    // this is the one moment we have real "user gesture" credit, which is
    // what lets the browser allow audio to start playing.
    if (typeof window.attemptMusicAutoplay === "function") window.attemptMusicAutoplay();
    envelope.classList.add("opened");
    burstHearts(6);

    // Primary: wait for the flap's own transform transition to actually finish.
    const onFlapTransitionEnd = (e) => {
      if (e.target !== flap || e.propertyName !== "transform") return;
      flap.removeEventListener("transitionend", onFlapTransitionEnd);
      finishOpening();
    };
    flap.addEventListener("transitionend", onFlapTransitionEnd);

    // Fallback: if transitionend never fires (reduced-motion users, a
    // backgrounded tab throttling timers, etc.) don't leave the user stuck
    // looking at the envelope — finish anyway shortly after the CSS duration.
    setTimeout(finishOpening, 1100);
  };

  envelope.addEventListener("click", openEnvelope);
  envelope.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }
  });
}

function setupReplay() {
  const replayBtn = document.getElementById("replayBtn");
  const envelope = document.getElementById("envelope");
  const envelopeScreen = document.getElementById("envelopeScreen");
  const main = document.getElementById("mainContent");

  replayBtn.addEventListener("click", () => {
    envelope.classList.remove("opened");
    main.hidden = true;
    envelopeScreen.hidden = false;
  });
}

/* ================================================================
   RENDERERS — TIMELINE / GALLERY / REASONS / POLAROIDS
   ================================================================ */
function renderTimeline() {
  const container = document.getElementById("timeline");
  container.innerHTML = state.months.map((m, i) => {
    const photoInner = m.image
      ? `<img src="${m.image}" alt="${escapeAttr(m.title)}" />`
      : `📷`;
    return `
      <article class="month-card" data-index="${i}">
        <div class="month-toggle-zone" data-action="month-toggle" data-index="${i}">
          <div class="month-number">Month ${i + 1}</div>
          <h3 class="month-title editable" contenteditable="false" data-bind="months.${i}.title" data-placeholder="Enter title">${escapeHTML(m.title)}</h3>
        </div>
        <p class="month-desc editable" contenteditable="false" data-bind="months.${i}.message" data-placeholder="Enter memory / message">${escapeHTML(m.message)}</p>
        <div class="month-photo photo-frame" data-action="month-photo" data-index="${i}" tabindex="0">
          ${photoInner}
          <div class="photo-actions edit-only">
            <button type="button" class="photo-action-btn" data-action="month-photo" data-index="${i}">Upload</button>
            ${m.image ? `<button type="button" class="photo-action-btn danger" data-action="month-remove-photo" data-index="${i}">Remove</button>` : ""}
          </div>
        </div>
        <p class="month-caption editable" contenteditable="false" data-bind="months.${i}.caption" data-placeholder="Enter caption">${escapeHTML(m.caption)}</p>
      </article>
    `;
  }).join("");

  container.querySelectorAll("[data-bind]").forEach(el => updateEmptyState(el, el.innerText));
  applyEditModeToNewNodes(container);
  setupTimelineCarousel();
}

/* ================================================================
   TIMELINE CAROUSEL (swipe/drag navigation between months)
   The horizontal scrolling + snapping itself is native CSS
   (scroll-snap-type), which is what gives real touch-drag/swipe
   behavior for free and avoids the common bugs of hand-rolled touch
   handlers (like breaking taps on things inside the card). This
   function just wires up the dots, the arrow buttons, and tracks
   which card is currently centered so it can play the page-turn
   sound on genuine navigation (not on initial load).
   ================================================================ */
let timelineObserver = null;
function setupTimelineCarousel() {
  const track = document.getElementById("timeline");
  const dotsWrap = document.getElementById("timelineDots");
  const prevBtn = document.getElementById("monthPrevBtn");
  const nextBtn = document.getElementById("monthNextBtn");
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll(".month-card"));
  if (!cards.length) { dotsWrap.innerHTML = ""; return; }

  dotsWrap.innerHTML = cards.map((_, i) =>
    `<button type="button" class="timeline-dot${i === 0 ? " active" : ""}" data-goto="${i}" aria-label="Go to month ${i + 1}"></button>`
  ).join("");
  const dots = Array.from(dotsWrap.querySelectorAll(".timeline-dot"));

  let activeIndex = 0;
  let isFirstObservation = true;
  let lastSoundAt = 0;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === cards.length - 1;
    if (!isFirstObservation) {
      const now = Date.now();
      if (now - lastSoundAt > 150) { // guards against rapid-swipe sound spam
        playPageTurnSound();
        lastSoundAt = now;
      }
    }
  }

  if (timelineObserver) timelineObserver.disconnect();
  timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        setActive(cards.indexOf(entry.target));
      }
    });
    isFirstObservation = false;
  }, { root: track, threshold: 0.6 });
  cards.forEach(card => timelineObserver.observe(card));

  if (prevBtn) {
    prevBtn.disabled = true;
    prevBtn.onclick = () => cards[Math.max(0, activeIndex - 1)].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  if (nextBtn) {
    nextBtn.disabled = cards.length <= 1;
    nextBtn.onclick = () => cards[Math.min(cards.length - 1, activeIndex + 1)].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  dots.forEach(dot => {
    dot.onclick = () => cards[Number(dot.dataset.goto)].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  });
}

/* ================================================================
   PAGE-TURN SOUND EFFECT
   A tiny synthesized "whoosh" (filtered white noise) — no audio file
   needed, so it works immediately. Plays when swiping/tapping
   between months. Wrapped in try/catch so unsupported or blocked
   Web Audio never breaks navigation itself.
   ================================================================ */
let pageTurnAudioCtx = null;
function playPageTurnSound() {
  try {
    pageTurnAudioCtx = pageTurnAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = pageTurnAudioCtx;
    const duration = 0.22;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.sin(Math.PI * t); // smooth rise and fall, no click at start/end
      data[i] = (Math.random() * 2 - 1) * envelope * 0.45;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + duration);
  } catch (err) {
    // Web Audio unsupported/blocked — silently skip, never break the page
  }
}

function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = state.gallery.map((g, i) => {
    const inner = g.image
      ? `<img src="${g.image}" alt="${escapeAttr(g.caption)}" />`
      : `📸`;
    return `
      <figure class="gallery-item" data-index="${i}">
        <button type="button" class="remove-item-btn edit-only" data-action="gallery-remove" data-index="${i}" aria-label="Remove photo">&times;</button>
        <div class="photo-frame" data-action="gallery-photo" data-index="${i}" tabindex="0">
          ${inner}
          <div class="photo-actions edit-only">
            <button type="button" class="photo-action-btn" data-action="gallery-photo" data-index="${i}">${g.image ? "Replace" : "Upload"}</button>
          </div>
        </div>
        <figcaption class="gallery-caption editable" contenteditable="false" data-bind="gallery.${i}.caption" data-placeholder="Enter caption">${escapeHTML(g.caption)}</figcaption>
      </figure>
    `;
  }).join("");

  grid.querySelectorAll("[data-bind]").forEach(el => updateEmptyState(el, el.innerText));
  applyEditModeToNewNodes(grid);
}

function renderReasons() {
  const grid = document.getElementById("reasonsGrid");
  grid.innerHTML = state.reasons.map((text, i) => `
    <div class="reason-card in-view">
      <span class="reason-number">${i + 1}</span>
      <span class="reason-text editable" contenteditable="false" data-bind="reasons.${i}" data-placeholder="Enter reason">${escapeHTML(text)}</span>
    </div>
  `).join("");
  grid.querySelectorAll("[data-bind]").forEach(el => updateEmptyState(el, el.innerText));
  applyEditModeToNewNodes(grid);
}

function renderPolaroids() {
  const wall = document.getElementById("polaroidWall");
  const tilts = [-6, 4, -3, 7, -8, 5];
  wall.innerHTML = state.polaroids.map((p, i) => {
    const rotate = tilts[i % tilts.length];
    const inner = p.image
      ? `<img src="${p.image}" alt="${escapeAttr(p.caption)}" />`
      : `❤️`;
    return `
      <div class="polaroid" style="transform: rotate(${rotate}deg)" data-index="${i}">
        <button type="button" class="remove-item-btn edit-only" data-action="polaroid-remove" data-index="${i}" aria-label="Remove memory">&times;</button>
        <div class="photo-frame" data-action="polaroid-photo" data-index="${i}" tabindex="0">
          ${inner}
          <div class="photo-actions edit-only">
            <button type="button" class="photo-action-btn" data-action="polaroid-photo" data-index="${i}">${p.image ? "Replace" : "Upload"}</button>
          </div>
        </div>
        <p class="polaroid-caption editable" contenteditable="false" data-bind="polaroids.${i}.caption" data-placeholder="Enter caption">${escapeHTML(p.caption)}</p>
      </div>
    `;
  }).join("");
  wall.querySelectorAll("[data-bind]").forEach(el => updateEmptyState(el, el.innerText));
  applyEditModeToNewNodes(wall);
}

/* Newly injected nodes need their contentEditable state set to match
   the current mode (the global class alone doesn't affect elements
   created after the fact). */
function applyEditModeToNewNodes(root) {
  root.querySelectorAll(".editable").forEach(el => {
    el.contentEditable = isEditing ? "true" : "false";
  });
}

/* ================================================================
   GLOBAL CLICK DELEGATION — every dynamic button, one listener.
   Avoids duplicate-listener bugs entirely since re-rendering a
   section never re-attaches per-element handlers.
   ================================================================ */
let pendingUpload = null; // { type: 'month'|'gallery-add'|'gallery-replace'|'polaroid-add'|'polaroid-replace', index }

function setupGlobalDelegation() {
  document.addEventListener("click", e => {
    const actionEl = e.target.closest("[data-action]");

    // Month card expand/collapse — ignore clicks that landed on editable text
    if (actionEl && actionEl.dataset.action === "month-toggle") {
      if (e.target.closest(".editable")) return;
      const card = actionEl.closest(".month-card");
      card.classList.toggle("expanded");
      return;
    }

    if (!actionEl) return;
    const action = actionEl.dataset.action;
    const index = actionEl.dataset.index !== undefined ? Number(actionEl.dataset.index) : null;

    switch (action) {
      case "month-photo":
        if (!isEditing) return;
        pendingUpload = { type: "month", index };
        document.getElementById("hiddenImageInput").click();
        break;

      case "month-remove-photo":
        state.months[index].image = null;
        renderTimeline();
        scheduleAutosave();
        break;

      case "gallery-photo":
        if (isEditing) {
          pendingUpload = { type: "gallery-replace", index };
          document.getElementById("hiddenImageInput").click();
        } else {
          const item = state.gallery[index];
          if (item.image) openLightbox(item.image, item.caption);
        }
        break;

      case "gallery-remove":
        state.gallery.splice(index, 1);
        renderGallery();
        scheduleAutosave();
        break;

      case "polaroid-photo":
        if (isEditing) {
          pendingUpload = { type: "polaroid-replace", index };
          document.getElementById("hiddenImageInput").click();
        } else {
          const p = state.polaroids[index];
          if (p.image) openLightbox(p.image, p.caption);
        }
        break;

      case "polaroid-remove":
        state.polaroids.splice(index, 1);
        renderPolaroids();
        scheduleAutosave();
        break;
    }
  });

  document.getElementById("addGalleryPhotoBtn").addEventListener("click", () => {
    pendingUpload = { type: "gallery-add" };
    document.getElementById("hiddenImageInput").click();
  });

  document.getElementById("addPolaroidBtn").addEventListener("click", () => {
    pendingUpload = { type: "polaroid-add" };
    document.getElementById("hiddenImageInput").click();
  });
}

/* ================================================================
   IMAGE UPLOAD (single reused hidden <input type="file">)
   ================================================================ */
function setupHiddenImageInput() {
  const input = document.getElementById("hiddenImageInput");
  input.addEventListener("change", async () => {
    const file = input.files && input.files[0];
    input.value = ""; // allow choosing the same file again later
    if (!file || !file.type.startsWith("image/") || !pendingUpload) return;

    let dataUrl;
    try {
      dataUrl = await compressImage(file);
    } catch (err) {
      console.error("Image processing failed:", err);
      showToastMessage("Couldn't read that image — try another one.");
      return;
    }

    switch (pendingUpload.type) {
      case "month":
        state.months[pendingUpload.index].image = dataUrl;
        renderTimeline();
        break;
      case "gallery-replace":
        state.gallery[pendingUpload.index].image = dataUrl;
        renderGallery();
        break;
      case "gallery-add":
        state.gallery.push({ image: dataUrl, caption: "New memory" });
        renderGallery();
        break;
      case "polaroid-replace":
        state.polaroids[pendingUpload.index].image = dataUrl;
        renderPolaroids();
        break;
      case "polaroid-add":
        state.polaroids.push({ image: dataUrl, caption: "New memory" });
        renderPolaroids();
        break;
    }
    pendingUpload = null;
    scheduleAutosave();
  });
}

function compressImage(file, maxDim = MAX_IMAGE_DIMENSION, quality = IMAGE_QUALITY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image decode failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ================================================================
   LIGHTBOX
   ================================================================ */
function setupLightbox() {
  const closeBtn = document.getElementById("lightboxClose");
  const lightbox = document.getElementById("lightbox");
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
}
function openLightbox(src, caption) {
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightboxImg").alt = caption || "";
  document.getElementById("lightboxCaption").textContent = caption || "";
  document.getElementById("lightbox").hidden = false;
  document.body.style.overflow = "hidden"; // lock background scroll while the modal is open
}
function closeLightbox() {
  document.getElementById("lightbox").hidden = true;
  document.body.style.overflow = "";
}

/* ================================================================
   LOVE QUESTION
   ================================================================ */
// 🗓️ Change this to your actual next monthsary date if it ever moves.
const NEXT_MONTHSARY_DATE = new Date("2026-10-09T00:00:00");

function setupLoveQuestion() {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const answer = document.getElementById("questionAnswer");

  let countdownStarted = false;
  yesBtn.addEventListener("click", () => {
    answer.hidden = false;
    burstHearts(24);
    if (!countdownStarted) {
      countdownStarted = true;
      startNextMonthsaryCountdown();
    }
  });

  noBtn.addEventListener("click", () => {
    noBtn.textContent = "Are you sure? 🥺";
    setTimeout(() => { noBtn.textContent = "No"; }, 1500);
  });
}

function startNextMonthsaryCountdown() {
  const daysEl = document.getElementById("cdDays");
  const hoursEl = document.getElementById("cdHours");
  const minutesEl = document.getElementById("cdMinutes");
  const secondsEl = document.getElementById("cdSeconds");
  const labelEl = document.querySelector(".countdown-label");
  if (!daysEl) return;

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    const diff = NEXT_MONTHSARY_DATE.getTime() - Date.now();
    if (diff <= 0) {
      if (labelEl) labelEl.textContent = "Happy monthsary! 🎉";
      daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = "00";
      clearInterval(intervalId);
      return;
    }
    const totalSeconds = Math.floor(diff / 1000);
    daysEl.textContent = pad(Math.floor(totalSeconds / 86400));
    hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    minutesEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    secondsEl.textContent = pad(totalSeconds % 60);
  }

  tick();
  const intervalId = setInterval(tick, 1000);
}

/* ================================================================
   FLOATING HEARTS
   ================================================================ */
function startFloatingHearts() {
  const layer = document.getElementById("particleLayer");
  const symbols = ["❤️", "💕", "🌸", "✨"];
  setInterval(() => {
    const el = document.createElement("span");
    el.className = "particle";
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
    el.style.animationDuration = (7 + Math.random() * 5) + "s";
    el.style.fontSize = (0.9 + Math.random() * 0.9) + "rem";
    layer.appendChild(el);
    setTimeout(() => el.remove(), 13000);
  }, 1800);
}
function burstHearts(count) {
  const layer = document.getElementById("particleLayer");
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "particle";
    el.textContent = "❤️";
    el.style.left = 50 + (Math.random() * 40 - 20) + "vw";
    el.style.bottom = "20%";
    el.style.setProperty("--drift", (Math.random() * 200 - 100) + "px");
    el.style.animationDuration = (2.5 + Math.random() * 2) + "s";
    el.style.fontSize = (1 + Math.random()) + "rem";
    layer.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

/* ================================================================
   SCROLL REVEAL
   Fixed: the old threshold (0.15) required 15% of an element's ENTIRE
   height to be visible at once before it would reveal. That works
   fine for small elements, but sections like the 19-month timeline
   are far taller than any phone screen — 15% of a ~7,600px-tall
   section is over 1,100px, more than a whole viewport's worth, so it
   could never actually happen. Those sections were staying invisible
   forever. A near-zero threshold reveals a section as soon as any
   part of it scrolls into view, which works regardless of how tall
   the section is.
   ================================================================ */
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: "0px 0px -1px 0px" });
  document.querySelectorAll(".reveal").forEach(t => observer.observe(t));
}
function revealVisibleSections() {
  document.querySelectorAll(".reveal").forEach(el => {
    const rect = el.getBoundingClientRect();
    // Reveal anything that overlaps the viewport at all right now, not just
    // things that start above the fold — a tall section can already have
    // its top edge on-screen even though most of it extends further down.
    if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("in-view");
  });
}

/* ================================================================
   MUSIC (plays a local audio file — see the "MONTHSARY MUSIC FILE"
   comment block in index.html for where to put your song).
   One small button cycles through the three states you'd expect:
   ▶ Play → ♪ Playing (click = mute) → 🔇 Muted (click = pause) → ▶ ...
   Starting playback happens inside the envelope's click handler,
   which is the one moment we have a genuine "user gesture" — that's
   what the browser requires before it will allow audio to play.
   ================================================================ */
function setupMusic() {
  const toggle = document.getElementById("musicToggle");
  const icon = toggle.querySelector(".music-icon");
  const audio = document.getElementById("monthsaryMusic");
  if (!audio) return; // no music file wired up yet — leave the toggle hidden

  let state = "paused"; // 'paused' | 'playing' | 'muted'

  function updateIcon() {
    toggle.classList.toggle("playing", state === "playing");
    toggle.classList.toggle("muted", state === "muted");
    if (state === "playing") {
      icon.textContent = "♪";
      toggle.setAttribute("aria-label", "Mute music");
    } else if (state === "muted") {
      icon.textContent = "🔇";
      toggle.setAttribute("aria-label", "Pause music");
    } else {
      icon.textContent = "▶";
      toggle.setAttribute("aria-label", "Play music");
    }
  }

  function startPlaying() {
    audio.muted = false;
    audio.play().then(() => {
      state = "playing";
      updateIcon();
      toggle.hidden = false;
    }).catch((error) => {
      // Autoplay blocked — not a bug, just a browser policy. Reveal the
      // button so the person can start it themselves with one tap.
      console.log("Music playback was blocked:", error);
      state = "paused";
      updateIcon();
      toggle.hidden = false;
    });
  }

  // Called from the envelope click handler — this is the one moment we
  // have a genuine user gesture to spend on starting audio.
  window.attemptMusicAutoplay = startPlaying;

  toggle.addEventListener("click", () => {
    if (state === "paused") {
      startPlaying();
    } else if (state === "playing") {
      audio.muted = true;
      state = "muted";
      updateIcon();
    } else if (state === "muted") {
      audio.pause();
      audio.muted = false;
      state = "paused";
      updateIcon();
    }
  });
}

/* ================================================================
   TOAST
   ================================================================ */
let toastTimer = null;
function showToastMessage(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => { toast.hidden = true; }, 300);
  }, 2200);
}

/* ================================================================
   UTILITIES
   ================================================================ */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return (str || "").replace(/"/g, "&quot;");
}
