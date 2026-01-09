/* ================= COMPLETE SCRIPT.JS ================= */

// DOM Elements
const itemsContainer = document.getElementById('itemsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sortSelect');
const clearFilters = document.getElementById('clearFilters');
const itemsCount = document.getElementById('itemsCount');
const emptyState = document.getElementById('emptyState');
const categoryCards = document.querySelectorAll('.category-card');

// State
let allItems = [];
let filteredItems = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'newest';

// WhatsApp number
const whatsappNumber = '94755997160'; // Your WhatsApp number

// Default images for categories
const defaultImages = {
    gift: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    vehicle: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    mobile: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    school: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    stores: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    kids: 'https://images.unsplash.com/photo-1534188753412-9f0337d4d51d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    toy: 'https://images.unsplash.com/photo-1550747531-5f0b3c16d2e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    home: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    sports: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    other: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
};

// Category icons mapping
const categoryIcons = {
    gift: 'fas fa-gift',
    vehicle: 'fas fa-car',
    mobile: 'fas fa-mobile-alt',
    fashion: 'fas fa-tshirt',
    school: 'fas fa-graduation-cap',
    stores: 'fas fa-store',
    kids: 'fas fa-child',
    toy: 'fas fa-gamepad',
    electronics: 'fas fa-laptop',
    home: 'fas fa-home',
    sports: 'fas fa-futbol',
    other: 'fas fa-ellipsis-h'
};

// DOM Elements - Popup
let whatsappPopup = null;
let popupOverlay = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    setupEventListeners();
    createWhatsAppPopup(); // Create popup on load
    createSuggestionsDropdown();
    setupMobileMenu();
});

// Setup mobile menu toggle
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuBtn.contains(event.target) && !navLinks.contains(event.target)) {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            }
        });
    }
}

// Load items from Firebase
function loadItems() {
    itemsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading items...</p></div>';
    
    db.collection('items').get()
        .then((querySnapshot) => {
            allItems = [];
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                item.id = doc.id;
                item.date = item.date || new Date().toISOString();
                allItems.push(item);
            });
            
            // Sort by date (newest first) initially
            allItems.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            filteredItems = [...allItems];
            renderItems();
            updateItemsCount();
        })
        .catch((error) => {
            console.error("Error loading items: ", error);
            itemsContainer.innerHTML = '<div class="error-message">Failed to load items. Please try again later.</div>';
        });
}

// Create suggestions dropdown
function createSuggestionsDropdown() {
    const suggestionsDropdown = document.createElement('div');
    suggestionsDropdown.id = 'searchSuggestions';
    suggestionsDropdown.className = 'search-suggestions';
    
    // Add after search container
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.appendChild(suggestionsDropdown);
    }
}

// Get search suggestions based on input
function getSearchSuggestions(searchTerm) {
    if (!searchTerm || searchTerm.length < 1) return [];
    
    const suggestions = new Set(); // Use Set to avoid duplicates
    
    allItems.forEach(item => {
        // Check item name
        if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            suggestions.add(item.name);
        }
        
        // Check item category
        if (item.category.toLowerCase().includes(searchTerm.toLowerCase())) {
            suggestions.add(item.category);
        }
        
        // Check for words starting with search term
        const words = item.name.toLowerCase().split(' ');
        words.forEach(word => {
            if (word.startsWith(searchTerm.toLowerCase())) {
                suggestions.add(word);
            }
        });
    });
    
    // Convert Set to Array and limit to 5 suggestions
    return Array.from(suggestions).slice(0, 5);
}

// Show search suggestions
function showSearchSuggestions(suggestions) {
    const suggestionsDropdown = document.getElementById('searchSuggestions');
    if (!suggestionsDropdown) return;
    
    if (suggestions.length === 0) {
        suggestionsDropdown.style.display = 'none';
        return;
    }
    
    suggestionsDropdown.innerHTML = '';
    suggestionsDropdown.style.display = 'block';
    
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.innerHTML = `<i class="fas fa-search"></i> ${suggestion}`;
        
        suggestionItem.addEventListener('click', function() {
            searchInput.value = suggestion;
            hideSearchSuggestions();
            performSearch();
            scrollToItems();
        });
        
        suggestionsDropdown.appendChild(suggestionItem);
    });
}

// Hide search suggestions
function hideSearchSuggestions() {
    const suggestionsDropdown = document.getElementById('searchSuggestions');
    if (suggestionsDropdown) {
        suggestionsDropdown.style.display = 'none';
    }
}

// Create WhatsApp Order Popup
function createWhatsAppPopup() {
    // Create overlay
    popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.style.display = 'none';
    
    // Create popup
    whatsappPopup = document.createElement('div');
    whatsappPopup.className = 'whatsapp-popup';
    whatsappPopup.innerHTML = `
        <div class="popup-header">
            <div class="header-content">
                <i class="fab fa-whatsapp"></i>
                <h3>Order via WhatsApp</h3>
            </div>
            <button class="popup-close">&times;</button>
        </div>
        
        <div class="popup-content">
            <!-- Item Image Section -->
            <div class="popup-image-section">
                <div class="image-container" id="popupImageContainer">
                    <!-- Image will be loaded here -->
                </div>
                <div class="image-loader">
                    <div class="spinner"></div>
                </div>
            </div>
            
            <!-- Item Details -->
            <div class="popup-item-details">
                <h4 id="popupItemName">Item Name</h4>
                
                <div class="detail-row">
                    <div class="detail-item">
                        <i class="fas fa-tag"></i>
                        <span class="label">Category:</span>
                        <span class="value" id="popupCategory">Category</span>
                    </div>
                    <div class="detail-item price">
                        <i class="fas fa-money-bill-wave"></i>
                        <span class="label">Price:</span>
                        <span class="value" id="popupPrice">LKR 0.00</span>
                    </div>
                </div>
                
                <div class="description-section">
                    <div class="section-title">
                        <i class="fas fa-align-left"></i>
                        <span>Description</span>
                    </div>
                    <p class="item-description" id="popupDescription">Description will appear here</p>
                </div>
            </div>
            
            <!-- Customer Form -->
            <div class="customer-form">
                <div class="form-title">
                    <i class="fas fa-user-edit"></i>
                    <h4>Your Details</h4>
                </div>
                
                <div class="form-group">
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" 
                               id="customerName" 
                               placeholder="Your Full Name"
                               maxlength="50"
                               required>
                    </div>
                    <div class="input-hint">Required field</div>
                </div>
                
                <div class="form-group">
                    <div class="input-with-icon">
                        <i class="fas fa-phone"></i>
                        <input type="tel" 
                               id="customerPhone" 
                               placeholder="07X XXX XXXX"
                               maxlength="10"
                               pattern="[0-9]{9,10}"
                               required>
                    </div>
                    <div class="input-hint">10 digit phone number</div>
                </div>
                
                <div class="form-group">
                    <div class="input-with-icon">
                        <i class="fas fa-map-marker-alt"></i>
                        <textarea id="customerAddress" 
                                  rows="2" 
                                  placeholder="Delivery Address (Optional)"
                                  maxlength="200"></textarea>
                    </div>
                    <div class="input-hint">Include city and postal code if possible</div>
                </div>
                
                <div class="form-group">
                    <div class="input-with-icon">
                        <i class="fas fa-comment"></i>
                        <textarea id="customerMessage" 
                                  rows="2" 
                                  placeholder="Additional Notes (Optional)"
                                  maxlength="200"></textarea>
                    </div>
                    <div class="input-hint">Special requests or questions</div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="popup-actions">
                <button class="btn-secondary" id="btnClosePopup">
                    <i class="fas fa-times"></i>
                    <span>Cancel</span>
                </button>
                <button class="btn-primary" id="btnSendWhatsApp">
                    <i class="fab fa-whatsapp"></i>
                    <span>Send WhatsApp Message</span>
                </button>
            </div>
        </div>
        
        <!-- WhatsApp Direct Link -->
        <div class="whatsapp-direct">
            <a href="https://wa.me/${whatsappNumber}" target="_blank" class="direct-link">
                <i class="fab fa-whatsapp"></i>
                <span>Click here to open WhatsApp directly</span>
            </a>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(popupOverlay);
    document.body.appendChild(whatsappPopup);
    
    // Setup popup events
    setupPopupEvents();
}

// Setup popup event listeners
function setupPopupEvents() {
    // Close buttons
    const closeBtn = whatsappPopup.querySelector('.popup-close');
    const cancelBtn = whatsappPopup.querySelector('#btnClosePopup');
    const overlay = popupOverlay;
    
    [closeBtn, cancelBtn, overlay].forEach(element => {
        element.addEventListener('click', hideWhatsAppPopup);
    });
    
    // Send WhatsApp button
    const sendBtn = whatsappPopup.querySelector('#btnSendWhatsApp');
    sendBtn.addEventListener('click', sendWhatsAppOrder);
    
    // Input validation
    const nameInput = whatsappPopup.querySelector('#customerName');
    const phoneInput = whatsappPopup.querySelector('#customerPhone');
    
    // Real-time validation
    nameInput.addEventListener('input', function() {
        validateField(this, this.value.trim().length > 0);
    });
    
    phoneInput.addEventListener('input', function() {
        const isValid = /^[0-9]{9,10}$/.test(this.value.trim());
        validateField(this, isValid);
    });
    
    // Prevent popup close when clicking inside
    whatsappPopup.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Escape key to close popup
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && whatsappPopup.style.display === 'block') {
            hideWhatsAppPopup();
        }
    });
}

// Validate input field
function validateField(inputElement, isValid) {
    if (isValid) {
        inputElement.classList.remove('invalid');
        inputElement.classList.add('valid');
    } else {
        inputElement.classList.remove('valid');
        inputElement.classList.add('invalid');
    }
}

// Show WhatsApp popup with item details
function showWhatsAppPopup(item) {
    // Fill item details
    document.getElementById('popupItemName').textContent = item.name;
    document.getElementById('popupCategory').textContent = item.category;
    document.getElementById('popupPrice').textContent = `LKR ${parseFloat(item.price).toFixed(2)}`;
    document.getElementById('popupDescription').textContent = item.description;
    
    // Load item image
    loadItemImage(item);
    
    // Store current item for sending
    whatsappPopup.currentItem = item;
    
    // Reset form
    resetForm();
    
    // Show popup
    showPopup();
}

// Load and display item image
function loadItemImage(item) {
    const imageContainer = document.getElementById('popupImageContainer');
    const imageLoader = whatsappPopup.querySelector('.image-loader');
    
    // Show loader
    imageLoader.style.display = 'flex';
    imageContainer.innerHTML = '';
    
    // Try to get image from item data
    const imageUrl = item.image || getDefaultImageByCategory(item.category);
    
    // Create image element
    const img = document.createElement('img');
    img.className = 'popup-item-image';
    img.alt = item.name;
    img.loading = 'eager';
    
    // Set image source
    img.src = imageUrl;
    
    // When image loads
    img.onload = function() {
        imageLoader.style.display = 'none';
        imageContainer.innerHTML = '';
        imageContainer.appendChild(img);
        
        // Add zoom effect on click
        img.addEventListener('click', function() {
            this.classList.toggle('zoomed');
        });
    };
    
    // If image fails to load
    img.onerror = function() {
        imageLoader.style.display = 'none';
        imageContainer.innerHTML = `
            <div class="image-placeholder">
                <i class="fas fa-image"></i>
                <span>No Image Available</span>
            </div>
        `;
    };
    
    // Set timeout for slow loading
    setTimeout(() => {
        if (imageLoader.style.display !== 'none') {
            imageLoader.style.display = 'none';
            imageContainer.innerHTML = `
                <div class="image-placeholder">
                    <i class="fas fa-image"></i>
                    <span>Image Loading...</span>
                </div>
            `;
        }
    }, 5000);
}

// Get default image based on category
function getDefaultImageByCategory(category) {
    const defaultImages = {
        gift: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        vehicle: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        mobile: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        school: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        stores: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        kids: 'https://images.unsplash.com/photo-1534188753412-9f0337d4d51d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        toy: 'https://images.unsplash.com/photo-1550747531-5f0b3c16d2e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        home: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sports: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        other: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    
    return defaultImages[category] || defaultImages.other;
}

// Reset form fields
function resetForm() {
    const inputs = [
        'customerName',
        'customerPhone', 
        'customerAddress',
        'customerMessage'
    ];
    
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = '';
            input.classList.remove('valid', 'invalid');
        }
    });
    
    // Focus on name field
    setTimeout(() => {
        document.getElementById('customerName').focus();
    }, 300);
}

// Show popup with animation
function showPopup() {
    popupOverlay.style.display = 'block';
    whatsappPopup.style.display = 'block';
    
    // Add animation class
    setTimeout(() => {
        whatsappPopup.classList.add('show');
        popupOverlay.classList.add('show');
    }, 10);
}

// Hide WhatsApp popup
function hideWhatsAppPopup() {
    whatsappPopup.classList.remove('show');
    popupOverlay.classList.remove('show');
    
    setTimeout(() => {
        popupOverlay.style.display = 'none';
        whatsappPopup.style.display = 'none';
    }, 300);
}

// Send WhatsApp order
function sendWhatsAppOrder() {
    const item = whatsappPopup.currentItem;
    if (!item) return;
    
    // Get customer details
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const customerMessage = document.getElementById('customerMessage').value.trim();
    
    // Validation
    if (!customerName) {
        showValidationError('Please enter your name');
        document.getElementById('customerName').focus();
        return;
    }
    
    if (!customerPhone || !/^[0-9]{9,10}$/.test(customerPhone)) {
        showValidationError('Please enter a valid 10-digit phone number');
        document.getElementById('customerPhone').focus();
        return;
    }
    
    // Create WhatsApp message
    const whatsappMessage = encodeURIComponent(
        `🛒 *NEW ORDER REQUEST* 🛒\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        
        `👤 *CUSTOMER DETAILS*\n` +
        `• Name: ${customerName}\n` +
        `• Phone: ${customerPhone}\n` +
        `• Address: ${customerAddress || 'Not specified'}\n` +
        `• Notes: ${customerMessage || 'None'}\n\n` +
        
        `📦 *ITEM DETAILS*\n` +
        `• Item: ${item.name}\n` +
        `• Category: ${item.category}\n` +
        `• Price: LKR ${parseFloat(item.price).toFixed(2)}\n` +
        `• Description: ${item.description}\n\n` +
        
        `📋 *ORDER INFORMATION*\n` +
        `• Platform: Kd Online Shop\n` +
        `• Time: ${new Date().toLocaleString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}\n` +
        `• Order ID: ${item.id || 'N/A'}\n\n` +
        
        `✅ Please confirm this order.`
    );
    
    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
    
    // Track order
    trackOrder(item, customerName, customerPhone);
    
    // Hide popup
    hideWhatsAppPopup();
    
    // Show success message
    showOrderSuccessMessage(item.name);
}

// Show validation error
function showValidationError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Remove existing error
    const existingError = whatsappPopup.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error to popup
    whatsappPopup.querySelector('.popup-content').prepend(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Track order
function trackOrder(item, customerName, customerPhone) {
    console.log(`Order sent: ${item.name}`, {
        customer: customerName,
        phone: customerPhone,
        itemId: item.id,
        timestamp: new Date().toISOString()
    });
    
    // Optional: Save to Firebase
    /*
    db.collection('orders').add({
        itemId: item.id,
        itemName: item.name,
        customerName: customerName,
        customerPhone: customerPhone,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    */
}

// Show success message
function showOrderSuccessMessage(itemName) {
    const successMsg = document.createElement('div');
    successMsg.className = 'order-success-message';
    successMsg.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h4>Order Request Sent!</h4>
            <p>Your order for "<strong>${itemName}</strong>" has been prepared.</p>
            <p>Check WhatsApp to complete your order.</p>
            <div class="success-tips">
                <div class="tip">
                    <i class="fas fa-clock"></i>
                    <span>Response within 15 minutes</span>
                </div>
                <div class="tip">
                    <i class="fas fa-headset"></i>
                    <span>Customer support available</span>
                </div>
            </div>
            <button class="btn-close-success">OK</button>
        </div>
    `;
    
    document.body.appendChild(successMsg);
    
    // Show with animation
    setTimeout(() => {
        successMsg.classList.add('show');
    }, 10);
    
    // Close button event
    const closeBtn = successMsg.querySelector('.btn-close-success');
    closeBtn.addEventListener('click', function() {
        successMsg.classList.remove('show');
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.remove();
            }
        }, 300);
    });
    
    // Auto close after 8 seconds
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.classList.remove('show');
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.remove();
                }
            }, 300);
        }
    }, 8000);
}

// Render items to the page
function renderItems() {
    if (filteredItems.length === 0) {
        itemsContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    itemsContainer.style.display = 'grid';
    emptyState.style.display = 'none';
    
    itemsContainer.innerHTML = '';
    
    filteredItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        
        const imageUrl = item.image || defaultImages[item.category] || defaultImages.other;
        const categoryIcon = categoryIcons[item.category] || 'fas fa-box';
        
        itemCard.innerHTML = `
            <div class="item-image">
                <img src="${imageUrl}" alt="${item.name}" loading="lazy">
                <div class="item-overlay">
                    <span class="overlay-category">
                        <i class="${categoryIcon}"></i> ${item.category}
                    </span>
                </div>
            </div>
            <div class="item-info">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-description">${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}</p>
                
                <div class="item-details">
                    <div class="item-price">
                        <i class="fas fa-tag"></i>
                        LKR. ${parseFloat(item.price).toFixed(2)}
                    </div>
                    <div class="item-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${formatDate(item.date)}
                    </div>
                </div>
                
                <button class="order-now-btn" 
                    data-item-id="${item.id}" 
                    data-item-name="${item.name}" 
                    data-item-category="${item.category}" 
                    data-item-price="${item.price}" 
                    data-item-description="${item.description}"
                    data-item-image="${imageUrl}">
                    <i class="fab fa-whatsapp"></i> Order Now
                </button>
            </div>
        `;
        
        // Add click event to the order button
        const orderBtn = itemCard.querySelector('.order-now-btn');
        orderBtn.addEventListener('click', function() {
            const itemData = {
                id: this.getAttribute('data-item-id'),
                name: this.getAttribute('data-item-name'),
                category: this.getAttribute('data-item-category'),
                price: this.getAttribute('data-item-price'),
                description: this.getAttribute('data-item-description'),
                image: this.getAttribute('data-item-image')
            };
            
            // Show WhatsApp popup
            showWhatsAppPopup(itemData);
        });
        
        // Add click event to item image/name for quick view
        const itemImage = itemCard.querySelector('.item-image');
        const itemNameElement = itemCard.querySelector('.item-name');
        
        [itemImage, itemNameElement].forEach(element => {
            element.style.cursor = 'pointer';
            element.addEventListener('click', function() {
                const itemData = {
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    description: item.description,
                    image: item.image || imageUrl
                };
                showWhatsAppPopup(itemData);
            });
        });
        
        itemsContainer.appendChild(itemCard);
    });
}

// Format date for display
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays <= 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    } catch (error) {
        return 'Recently';
    }
}

// Setup event listeners
function setupEventListeners() {
    let searchTimeout;
    
    // Real-time search with suggestions
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm.length > 0) {
            // Show suggestions immediately
            const suggestions = getSearchSuggestions(searchTerm);
            showSearchSuggestions(suggestions);
            
            // Delay the actual search
            searchTimeout = setTimeout(() => {
                currentSearch = searchTerm.toLowerCase();
                applyFilters();
            }, 500);
        } else {
            // Hide suggestions if search is empty
            hideSearchSuggestions();
            currentSearch = '';
            applyFilters();
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(event) {
        const suggestionsDropdown = document.getElementById('searchSuggestions');
        if (suggestionsDropdown && 
            !suggestionsDropdown.contains(event.target) && 
            event.target !== searchInput) {
            hideSearchSuggestions();
        }
    });
    
    // Search button click
    searchBtn.addEventListener('click', function() {
        currentSearch = searchInput.value.trim().toLowerCase();
        hideSearchSuggestions();
        applyFilters();
        
        if (currentSearch.length > 0) {
            scrollToItems();
        }
    });
    
    // Enter key for search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim().toLowerCase();
            hideSearchSuggestions();
            applyFilters();
            
            if (currentSearch.length > 0) {
                scrollToItems();
            }
        }
    });
    
    // Arrow keys navigation in suggestions
    searchInput.addEventListener('keydown', function(e) {
        const suggestionsDropdown = document.getElementById('searchSuggestions');
        if (!suggestionsDropdown || suggestionsDropdown.style.display === 'none') return;
        
        const suggestions = suggestionsDropdown.querySelectorAll('.suggestion-item');
        let activeIndex = -1;
        
        // Find currently active suggestion
        suggestions.forEach((suggestion, index) => {
            if (suggestion.classList.contains('active')) {
                activeIndex = index;
            }
        });
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeIndex < suggestions.length - 1) {
                if (activeIndex >= 0) {
                    suggestions[activeIndex].classList.remove('active');
                }
                suggestions[activeIndex + 1].classList.add('active');
                searchInput.value = suggestions[activeIndex + 1].textContent.replace('🔍 ', '');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeIndex > 0) {
                suggestions[activeIndex].classList.remove('active');
                suggestions[activeIndex - 1].classList.add('active');
                searchInput.value = suggestions[activeIndex - 1].textContent.replace('🔍 ', '');
            }
        } else if (e.key === 'Escape') {
            hideSearchSuggestions();
        }
    });
    
    // Sorting
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        applyFilters();
    });
    
    // Clear filters
    clearFilters.addEventListener('click', function() {
        searchInput.value = '';
        sortSelect.value = 'newest';
        currentSearch = '';
        currentCategory = 'all';
        currentSort = 'newest';
        hideSearchSuggestions();
        
        // Remove active class from all category cards
        categoryCards.forEach(card => card.classList.remove('active'));
        
        // Add active class to "All Items" card
        const allItemsCard = document.querySelector('.category-card[data-category="all"]');
        if (allItemsCard) {
            allItemsCard.classList.add('active');
        }
        
        applyFilters();
    });
    
    // Category filtering
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active category
            categoryCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = category;
            applyFilters();
            
            // Category select කළ විට items section එකට scroll වේ
            if (category !== 'all') {
                scrollToItems();
            }
        });
    });
    
    // Set "All Items" as active initially
    const allItemsCard = document.querySelector('.category-card[data-category="all"]');
    if (allItemsCard) {
        allItemsCard.classList.add('active');
    }
    
    // Categories navigation - Mobile horizontal scroll
    const categoryList = document.getElementById('categoryList');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn && nextBtn && categoryList) {
        prevBtn.addEventListener('click', () => {
            scrollCategories(-200);
        });
        
        nextBtn.addEventListener('click', () => {
            scrollCategories(200);
        });
        
        // Update navigation button visibility based on scroll position
        categoryList.addEventListener('scroll', updateCategoryNavigation);
        
        // Initial update
        updateCategoryNavigation();
        
        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        categoryList.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        categoryList.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    // Swipe right - scroll left
                    scrollCategories(-200);
                } else {
                    // Swipe left - scroll right
                    scrollCategories(200);
                }
            }
        }
    }
    
    // Window resize handler to update navigation buttons
    window.addEventListener('resize', updateCategoryNavigation);
}

// Scroll categories horizontally
function scrollCategories(amount) {
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
        categoryList.scrollBy({
            left: amount,
            behavior: 'smooth'
        });
        
        // Update buttons after scrolling
        setTimeout(updateCategoryNavigation, 300);
    }
}

// Update category navigation buttons
function updateCategoryNavigation() {
    const categoryList = document.getElementById('categoryList');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!categoryList || !prevBtn || !nextBtn) return;
    
    const scrollLeft = categoryList.scrollLeft;
    const scrollWidth = categoryList.scrollWidth;
    const clientWidth = categoryList.clientWidth;
    
    // Show/hide previous button
    if (scrollLeft <= 10) {
        prevBtn.classList.add('disabled');
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.classList.remove('disabled');
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }
    
    // Show/hide next button
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
        nextBtn.classList.add('disabled');
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.classList.remove('disabled');
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
    
    // Hide navigation buttons on desktop
    if (window.innerWidth >= 768) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }
}

// Perform search
function performSearch() {
    currentSearch = searchInput.value.trim().toLowerCase();
    applyFilters();
}

// Apply all filters and sorting
function applyFilters() {
    filteredItems = [...allItems];
    
    // Apply category filter
    if (currentCategory !== 'all') {
        filteredItems = filteredItems.filter(item => 
            item.category.toLowerCase() === currentCategory.toLowerCase()
        );
    }
    
    // Apply search filter
    if (currentSearch) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(currentSearch) ||
            item.description.toLowerCase().includes(currentSearch) ||
            item.category.toLowerCase().includes(currentSearch)
        );
    }
    
    // Apply sorting
    switch (currentSort) {
        case 'price-low':
            filteredItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            filteredItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'name':
            filteredItems.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
        default:
            filteredItems.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
    }
    
    renderItems();
    updateItemsCount();
}

// Update items count display
function updateItemsCount() {
    itemsCount.textContent = filteredItems.length;
}

// Scroll to items section function
function scrollToItems() {
    const itemsSection = document.querySelector('.items-section');
    if (itemsSection) {
        // Smooth scroll to items section
        itemsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// Optional: Refresh items periodically
setInterval(() => {
    // You can enable this to auto-refresh items every 5 minutes
    // loadItems();
}, 300000); // 5 minutes

// Handle online/offline status
window.addEventListener('online', function() {
    console.log('Connection restored. Reloading items...');
    loadItems();
    
    // Show online message
    showStatusMessage('You are back online!', 'success');
});

window.addEventListener('offline', function() {
    console.log('Connection lost. Showing offline message...');
    
    // Show offline message
    showStatusMessage('You are currently offline. Some features may not be available.', 'warning');
});

// Show status message
function showStatusMessage(message, type) {
    const statusMsg = document.createElement('div');
    statusMsg.className = `status-message status-${type}`;
    statusMsg.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'wifi' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(statusMsg);
    
    // Show with animation
    setTimeout(() => {
        statusMsg.classList.add('show');
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        statusMsg.classList.remove('show');
        setTimeout(() => {
            if (statusMsg.parentNode) {
                statusMsg.remove();
            }
        }, 300);
    }, 5000);
}

// Add status message styles to CSS
const statusStyle = document.createElement('style');
statusStyle.textContent = `
    .status-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: var(--border-radius);
        padding: 15px 20px;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10001;
        transform: translateX(120%);
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        border-left: 4px solid;
    }
    
    .status-message.show {
        transform: translateX(0);
    }
    
    .status-success {
        border-left-color: var(--success);
    }
    
    .status-warning {
        border-left-color: var(--warning);
    }
    
    .status-message i {
        font-size: 1.3rem;
    }
    
    .status-success i {
        color: var(--success);
    }
    
    .status-warning i {
        color: var(--warning);
    }
    
    .status-message span {
        font-weight: 500;
        color: var(--dark);
    }
`;
document.head.appendChild(statusStyle);
