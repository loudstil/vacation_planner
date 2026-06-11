"use strict";

/* ===== מטבעות (מחירי הבסיס מוגדרים בדולר) ===== */
const CURRENCIES = {
  ILS: { symbol: "₪", rate: 3.7 },
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
};

/* ===== שאלות הסימולציה =====
   בכל שאלה אפשר לבחור כמה אפשרויות, וגם להוסיף פריטים ידנית.
   pricing: איך מחושב המחיר —
   perPerson         פעם אחת לכל נפש
   perNightPerRoom   לכל לילה, כפול מספר חדרים (חדר לכל 3 נפשות)
   perDay            לכל יום חופשה
   perPersonPerDay   לכל נפש לכל יום
   fixedCouple       מחיר קבוע לזוג
   manual            סכום שהוזן ידנית במטבע הנבחר, ללא המרה
*/
const QUESTIONS = [
  {
    id: "flight",
    title: "✈️ איך מגיעים ליעד?",
    options: [
      { id: "none",    icon: "🚗", name: "נסיעה ברכב הפרטי", desc: "ללא עלות טיסה", price: 0,   pricing: "perPerson" },
      { id: "charter", icon: "🛫", name: "טיסת צ'רטר / לואו-קוסט", desc: "מחיר לנפש, הלוך-חזור", price: 250, pricing: "perPerson" },
      { id: "regular", icon: "✈️", name: "טיסה סדירה", desc: "מחיר לנפש, הלוך-חזור", price: 420, pricing: "perPerson" },
      { id: "direct",  icon: "🥂", name: "טיסה ישירה פרימיום", desc: "מחיר לנפש, הלוך-חזור", price: 650, pricing: "perPerson" },
    ],
  },
  {
    id: "hotel",
    title: "🏨 איפה ישנים?",
    options: [
      { id: "hostel", icon: "🛏️", name: "אכסניה / צימר פשוט", desc: "מחיר לחדר ללילה", price: 70,  pricing: "perNightPerRoom" },
      { id: "star3",  icon: "🏨", name: "מלון 3 כוכבים", desc: "מחיר לחדר ללילה", price: 130, pricing: "perNightPerRoom" },
      { id: "star4",  icon: "🏨", name: "מלון 4 כוכבים", desc: "מחיר לחדר ללילה, כולל ארוחת בוקר", price: 210, pricing: "perNightPerRoom" },
      { id: "star5",  icon: "🏰", name: "מלון 5 כוכבים / ריזורט", desc: "מחיר לחדר ללילה, הכל כלול", price: 380, pricing: "perNightPerRoom" },
    ],
  },
  {
    id: "car",
    title: "🚙 איך מתניידים ביעד?",
    options: [
      { id: "none",    icon: "🚌", name: "תחבורה ציבורית", desc: "הערכת עלות יומית למשפחה", price: 15, pricing: "perDay" },
      { id: "compact", icon: "🚗", name: "רכב שכור קומפקטי", desc: "מחיר ליום", price: 38, pricing: "perDay" },
      { id: "family",  icon: "🚘", name: "רכב שכור משפחתי", desc: "מחיר ליום", price: 58, pricing: "perDay" },
      { id: "minivan", icon: "🚐", name: "מיניוואן / SUV", desc: "מחיר ליום, מתאים למשפחה גדולה", price: 88, pricing: "perDay" },
    ],
  },
  {
    id: "attractions",
    title: "🎢 אילו אטרקציות מתאימות לכם?",
    options: [
      { id: "themepark", icon: "🎢", name: "פארק שעשועים", desc: "כרטיס לנפש", price: 60, pricing: "perPerson" },
      { id: "waterpark", icon: "💦", name: "פארק מים", desc: "כרטיס לנפש", price: 42, pricing: "perPerson" },
      { id: "boat",      icon: "🚤", name: "שייט / קרוז יומי", desc: "כרטיס לנפש", price: 35, pricing: "perPerson" },
      { id: "museum",    icon: "🏛️", name: "מוזיאונים ואתרים", desc: "כרטיס לנפש", price: 18, pricing: "perPerson" },
      { id: "zoo",       icon: "🦁", name: "גן חיות / ספארי", desc: "כרטיס לנפש", price: 22, pricing: "perPerson" },
      { id: "spa",       icon: "💆", name: "יום ספא להורים", desc: "מחיר לנפש (2 נפשות)", price: 85, pricing: "fixedCouple" },
    ],
  },
  {
    id: "food",
    title: "🍽️ איך אוכלים בחופשה?",
    options: [
      { id: "self",  icon: "🛒", name: "בישול עצמי / סופרמרקט", desc: "הערכה לנפש ליום", price: 14, pricing: "perPersonPerDay" },
      { id: "mixed", icon: "🥪", name: "משולב — מסעדה פעם ביום", desc: "הערכה לנפש ליום", price: 30, pricing: "perPersonPerDay" },
      { id: "rest",  icon: "🍝", name: "מסעדות בכל הארוחות", desc: "הערכה לנפש ליום", price: 55, pricing: "perPersonPerDay" },
    ],
  },
  {
    id: "insurance",
    title: "🛡️ ביטוח נסיעות?",
    options: [
      { id: "basic",    icon: "📄", name: "ביטוח בסיסי", desc: "מחיר לנפש ליום", price: 3, pricing: "perPersonPerDay" },
      { id: "extended", icon: "🛡️", name: "ביטוח מורחב + ביטול נסיעה", desc: "מחיר לנפש ליום", price: 6, pricing: "perPersonPerDay" },
    ],
  },
  {
    id: "other",
    title: "🧾 הוצאות נוספות",
    options: [
      { id: "shopping", icon: "🛍️", name: "קניות ומזכרות", desc: "הערכה לנפש", price: 40, pricing: "perPerson" },
      { id: "parking",  icon: "🅿️", name: "חניות ואגרות", desc: "הערכה ליום", price: 10, pricing: "perDay" },
    ],
  },
];

const CATEGORY_LABELS = {
  flight: "טיסות / הגעה",
  hotel: "לינה",
  car: "רכב ותחבורה",
  attractions: "אטרקציות",
  food: "אוכל",
  insurance: "ביטוח",
  other: "הוצאות נוספות",
};

/* ===== מצב המערכת ===== */
const state = {
  currency: "ILS",
  budget: 15000,
  people: 4,
  nights: 5,
  questionIndex: 0,
  // selections[questionId] = Set של optionIds (כולל פריטים ידניים)
  selections: {},
  // customOptions[questionId] = מערך פריטים שהוזנו ידנית
  customOptions: {},
  // priceOverrides["qId:optId"] = { amount, currency } — מחיר שהמשתמש שינה
  priceOverrides: {},
  // המפתח של האפשרות שנמצאת כרגע במצב עריכת מחיר
  editingKey: null,
};

let customCounter = 0;

/* ===== עזרי DOM ===== */
const $ = (sel) => document.querySelector(sel);
const stepSetup = $("#step-setup");
const stepQuestions = $("#step-questions");
const stepResults = $("#step-results");

function showStep(step) {
  [stepSetup, stepQuestions, stepResults].forEach((s) => s.classList.add("hidden"));
  step.classList.remove("hidden");
}

/* ===== המרת מטבע ופורמט ===== */
function toCurrency(usdAmount) {
  return usdAmount * CURRENCIES[state.currency].rate;
}

function fmt(amount) {
  const { symbol } = CURRENCIES[state.currency];
  return `${symbol}${Math.round(amount).toLocaleString("he-IL")}`;
}

/* ===== חישוב עלות אפשרות ===== */
// מחיר היחידה בדולר, בהתחשב בשינוי ידני של מחיר/מטבע
function unitPriceUSD(qId, option) {
  const override = state.priceOverrides[`${qId}:${option.id}`];
  if (override) return override.amount / CURRENCIES[override.currency].rate;
  if (option.currency) return option.price / CURRENCIES[option.currency].rate;
  return option.price; // מחירי ברירת המחדל מוגדרים בדולר
}

// המחיר והמטבע שיוצגו בעורך — הערך האחרון שהמשתמש קבע, או ברירת המחדל
function displayedPrice(qId, option) {
  const override = state.priceOverrides[`${qId}:${option.id}`];
  if (override) return { amount: override.amount, currency: override.currency };
  return { amount: option.price, currency: option.currency || "USD" };
}

function optionCost(qId, option) {
  const { people, nights } = state;
  const days = nights + 1;
  const rooms = Math.ceil(people / 3);
  const unit = unitPriceUSD(qId, option);
  let usd;
  switch (option.pricing) {
    case "perPerson":        usd = unit * people; break;
    case "perNightPerRoom":  usd = unit * nights * rooms; break;
    case "perDay":           usd = unit * days; break;
    case "perPersonPerDay":  usd = unit * people * days; break;
    case "fixedCouple":      usd = unit * 2; break;
    case "manual":           usd = unit; break; // מחיר כולל
    default:                 usd = unit;
  }
  return toCurrency(usd);
}

function questionOptions(q) {
  return [...q.options, ...(state.customOptions[q.id] || [])];
}

/* ===== שלב 1: הגדרות ===== */
$("#btn-start").addEventListener("click", () => {
  state.currency = $("#currency").value;
  state.budget = Math.max(0, Number($("#budget").value) || 0);
  state.people = Math.min(12, Math.max(1, Number($("#people").value) || 1));
  state.nights = Math.min(30, Math.max(1, Number($("#nights").value) || 1));
  state.questionIndex = 0;
  renderQuestion();
  showStep(stepQuestions);
});

/* ===== שלב 2: שאלות ===== */
function renderQuestion() {
  const q = QUESTIONS[state.questionIndex];
  $("#question-title").textContent = q.title;
  $("#question-progress").textContent =
    `שאלה ${state.questionIndex + 1} מתוך ${QUESTIONS.length} · אפשר לבחור כמה אפשרויות או להוסיף ידנית`;

  if (!(q.id in state.selections)) state.selections[q.id] = new Set();
  const selected = state.selections[q.id];

  const container = $("#question-options");
  container.innerHTML = "";

  questionOptions(q).forEach((opt) => {
    const key = `${q.id}:${opt.id}`;
    const card = document.createElement("div");
    card.className = "option-card";
    card.setAttribute("role", "button");
    card.tabIndex = 0;

    const cost = optionCost(q.id, opt);
    const priceLabel = cost === 0 ? "חינם" : fmt(cost);
    const isOverridden = key in state.priceOverrides;
    card.innerHTML = `
      <div class="option-main">
        <span class="option-icon">${opt.icon}</span>
        <div>
          <div class="option-name"></div>
          <div class="option-desc"></div>
        </div>
      </div>
      <div class="option-side">
        <span class="option-price ${cost === 0 ? "free" : ""}">${priceLabel}</span>
        <button class="icon-btn edit-btn" title="עריכת מחיר ומטבע">✏️</button>
        ${opt.pricing === "manual" ? '<button class="icon-btn remove-btn" title="הסרת פריט">✖</button>' : ""}
      </div>
    `;
    card.querySelector(".option-name").textContent = opt.name;
    card.querySelector(".option-desc").textContent =
      opt.desc + (isOverridden ? " · מחיר מותאם אישית" : "");
    card.classList.toggle("selected", selected.has(opt.id));

    const toggle = () => {
      selected.has(opt.id) ? selected.delete(opt.id) : selected.add(opt.id);
      renderQuestion();
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });

    card.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      state.editingKey = state.editingKey === key ? null : key;
      renderQuestion();
    });

    const removeBtn = card.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.customOptions[q.id] = (state.customOptions[q.id] || []).filter((o) => o.id !== opt.id);
        selected.delete(opt.id);
        delete state.priceOverrides[key];
        if (state.editingKey === key) state.editingKey = null;
        renderQuestion();
      });
    }

    container.appendChild(card);

    /* עורך מחיר ומטבע לאפשרות */
    if (state.editingKey === key) {
      const current = displayedPrice(q.id, opt);
      const editor = document.createElement("div");
      editor.className = "price-editor";
      editor.innerHTML = `
        <span class="custom-add-title">✏️ עריכת מחיר — ${opt.name}</span>
        <input type="number" id="edit-price" min="0" step="1" value="${current.amount}">
        <select id="edit-currency">
          ${Object.keys(CURRENCIES).map((c) =>
            `<option value="${c}" ${c === current.currency ? "selected" : ""}>${CURRENCIES[c].symbol} ${c}</option>`).join("")}
        </select>
        <button class="btn primary" id="btn-save-price">שמירה</button>
        ${isOverridden ? '<button class="btn" id="btn-reset-price">איפוס לברירת מחדל</button>' : ""}
      `;
      editor.addEventListener("click", (e) => e.stopPropagation());

      const save = () => {
        const amount = Number(editor.querySelector("#edit-price").value);
        if (!(amount >= 0)) return;
        state.priceOverrides[key] = { amount, currency: editor.querySelector("#edit-currency").value };
        state.editingKey = null;
        renderQuestion();
      };
      editor.querySelector("#btn-save-price").addEventListener("click", save);
      editor.querySelector("#edit-price").addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
      });
      const resetBtn = editor.querySelector("#btn-reset-price");
      if (resetBtn) resetBtn.addEventListener("click", () => {
        delete state.priceOverrides[key];
        state.editingKey = null;
        renderQuestion();
      });

      container.appendChild(editor);
    }
  });

  /* טופס הוספה ידנית */
  const form = document.createElement("div");
  form.className = "custom-add";
  form.innerHTML = `
    <span class="custom-add-title">➕ הוספה ידנית</span>
    <input type="text" id="custom-name" placeholder="שם הפריט (למשל: כרטיסים להופעה)" maxlength="60">
    <input type="number" id="custom-price" placeholder="מחיר כולל" min="0" step="1">
    <select id="custom-currency">
      ${Object.keys(CURRENCIES).map((c) =>
        `<option value="${c}" ${c === state.currency ? "selected" : ""}>${CURRENCIES[c].symbol} ${c}</option>`).join("")}
    </select>
    <button class="btn primary" id="btn-add-custom">הוספה</button>
  `;
  container.appendChild(form);

  const addCustom = () => {
    const name = form.querySelector("#custom-name").value.trim();
    const price = Number(form.querySelector("#custom-price").value);
    const currency = form.querySelector("#custom-currency").value;
    if (!name || !(price >= 0)) return;
    const id = `custom-${++customCounter}`;
    if (!state.customOptions[q.id]) state.customOptions[q.id] = [];
    state.customOptions[q.id].push({
      id, icon: "📝", name,
      desc: "פריט שהוזן ידנית · מחיר כולל",
      price, currency, pricing: "manual",
    });
    selected.add(id);
    renderQuestion();
  };
  form.querySelector("#btn-add-custom").addEventListener("click", addCustom);
  form.querySelectorAll("input").forEach((inp) =>
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") addCustom(); }));

  $("#btn-next").textContent =
    state.questionIndex === QUESTIONS.length - 1 ? "לתוצאות 🏁" : "המשך ←";
}

$("#btn-next").addEventListener("click", () => {
  if (state.questionIndex < QUESTIONS.length - 1) {
    state.questionIndex++;
    renderQuestion();
  } else {
    renderResults();
    showStep(stepResults);
  }
});

$("#btn-back").addEventListener("click", () => {
  if (state.questionIndex > 0) {
    state.questionIndex--;
    renderQuestion();
  } else {
    showStep(stepSetup);
  }
});

/* ===== חישוב סך הכל ===== */
function categoryCosts() {
  return QUESTIONS.map((q) => {
    const sel = state.selections[q.id] || new Set();
    const chosen = questionOptions(q).filter((o) => sel.has(o.id));
    const cost = chosen.reduce((sum, o) => sum + optionCost(q.id, o), 0);
    const detail = chosen.length ? chosen.map((o) => o.name).join(", ") : "ללא";
    return { id: q.id, label: CATEGORY_LABELS[q.id], detail, cost };
  });
}

/* ===== שלב 3: תוצאות ומחוג ===== */
function renderResults() {
  const cats = categoryCosts();
  const total = cats.reduce((s, c) => s + c.cost, 0);
  const budget = state.budget;
  const ratio = budget > 0 ? total / budget : (total > 0 ? Infinity : 0);

  $("#total-budget").textContent = fmt(budget);
  $("#total-cost").textContent = fmt(total);

  const balance = budget - total;
  const balanceCard = $("#balance-card");
  balanceCard.classList.toggle("over", balance < 0);
  balanceCard.classList.toggle("under", balance >= 0);
  $("#balance-label").textContent = balance >= 0 ? "יתרה" : "חריגה";
  $("#total-balance").textContent = fmt(Math.abs(balance));

  // טבלת פירוט
  const table = $("#breakdown");
  table.innerHTML = `
    <tr><th>קטגוריה</th><th>בחירה</th><th>עלות</th></tr>
    ${cats.map((c) => `
      <tr>
        <td>${c.label}</td>
        <td>${c.detail}</td>
        <td class="amount">${fmt(c.cost)}</td>
      </tr>`).join("")}
    <tr class="total-row">
      <td>סה"כ</td><td></td><td class="amount">${fmt(total)}</td>
    </tr>
  `;

  drawGauge(ratio);
}

/* ===== ציור המחוג =====
   חצי מעגל 180°. הסקאלה: 0% עד 130% מהתקציב.
   אזורים: ירוק 0–75%, צהוב 75–100%, אדום 100–130%. */
const GAUGE_MAX = 1.3;

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

// ratio (0..GAUGE_MAX) -> זווית במעלות. ב-RTL: 0% בימין (0°), מקסימום בשמאל (180°)
function ratioToAngle(ratio) {
  const clamped = Math.max(0, Math.min(GAUGE_MAX, ratio));
  return (clamped / GAUGE_MAX) * 180;
}

function arcPath(cx, cy, r, fromRatio, toRatio) {
  const a1 = ratioToAngle(fromRatio);
  const a2 = ratioToAngle(toRatio);
  const p1 = polar(cx, cy, r, a1);
  const p2 = polar(cx, cy, r, a2);
  const largeArc = a2 - a1 > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 0 ${p2.x} ${p2.y}`;
}

function drawGauge(ratio) {
  const svg = $("#gauge");
  const cx = 150, cy = 160, r = 120, width = 26;
  const zones = [
    { from: 0,    to: 0.75, color: "#22c55e" },
    { from: 0.75, to: 1.0,  color: "#f59e0b" },
    { from: 1.0,  to: GAUGE_MAX, color: "#ef4444" },
  ];

  let parts = "";

  // קשתות אזורי הצבע
  zones.forEach((z) => {
    parts += `<path d="${arcPath(cx, cy, r, z.from, z.to)}"
      fill="none" stroke="${z.color}" stroke-width="${width}" stroke-linecap="butt"/>`;
  });

  // שנתות ותוויות
  const ticks = [0, 0.25, 0.5, 0.75, 1.0, 1.3];
  ticks.forEach((t) => {
    const a = ratioToAngle(t);
    const pOut = polar(cx, cy, r + width / 2 + 2, a);
    const pIn = polar(cx, cy, r - width / 2 - 2, a);
    const pLabel = polar(cx, cy, r + width / 2 + 16, a);
    parts += `<line x1="${pIn.x}" y1="${pIn.y}" x2="${pOut.x}" y2="${pOut.y}"
      stroke="#1f2a3d" stroke-width="1.5"/>`;
    parts += `<text x="${pLabel.x}" y="${pLabel.y}" font-size="11" fill="#6b7a90"
      text-anchor="middle" dominant-baseline="middle">${Math.round(t * 100)}%</text>`;
  });

  // קו גבול התקציב (100%)
  const a100 = ratioToAngle(1);
  const b1 = polar(cx, cy, r - width / 2 - 6, a100);
  const b2 = polar(cx, cy, r + width / 2 + 6, a100);
  parts += `<line x1="${b1.x}" y1="${b1.y}" x2="${b2.x}" y2="${b2.y}"
    stroke="#1f2a3d" stroke-width="3" stroke-dasharray="4 3"/>`;

  // המחט
  const needleAngle = ratioToAngle(ratio);
  const tip = polar(cx, cy, r - width / 2 - 10, needleAngle);
  const baseL = polar(cx, cy, 10, needleAngle + 90);
  const baseR = polar(cx, cy, 10, needleAngle - 90);
  parts += `<polygon points="${tip.x},${tip.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}"
    fill="#1f2a3d"/>`;
  parts += `<circle cx="${cx}" cy="${cy}" r="13" fill="#1f2a3d"/>`;
  parts += `<circle cx="${cx}" cy="${cy}" r="6" fill="#fff"/>`;

  svg.innerHTML = parts;

  // טקסט מצב
  const pct = isFinite(ratio) ? Math.round(ratio * 100) : 100;
  $("#gauge-percent").textContent = `${pct}%`;
  const status = $("#gauge-status");
  status.classList.remove("ok", "warn", "danger");
  if (ratio < 0.75) {
    status.textContent = "✅ בתוך התקציב — מרווח נשימה";
    status.classList.add("ok");
  } else if (ratio <= 1) {
    status.textContent = "⚠️ קרוב לגבול התקציב";
    status.classList.add("warn");
  } else {
    status.textContent = "🚨 חריגה מהתקציב!";
    status.classList.add("danger");
  }
}

/* ===== כפתורי תוצאות ===== */
$("#btn-edit").addEventListener("click", () => {
  state.questionIndex = 0;
  renderQuestion();
  showStep(stepQuestions);
});

$("#btn-restart").addEventListener("click", () => {
  state.selections = {};
  state.customOptions = {};
  state.priceOverrides = {};
  state.editingKey = null;
  state.questionIndex = 0;
  showStep(stepSetup);
});
