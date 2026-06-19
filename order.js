const productId = localStorage.getItem('selectedProductId');
const summaryDiv = document.getElementById('selected-product-summary');

if(productId && summaryDiv) {
    db.collection("products").doc(productId).get().then((doc) => {
        if(doc.exists) {
            const prod = doc.data();
            summaryDiv.innerHTML = `<h3>Ordering: ${prod.name} - LKR ${prod.price}</h3>`;
        }
    });
}

document.getElementById('order-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const orderData = {
        productId: productId,
        customerName: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value,
        qty: document.getElementById('cust-qty').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore 'orders' collection (accessible by admin)
    db.collection("orders").add(orderData).then(() => {
        alert("Order Confirmed Successfully!");
        window.location.href = 'index.html';
    }).catch(err => alert("Error saving order: " + err.message));
});

function goBack() { window.history.back(); }
