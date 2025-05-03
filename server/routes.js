const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("./config");
const multer = require("multer");

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// User Registration
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User Registered Successfully!" });
    }
  );
});

// User Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(401).json({ error: "Invalid Credentials" });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ error: "Invalid Credentials" });

      req.session.user = user;
      res.json({ message: "Login Successful", user });
    }
  );
});

// Add Product
router.post("/add-product", upload.single("image"), (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  const { name, description, price } = req.body;
  const image = req.file.filename;
  const user_id = req.session.user.id;

  db.query(
    "INSERT INTO products (user_id, name, description, image, price) VALUES (?, ?, ?, ?, ?)",
    [user_id, name, description, image, price],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product Added Successfully!" });
    }
  );
});

// Get User Products
router.get("/my-products", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  db.query(
    "SELECT * FROM products WHERE user_id = ?",
    [req.session.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Add to Cart
router.post("/add-to-cart", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  const { product_id } = req.body;
  db.query(
    "INSERT INTO cart (user_id, product_id) VALUES (?, ?)",
    [req.session.user.id, product_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product Added to Cart!" });
    }
  );
});

// Get User Cart
router.get("/my-cart", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized" });

  db.query(
    "SELECT products.* FROM cart INNER JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?",
    [req.session.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

module.exports = router;
