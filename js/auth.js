const username = document.querySelector("#username");
const useremail = document.querySelector("#useremail");
const password = document.querySelector("#password");
const loginpassword = document.querySelector("#loginpassword");
const loginemail = document.querySelector("#loginemail");
const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");

function redirectIfLoggedIn() {
  const loggedUserEmail = localStorage.getItem("loggedUserEmail");
  if (loggedUserEmail && (signupForm || loginForm)) location.replace("dashboard.html");
}

redirectIfLoggedIn();
window.addEventListener("pageshow", () => {
  redirectIfLoggedIn();
});

function getuserdetails() {
  if (!username || !useremail || !password) return;
  const userdetail = {
    usernamevalue: username.value.trim(),
    useremailvalue: useremail.value.trim(),
    passwordvalue: password.value.trim(),
  };
  if (
    !userdetail.usernamevalue ||
    !userdetail.useremailvalue ||
    !userdetail.passwordvalue
  ) {
    console.log("empty space there enter value first");
    return;
  }

  let userall = JSON.parse(localStorage.getItem("userall")) || [];
  userall.push(userdetail);
  localStorage.setItem("userall", JSON.stringify(userall));
  alert("you are successfully signup")
  signupForm.reset();

}
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    getuserdetails();
  
  });
}
function matchuser() {
  if (!loginemail || !loginpassword) return;
  const loginuserdetail = {
    email: loginemail.value.trim(),
    password: loginpassword.value.trim(),
  };
  let userallvalue = JSON.parse(localStorage.getItem("userall")) || [];
  const user = userallvalue.find(u=>
      u.useremailvalue === loginuserdetail.email &&
      u.passwordvalue === loginuserdetail.password
  );
  if (user) {
   localStorage.setItem("loggedUserEmail", user.useremailvalue);
    location.href = "dashboard.html";
  } else {
    alert("your password and email dont match fix it");
  }
  loginForm.reset();
}
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    matchuser();
  });
}
