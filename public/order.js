document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/api/my-orders", {
    // Ensure this matches your backend route
    method: "GET",
    credentials: "include", // Ensures cookies (session) are sent
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    })
    .then((data) => {
      console.log("Orders:", data);
      if (data.error) {
        console.error("Error:", data.error);
        document.getElementById("orders").innerHTML = `<p>${data.error}</p>`;
      } else {
        displayOrders(data);
      }
    })
    .catch((error) => console.error("Error fetching orders:", error));
});

function displayOrders(orders) {
  const ordersContainer = document.getElementById("orders");
  ordersContainer.innerHTML = "";

  if (!orders || orders.length === 0) {
    ordersContainer.innerHTML = "<p class='no-orders'>No orders found.</p>";
    return;
  }

  orders.forEach((order) => {
    const orderElement = document.createElement("div");
    orderElement.classList.add("order-card");
    orderElement.innerHTML = `
      <img src="${order.image}" alt="${
      order.product_name
    }" class="product-image">
      <div class="order-details">
        <h3>${order.product_name}</h3>
        <p><strong>Price:</strong> ₹ ${order.price}</p>
        <p><strong>Username:</strong> ${order.username}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p class="status ${order.status.toLowerCase()}"><strong>Status:</strong> ${
      order.status
    }</p>
      </div>
    `;
    ordersContainer.appendChild(orderElement);
  });
}
