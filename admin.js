// DOM Elements
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

// --- නව POP-UP MODAL සන්නිවේදනය සඳහා DOM Elements ---
const catModal = document.getElementById('categoryModal');
const openCatModalBtn = document.getElementById('openCategoryModalBtn');
const closeCatModalBtn = document.getElementById('closeCategoryModalBtn');
const saveCatModalBtn = document.getElementById('saveCategoryModalBtn');
const selectedCatText = document.getElementById('selectedCategoriesText');
const checkboxes = document.querySelectorAll('input[name="itemCategories"]');

// State
let adminLoggedIn = false;
let adminItems = [];
let currentAdminSearch = '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
checkAdminAuth();
setupAdminEventListeners();
});

// Check if admin is already logged in
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

// Show login section
function showLoginSection() {
loginSection.style.display = 'flex';
adminDashboard.style.display = 'none';
}

// Show admin dashboard
function showAdminDashboard() {
loginSection.style.display = 'none';
adminDashboard.style.display = 'block';
}

// Setup admin event listeners
function setupAdminEventListeners() {
loginBtn.addEventListener('click', adminLogin);
logoutBtn.addEventListener('click', adminLogout);
addItemForm.addEventListener('submit', addNewItem);

clearFormBtn.addEventListener('click', function() {  
    addItemForm.reset();  
    clearCategoryCheckboxes();  
    // Clear කරන විට Text එක මුල් තත්වයට පත් කිරීම  
    if (selectedCatText) {  
        selectedCatText.textContent = "No categories selected";  
        selectedCatText.style.color = "#e74c3c";  
    }  
});  
  
adminSearchBtn.addEventListener('click', performAdminSearchLive');

adminSearch.addEventListener('input', function() {
    performAdminSearchLive();
    showSearchSuggestions();
});

adminSearch.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performAdminSearchLive();
    }
});

// --- POP-UP EVENT LISTENERS ---  
if (openCatModalBtn) {  
    openCatModalBtn.addEventListener('click', () => {  
        catModal.style.display = 'flex';  
    });  
}  

if (closeCatModalBtn) {  
    closeCatModalBtn.addEventListener('click', () => {  
        catModal.style.display = 'none';  
    });  
}  

if (saveCatModalBtn) {  
    saveCatModalBtn.addEventListener('click', updateSelectedCategoriesUI);  
}  

// Pop-up එකෙන් පිටත Click කලහොත් එය වැසීම  
window.addEventListener('click', (e) => {  
    if (e.target === catModal) {  
        catModal.style.display = 'none';  
    }  
});

}

// Helper function to clear checkboxes
function clearCategoryCheckboxes() {
const checkboxes = document.querySelectorAll('input[name="itemCategories"]');
checkboxes.forEach(cb => cb.checked = false);
}

// Pop-up එකේ තෝරාගත් දේ ප්‍රධාන UI එකේ පෙන්වන ශ්‍රිතය (Helper Function)
function updateSelectedCategoriesUI() {
let selectedLabels = [];
checkboxes.forEach(cb => {
if (cb.checked) {
selectedLabels.push(cb.nextElementSibling.textContent);
}
});

if (selectedLabels.length > 0) {  
    selectedCatText.textContent = "Selected: " + selectedLabels.join(', ');  
    selectedCatText.style.color = "#27ae60";  
} else {  
    selectedCatText.textContent = "No categories selected";  
    selectedCatText.style.color = "#e74c3c";  
}  
catModal.style.display = 'none';

}

// Admin login
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

// Admin logout
function adminLogout() {
auth.signOut()
.then(() => {
alert('Logged out successfully');
})
.catch((error) => {
console.error("Logout error: ", error);
});
}

// Load items for admin panel
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

// Update admin statistics
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

// Render items in admin panel
function renderAdminItems() {
if (adminItems.length === 0) {
adminItemsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><h3>No Items Found</h3><p>Add your first item using the form above.</p></div>';
return;
}

let displayedItems = [...adminItems];  
if (currentAdminSearch) {  
    displayedItems = displayedItems.filter(item => {  
        const nameMatch = item.name.toLowerCase().includes(currentAdminSearch);  
        const descMatch = item.description.toLowerCase().includes(currentAdminSearch);  
          
        let categoryMatch = false;  
        if (item.categories && Array.isArray(item.categories)) {  
            categoryMatch = item.categories.some(cat => cat.toLowerCase().includes(currentAdminSearch));  
        } else if (item.category) {  
            categoryMatch = item.category.toLowerCase().includes(currentAdminSearch);  
        }  
          
        return nameMatch || descMatch || categoryMatch;  
    });  
}  
  
if (displayedItems.length === 0) {  
    adminItemsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>No Items Match Your Search</h3><p>Try a different search term.</p></div>';  
    return;  
}  
  
adminItemsContainer.innerHTML = '';  
  
displayedItems.forEach(item => {  
    const itemCard = document.createElement('div');  
    itemCard.className = 'admin-item-card';  
      
    let categoriesDisplay = '';  
    if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {  
        categoriesDisplay = item.categories.map(cat => cat.toUpperCase()).join(', ');  
    } else if (item.category) {  
        categoriesDisplay = item.category.toUpperCase();  
    } else {  
        categoriesDisplay = 'NO CATEGORY';  
    }  
      
    itemCard.innerHTML = `  
<div class="admin-item-image">  
    <img src="${item.image}" alt="${item.image}" class="item-image">  
</div>  

<div class="admin-item-info">  
    <h4 class="admin-item-name">${item.name}</h4>  
    <span class="admin-item-category">${categoriesDisplay}</span>  
    <p class="admin-item-description">  
        ${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}  
    </p>  
    <div class="admin-item-price">LKR ${parseFloat(item.price).toFixed(2)}</div>  
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

// Add new item
function addNewItem(e) {
e.preventDefault();

if (!adminLoggedIn) {  
    alert('You must be logged in as admin to add items');  
    return;  
}  
  
const itemName = document.getElementById('itemName').value.trim();  
const itemPrice = document.getElementById('itemPrice').value.trim();  
const itemImage = document.getElementById('itemImage').value.trim();  
const itemDescription = document.getElementById('itemDescription').value.trim();  
  
const checkedBoxes = document.querySelectorAll('input[name="itemCategories"]:checked');  
const selectedCategories = Array.from(checkedBoxes).map(cb => cb.value);  
  
if (!itemName || !itemPrice || selectedCategories.length === 0 || !itemDescription) {  
    alert('Please fill in all required fields (Select at least one category)');  
    return;  
}  
  
const newItem = {  
    name: itemName,  
    price: parseFloat(itemPrice),  
    categories: selectedCategories,   
    category: selectedCategories[0],   
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
        alert('Item added successfully with selected categories!');  
        addItemForm.reset();  
        clearCategoryCheckboxes();  
        // සේව් වූ පසු Text එක reset කිරීම  
        selectedCatText.textContent = "No categories selected";  
        selectedCatText.style.color = "#e74c3c";  
        loadAdminItems();  
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

// Edit item
function editItem(itemId) {
const item = adminItems.find(i => i.id === itemId);

if (!item) {  
    alert('Item not found');  
    return;  
}  
  
document.getElementById('itemName').value = item.name;  
document.getElementById('itemPrice').value = item.price;  
document.getElementById('itemImage').value = item.image || '';  
document.getElementById('itemDescription').value = item.description;  
  
clearCategoryCheckboxes();  
let selectedLabels = [];  

if (item.categories && Array.isArray(item.categories)) {  
    item.categories.forEach(cat => {  
        const checkbox = document.querySelector(`input[name="itemCategories"][value="${cat}"]`);  
        if (checkbox) {  
            checkbox.checked = true;  
            selectedLabels.push(checkbox.nextElementSibling.textContent);  
        }  
    });  
} else if (item.category) {  
    const checkbox = document.querySelector(`input[name="itemCategories"][value="${item.category}"]`);  
    if (checkbox) {  
        checkbox.checked = true;  
        selectedLabels.push(checkbox.nextElementSibling.textContent);  
    }  
}  
  
// Edit බටන් එක එබූ විට තෝරාගත් කැටගරි ටික ප්‍රධාන UI එකේ දිස්වීමට සැලැස්වීම  
if (selectedLabels.length > 0) {  
    selectedCatText.textContent = "Selected: " + selectedLabels.join(', ');  
    selectedCatText.style.color = "#27ae60";  
} else {  
    selectedCatText.textContent = "No categories selected";  
    selectedCatText.style.color = "#e74c3c";  
}  
  
const formTitle = document.querySelector('.add-item-section h3');  
const submitBtn = addItemForm.querySelector('button[type="submit"]');  
  
formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Item';  
submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Item';  
  
addItemForm.removeEventListener('submit', addNewItem);  
  
const updateItemHandler = function(e) {  
    e.preventDefault();  
      
    const checkedBoxes = document.querySelectorAll('input[name="itemCategories"]:checked');  
    const selectedCategories = Array.from(checkedBoxes).map(cb => cb.value);  
      
    if (selectedCategories.length === 0) {  
        alert('Please select at least one category');  
        return;  
    }  
      
    const updatedItem = {  
        name: document.getElementById('itemName').value.trim(),  
        price: parseFloat(document.getElementById('itemPrice').value.trim()),  
        categories: selectedCategories,  
        category: selectedCategories[0],   
        description: document.getElementById('itemDescription').value.trim(),  
        date: item.date  
    };  
      
    const imageUrl = document.getElementById('itemImage').value.trim();  
    if (imageUrl) {  
        updatedItem.image = imageUrl;  
    } else {  
        updatedItem.image = "";  
    }  
      
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';  
    submitBtn.disabled = true;  
      
    db.collection('items').doc(itemId).update(updatedItem)  
        .then(() => {  
            alert('Item updated successfully!');  
            addItemForm.reset();  
            clearCategoryCheckboxes();  
              
            // යාවත්කාලීන වූ පසු ප්‍රධාන UI එක reset කිරීම  
            selectedCatText.textContent = "No categories selected";  
            selectedCatText.style.color = "#e74c3c";  
              
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

// Delete item
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

// Perform admin search
function performAdminSearch() {
currentAdminSearch = adminSearch.value.trim().toLowerCase();
renderAdminItems();
}

//මේ කෝඩ් එකට අදාලව  Admin ප්‍රොඩක්ට් search කරද්දි auto අදාල items search වෙලා යටින් පෙන්නන්න සහ auto ඊට අදාල items ස්ක්‍රෝල් වෙලා එන විදියට හදලා කෝඩ් එක දෙන්න
