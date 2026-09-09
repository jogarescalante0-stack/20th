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
      "Your presence"
    ],
    polaroids: [
      { image: null, caption: "This moment" },
      { image: null, caption: "One of my favorite memories." },
      { image: null, caption: "Us." }
    ],
    final: {
      small: "20 months down…",
      main: "…and hopefully, a lifetime to go.",
      signature: "Me"
    }
  };
}

let state = loadState();
let isEditing = false; // starts in Preview mode — the on-page Edit/Save/Clear controls are hidden (see CSS), so visitors always see the finished, already-saved content

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
    // Reasons get the same treatment as months — a save from when the site
    // had 12 reasons would otherwise keep showing all 12 forever, since the
    // generic array-merge above just takes the saved array as-is. Always
    // match the CURRENT number of reasons, keeping edited text by position.
    merged.reasons = defaults.reasons.map((def, i) => {
      const saved = Array.isArray(parsed.reasons) ? parsed.reasons[i] : null;
      return typeof saved === "string" && saved.trim() ? saved : def;
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
    if (showToast) showToastMessage("Saved");
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
  btn.textContent = isEditing ? "Preview" : "✎ Back to Edit";
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
  const letterPeek = envelope.querySelector(".envelope-letter-peek");
  const main = document.getElementById("mainContent");

  let finished = false;
  let crossfadeStarted = false;

  // Step 2 of the handoff: once the paper has risen out of the envelope,
  // crossfade the two screens instead of hard-swapping `hidden`. Main
  // content fades in *underneath* the envelope scene while the envelope
  // scene dissolves on top of it, so it reads as one continuous motion.
  const startCrossfade = () => {
    if (crossfadeStarted) return;
    crossfadeStarted = true;

    main.hidden = false;
    main.classList.add("entering"); // start transparent
    window.scrollTo(0, 0);
    revealVisibleSections();

    // Force a layout flush so the browser registers the "entering" (opacity:0)
    // state before we remove it — otherwise both class changes coalesce into
    // one paint and there's nothing to transition from.
    void main.offsetWidth;

    requestAnimationFrame(() => {
      main.classList.remove("entering");   // main content fades in
      envelopeScreen.classList.add("leaving"); // envelope scene dissolves on top
    });

    // Step 3: once the crossfade itself has finished, actually remove the
    // envelope screen from layout so it can't linger as an invisible,
    // click-blocking layer.
    const finishOpening = () => {
      if (finished) return; // transitionend + fallback timeout can both fire — only run this once
      finished = true;
      envelopeScreen.hidden = true; // fully removed from layout, no leftover overlay
    };
    envelopeScreen.addEventListener("transitionend", (e) => {
      if (e.target !== envelopeScreen || e.propertyName !== "opacity") return;
      finishOpening();
    }, { once: true });
    setTimeout(finishOpening, 700); // fallback matching the 0.55s CSS fade + buffer
  };

  const openEnvelope = () => {
    if (envelope.classList.contains("opened")) return;
    finished = false;
    crossfadeStarted = false;
    // Fire this first and synchronously, inside the click handler itself —
    // this is the one moment we have real "user gesture" credit, which is
    // what lets the browser allow audio to start playing.
    if (typeof window.attemptMusicAutoplay === "function") window.attemptMusicAutoplay();
    envelope.classList.add("opened");
    burstHearts(6);

    // Primary: wait for the letter-peek's own rise-out transition to finish —
    // that's the moment the paper has fully emerged, which is when the
    // crossfade to the full letter should begin.
    const onLetterTransitionEnd = (e) => {
      if (e.target !== letterPeek || e.propertyName !== "transform") return;
      letterPeek.removeEventListener("transitionend", onLetterTransitionEnd);
      startCrossfade();
    };
    letterPeek.addEventListener("transitionend", onLetterTransitionEnd);

    // Fallback: if transitionend never fires (reduced-motion users, a
    // backgrounded tab throttling timers, etc.) don't leave the user stuck
    // looking at the envelope — start the crossfade anyway shortly after
    // the CSS duration (1.1s transition + 0.26s delay ≈ 1.36s).
    setTimeout(startCrossfade, 1450);
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
    main.classList.remove("entering");
    envelopeScreen.classList.remove("leaving");
    envelopeScreen.hidden = false;
  });
}

/* ================================================================
   PHOTO FRAME TEMPLATES — shared by the full renderers below AND by
   the single-frame updates in the upload flow, so both stay in sync
   and a one-photo upload never has to touch unrelated frames.

   fitPhotoFrame(): the frame's CSS aspect-ratio (16/10, 1/1, etc.) is
   only a placeholder default for the empty state. The moment a real
   photo loads, this sets the FRAME's aspect-ratio to match the PHOTO's
   own aspect ratio exactly — so the frame conforms to the picture
   instead of the picture being boxed/cropped/letterboxed into a fixed
   frame shape. Portrait, landscape, or square: the whole photo fills
   the whole frame, no empty space, nothing cut off.
   ================================================================ */
function fitPhotoFrame(img) {
  if (img.naturalWidth && img.naturalHeight) {
    img.parentElement.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
  }
}
function monthPhotoFrameHTML(m, i) {
  const photoInner = m.image
    ? `<img src="${m.image}" alt="${escapeAttr(m.title)}" onload="fitPhotoFrame(this)" />`
    : `📷`;
  return `
    ${photoInner}
    <div class="photo-actions edit-only">
      <button type="button" class="photo-action-btn" data-action="month-photo" data-index="${i}">Upload</button>
      ${m.image ? `<button type="button" class="photo-action-btn danger" data-action="month-remove-photo" data-index="${i}">Remove</button>` : ""}
    </div>
  `;
}
function galleryPhotoFrameHTML(g, i) {
  const inner = g.image ? `<img src="${g.image}" alt="${escapeAttr(g.caption)}" onload="fitPhotoFrame(this)" />` : `📸`;
  return `
    ${inner}
    <div class="photo-actions edit-only">
      <button type="button" class="photo-action-btn" data-action="gallery-photo" data-index="${i}">${g.image ? "Replace" : "Upload"}</button>
    </div>
  `;
}
function polaroidPhotoFrameHTML(p, i) {
  const inner = p.image ? `<img src="${p.image}" alt="${escapeAttr(p.caption)}" onload="fitPhotoFrame(this)" />` : `📸`;
  return `
    ${inner}
    <div class="photo-actions edit-only">
      <button type="button" class="photo-action-btn" data-action="polaroid-photo" data-index="${i}">${p.image ? "Replace" : "Upload"}</button>
    </div>
  `;
}

/* ================================================================
   RENDERERS — TIMELINE / GALLERY / REASONS / POLAROIDS
   ================================================================ */
function renderTimeline() {
  const container = document.getElementById("timeline");
  container.innerHTML = state.months.map((m, i) => {
    return `
      <article class="month-card" data-index="${i}">
        <div class="month-toggle-zone" data-action="month-toggle" data-index="${i}">
          <div class="month-number">Month ${i + 1}</div>
          <h3 class="month-title editable" contenteditable="false" data-bind="months.${i}.title" data-placeholder="Enter title">${escapeHTML(m.title)}</h3>
        </div>
        <p class="month-desc editable" contenteditable="false" data-bind="months.${i}.message" data-placeholder="Enter memory / message">${escapeHTML(m.message)}</p>
        <div class="month-photo photo-frame" data-action="month-photo" data-index="${i}" tabindex="0">
          ${monthPhotoFrameHTML(m, i)}
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
    return `
      <figure class="gallery-item" data-index="${i}">
        <button type="button" class="remove-item-btn edit-only" data-action="gallery-remove" data-index="${i}" aria-label="Remove photo">&times;</button>
        <div class="photo-frame" data-action="gallery-photo" data-index="${i}" tabindex="0">
          ${galleryPhotoFrameHTML(g, i)}
        </div>
        <figcaption class="gallery-caption editable" contenteditable="false" data-bind="gallery.${i}.caption" data-placeholder="Enter caption">${escapeHTML(g.caption)}</figcaption>
      </figure>
    `;
  }).join("");

  grid.querySelectorAll("[data-bind]").forEach(el => updateEmptyState(el, el.innerText));
  applyEditModeToNewNodes(grid);
}

/* Appends exactly one new gallery item without touching any existing
   ones — used when adding a new photo so the other photos never
   re-render. Returns the new <figure> element. */
function appendGalleryItem(g, i) {
  const grid = document.getElementById("galleryGrid");
  const fig = document.createElement("figure");
  fig.className = "gallery-item";
  fig.dataset.index = String(i);
  fig.innerHTML = `
    <button type="button" class="remove-item-btn edit-only" data-action="gallery-remove" data-index="${i}" aria-label="Remove photo">&times;</button>
    <div class="photo-frame" data-action="gallery-photo" data-index="${i}" tabindex="0">
      ${galleryPhotoFrameHTML(g, i)}
    </div>
    <figcaption class="gallery-caption editable" contenteditable="false" data-bind="gallery.${i}.caption" data-placeholder="Enter caption">${escapeHTML(g.caption)}</figcaption>
  `;
  grid.appendChild(fig);
  fig.querySelectorAll("[data-bind]").forEach(el => updateEmptyState(el, el.innerText));
  applyEditModeToNewNodes(fig);
  return fig;
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
  wall.innerHTML = state.polaroids.map((p, i) => {
    const rotate = POLAROID_TILTS[i % POLAROID_TILTS.length];
    return `
      <div class="polaroid" style="transform: rotate(${rotate}deg)" data-index="${i}">
        <button type="button" class="remove-item-btn edit-only" data-action="polaroid-remove" data-index="${i}" aria-label="Remove memory">&times;</button>
        <div class="photo-frame" data-action="polaroid-photo" data-index="${i}" tabindex="0">
          ${polaroidPhotoFrameHTML(p, i)}
        </div>
        <p class="polaroid-caption editable" contenteditable="false" data-bind="polaroids.${i}.caption" data-placeholder="Enter caption">${escapeHTML(p.caption)}</p>
      </div>
    `;
  }).join("");
  wall.querySelectorAll("[data-bind]").forEach(el => updateEmptyState(el, el.innerText));
  applyEditModeToNewNodes(wall);
}
const POLAROID_TILTS = [-6, 4, -3, 7, -8, 5];

/* Appends exactly one new polaroid without touching any existing ones. */
function appendPolaroidItem(p, i) {
  const wall = document.getElementById("polaroidWall");
  const rotate = POLAROID_TILTS[i % POLAROID_TILTS.length];
  const div = document.createElement("div");
  div.className = "polaroid";
  div.style.transform = `rotate(${rotate}deg)`;
  div.dataset.index = String(i);
  div.innerHTML = `
    <button type="button" class="remove-item-btn edit-only" data-action="polaroid-remove" data-index="${i}" aria-label="Remove memory">&times;</button>
    <div class="photo-frame" data-action="polaroid-photo" data-index="${i}" tabindex="0">
      ${polaroidPhotoFrameHTML(p, i)}
    </div>
    <p class="polaroid-caption editable" contenteditable="false" data-bind="polaroids.${i}.caption" data-placeholder="Enter caption">${escapeHTML(p.caption)}</p>
  `;
  wall.appendChild(div);
  div.querySelectorAll("[data-bind]").forEach(el => updateEmptyState(el, el.innerText));
  applyEditModeToNewNodes(div);
  return div;
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

   Flow for every upload:
     1. beginFramePreview()  — instantly shows the picked photo via
        URL.createObjectURL (no encoding, no main-thread work) in ONLY
        the one frame that was clicked. Nothing else on the page re-renders.
     2. compressImage()      — off the main thread where possible
        (createImageBitmap + async canvas.toBlob), producing a resized,
        persistable base64 image in the background while the preview is
        already visible.
     3. finalizeFramePreview() — swaps the temporary preview for the
        final image on that same single frame, and only then autosaves.
   ================================================================ */
let pendingUpload = null; // { type: 'month'|'gallery-add'|'gallery-replace'|'polaroid-add'|'polaroid-replace', index }

function setupHiddenImageInput() {
  const input = document.getElementById("hiddenImageInput");
  input.addEventListener("change", async () => {
    const file = input.files && input.files[0];
    input.value = ""; // allow choosing the same file again later
    if (!file || !file.type.startsWith("image/") || !pendingUpload) return;

    const upload = pendingUpload;
    pendingUpload = null;

    // Instant preview: an object URL just references the file already
    // sitting in memory — no base64 encoding, no blocking — so the photo
    // appears in its frame right away while the real processing happens
    // in the background.
    const previewUrl = URL.createObjectURL(file);
    const frame = beginFramePreview(upload, previewUrl);

    let dataUrl;
    try {
      dataUrl = await compressImage(file);
    } catch (err) {
      console.error("Image processing failed:", err);
      showToastMessage("Couldn't read that image — try another one.");
      URL.revokeObjectURL(previewUrl);
      cancelFramePreview(upload, frame);
      return;
    }

    URL.revokeObjectURL(previewUrl); // temporary preview no longer needed — avoid leaking memory
    finalizeFramePreview(upload, frame, dataUrl);
    scheduleAutosave();
  });
}

/* Shows the picked photo immediately in exactly one frame. For "add"
   actions, appends exactly one new gallery/polaroid item — the other
   19 month cards / existing photos are never touched or re-rendered. */
function beginFramePreview(upload, previewUrl) {
  let frame;
  switch (upload.type) {
    case "month":
      frame = document.querySelector(`.month-photo.photo-frame[data-index="${upload.index}"]`);
      break;
    case "gallery-replace":
      frame = document.querySelector(`#galleryGrid .gallery-item[data-index="${upload.index}"] .photo-frame`);
      break;
    case "polaroid-replace":
      frame = document.querySelector(`#polaroidWall .polaroid[data-index="${upload.index}"] .photo-frame`);
      break;
    case "gallery-add": {
      upload.index = state.gallery.length; // the index this item will occupy once pushed
      state.gallery.push({ image: null, caption: "New memory" });
      frame = appendGalleryItem(state.gallery[upload.index], upload.index).querySelector(".photo-frame");
      break;
    }
    case "polaroid-add": {
      upload.index = state.polaroids.length;
      state.polaroids.push({ image: null, caption: "New memory" });
      frame = appendPolaroidItem(state.polaroids[upload.index], upload.index).querySelector(".photo-frame");
      break;
    }
  }
  setFramePreviewImage(frame, previewUrl);
  return frame;
}

function setFramePreviewImage(frame, previewUrl) {
  if (!frame) return;
  frame.classList.add("photo-loading");
  const actions = frame.querySelector(".photo-actions");
  let img = frame.querySelector("img");
  if (!img) {
    img = document.createElement("img");
    img.alt = "";
    img.onload = () => fitPhotoFrame(img); // frame conforms to this photo's shape immediately, even during the preview
    frame.insertBefore(img, actions || null);
  }
  img.src = previewUrl;
  // Drop the placeholder emoji text node now that a real preview is showing.
  Array.from(frame.childNodes).forEach(n => {
    if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) n.remove();
  });
}

/* Swaps the temporary object-URL preview for the final, compressed,
   persistable image — touching only this same single frame. */
function finalizeFramePreview(upload, frame, dataUrl) {
  switch (upload.type) {
    case "month": state.months[upload.index].image = dataUrl; break;
    case "gallery-replace":
    case "gallery-add": state.gallery[upload.index].image = dataUrl; break;
    case "polaroid-replace":
    case "polaroid-add": state.polaroids[upload.index].image = dataUrl; break;
  }
  if (!frame || !frame.isConnected) return; // frame vanished for some unrelated reason — nothing to update
  frame.classList.remove("photo-loading");
  switch (upload.type) {
    case "month": frame.innerHTML = monthPhotoFrameHTML(state.months[upload.index], upload.index); break;
    case "gallery-replace":
    case "gallery-add": frame.innerHTML = galleryPhotoFrameHTML(state.gallery[upload.index], upload.index); break;
    case "polaroid-replace":
    case "polaroid-add": frame.innerHTML = polaroidPhotoFrameHTML(state.polaroids[upload.index], upload.index); break;
  }
}

/* If reading/compressing the file fails, cleanly undo the optimistic
   preview instead of leaving a broken or orphaned frame. */
function cancelFramePreview(upload, frame) {
  if (upload.type === "gallery-add") {
    state.gallery.splice(upload.index, 1);
    frame && frame.closest(".gallery-item") && frame.closest(".gallery-item").remove();
  } else if (upload.type === "polaroid-add") {
    state.polaroids.splice(upload.index, 1);
    frame && frame.closest(".polaroid") && frame.closest(".polaroid").remove();
  } else if (frame) {
    frame.classList.remove("photo-loading");
    frame.style.aspectRatio = ""; // fall back to the placeholder's default shape
    const img = frame.querySelector("img");
    if (img) img.remove();
    const emoji = upload.type === "month" ? "📷" : "📸";
    frame.insertBefore(document.createTextNode(emoji), frame.querySelector(".photo-actions"));
  }
}

/* ----------------------------------------------------------------
   compressImage — resizes to MAX_IMAGE_DIMENSION and re-encodes as
   JPEG, WITHOUT cropping (the full image is always kept, aspect
   ratio preserved; only its overall pixel size may shrink).
   Prefers createImageBitmap, which decodes off the main thread in
   supporting browsers, and canvas.toBlob, which encodes
   asynchronously — unlike canvas.toDataURL, which blocks the main
   thread while it encodes. Falls back to the classic Image()+
   FileReader path for older browsers.
   ---------------------------------------------------------------- */
function compressImage(file, maxDim = MAX_IMAGE_DIMENSION, quality = IMAGE_QUALITY) {
  if (window.createImageBitmap) {
    return compressImageViaBitmap(file, maxDim, quality).catch(() => compressImageViaElement(file, maxDim, quality));
  }
  return compressImageViaElement(file, maxDim, quality);
}

async function compressImageViaBitmap(file, maxDim, quality) {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = fitWithinPreservingAspect(bitmap.width, bitmap.height, maxDim);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    return await canvasToDataURLAsync(canvas, quality);
  } finally {
    bitmap.close();
  }
}

function compressImageViaElement(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image decode failed"));
      img.onload = () => {
        const { width, height } = fitWithinPreservingAspect(img.naturalWidth, img.naturalHeight, maxDim);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvasToDataURLAsync(canvas, quality).then(resolve, reject);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Scales width/height down to fit within maxDim on the longest side —
   aspect ratio is always preserved and the image is never cropped. */
function fitWithinPreservingAspect(width, height, maxDim) {
  if (width <= maxDim && height <= maxDim) return { width, height };
  if (width >= height) return { width: maxDim, height: Math.round(height * (maxDim / width)) };
  return { width: Math.round(width * (maxDim / height)), height: maxDim };
}

function canvasToDataURLAsync(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) { reject(new Error("Encoding failed")); return; }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("File read failed"));
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob); // blob is already downscaled + compressed, so this read is fast
    }, "image/jpeg", quality);
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
  const eyebrow = document.querySelector("#questionSection .question-eyebrow");
  const title = document.querySelector("#questionSection .question-title");
  const buttonsWrap = document.querySelector("#questionSection .question-buttons");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const answer = document.getElementById("questionAnswer");

  let countdownStarted = false;
  yesBtn.addEventListener("click", () => {
    // Once said yes, the question itself is done — only the countdown remains.
    if (eyebrow) eyebrow.hidden = true;
    if (title) title.hidden = true;
    if (buttonsWrap) buttonsWrap.hidden = true;
    answer.hidden = false;
    burstHearts(24);
    if (!countdownStarted) {
      countdownStarted = true;
      startNextMonthsaryCountdown();
    }
  });

  // "No" isn't really an option — a few playful nudges, then it just goes
  // quiet (stays put but does nothing more). It only actually disappears
  // once "Yes" is clicked, since that hides the whole buttons row above.
  const noStages = [
    "Bossinggg, bawal yan bossing ha",
    "bawal nga yan bossing",
    "sige na beh, mag yes ka na"
  ];
  let noClicks = 0;
  noBtn.addEventListener("click", () => {
    if (noClicks < noStages.length) {
      noBtn.textContent = noStages[noClicks];
      noClicks++;
    }
    // Beyond the last stage, clicking again does nothing — text just stays.
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
