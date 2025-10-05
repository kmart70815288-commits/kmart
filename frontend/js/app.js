// ----------- تحميل العروض -----------
const offers = [
  { img: "img/offers/1.jpeg" },
  { img: "img/offers/2.jpeg" },
  { img: "img/offers/3.jpeg" }
];

const offersContainer = document.getElementById("offersContainer");
offers.forEach((offer, i) => {
  offersContainer.innerHTML += `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <img src="${offer.img}" class="d-block w-100 rounded" height="250" alt="عرض">
    </div>`;
});

// ----------- عداد زمني للعروض -----------
let countdownDate = new Date().getTime() + (3 * 60 * 60 * 1000); // 3 ساعات
setInterval(() => {
  let now = new Date().getTime();
  let distance = countdownDate - now;
  if (distance < 0) { document.getElementById("countdown").innerText = "انتهى"; return; }
  let h = Math.floor(distance / (1000 * 60 * 60));
  let m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let s = Math.floor((distance % (1000 * 60)) / 1000);
  document.getElementById("countdown").innerText = `${h}:${m}:${s}`;
}, 1000);

// ----------- تحميل المنتجات من db.json -----------
let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderProducts(products) {
  const container = document.getElementById("productsContainer");
  container.innerHTML = "";
  products.forEach(p => {
    container.innerHTML += `
      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <img src="${p.img || 'img/placeholder.png'}" class="card-img-top" height="150" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h6 class="card-title">${p.name}</h6>
            <p class="text-muted">${p.category}</p>
            <p class="fw-bold">${p.price} ل.ل</p>
            <button class="btn btn-primary mt-auto" onclick="addToCart(${p.id})">➕ أضف</button>
          </div>
        </div>
      </div>`;
  });
}

async function loadProducts() {
  const res = await fetch("http://localhost:3000/products");
  allProducts = await res.json();
  renderProducts(allProducts);
  renderCategories();
}
loadProducts();

// ----------- الأقسام -----------
function renderCategories() {
  const cats = [...new Set(allProducts.map(p => p.category))];
  const container = document.getElementById("categoriesContainer");
  container.innerHTML = "";
  cats.forEach(c => {
    container.innerHTML += `<button class="btn btn-outline-secondary" onclick="filterCategory('${c}')">${c}</button>`;
  });
}
function filterCategory(cat) {
  renderProducts(allProducts.filter(p => p.category === cat));
}
document.getElementById("allCategoriesBtn").onclick = () => renderProducts(allProducts);

// ----------- البحث -----------
document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderProducts(allProducts.filter(p => p.name.toLowerCase().includes(q)));
});

// ----------- السلة -----------
function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  container.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    container.innerHTML += `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>${item.name} <br><small class="text-muted">${item.price} ل.ل</small></div>
        <div>
          <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${item.id}, -1)">-</button>
          <span class="mx-2">${item.qty}</span>
          <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>`;
  });
  document.getElementById("cartTotal").innerText = total;
  document.getElementById("cartCount").innerText = cart.reduce((a, b) => a + b.qty, 0);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

document.getElementById("cartBtn").onclick = () => new bootstrap.Modal(document.getElementById("cartModal")).show();
document.getElementById("clearCart").onclick = () => { cart = []; saveCart(); };

// تحميل السلة عند البدء
renderCart();
