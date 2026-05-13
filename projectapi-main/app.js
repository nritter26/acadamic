   // Function to get products from the server and display them
  async function getProducts() {
    // 1. Request data from your running server.js
    const response = await fetch('http://localhost:3000/api/data');
    const result = await response.json();
    
    // 2. Target the div
    const container = document.getElementById('product-list');
    
    // 3. Put the data on the screen
    container.innerHTML = result.data.map(p => '<p>' + (p.NAME || p.name || Object.values(p)[1]) + '</p>').join('');
}
// Function to add a product
async function createProduct(newName) {
    await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
    });
    getProducts(); // Refresh the list on screen
}

// Function to delete a product
async function removeProduct(id) {
    await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE'
    });
    getProducts(); // Refresh the list on screen
}


  getProducts();