const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Middleware
app.use(cors({ credentials: true, origin: "http://localhost:5500" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Serve the frontend files
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost", // MySQL host
  user: "root", // MySQL username (you can replace this with another username if needed)
  password: "1998", // MySQL password (replace with your actual password)
  database: "ecommerce_db", // Your database name
  //port: 3360, // The port your MySQL server is using
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err.stack);
    return;
  }
  console.log("Connected to the database as id " + db.threadId);
});
// User Registration
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error registering user" });
      res.json({ message: "User registered successfully" });
    }
  );
});

// User Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err || result.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      req.session.user = user;
      res.json({
        message: "Login successful",
        user: { id: user.id, username: user.username },
      });
    }
  );
});

// Logout
app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
});

// Image Upload Setup (Multer)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Add Product
app.post("/api/add-product", upload.single("image"), (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Unauthorized" });

  const { name, description, price } = req.body;
  const image = req.file.filename;
  const userId = req.session.user.id;

  db.query(
    "INSERT INTO products (user_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)",
    [userId, name, description, price, image],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error adding product" });
      res.json({ message: "Product added successfully" });
    }
  );
});

app.get("/my-products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ message: "Error fetching products" });
    }
    res.json(results); // Return all products
  });
});

// Add to Cart
app.post("/api/add-to-cart", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Unauthorized" });

  const { productId } = req.body;
  const userId = req.session.user.id;

  db.query(
    "INSERT INTO cart (user_id, product_id) VALUES (?, ?)",
    [userId, productId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error adding to cart" });
      res.json({ message: "Added to cart" });
    }
  );
});

///naya
app.get("/api/get-cart", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.session.user.id;

  const query = `
    SELECT p.id, p.name, p.price, p.image, p.description 
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching cart:", err);
      return res.status(500).json({ message: "Error fetching cart" });
    }
    res.json(results);
  });
});

app.get("/api/my-cart", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Unauthorized" });

  db.query(
    `SELECT products.id, products.name, products.price, products.image, products.description 
     FROM cart
     JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = ?`,
    [req.session.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching cart" });
      res.json(results);
    }
  );
});

app.post("/api/remove-from-cart", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Unauthorized" });

  const { productId } = req.body;
  const userId = req.session.user.id;

  db.query(
    "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error removing from cart" });
      res.json({ message: "Item removed from cart" });
    }
  );
});

app.get("/api/get-cart", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Unauthorized" });

  const userId = req.session.user.id;

  db.query(
    `SELECT cart.id, products.name, products.price, products.image 
     FROM cart 
     JOIN products ON cart.product_id = products.id 
     WHERE cart.user_id = ?`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching cart:", err);
        return res.status(500).json({ message: "Error fetching cart" });
      }
      res.json(results);
    }
  );
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//API TO STORE ORDERS
app.post("/api/place-order", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Unauthorized" });

  const { productId, username, address, phone } = req.body;
  const userId = req.session.user.id;

  db.query(
    "INSERT INTO orders (user_id, product_id, username, address, phone) VALUES (?, ?, ?, ?, ?)",
    [userId, productId, username, address, phone],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error placing order" });
      res.json({ message: "Order placed successfully" });
    }
  );
});

app.get("/my-orders", (req, res) => {
  console.log("Received request for orders:", req.session.user); // Log session info
  if (!req.session.user) {
    return res.status(401).json({ error: "User  not logged in" });
  }

  const userId = req.session.user.id;

  db.query(
    "SELECT * FROM orders WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      console.log("Fetched Orders:", results);
      res.json(results);
    }
  );
});

//GET ORDER
app.get("/api/my-orders", (req, res) => {
  if (!req.session.user) {
    console.log("User session not found"); // Debugging log
    return res.status(401).json({ error: "User not logged in" });
  }

  const userId = req.session.user.id;
  console.log("Fetching orders for user:", userId); // Debugging log

  const query = `
    SELECT o.id AS order_id, o.username, o.address, o.phone, o.status, 
           p.name AS product_name, p.price, p.image
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.user_id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error while fetching orders:", err);
      return res.status(500).json({ error: "Error fetching orders" });
    }

    console.log("Fetched orders:", results); // Debugging log
    res.json(results);
  });
});

// Start Server
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
