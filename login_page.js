import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.switchTab = function (tab) {
  const loginForm = document.getElementById("loginForm");
  const regForm = document.getElementById("regForm");

  const tabBtns = document.querySelectorAll(".tab-btn");

  tabBtns.forEach((btn) => btn.classList.remove("active"));

  if (tab === "login") {
    loginForm.classList.remove("hidden");
    regForm.classList.add("hidden");

    tabBtns[0].classList.add("active");
  } else {
    loginForm.classList.add("hidden");
    regForm.classList.remove("hidden");

    tabBtns[1].classList.add("active");
  }
};

window.doLogin = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter Email and Password");
    return;
  }

  const users = await getDocs(collection(db, "users"));

  let found = false;

  users.forEach((doc) => {
    const user = doc.data();

    if (user.email === email && user.password === password) {
      found = true;

      user.id = doc.id;
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        alert("Admin Login Successful");
        window.location.href = "index.html";
      } else {
        alert("User Login Successful");
        window.location.href = "index.html";
      }
    }
  });

  if (!found) {
    alert("Invalid Email or Password");
  }
};

window.doRegister = async function () {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const studId = document.getElementById("regStudId").value;
  const dept = document.getElementById("regDept").value;
  const password = document.getElementById("regPwd").value;

  if (!name || !email || !studId || !password) {
    alert("Please fill all required fields");
    return;
  }

  const userData = {
    name,
    email,
    studId,
    dept,
    password,
    role: "user"
  };

  try {
    await addDoc(collection(db, "users"), userData);
    alert("Registration Successful. Please Login.");
    switchTab("login");
  } catch (error) {
    console.error("Error registering user: ", error);
    alert("Registration failed");
  }
};
