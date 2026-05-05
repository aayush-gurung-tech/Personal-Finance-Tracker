const transitionform = document.querySelector(".simple-form");
const transitiontable = document.querySelector(".table");
const amountInput = document.querySelector(".amount");
const incometypeInput = document.querySelector(".select");
const categoryInput = document.querySelector(".Category");
const dateInput = document.querySelector("#dateid");
const descriptionInput = document.querySelector(".description");
const logoutbtn = document.querySelector(".dash-header-actions a");

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

function saveTransaction() {
  if (
    !transitionform ||
    !amountInput ||
    !incometypeInput ||
    !categoryInput ||
    !dateInput ||
    !descriptionInput
  )
    return;

  const amount = amountInput.value.trim();
  const incometype = incometypeInput.value.trim();
  const category = categoryInput.value.trim();
  const dateid = dateInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!amount || !incometype || !category || !dateid || !description) {
    alert("Please fill all fields");
    return;
  }

  transitionform.reset();

  const transaction = {
    id: Date.now(),
    dateid,
    description,
    category,
    incometype,
    amount: Number(amount),
  };

  const transitionsAll = JSON.parse(sessionStorage.getItem("transactions")) || [];
  transitionsAll.push(transaction);
  sessionStorage.setItem("transactions", JSON.stringify(transitionsAll));

  location.href = "transactions.html";
}

if (transitionform) {
  transitionform.addEventListener("submit", (e) => {
    e.preventDefault();
    saveTransaction();
  });
}

requireLogin();
setlogout();
