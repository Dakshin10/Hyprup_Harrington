const roleInput = document.getElementById("role");
    const statusText = document.getElementById("status");
    const roleButtons = Array.from(document.querySelectorAll(".role-switch button"));
    const form = document.getElementById("loginForm");

    roleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        roleButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        roleInput.value = button.dataset.role;
        statusText.textContent = "";
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const role = roleInput.value;
      const email = document.getElementById("email").value.trim();

      if (!email) {
        statusText.textContent = "Please enter a valid email.";
        return;
      }

      statusText.textContent =
        role === "business"
          ? "Login successful. Redirect to Business Dashboard."
          : "Login successful. Redirect to Student Dashboard.";
    });