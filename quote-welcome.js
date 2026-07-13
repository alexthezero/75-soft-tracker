(function () {
  const SEEN_KEY = "soft75DailyQuoteSeen.v1";
  const QUOTES = [
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "If there is no struggle, there is no progress.", author: "Frederick Douglass" },
    { text: "You must do the thing you think you cannot do.", author: "Eleanor Roosevelt" },
    { text: "Well done is better than well said.", author: "Benjamin Franklin" },
    { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
    { text: "Nothing will work unless you do.", author: "Maya Angelou" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "The best way out is always through.", author: "Robert Frost" },
    { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
    { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
    { text: "No great thing is created suddenly.", author: "Epictetus" },
    { text: "Begin, be bold, and venture to be wise.", author: "Horace" },
    { text: "Action is eloquence.", author: "William Shakespeare" },
    { text: "The most effective way to do it, is to do it.", author: "Amelia Earhart" },
    { text: "With the new day comes new strength and new thoughts.", author: "Eleanor Roosevelt" },
    { text: "Never bend your head. Always hold it high. Look the world straight in the eye.", author: "Helen Keller" },
    { text: "Fortune favors the brave.", author: "Virgil" }
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
    const dailyQuote = quoteForDate(dateKey);
    const overlay = document.createElement("div");
    overlay.className = "quote-welcome";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "quoteWelcomeTitle");

    overlay.innerHTML = `
      <section class="quote-welcome-card">
        <p class="quote-welcome-kicker">Today's encouragement</p>
        <h2 class="quote-welcome-title" id="quoteWelcomeTitle">Welcome back</h2>
        <p class="quote-welcome-quote">"${dailyQuote.text}"</p>
        <p class="quote-welcome-author">— ${dailyQuote.author}</p>
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

(function loadActivityManager() {
  if (document.querySelector('script[data-activity-manager]')) return;
  const script = document.createElement("script");
  script.src = "activity-manager.js?v=25";
  script.dataset.activityManager = "true";
  script.defer = true;
  document.head.appendChild(script);
})();

(function loadChecklistManager() {
  if (document.querySelector('script[data-checklist-manager]')) return;
  const script = document.createElement("script");
  script.src = "checklist-manager.js?v=26";
  script.dataset.checklistManager = "true";
  script.defer = true;
  document.head.appendChild(script);
})();

(function loadThemeToggle() {
  if (document.querySelector('script[data-theme-toggle]')) return;
  const script = document.createElement("script");
  script.src = "theme-toggle.js?v=27";
  script.dataset.themeToggle = "true";
  script.defer = true;
  document.head.appendChild(script);
})();
