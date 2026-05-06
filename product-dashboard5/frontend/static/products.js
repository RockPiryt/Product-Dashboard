async function loadProducts() {
    const tableBody = document.getElementById("productsTableBody");
    const info = document.getElementById("productsInfo");
  
    tableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";
  
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
  
      info.innerHTML = `<p>Loaded ${data.count} products. Served by backend instance: <strong>${data.servedBy}</strong></p>`;
  
      if (!data.items.length) {
        tableBody.innerHTML = "<tr><td colspan='4'>No products available</td></tr>";
        return;
      }
  
      tableBody.innerHTML = data.items.map(item => `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.price}</td>
        </tr>
      `).join("");
    } catch (error) {
      tableBody.innerHTML = "<tr><td colspan='4'>Failed to load products</td></tr>";
      info.innerHTML = `<div class="message error">${error.message}</div>`;
    }
  }
  
  async function addProduct(event) {
    event.preventDefault();
  
    const message = document.getElementById("formMessage");
    const payload = {
      name: document.getElementById("name").value,
      category: document.getElementById("category").value,
      price: Number(document.getElementById("price").value)
    };
  
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }
  
      message.innerHTML = `<div class="message success">Created product with id ${data.item.id} on instance ${data.servedBy}</div>`;
      document.getElementById("productForm").reset();
      await loadProducts();
    } catch (error) {
      message.innerHTML = `<div class="message error">${error.message}</div>`;
    }
  }
  
  document.getElementById("productForm").addEventListener("submit", addProduct);
  document.getElementById("reloadBtn").addEventListener("click", loadProducts);
  
  loadProducts();