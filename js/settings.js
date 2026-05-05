const logoutbtn = document.querySelector(".dash-header-actions a");
const settingsform = document.querySelector(".simple-form");
const nameInput = document.querySelector(".simple-form input");

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

function setInitialName() {
  if (!nameInput) return;
  const useremaillogin = localStorage.getItem("loggedUserEmail");
  if (!useremaillogin) return;
  const userdetail = JSON.parse(localStorage.getItem("userall")) || [];
  const user = userdetail.find((u) => useremaillogin === u.useremailvalue);
  if (!user) return;
  const name = (user.usernamevalue || "").trim();
  if (!name) return;
  nameInput.value = name;
}

function saveSettings() {
  if (!settingsform || !nameInput) return;
  settingsform.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    if (!name) return;

    const useremaillogin = localStorage.getItem("loggedUserEmail");
    const userdetail = JSON.parse(localStorage.getItem("userall")) || [];
    const userIndex = userdetail.findIndex((u) => useremaillogin === u.useremailvalue);

    if (userIndex >= 0) {
      userdetail[userIndex].usernamevalue = name;
      localStorage.setItem("userall", JSON.stringify(userdetail));
    }

    alert("Settings saved");
  });
}

requireLogin();
setlogout();
setInitialName();
saveSettings();
