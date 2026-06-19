// Admin Authentication Check
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-password').value;

    auth.signInWithEmailAndPassword(email, pass).then(() => {
        document.getElementById('admin-auth').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadOrders();
        loadAdminItems();
    }).catch(err => alert("Access Denied: " + err.message));
});

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    event.currentTarget.classList.add('active');
}

// Upload Product with Image
document.getElementById('upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const file = document.getElementById('prod-image').files[0];
    const name = document.getElementById('prod-name').value;
    const cat = document.getElementById('prod-category').value;
    const price = document.getElementById('prod-price').value;
    const desc = document.getElementById('prod-desc').value;

    const storageRef = storage.ref('products/' + file.name);
    storageRef.put(file).then(() => {
        storageRef.getDownloadURL().then((url) => {
            db.collection('products').add({
                name: name, category: cat, price: price, description: desc, imageUrl: url
            }).then(() => {
                alert("Product Uploaded Successfully!");
                document.getElementById('upload-form').reset();
            });
        });
    });
});

// Load Secure Orders (Only Admin Viewable)
function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    db.collection('orders').orderBy('timestamp', 'desc').onSnapshot(snap => {
        ordersList.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            ordersList.innerHTML += `
                <div class="order-item-card">
                    <p><strong>Customer:</strong> ${data.customerName} (${data.phone})</p>
                    <p><strong>Address:</strong> ${data.address}</p>
                    <p><strong>Qty:</strong> ${data.qty}</p>
                    <button onclick="deleteOrder('${doc.id}')" style="background:red; color:white; border:none; padding:5px; border-radius:3px;">Complete/Delete</button>
                </div>
            `;
        });
    });
}

function deleteOrder(id) { if(confirm("Delete this order?")) db.collection('orders').doc(id).delete(); }
function goBack() { window.history.back(); }
