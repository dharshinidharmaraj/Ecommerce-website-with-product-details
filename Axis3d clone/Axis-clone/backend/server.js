const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

// In-memory storage for tracking events
let trackingEvents = [];

// Secret key for JWT (in production, use environment variables)
const JWT_SECRET = "your_secret_key_change_this_in_production";

// Company credentials (in production, use a database)
const COMPANY_CREDENTIALS = {
  email: "admin@axis3d.com",
  password: "admin123" // In production, store hashed passwords
};

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.company = decoded;
    next();
  });
};

// Login endpoint for company
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email === COMPANY_CREDENTIALS.email && password === COMPANY_CREDENTIALS.password) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, message: "Login successful" });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

// Endpoint to track events
app.post("/track", (req, res) => {
  const { event, product, time } = req.body;

  trackingEvents.push({
    event: event,
    product: product,
    timestamp: time || new Date()
  });

  console.log("Event tracked:", req.body);
  res.send("Event received");
});

// Dashboard endpoint - protected
app.get("/api/dashboard", verifyToken, (req, res) => {
  const productStats = {};

  trackingEvents.forEach(event => {
    if (!productStats[event.product]) {
      productStats[event.product] = {
        product: event.product,
        clicks: 0,
        addToCart: 0,
        ignored: 0,
        views: 0
      };
    }

    productStats[event.product].views++;

    if (event.event === "add_to_cart") {
      productStats[event.product].addToCart++;
      productStats[event.product].clicks++;
    } else if (event.event === "click") {
      productStats[event.product].clicks++;
    } else if (event.event === "ignored") {
      productStats[event.product].ignored++;
    }
  });

  // Sort by add_to_cart count (descending)
  const sortedProducts = Object.values(productStats)
    .sort((a, b) => b.addToCart - a.addToCart)
    .map((stat, index) => ({
      ...stat,
      rank: index + 1,
      conversionRate: stat.clicks > 0
        ? ((stat.addToCart / stat.clicks) * 100).toFixed(2)
        : 0
    }));

  const total = sortedProducts.reduce((sum, product) => sum + product.addToCart, 0);

  res.json({
    products: sortedProducts.map(stat => ({
      rank: stat.rank,
      name: stat.product,
      addToCartCount: stat.addToCart,
      percentage: total > 0 ? ((stat.addToCart / total) * 100).toFixed(2) : 0,
      clicks: stat.clicks,
      conversionRate: stat.conversionRate
    })),
    total: total,
    lastUpdated: new Date().toISOString()
  });
});

// Endpoint to generate and download Excel report
app.get("/download-report", async (req, res) => {
  try {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product Analytics");

    // Define columns
    worksheet.columns = [
      { header: "Product Name", key: "product", width: 30 },
      { header: "Total Clicks", key: "clicks", width: 15 },
      { header: "Add to Cart", key: "addToCart", width: 15 },
      {header: "total views", key:"totalViews", width: 15},
      { header: "Ignored", key: "ignored", width: 15 },
      { header: "Conversion Rate (%)", key: "conversionRate", width: 20 }
    ];

    // Calculate statistics by product
    const productStats = {};

    trackingEvents.forEach(event => {
      if (!productStats[event.product]) {
        productStats[event.product] = {
          product: event.product,
          clicks: 0,
          addToCart: 0,
          ignored: 0,
          views: 0
        };
      }

      // Every event means product was viewed
      productStats[event.product].views++;

      if (event.event === "add_to_cart") {
        productStats[event.product].addToCart++;
        productStats[event.product].clicks++; // Also count as click
      } else if (event.event === "click") {
        productStats[event.product].clicks++;
      } else if (event.event === "ignored") {
        productStats[event.product].ignored++;
      }
    });

    // Add data rows
    Object.values(productStats).forEach(stat => {
      const totalInteractions = stat.clicks + stat.ignored;
      const conversionRate = totalInteractions > 0
        ? ((stat.addToCart / stat.clicks) * 100).toFixed(2)
        : 0;

      worksheet.addRow({
        product: stat.product,
        clicks: stat.clicks,
        addToCart: stat.addToCart,
        ignored: stat.ignored,
        conversionRate: conversionRate
      });
    });

    // Format header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };

    // Generate buffer and send file
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=Product_Analytics_Report.xlsx");
    res.send(buffer);

  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).send("Error generating report");
  }
});

// Endpoint to view tracking data (for debugging)
app.get("/tracking-data", (req, res) => {
  res.json(trackingEvents);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
  console.log("Track events at: POST http://localhost:5000/track");
  console.log("Download report at: http://localhost:5000/download-report");
  console.log("Dashboard (protected) at: GET http://localhost:5000/api/dashboard");
  console.log("Login at: POST http://localhost:5000/api/auth/login");
  console.log("\nDefault company credentials:");
  console.log("Email: admin@axis3d.com");
  console.log("Password: admin123");
}); 