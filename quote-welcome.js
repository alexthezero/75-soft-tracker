(function () {
  const SEEN_KEY = "soft75DailyQuoteSeen.v1";
  const QUOTES = [
    "Today does not need to be perfect. It just needs to be yours.",
    "Small choices repeated long enough become a new life.",
    "Show up gently. Show up honestly. Show up again tomorrow.",
    "You are not starting over. You are building proof.",
    "Progress counts even when it feels quiet.",
    "The win is not intensity. The win is returning.",
    "One checked box can change the tone of the whole day.",
    "Keep the promise small enough to keep, then keep it.",
    "Consistency is self-respect in motion.",
    "Your future self is built by what you repeat today.",
    "Do the next good thing. That is enough for right now.",
    "You do not need more pressure. You need one steady step.",
    "Health grows best where patience is allowed.",
    "A soft challenge can still create strong results.",
    "Choose progress you can live with.",
    "The goal is not to punish your body. The goal is to care for it.",
    "Start where you are, then make today count.",
    "Your effort matters, even when nobody else sees it.",
    "Every honest check-in is a step forward.",
    "You are allowed to move slowly and still move well.",
    "The habit is the victory before the result arrives.",
    "Let today be simple, steady, and enough.",
    "You are practicing the person you are becoming.",
    "A better routine is built one ordinary day at a time.",
    "Do not chase perfect. Choose consistent.",
    "The quiet work is still working.",
    "You can make today lighter by keeping one promise to yourself.",
    "Momentum begins with a single completed step.",
    "This is not about being extreme. This is about being faithful to yourself.",
    "Keep going. The small stuff is not small when it compounds."
  ];

  function todayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function readableDate() {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }

  function quoteForDate(dateKey) {
    let seed = 0;
    for (let i = 0; i < dateKey.length; i += 1) {
      seed = (seed * 31 + dateKey.charCodeAt(i)) >>> 0;
    }
    return QUOTES[seed % QUOTES.length];
  }

  function alreadySeen(dateKey) {
    try {
      return localStorage.getItem(SEEN_KEY) === dateKey;
    } catch {
      return false;
    }
  }

  function markSeen(dateKey) {
    try {
      localStorage.setItem(SEEN_KEY, dateKey);
    } catch {
      // If localStorage is blocked, just hide for this session.
    }
  }

  function buildWelcome(dateKey) {
    const overlay = document.createElement("div");
    overlay.className = "quote-welcome";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "quoteWelcomeTitle");

    overlay.innerHTML = `
      <section class="quote-welcome-card">
        <p class="quote-welcome-kicker">Today’s encouragement</p>
        <h2 class="quote-welcome-title" id="quoteWelcomeTitle">Welcome back</h2>
        <p class="quote-welcome-quote">“${quoteForDate(dateKey)}”</p>
        <p class="quote-welcome-date">${readableDate()} • One steady day at a time.</p>
        <button class="quote-welcome-button" type="button">Continue to tracker</button>
        <p class="quote-welcome-small">A new quote will appear the first time you open the app each day.</p>
      </section>
    `;

    const button = overlay.querySelector("button");
    button.addEventListener("click", () => {
      markSeen(dateKey);
      overlay.hidden = true;
      overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  function boot() {
    const dateKey = todayKey();
    if (alreadySeen(dateKey)) return;
    buildWelcome(dateKey);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
