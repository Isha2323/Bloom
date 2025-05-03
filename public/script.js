const API_URL = "http://localhost:3000/api";

// Register User
document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    alert(data.message);
  });

// Login User
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
});

// Logout
function logout() {
  localStorage.removeItem("user");
  fetch(`${API_URL}/logout`).then(() => {
    window.location.href = "index.html";
  });
}

// Add Product
document
  .getElementById("addProductForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", document.getElementById("productName").value);
    formData.append(
      "description",
      document.getElementById("productDesc").value
    );
    formData.append("price", document.getElementById("productPrice").value);
    formData.append("image", document.getElementById("productImage").files[0]);

    const res = await fetch(`${API_URL}/add-product`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    alert(data.message);
  });

//FETCH PRODUCT
async function fetchProducts() {
  try {
    const res = await fetch("/my-products", {
      credentials: "include", // Ensure session data is sent
    });

    console.log("Response status:", res.status); // Debugging
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const products = await res.json();
    console.log("Products fetched:", products); // Debugging

    const container = document.getElementById("myProducts");

    if (products.length === 0) {
      container.innerHTML = "<p>No products added yet.</p>";
      return;
    }

    container.innerHTML = products
      .map(
        (p) => `
      <div class="product-card" style="margin-left:10px;margin-top:10px;">
          <img src="http://localhost:3000/uploads/${p.image}" alt="${p.name}" class="product-image">
          <p><strong>${p.name}</strong> - ₹ ${p.price}</p>
          <p>${p.description}</p> 
          <button onclick="addToCart(${p.id})">Add to Cart</button>
          <button onclick="openOrderForm(${p.id})">Buy Now</button> <!-- Buy Now button -->
      </div>
  `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching products:", error);
    document.getElementById("myProducts").innerHTML =
      "<p>Error loading products.</p>";
  }
}

// ✅ Move addToCart outside fetchProducts()
async function addToCart(productId) {
  try {
    console.log("Adding product to cart:", productId); // Debugging
    const res = await fetch("/api/add-to-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
      credentials: "include", // Ensure session cookies are sent
    });

    const data = await res.json();
    console.log("Server response:", data); // Debugging
    alert(data.message); // Show success or error message
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Error adding to cart. Please try again.");
  }
}

// Fetch products when the page loads
fetchProducts();

//FETCH CART
async function fetchCart() {
  try {
    const res = await fetch("/api/my-cart", {
      // Ensure the endpoint matches your server route
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const cartItems = await res.json();
    console.log("Cart items fetched:", cartItems);

    const cartContainer = document.getElementById("cartItems");

    if (cartItems.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    cartContainer.innerHTML = cartItems
      .map(
        (item) => `
        <div class="cart-item">
            <img src="http://localhost:3000/uploads/${item.image}" alt="${item.name}" class="cart-image">
            <p><strong>${item.name}</strong> - ₹ ${item.price}</p>
            <p>${item.description}</p> <!-- Displaying the product description -->
            <button onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching cart:", error);
    document.getElementById("cartItems").innerHTML =
      "<p>Error loading cart.</p>";
  }
}

fetchCart();

//REMOVE FROM CART
async function removeFromCart(productId) {
  try {
    const res = await fetch("/api/remove-from-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    const data = await res.json();
    alert(data.message); // Show success or error message

    fetchCart(); // Refresh cart after removing item
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
}

//Open order form
/*function openOrderForm(productId) {
  document.getElementById("productId").value = productId;
  document.getElementById("orderModal").style.display = "block";
}

function closeOrderForm() {
  document.getElementById("orderModal").style.display = "none";
}*/

// Open order form when Buy Now is clicked
function openOrderForm(productId) {
  console.log("Opening order form for product:", productId); // Debugging
  document.getElementById("productId").value = productId;
  document.getElementById("orderModal").style.display = "flex"; // Ensure it becomes visible
}

// Close the form when clicking 'X'
function closeOrderForm() {
  document.getElementById("orderModal").style.display = "none";
}

//Submit order form
document
  .getElementById("orderForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const productId = document.getElementById("productId").value;
    const username = document.getElementById("username").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;

    try {
      const res = await fetch("/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, username, address, phone }),
      });

      const data = await res.json();
      alert(data.message); // Show success message

      if (res.ok) {
        closeOrderForm();
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  });
