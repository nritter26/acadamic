function filterTable() {
    const input = document.getElementById("searchInput").value.toUpperCase();
    const rows = document.getElementById("customer-table-body").getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const nameColumn = rows[i].getElementsByTagName("td")[1]; // Name column
        const emailColumn = rows[i].getElementsByTagName("td")[2]; // Email column
        if (nameColumn || emailColumn) {
            const textValue = (nameColumn.textContent || nameColumn.innerText) + 
                              (emailColumn.textContent || emailColumn.innerText);
            rows[i].style.display = textValue.toUpperCase().indexOf(input) > -1 ? "" : "none";
        }
    }
}
// Function to switch views
function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.content-view').forEach(view => {
        view.style.display = 'none';
    });
    // Remove active class from all sidebar items
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.classList.remove('active');
    });
    
    // Show the requested view
    document.getElementById(viewId + '-view').style.display = 'block';
    
    // Fetch data if switching to orders
    if (viewId === 'orders') {
        fetchOrders();
    }
}

// Function to fetch orders specifically
function fetchOrders() {
    fetch('http://localhost:3000/api/orders')
      .then(res => res.json())
      .then(data => {
        const tableBody = document.getElementById('orders-table-body');
        tableBody.innerHTML = data.map(o => `
            <tr>
                <td>${o.orderid}</td>
                <td>${new Date(o.orderdate).toLocaleDateString()}</td>
                <td>$${o.amount}</td>
                <td>${o.customerid}</td>
            </tr>
        `).join('');
      });
}

// Setup sidebar clicks in your index.html
// Update your sidebar <ul> in index.html to look like this:
/* 
<ul>
    <li onclick="showView('customers')" class="active">Customers</li>
    <li onclick="showView('orders')">Orders</li>
    <li onclick="showView('settings')">Settings</li>
</ul>
*/
