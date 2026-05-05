const transitiontable = document.querySelector(".table");
const logoutbtn = document.querySelector(".dash-header-actions a");
const exportbtn = document.querySelector("#export-transactions");
const importbtn = document.querySelector("#import-transactions");
const clearbtn = document.querySelector("#clear-transactions");
const fileinput = document.querySelector("#transactions-file");

function requireLogin() {
  const useremaillogin = localStorage.getItem("loggedUserEmail");
  if (!useremaillogin) location.href = "login.html";
  return useremaillogin || "";
}

function setlogout() {
  if (!logoutbtn) return;
  logoutbtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("loggedUserEmail");
    location.href = "login.html";
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

function getTransactions() {
  return JSON.parse(sessionStorage.getItem("transactions")) || [];
}

function setTransactions(value) {
  sessionStorage.setItem("transactions", JSON.stringify(value || []));
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

function renderTableHead() {
  if (!transitiontable) return;
  transitiontable.innerHTML = `
    <div class="t-row t-head">
      <div>Date</div>
      <div>Description</div>
      <div>Category</div>
      <div>Status</div>
      <div class="right">Amount</div>
      <div class="right">Action</div>
    </div>
  `;
}

function addTransactionFromQuery() {
  if (!transitiontable) return;

  const url = new URL(location.href);
  const dateid = url.searchParams.get("dateid") || "";
  const description = url.searchParams.get("description") || "";
  const category = url.searchParams.get("category") || "";
  const incometype = url.searchParams.get("incometype") || "";
  const amount = url.searchParams.get("amount") || "";

  if (!dateid || !description || !category || !incometype || !amount) return;

  const transaction = {
    id: Date.now(),
    dateid,
    description,
    category,
    incometype,
    amount: Number(amount),
  };

  const transitionsAll = getTransactions();
  transitionsAll.push(transaction);
  setTransactions(transitionsAll);

  url.search = "";
  history.replaceState({}, "", url.toString());
}

function renderTransactions() {
  if (!transitiontable) return;

  const transitionsAll = getTransactions();
  transitionsAll.sort((a, b) => {
    const dateCompare = (b.dateid || "").localeCompare(a.dateid || "");
    if (dateCompare !== 0) return dateCompare;
    return (b.id || 0) - (a.id || 0);
  });

  const rows = transitionsAll
    .map((t) => {
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
          <div class="right">
            <button class="btn btn-ghost delete-transaction" data-id="${t.id || ""}" type="button">
              Delete
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  renderTableHead();
  transitiontable.insertAdjacentHTML("beforeend", rows);
}

function deleteTransaction(id) {
  const transitionsAll = getTransactions();
  const next = transitionsAll.filter((t) => String(t.id) !== String(id));
  setTransactions(next);
  renderTransactions();
}

function setDeleteHandler() {
  if (!transitiontable) return;
  transitiontable.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-transaction");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;
    const ok = confirm("Delete this transaction?");
    if (!ok) return;
    deleteTransaction(id);
  });
}

function setExport() {
  if (!exportbtn) return;
  exportbtn.addEventListener("click", () => {
    const transitionsAll = getTransactions();
    downloadJson("transactions.json", transitionsAll);
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
        .filter((t) => t && typeof t === "object")
        .map((t) => {
          return {
            id: t.id || Date.now() + Math.random(),
            dateid: String(t.dateid || ""),
            description: String(t.description || ""),
            category: String(t.category || ""),
            incometype: String(t.incometype || ""),
            amount: Number(t.amount) || 0,
          };
        })
        .filter((t) => t.dateid && t.description && t.category && t.incometype);

      setTransactions(clean);
      renderTransactions();
      alert("Imported");
    } catch (err) {
      alert("Invalid file");
    }
  });
}

function setClearAll() {
  if (!clearbtn) return;
  clearbtn.addEventListener("click", () => {
    const ok = confirm("Clear all transactions?");
    if (!ok) return;
    setTransactions([]);
    renderTransactions();
  });
}

renderTableHead();
addTransactionFromQuery();
renderTransactions();
requireLogin();
setlogout();
setDeleteHandler();
setExport();
setImport();
setClearAll();
