// Menu Drawer open/close
const menuBtn = document.getElementById('menu-btn');
const closeMenu = document.getElementById('close-menu');
const navMenu = document.getElementById('nav-menu');

if(menuBtn) menuBtn.addEventListener('click', () => navMenu.classList.add('active'));
if(closeMenu) closeMenu.addEventListener('click', () => navMenu.classList.remove('active'));

// Dynamic Links for Socials (Set your links here)
document.getElementById('fb-link').href = "https://facebook.com/yourpage";
document.getElementById('gmail-link').href = "mailto:youremail@gmail.com";
document.getElementById('wa-channel-link').href = "https://whatsapp.com/channel/yourchannelid";

// Load Products from Firebase Firestore
const productsGrid = document.getElementById('products-grid');

if (productsGrid) {
    db.collection("products").onSnapshot((snapshot) => {
        productsGrid.innerHTML = "";
        if(snapshot.empty) {
            productsGrid.innerHTML = "<p>No products available right now.</p>";
            return;
        }
        snapshot.forEach((doc) => {
            const product = doc.data();
            const productCard = `
                <div class="product-card">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/200'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="category">Category: ${product.category}</p>
                    <p class="price">LKR ${product.price}</p>
                    <button class="btn-order" onclick="redirectToOrder('${doc.id}')">Order Now</button>
                </div>
            `;
            productsGrid.innerHTML += productCard;
        });
    });
}

function redirectToOrder(productId) {
    localStorage.setItem('selectedProductId', productId);
    window.location.href = 'order.html';
}

// Handle browser/phone back button nicely
function goBack() { window.history.back(); }
