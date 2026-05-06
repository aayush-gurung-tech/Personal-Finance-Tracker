const logoutbtn = document.querySelector(".dash-header-actions a");
const settingsform = document.querySelector(".simple-form");
const nameInput = document.querySelector("#display-name");
const AUTH_KEY = "authUserEmail";

function requireLogin() {
  const useremaillogin = sessionStorage.getItem(AUTH_KEY);
  if (!useremaillogin) location.replace("login.html");
  return useremaillogin || "";
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

function installAuthGuards() {
  const check = () => {
    if (!sessionStorage.getItem(AUTH_KEY)) location.replace("login.html");
  };
  window.addEventListener("pageshow", check);
  window.addEventListener("popstate", check);
}

function setInitialName() {
  if (!nameInput) return;
  const useremaillogin = sessionStorage.getItem(AUTH_KEY);
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

    const useremaillogin = sessionStorage.getItem(AUTH_KEY);
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
installAuthGuards();
setlogout();
setInitialName();
saveSettings();
