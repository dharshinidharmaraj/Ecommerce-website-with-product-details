(function() {
  const API_BASE = "http://localhost:5000";
  const TOKEN_KEY = "dashboardToken";

  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const loginError = document.getElementById("loginError");

  // Check if user is already logged in
  function checkAuthentication() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      showDashboard();
      loadDashboardData(token);
    } else {
      showLogin();
    }
  }

  // Show login form
  function showLogin() {
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
    logoutBtn.style.display = "none";
  }

  // Show dashboard
  function showDashboard() {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    logoutBtn.style.display = "block";
  }

  // Handle login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        loginError.textContent = "";
        loginForm.reset();
        showDashboard();
        loadDashboardData(data.token);
      } else {
        loginError.textContent = data.error || "Login failed";
      }
    } catch (error) {
      loginError.textContent = "Error connecting to server";
      console.error("Login error:", error);
    }
  });

  // Handle logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    loginForm.reset();
    loginError.textContent = "";
    showLogin();
  });

  // Load dashboard data from API
  async function loadDashboardData(token) {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          showLogin();
          loginError.textContent = "Session expired. Please login again.";
          return;
        }
        throw new Error("Failed to load dashboard data");
      }

      const data = await response.json();
      displayDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      document.getElementById("tableBody").innerHTML = `
        <tr>
          <td colspan="6" class="no-data">Error loading data. Please try again.</td>
        </tr>
      `;
    }
  }

  // Display dashboard data in table
  function displayDashboardData(data) {
    const tableBody = document.getElementById("tableBody");
    const totalAddToCart = document.getElementById("totalAddToCart");
    const totalProducts = document.getElementById("totalProducts");
    const lastUpdated = document.getElementById("lastUpdated");

    // Update stats
    totalAddToCart.textContent = data.total;
    totalProducts.textContent = data.products.length;

    const updateTime = new Date(data.lastUpdated);
    lastUpdated.textContent = updateTime.toLocaleTimeString();

    // Clear existing rows
    tableBody.innerHTML = "";

    // Check if there's data
    if (!data.products || data.products.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">No add-to-cart data yet. Start tracking products!</td>
        </tr>
      `;
      return;
    }

    // Populate table with product data
    data.products.forEach(product => {
      const row = document.createElement("tr");

      // Highlight top 3
      if (product.rank === 1) {
        row.classList.add("rank-1");
      } else if (product.rank === 2) {
        row.classList.add("rank-2");
      } else if (product.rank === data.products.length) {
        row.classList.add("rank-last");
      }

      row.innerHTML = `
        <td class="rank">#${product.rank}</td>
        <td class="product-name">${escapeHtml(product.name)}</td>
        <td class="count">${product.addToCartCount}</td>
        <td class="percentage">${product.percentage}%</td>
        <td class="clicks">${product.clicks}</td>
        <td class="conversion">${product.conversionRate}%</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Refresh data
  refreshBtn.addEventListener("click", () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      loadDashboardData(token);
    }
  });

  // Helper to escape HTML characters
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on page load
  window.addEventListener("DOMContentLoaded", checkAuthentication);
})();
