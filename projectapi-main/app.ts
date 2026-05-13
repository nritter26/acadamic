// 1. Define types so you don't make typos later
interface Product {
    id: number;
    name: string;
    NAME?: string; // Handling your optional uppercase NAME property
}

interface ApiResponse {
    data: Product[];
}

async function getProducts(): Promise<void> {
    const response = await fetch('http://localhost:3000/api/data');
    const result: ApiResponse = await response.json();
    
    // Using Type Assertion ('as') because TS doesn't know if the div exists
    const container = document.getElementById('product-list') as HTMLDivElement;
    
    if (container) {
        container.innerHTML = result.data.map(p => 
            `<p>${p.NAME || p.name || Object.values(p)[1]}</p>`
        ).join('');
    }
}

async function createProduct(newName: string): Promise<void> {
    await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
    });
    getProducts();
}

async function removeProduct(id: number | string): Promise<void> {
    await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE'
    });
    getProducts();
}

getProducts();
