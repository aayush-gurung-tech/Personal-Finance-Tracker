const logoutbtn = document.querySelector(".dash-header-actions a");

const toggleBudgetFormBtn = document.querySelector("#toggle-budget-form");
const budgetForm = document.querySelector("#budget-form");
const budgetCategoryInput = document.querySelector("#budget-category");
const budgetPeriodInput = document.querySelector("#budget-period");
const budgetAmountInput = document.querySelector("#budget-amount");
const budgetsTable = document.querySelector("#budgets-table");

const totalEl = document.querySelector("#budget-total");
const spentEl = document.querySelector("#budget-spent");
const remainingEl = document.querySelector("#budget-remaining");

const exportbtn = document.querySelector("#export-budgets");
const importbtn = document.querySelector("#import-budgets");
const clearbtn = document.querySelector("#clear-budgets");
const fileinput = document.querySelector("#budgets-file");

const AUTH_KEY = "authUserEmail";
const BUDGETS_KEY = "budgets";

function requireLogin() {
  const useremaillogin = sessionStorage.getItem(AUTH_KEY);
  if (!useremaillogin) location.replace("login.html");
  return useremaillogin || "";
}

function installAuthGuards() {
  const check = () => {
    if (!sessionStorage.getItem(AUTH_KEY)) location.replace("login.html");
  };
  window.addEventListener("pageshow", check);
  window.addEventListener("popstate", check);
}

function setlogout() {
  if (!logoutbtn) return;
  logoutbtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("loggedUserEmail"); // legacy key cleanup
    sessionStorage.clear();
    location.replace("login.html");
  });
}

function setBudgetFormToggle() {
  if (!toggleBudgetFormBtn || !budgetForm) return;

  const applyLabel = () => {
    const open = !budgetForm.hidden;
    toggleBudgetFormBtn.innerHTML = open
      ? `<i class="fa-solid fa-minus"></i>Hide Form`
      : `<i class="fa-solid fa-plus"></i>Add Budget`;
  };

  applyLabel();
  toggleBudgetFormBtn.addEventListener("click", () => {
    budgetForm.hidden = !budgetForm.hidden;
    applyLabel();
    if (!budgetForm.hidden) budgetForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseDate(dateid) {
  const d = new Date(dateid);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun..6=Sat
  const offset = (day + 6) % 7; // Monday=0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return date;
}

function startOfMonth(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  return date;
}

function getTransactions() {
  return JSON.parse(sessionStorage.getItem("transactions")) || [];
}

function getBudgets() {
  return JSON.parse(sessionStorage.getItem(BUDGETS_KEY)) || [];
}

function setBudgets(value) {
  sessionStorage.setItem(BUDGETS_KEY, JSON.stringify(value || []));
}

function getBudgetSpent(budget, now) {
  const period = (budget.period || "monthly").toLowerCase();
  const start = period === "weekly" ? startOfWeek(now) : startOfMonth(now);

  const category = (budget.category || "").trim().toLowerCase();
  if (!category) return 0;

  const transitionsAll = getTransactions();
  let spent = 0;
  transitionsAll.forEach((t) => {
    const isIncome = (t.incometype || "").toLowerCase() === "income";
    if (isIncome) return;
    const d = parseDate(t.dateid);
    if (!d) return;
    if (d < start || d > now) return;
    const tCategory = (t.category || "").trim().toLowerCase();
    if (tCategory !== category) return;
    spent += Number(t.amount) || 0;
  });
  return spent;
}

function renderKpis() {
  if (!totalEl || !spentEl || !remainingEl) return;
  const budgets = getBudgets();
  const now = new Date();

  let total = 0;
  let spent = 0;
  budgets.forEach((b) => {
    const limit = Number(b.amount) || 0;
    total += limit;
    spent += getBudgetSpent(b, now);
  });

  const remaining = total - spent;
  totalEl.textContent = `$${formatMoney(total)}`;
  spentEl.textContent = `$${formatMoney(spent)}`;
  remainingEl.textContent = `$${formatMoney(remaining)}`;
}

function renderBudgets() {
  if (!budgetsTable) return;
  const budgets = getBudgets();
  const now = new Date();

  budgetsTable.innerHTML = `
    <div class="t-row t-head">
      <div>Category</div>
      <div>Period</div>
      <div class="right">Budget</div>
      <div class="right">Spent</div>
      <div class="right">Remaining</div>
      <div>Status</div>
      <div class="right">Action</div>
    </div>
  `;

  if (!budgets.length) {
    budgetsTable.insertAdjacentHTML(
      "beforeend",
      `
        <div class="t-row">
          <div class="muted">No budgets yet</div>
          <div>-</div>
          <div class="right muted">$0.00</div>
          <div class="right muted">$0.00</div>
          <div class="right muted">$0.00</div>
          <div>-</div>
          <div class="right">-</div>
        </div>
      `
    );
    return;
  }

  const rows = budgets
    .slice()
    .reverse()
    .map((b) => {
      const limit = Number(b.amount) || 0;
      const spent = getBudgetSpent(b, now);
      const remaining = limit - spent;
      const over = remaining < 0;
      const statusPill = over
        ? `<span class="pill bad">Over</span>`
        : `<span class="pill ok">On track</span>`;
      const remainingClass = over ? "neg" : "pos";
      const periodLabel =
        (b.period || "monthly").toLowerCase() === "weekly" ? "Weekly" : "Monthly";
      return `
        <div class="t-row">
          <div>${b.category || ""}</div>
          <div><span class="pill ${over ? "bad" : "ok"}">${periodLabel}</span></div>
          <div class="right">$${formatMoney(limit)}</div>
          <div class="right">$${formatMoney(spent)}</div>
          <div class="right ${remainingClass}">$${formatMoney(remaining)}</div>
          <div>${statusPill}</div>
          <div class="right">
            <button class="btn btn-ghost delete-budget" data-id="${b.id || ""}" type="button">
              Delete
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  budgetsTable.insertAdjacentHTML("beforeend", rows);
}

function setBudgetForm() {
  if (!budgetForm || !budgetCategoryInput || !budgetPeriodInput || !budgetAmountInput) return;
  budgetForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const category = String(budgetCategoryInput.value || "").trim();
    const period = budgetPeriodInput.value.trim();
    const amount = Number(budgetAmountInput.value);

    if (!category) return;
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    const budgets = getBudgets();
    budgets.push({
      id: Date.now(),
      category,
      period: period === "weekly" ? "weekly" : "monthly",
      amount,
    });
    setBudgets(budgets);
    budgetForm.reset();
    renderBudgets();
    renderKpis();
  });
}

function setDeleteHandler() {
  if (!budgetsTable) return;
  budgetsTable.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-budget");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;
    const ok = confirm("Delete this budget?");
    if (!ok) return;
    const budgets = getBudgets();
    const next = budgets.filter((b) => String(b.id) !== String(id));
    setBudgets(next);
    renderBudgets();
    renderKpis();
  });
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value || [], null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function setExport() {
  if (!exportbtn) return;
  exportbtn.addEventListener("click", () => {
    const budgets = getBudgets();
    downloadJson("budgets.json", budgets);
  });
}

function setImport() {
  if (!importbtn || !fileinput) return;
  importbtn.addEventListener("click", () => {
    fileinput.value = "";
    fileinput.click();
  });

  fileinput.addEventListener("change", async () => {
    const file = fileinput.files && fileinput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        alert("Invalid file");
        return;
      }

      const clean = data
        .filter((b) => b && typeof b === "object")
        .map((b) => {
          return {
            id: b.id || Date.now() + Math.random(),
            category: String(b.category || "").trim(),
            period: String(b.period || "monthly").toLowerCase() === "weekly" ? "weekly" : "monthly",
            amount: Number(b.amount) || 0,
          };
        })
        .filter((b) => b.category && Number.isFinite(b.amount) && b.amount > 0);

      setBudgets(clean);
      renderBudgets();
      renderKpis();
      alert("Imported");
    } catch (err) {
      alert("Invalid file");
    }
  });
}

function setClearAll() {
  if (!clearbtn) return;
  clearbtn.addEventListener("click", () => {
    const ok = confirm("Clear all budgets?");
    if (!ok) return;
    setBudgets([]);
    renderBudgets();
    renderKpis();
  });
}

requireLogin();
installAuthGuards();
setlogout();
setBudgetFormToggle();
setBudgetForm();
setDeleteHandler();
setExport();
setImport();
setClearAll();
renderBudgets();
renderKpis();
