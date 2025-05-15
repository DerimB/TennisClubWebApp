document.querySelector(".login-button").addEventListener("click", async () => {
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const response = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (response.ok) {
    // alert("Login successful!");
    localStorage.setItem("user_id", result.user_id);
    localStorage.setItem("userRole", result.role);
    localStorage.setItem("isSignedIn", "true");
    window.location.href = "/html/about.html";
  } else {
    alert("Login Failed." + result.message);
    localStorage.setItem("isSignedIn", "false");
  }
});
