const logoutbtn = document.querySelector(".dash-header-actions a");
const goalform = document.querySelector(".simple-form");
const goalname = document.querySelector(".goal-name");
const goalcategory = document.querySelector(".goal-category");
const goaltarget = document.querySelector(".goal-target");
const goalcurrent = document.querySelector(".goal-current");
const goaldate = document.querySelector(".goal-date");
const goalmonthly = document.querySelector(".goal-monthly");
const goalnotes = document.querySelector(".goal-notes");
const goalstable = document.querySelector("#goals-table");
const exportbtn = document.querySelector("#export-goals");
const importbtn = document.querySelector("#import-goals");
const clearbtn = document.querySelector("#clear-goals");
const fileinput = document.querySelector("#goals-file");

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

function getGoals() {
  return JSON.parse(sessionStorage.getItem("goals")) || [];
}

function setGoals(value) {
  sessionStorage.setItem("goals", JSON.stringify(value || []));
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

function renderGoals() {
  if (!goalstable) return;
  const goals = getGoals();

  goalstable.innerHTML = `
    <div class="t-row t-head">
      <div>Name</div>
      <div>Category</div>
      <div>Target</div>
      <div>Current</div>
      <div class="right">Monthly</div>
      <div class="right">Action</div>
    </div>
  `;

  if (!goals.length) {
    goalstable.insertAdjacentHTML(
      "beforeend",
      `
        <div class="t-row">
          <div class="muted">No goals yet</div>
          <div>-</div>
          <div>-</div>
          <div>-</div>
          <div class="right muted">$0.00</div>
        </div>
      `
    );
    return;
  }

  const rows = goals
    .slice()
    .reverse()
    .map((g) => {
      return `
        <div class="t-row">
          <div>${g.name || ""}</div>
          <div>${g.category || ""}</div>
          <div>$${formatMoney(g.target)}</div>
          <div>$${formatMoney(g.current)}</div>
          <div class="right">$${formatMoney(g.monthly)}</div>
          <div class="right">
            <button class="btn btn-ghost delete-goal" data-id="${g.id || ""}" type="button">
              Delete
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  goalstable.insertAdjacentHTML("beforeend", rows);
}

function deleteGoal(id) {
  const goals = getGoals();
  const next = goals.filter((g) => String(g.id) !== String(id));
  setGoals(next);
  renderGoals();
}

function setDeleteHandler() {
  if (!goalstable) return;
  goalstable.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-goal");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;
    const ok = confirm("Delete this goal?");
    if (!ok) return;
    deleteGoal(id);
  });
}

function setExport() {
  if (!exportbtn) return;
  exportbtn.addEventListener("click", () => {
    const goals = getGoals();
    downloadJson("goals.json", goals);
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
        .filter((g) => g && typeof g === "object")
        .map((g) => {
          return {
            id: g.id || Date.now() + Math.random(),
            name: String(g.name || ""),
            category: String(g.category || ""),
            target: Number(g.target) || 0,
            current: Number(g.current) || 0,
            date: String(g.date || ""),
            monthly: Number(g.monthly) || 0,
            notes: String(g.notes || ""),
          };
        })
        .filter((g) => g.name && g.category && g.date);

      setGoals(clean);
      renderGoals();
      alert("Imported");
    } catch (err) {
      alert("Invalid file");
    }
  });
}

function setClearAll() {
  if (!clearbtn) return;
  clearbtn.addEventListener("click", () => {
    const ok = confirm("Clear all goals?");
    if (!ok) return;
    setGoals([]);
    renderGoals();
  });
}

function saveGoal() {
  if (
    !goalform ||
    !goalname ||
    !goalcategory ||
    !goaltarget ||
    !goalcurrent ||
    !goaldate ||
    !goalmonthly
  )
    return;
  goalform.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = goalname.value.trim();
    const category = goalcategory.value.trim();
    const target = goaltarget.value.trim();
    const current = goalcurrent.value.trim();
    const date = goaldate.value.trim();
    const monthly = goalmonthly.value.trim();
    const notes = goalnotes ? goalnotes.value.trim() : "";

    if (!name || !category || !target || !current || !date || !monthly) {
      alert("Please fill all fields");
      return;
    }

    const goal = {
      id: Date.now(),
      name,
      category,
      target: Number(target),
      current: Number(current),
      date,
      monthly: Number(monthly),
      notes,
    };

    const goals = getGoals();
    goals.push(goal);
    setGoals(goals);

    alert("Goal saved");
    goalform.reset();
    renderGoals();
  });
}

requireLogin();
setlogout();
saveGoal();
renderGoals();
setDeleteHandler();
setExport();
setImport();
setClearAll();
