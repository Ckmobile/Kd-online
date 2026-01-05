/* ================= WHATSAPP POPUP COMPLETE CODE ================= */

// WhatsApp number
const whatsappNumber = '94755997160'; // ඔබගේ WhatsApp අංකය

// DOM Elements - Popup
let whatsappPopup = null;
let popupOverlay = null;

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
    
    // Optional: Save to your database
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

// Initialize popup on page load
document.addEventListener('DOMContentLoaded', function() {
    createWhatsAppPopup();
});