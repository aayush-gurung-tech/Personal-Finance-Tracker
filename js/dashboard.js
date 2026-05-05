const username = document.querySelector(".dash-title");
const logoutbtn = document.querySelector(".dash-header-actions a");
const transitiontable = document.querySelector(".table");
const totalBalanceValue = document.querySelector("#total-balance");
const monthlyIncomeValue = document.querySelector("#monthly-income");
const monthlyExpenseValue = document.querySelector("#monthly-expense");
const totalBalanceSub = document.querySelector("#total-balance-sub");
const monthlyIncomeSub = document.querySelector("#monthly-income-sub");
const monthlyExpenseSub = document.querySelector("#monthly-expense-sub");
const categoryLegend = document.querySelector("#category-legend");

function requireLogin() {
  const useremaillogin = localStorage.getItem("loggedUserEmail");
  if (!useremaillogin) location.href = "login.html";
  return useremaillogin || "";
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  return Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function setusername() {
  if (!username) return;
  const userdetail = JSON.parse(localStorage.getItem("userall")) || [];
  const useremaillogin = localStorage.getItem("loggedUserEmail");

  const user = userdetail.find((u) => useremaillogin === u.useremailvalue);
  if (!user) return;
  const name = user.usernamevalue;
  username.textContent = `${name}`;
}

function setlogout() {
  if (!logoutbtn) return;
  logoutbtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("loggedUserEmail");
    location.href = "login.html";
  });
}

function setSearchFilter() {
  const searchInput = document.querySelector(".dash-search input");
  const rows = document.querySelectorAll(".table .t-row");
  if (!searchInput || !rows.length) return;

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim().toLowerCase();
    rows.forEach((row, index) => {
      if (index === 0) return;
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(value) ? "" : "none";
    });
  });
}

function getTransactions() {
  return JSON.parse(sessionStorage.getItem("transactions")) || [];
}

function renderTableHead() {
  if (!transitiontable) return;
  transitiontable.innerHTML = `
    <div class="t-row t-head">
      <div>Date</div>
      <div>Description</div>
      <div>Category</div>
      <div>Status</div>
      <div class="right">Amount</div>
    </div>
  `;
}

function renderRecentTransactions() {
  if (!transitiontable) return;
  const transitionsAll = getTransactions();

  transitionsAll.sort((a, b) => {
    const dateCompare = (b.dateid || "").localeCompare(a.dateid || "");
    if (dateCompare !== 0) return dateCompare;
    return (b.id || 0) - (a.id || 0);
  });

  renderTableHead();
  if (!transitionsAll.length) {
    transitiontable.insertAdjacentHTML(
      "beforeend",
      `
        <div class="t-row">
          <div>-</div>
          <div class="muted">No transactions yet</div>
          <div>-</div>
          <div><span class="pill wait">Empty</span></div>
          <div class="right muted">$0.00</div>
        </div>
      `
    );
    return;
  }

  const rows = transitionsAll.slice(0, 5).map((t) => {
    const isIncome = (t.incometype || "").toLowerCase() === "income";
    const pillClass = isIncome ? "ok" : "wait";
    const amountClass = isIncome ? "pos" : "neg";
    const sign = isIncome ? "+" : "-";
    const money = formatMoney(t.amount);
    return `
      <div class="t-row">
        <div>${t.dateid || ""}</div>
        <div>${t.description || ""}</div>
        <div>${t.category || ""}</div>
        <div><span class="pill ${pillClass}">${t.incometype || ""}</span></div>
        <div class="right ${amountClass}">${sign}$${money}</div>
      </div>
    `;
  });

  transitiontable.insertAdjacentHTML("beforeend", rows.join(""));
}

function parseDate(dateid) {
  const d = new Date(dateid);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function setKpis() {
  const transitionsAll = getTransactions();
  if (!totalBalanceValue || !monthlyIncomeValue || !monthlyExpenseValue) return;

  let incomeAll = 0;
  let expenseAll = 0;
  transitionsAll.forEach((t) => {
    const isIncome = (t.incometype || "").toLowerCase() === "income";
    const amount = Number(t.amount) || 0;
    if (isIncome) incomeAll += amount;
    else expenseAll += amount;
  });

  const totalBalance = incomeAll - expenseAll;
  totalBalanceValue.textContent = `$${formatMoney(totalBalance)}`;
  if (totalBalanceSub) totalBalanceSub.textContent = "Based on this session data";

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 30);

  let income30 = 0;
  let expense30 = 0;
  transitionsAll.forEach((t) => {
    const d = parseDate(t.dateid);
    if (!d) return;
    if (d < start || d > now) return;
    const isIncome = (t.incometype || "").toLowerCase() === "income";
    const amount = Number(t.amount) || 0;
    if (isIncome) income30 += amount;
    else expense30 += amount;
  });

  monthlyIncomeValue.textContent = `$${formatMoney(income30)}`;
  monthlyExpenseValue.textContent = `$${formatMoney(expense30)}`;
  if (monthlyIncomeSub) monthlyIncomeSub.textContent = "Last 30 days";
  if (monthlyExpenseSub) monthlyExpenseSub.textContent = "Last 30 days";
}

function setCategoryLegend() {
  if (!categoryLegend) return;

  const transitionsAll = getTransactions();
  const totals = {};

  transitionsAll.forEach((t) => {
    const isIncome = (t.incometype || "").toLowerCase() === "income";
    if (isIncome) return;
    const category = (t.category || "Other").trim() || "Other";
    const amount = Number(t.amount) || 0;
    totals[category] = (totals[category] || 0) + amount;
  });

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (!entries.length) {
    categoryLegend.innerHTML = `<div class="muted">No expense data</div>`;
    return;
  }

  const dotClasses = ["dot-a", "dot-b", "dot-c", "dot-d"];
  categoryLegend.innerHTML = entries
    .map(([name], index) => {
      const dot = dotClasses[index] || "dot-a";
      return `<div><span class="dot ${dot}"></span>${name}</div>`;
    })
    .join("");
}

requireLogin();
setusername();
setlogout();
renderRecentTransactions();
setKpis();
setCategoryLegend();
setSearchFilter();
