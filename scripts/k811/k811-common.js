/*
 * Shared runtime for the kotak811 (k811-*) blocks.
 *
 * - Marks <main> with `.kotak811` so the scoped design guide (styles/kotak811.css)
 *   applies only to these migrated pages.
 * - Loads the design guide + Manrope once.
 * - Scroll reveal uses the real AOS library (self-hosted scripts/k811/aos.js +
 *   aos.css), initialised with the source site's config (fade / 400ms /
 *   ease-in / once:false). A lightweight IntersectionObserver stands in as a
 *   failsafe only if AOS fails to load, so content can never stay hidden.
 */

let stylesLoaded = false;

function loadDesignGuide() {
  if (stylesLoaded) return;
  stylesLoaded = true;
  const main = document.querySelector('main');
  if (main) main.classList.add('kotak811');
  if (!document.querySelector('link[data-k811-styles]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/kotak811.css';
    link.setAttribute('data-k811-styles', '');
    document.head.append(link);
  }
}

// ---- AOS (self-hosted) --------------------------------------------------
// Loaded lazily so it never blocks LCP. UMD build → attaches window.AOS.
let aosPromise;
function loadAOS() {
  if (aosPromise) return aosPromise;
  aosPromise = new Promise((resolve) => {
    if (window.AOS) { resolve(window.AOS); return; }
    // stylesheet
    if (!document.querySelector('link[data-k811-aos-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/scripts/k811/aos.css';
      link.setAttribute('data-k811-aos-css', '');
      document.head.append(link);
    }
    // script (classic; UMD sets window.AOS with `this` = window)
    const s = document.createElement('script');
    s.src = '/scripts/k811/aos.min.js';
    s.async = true;
    s.addEventListener('load', () => {
      if (window.AOS) {
        window.AOS.init({
          duration: 400,
          easing: 'ease-in',
          delay: 0,
          once: false, // re-trigger on scroll in/out, matching the source
          offset: 80,
          disableMutationObserver: true,
        });
      }
      resolve(window.AOS);
    });
    s.addEventListener('error', () => resolve(null));
    document.head.append(s);
  });
  return aosPromise;
}

// Failsafe observer, used only if AOS fails to load: re-triggers (matches AOS
// `once: false`) by toggling the class as elements enter/leave the viewport.
let observer;
function getObserver() {
  if (observer) return observer;
  if (typeof IntersectionObserver === 'undefined') return null;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('k811-aos-in', entry.isIntersecting);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
  return observer;
}

let refreshQueued = false;

/**
 * Register an element (or elements) for the fade-in reveal, driven by the real
 * AOS library. Falls back to the IntersectionObserver reveal if AOS is
 * unavailable so content is never left hidden.
 * @param {Element|Element[]} targets
 */
export function revealOnScroll(targets) {
  const list = (Array.isArray(targets) ? targets : [targets]).filter(Boolean);
  // AOS's built-in "fade" = pure opacity 0->1 (the source's fade-in effect).
  // `data-k811-aos` drives our failsafe IntersectionObserver reveal if AOS
  // can't load.
  list.forEach((el) => {
    el.setAttribute('data-aos', 'fade');
    el.setAttribute('data-k811-aos', 'fade-in');
  });

  loadAOS().then((AOS) => {
    if (AOS && typeof AOS.refreshHard === 'function') {
      if (!refreshQueued) {
        refreshQueued = true;
        requestAnimationFrame(() => { refreshQueued = false; AOS.refreshHard(); });
      }
      return;
    }
    // Failsafe: AOS didn't load — use the IntersectionObserver reveal.
    const io = getObserver();
    list.forEach((el) => {
      if (io) { el.classList.add('k811-aos-ready'); io.observe(el); }
    });
  });
}

/**
 * Standard init every k811 block calls first.
 * @param {Element} block
 */
export function initK811(block) {
  loadDesignGuide();
  block.classList.add('k811-block');
}

/**
 * Lazily mount a looping, autoplaying Lottie animation (decorative).
 * Loads the lottie-player web component on demand so it never blocks LCP.
 * @param {Element} container where the player is appended
 * @param {string} src Lottie JSON url
 */
export async function mountLottie(container, src) {
  if (!src || !container) return;
  if (!customElements.get('lottie-player')) {
    await import('./lottie-player.min.js').catch(() => {});
  }
  const player = document.createElement('lottie-player');
  player.classList.add('k811-lottie');
  player.setAttribute('src', src);
  player.setAttribute('background', 'transparent');
  player.setAttribute('speed', '1');
  player.setAttribute('loop', '');
  player.setAttribute('autoplay', '');
  container.append(player);
}
