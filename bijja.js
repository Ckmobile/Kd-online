const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminStatus = document.getElementById('adminStatus');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const adminKey = document.getElementById('adminKey');
const addItemForm = document.getElementById('addItemForm');
const clearFormBtn = document.getElementById('clearForm');
const adminItemsContainer = document.getElementById('adminItemsContainer');
const adminSearch = document.getElementById('adminSearch');
const adminSearchBtn = document.getElementById('adminSearchBtn');
const totalItemsEl = document.getElementById('totalItems');
const recentItemsEl = document.getElementById('recentItems');

let adminLoggedIn = false;
let adminItems = [];
let currentAdminSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    setupAdminEventListeners();
});

function checkAdminAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            adminLoggedIn = true;
            showAdminDashboard();
            loadAdminItems();
            adminStatus.textContent = user.email;
        } else {
            adminLoggedIn = false;
            showLoginSection();
            adminStatus.textContent = "Not Logged In";
        }
    });
}
function showLoginSection() {
    loginSection.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

function showAdminDashboard() {
    loginSection.style.display = 'none';
    adminDashboard.style.display = 'block';
}

function setupAdminEventListeners() {
    loginBtn.addEventListener('click', adminLogin);
    logoutBtn.addEventListener('click', adminLogout);
    
    addItemForm.addEventListener('submit', addNewItem);
    
    clearFormBtn.addEventListener('click', function() {
        addItemForm.reset();
    });
    
    adminSearchBtn.addEventListener('click', performAdminSearch);
    adminSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performAdminSearch();
    });
}

function adminLogin() {
    const email = adminEmail.value.trim();
    const password = adminPassword.value.trim();
    const secretKey = adminKey.value.trim();
    
    if (!email || !password || !secretKey) {
        alert('Please fill in all fields');
        return;
    }
    
    if (secretKey !== "admin123") {
        alert('Invalid admin key');
        return;
    }
    
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login as Admin';
            loginBtn.disabled = false;
            alert('Admin login successful!');
        })
        .catch((error) => {
            console.error("Login error: ", error);
            alert('Login failed: ' + error.message);
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login as Admin';
            loginBtn.disabled = false;
        });
}

function adminLogout() {
    auth.signOut()
        .then(() => {
            alert('Logged out successfully');
        })
        .catch((error) => {
            console.error("Logout error: ", error);
        });
}

function loadAdminItems() {
    adminItemsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading items...</p></div>';
    
    db.collection('items').get()
        .then((querySnapshot) => {
            adminItems = [];
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                item.id = doc.id;
                adminItems.push(item);
            });
            
            updateAdminStats();
            renderAdminItems();
        })
        .catch((error) => {
            console.error("Error loading items: ", error);
            adminItemsContainer.innerHTML = '<div class="error-message">Failed to load items. Please try again later.</div>';
        });
}

function updateAdminStats() {
    totalItemsEl.textContent = adminItems.length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentItems = adminItems.filter(item => {
        const itemDate = new Date(item.date || new Date());
        return itemDate >= oneWeekAgo;
    });
    
    recentItemsEl.textContent = recentItems.length;
}

function renderAdminItems() {
    if (adminItems.length === 0) {
        adminItemsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><h3>No Items Found</h3><p>Add your first item using the form above.</p></div>';
        return;
    }
    
    let displayedItems = [...adminItems];
    if (currentAdminSearch) {
        displayedItems = displayedItems.filter(item => 
            item.name.toLowerCase().includes(currentAdminSearch) ||
            item.description.toLowerCase().includes(currentAdminSearch) ||
            item.category.toLowerCase().includes(currentAdminSearch)
        );
    }
    
    if (displayedItems.length === 0) {
        adminItemsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>No Items Match Your Search</h3><p>Try a different search term.</p></div>';
        return;
    }
    
    adminItemsContainer.innerHTML = '';
    
    displayedItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'admin-item-card';
        
        itemCard.innerHTML = `
            <div class="admin-item-info">
                <h4 class="admin-item-name">${item.name}</h4>
                <span class="admin-item-category">${item.category.toUpperCase()}</span>
                <p class="admin-item-description">${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}</p>
                <div class="admin-item-price">$${parseFloat(item.price).toFixed(2)}</div>
                <div class="admin-item-date">Added: ${formatDate(item.date)}</div>
            </div>
            <div class="admin-item-actions">
                <button class="btn-edit" data-id="${item.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        adminItemsContainer.appendChild(itemCard);
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            editItem(itemId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            deleteItem(itemId);
        });
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function addNewItem(e) {
    e.preventDefault();
    
    if (!adminLoggedIn) {
        alert('You must be logged in as admin to add items');
        return;
    }
    
    const itemName = document.getElementById('itemName').value.trim();
    const itemPrice = document.getElementById('itemPrice').value.trim();
    const itemCategory = document.getElementById('itemCategory').value;
    const itemImage = document.getElementById('itemImage').value.trim();
    const itemDescription = document.getElementById('itemDescription').value.trim();
    
    if (!itemName || !itemPrice || !itemCategory || !itemDescription) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newItem = {
        name: itemName,
        price: parseFloat(itemPrice),
        category: itemCategory,
        description: itemDescription,
        date: new Date().toISOString()
    };
    
    if (itemImage) {
        newItem.image = itemImage;
    }
    
    const submitBtn = addItemForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;
    
    db.collection('items').add(newItem)
        .then((docRef) => {
            alert('Item added successfully!');
            addItemForm.reset();
            loadAdminItems(); // Reload items
        })
        .catch((error) => {
            console.error("Error adding item: ", error);
            alert('Error adding item: ' + error.message);
        })
        .finally(() => {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Item';
            submitBtn.disabled = false;
        });
}

function editItem(itemId) {
    const item = adminItems.find(i => i.id === itemId);
    
    if (!item) {
        alert('Item not found');
        return;
    }
    
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemImage').value = item.image || '';
    document.getElementById('itemDescription').value = item.description;
    
    const formTitle = document.querySelector('.add-item-section h3');
    const submitBtn = addItemForm.querySelector('button[type="submit"]');
    
    formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Item';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Item';
    
    addItemForm.removeEventListener('submit', addNewItem);
    
    const updateItemHandler = function(e) {
        e.preventDefault();
        
        const updatedItem = {
            name: document.getElementById('itemName').value.trim(),
            price: parseFloat(document.getElementById('itemPrice').value.trim()),
            category: document.getElementById('itemCategory').value,
            description: document.getElementById('itemDescription').value.trim(),
            date: item.date
        };
        
        const imageUrl = document.getElementById('itemImage').value.trim();
        if (imageUrl) updatedItem.image = imageUrl;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        submitBtn.disabled = true;
        
        db.collection('items').doc(itemId).update(updatedItem)
            .then(() => {
                alert('Item updated successfully!');
                addItemForm.reset();
                loadAdminItems();
                
                formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Item';
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Item';
                
                addItemForm.removeEventListener('submit', updateItemHandler);
                addItemForm.addEventListener('submit', addNewItem);
            })
            .catch((error) => {
                console.error("Error updating item: ", error);
                alert('Error updating item: ' + error.message);
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Item';
                submitBtn.disabled = false;
            });
    };
    
    addItemForm.addEventListener('submit', updateItemHandler);
    
    document.querySelector('.add-item-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    db.collection('items').doc(itemId).delete()
        .then(() => {
            alert('Item deleted successfully!');
            loadAdminItems();
        })
        .catch((error) => {
            console.error("Error deleting item: ", error);
            alert('Error deleting item: ' + error.message);
        });
}

function performAdminSearch() {
    currentAdminSearch = adminSearch.value.trim().toLowerCase();
    renderAdminItems();
}