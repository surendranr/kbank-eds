import { loadCSS } from './aem.js';

/*
 * Eligibility quick-check modal — shared by cc-steps and cc-hero.
 * A 4-question quiz shown in a <body>-level overlay; the final result panel
 * offers an "Apply Now" link (to the application page) and "Check again".
 *
 * Markup keeps the cc-steps-* class names so the styling in
 * styles/eligibility-modal.css applies wherever the modal is opened.
 */

const ELIGIBILITY_QUESTIONS = [
  { q: "What's your age?", options: ['18-25 years', '26-40 years', '41-60 years', '60+ years'] },
  { q: "What's your monthly income?", options: ['Below 15000', '30000-45000', '45000-75000', 'Above 75000'] },
  { q: 'Employment status?', options: ['Salaried', 'Self-Employed', 'Business Owner', 'Student/other'] },
  { q: 'Do you have an existing credit card?', options: ['Yes, from any bank', 'No, first time', 'Had one before', 'Multiple cards'] },
];

/**
 * Open the eligibility quick-check modal.
 * @param {string} applyHref href the result panel's "Apply Now" links to
 */
export default function openEligibilityModal(applyHref) {
  loadCSS(`${window.hlx.codeBasePath}/styles/eligibility-modal.css`);

  const total = ELIGIBILITY_QUESTIONS.length;
  let step = 0;

  const overlay = document.createElement('div');
  overlay.className = 'cc-steps-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Check your eligibility');

  const modal = document.createElement('div');
  modal.className = 'cc-steps-modal';

  const close = () => {
    overlay.remove();
    document.body.style.overflow = '';
  };

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'cc-steps-modal-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', close);

  const head = document.createElement('div');
  head.className = 'cc-steps-modal-head';
  head.innerHTML = `
    <p class="cc-steps-modal-eyebrow">Quick Check</p>
    <h3 class="cc-steps-modal-title">Check your eligibility in 30 seconds</h3>
    <p class="cc-steps-modal-sub">Answer 4 quick questions to know if you qualify</p>`;

  const bodyEl = document.createElement('div');
  bodyEl.className = 'cc-steps-modal-body';

  const renderQuestion = () => {
    // header (Quick Check / title / subtitle) shows only on the first question
    head.hidden = step > 0;
    const { q, options } = ELIGIBILITY_QUESTIONS[step];
    // progress reflects answered questions: 0% on the first question, then
    // 25% after answering it, and so on up to 100% at the result.
    const pct = Math.round((step / total) * 100);
    bodyEl.innerHTML = `
      <div class="cc-steps-quiz-progress">
        <div class="cc-steps-quiz-progress-row">
          <span class="cc-steps-quiz-count">Question ${step + 1} of ${total}</span>
          <span class="cc-steps-quiz-pct">${pct}%</span>
        </div>
        <div class="cc-steps-quiz-bar"><span style="width:${pct}%"></span></div>
      </div>
      <h4 class="cc-steps-quiz-question">${q}</h4>
      <div class="cc-steps-quiz-options"></div>`;
    const optionsWrap = bodyEl.querySelector('.cc-steps-quiz-options');
    options.forEach((label) => {
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'cc-steps-quiz-option';
      opt.textContent = label;
      opt.addEventListener('click', () => {
        step += 1;
        // eslint-disable-next-line no-use-before-define
        if (step >= total) renderResult(); else renderQuestion();
      });
      optionsWrap.append(opt);
    });
  };

  function renderResult() {
    head.hidden = true;
    bodyEl.innerHTML = `
      <div class="cc-steps-quiz-result">
        <span class="cc-steps-quiz-result-icon" aria-hidden="true"></span>
        <h4 class="cc-steps-quiz-result-title">Great news! You're likely eligible</h4>
        <p class="cc-steps-quiz-result-note">Based on your profile, you meet the basic criteria for most Kotak credit cards. Apply now to get instant approval.</p>
        <div class="cc-steps-quiz-result-actions">
          <a class="cc-steps-quiz-apply" href="${applyHref || '#'}">Apply Now</a>
          <button type="button" class="cc-steps-quiz-again">Check again</button>
        </div>
      </div>`;
    bodyEl.querySelector('.cc-steps-quiz-again').addEventListener('click', () => {
      step = 0;
      renderQuestion();
    });
  }

  renderQuestion();

  modal.append(closeBtn, head, bodyEl);
  overlay.append(modal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
  document.body.append(overlay);
  document.body.style.overflow = 'hidden';
}
