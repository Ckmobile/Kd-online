const itemsContainer = document.getElementById('itemsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sortSelect');
const clearFilters = document.getElementById('clearFilters');
const itemsCount = document.getElementById('itemsCount');
const emptyState = document.getElementById('emptyState');
const categoryCards = document.querySelectorAll('.category-card');
/* ===========================
   PRODUCT IMAGE POPUP
=========================== */

const imagePopupOverlay = document.getElementById("imagePopupOverlay");
const popupImage = document.getElementById("popupImage");
const imagePopupClose = document.querySelector(".image-popup-close");

/* OPEN IMAGE POPUP */
document.addEventListener("click", function (e) {

    /*
      Project structure based on your HTML:
      - Product image is inside product card
      - Clicking the image should open popup
    */

    if (e.target.tagName === "IMG" && e.target.closest(".item")) {
        popupImage.src = e.target.src;
        imagePopupOverlay.style.display = "flex";
    }
});

/* CLOSE POPUP */
imagePopupClose.addEventListener("click", () => {
    imagePopupOverlay.style.display = "none";
});

imagePopupOverlay.addEventListener("click", (e) => {
    if (e.target === imagePopupOverlay) {
        imagePopupOverlay.style.display = "none";
    }
});


let allItems = [];
let filteredItems = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'newest';

const whatsappNumbers = {
    option1: '94755997160',
    option2: '94760000000'
};

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

let whatsappPopup = null;
let popupOverlay = null;

document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    setupEventListeners();
    createWhatsAppPopup();
    createSuggestionsDropdown();
    setupMobileMenu();
});

function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
        
        document.addEventListener('click', function(event) {
            if (!mobileMenuBtn.contains(event.target) && !navLinks.contains(event.target)) {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            }
        });
    }
}

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

function createSuggestionsDropdown() {
    const suggestionsDropdown = document.createElement('div');
    suggestionsDropdown.id = 'searchSuggestions';
    suggestionsDropdown.className = 'search-suggestions';
    
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.appendChild(suggestionsDropdown);
    }
}

function getSearchSuggestions(searchTerm) {
    if (!searchTerm || searchTerm.length < 1) return [];
    
    const suggestions = new Set();
    
    allItems.forEach(item => {
        if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            suggestions.add(item.name);
        }
        
        if (item.category.toLowerCase().includes(searchTerm.toLowerCase())) {
            suggestions.add(item.category);
        }
        
        const words = item.name.toLowerCase().split(' ');
        words.forEach(word => {
            if (word.startsWith(searchTerm.toLowerCase())) {
                suggestions.add(word);
            }
        });
    });
    
    return Array.from(suggestions).slice(0, 5);
}

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

function hideSearchSuggestions() {
    const suggestionsDropdown = document.getElementById('searchSuggestions');
    if (suggestionsDropdown) {
        suggestionsDropdown.style.display = 'none';
    }
}

function createWhatsAppPopup() {
    popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.style.display = 'none';
    
    whatsappPopup = document.createElement('div');
    whatsappPopup.className = 'whatsapp-popup';
    whatsappPopup.innerHTML = `
        <div class="popup-header">
            <h3><i class="fab fa-whatsapp"></i> Order via WhatsApp</h3>
            <button class="popup-close">&times;</button>
        </div>
        <div class="popup-content">
            <div class="popup-item-info">
                <h4 id="popupItemName"></h4>
                <div class="popup-item-details">
                    <span class="popup-category" id="popupCategory"></span>
                    <span class="popup-price" id="popupPrice"></span>
                </div>
                <p class="popup-description" id="popupDescription"></p>
            </div>
            
            <div class="whatsapp-options">
                <div class="option-header">
                    <i class="fas fa-phone-alt"></i>
                    <h4>Select WhatsApp Number</h4>
                </div>
                
                <div class="number-options">
                    <div class="number-option" data-number="option1">
                        <div class="option-radio">
                            <div class="radio-circle"></div>
                        </div>
                        <div class="option-info">
                            <div class="option-title">Primary Number</div>
                            <div class="option-number">+94 75 599 7160</div>
                        </div>
                    </div>
                    
                    <div class="number-option" data-number="option2">
                        <div class="option-radio">
                            <div class="radio-circle"></div>
                        </div>
                        <div class="option-info">
                            <div class="option-title">Secondary Number</div>
                            <div class="option-number">+94 76 000 0000</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="customer-details">
                <div class="form-group">
                    <label for="customerName"><i class="fas fa-user"></i> Your Name</label>
                    <input type="text" id="customerName" placeholder="Enter your name" maxlength="50">
                </div>
                
                <div class="form-group">
                    <label for="customerPhone"><i class="fas fa-phone"></i> Your Phone Number</label>
                    <input type="tel" id="customerPhone" placeholder="07X XXX XXXX" maxlength="10">
                </div>
                
                <div class="form-group">
                    <label for="customerAddress"><i class="fas fa-map-marker-alt"></i> Delivery Address (Optional)</label>
                    <textarea id="customerAddress" rows="2" placeholder="Enter your delivery address"></textarea>
                </div>
            </div>
            
            <div class="popup-actions">
                <button class="btn-cancel">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn-send-whatsapp">
                    <i class="fab fa-whatsapp"></i> Send via WhatsApp
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popupOverlay);
    document.body.appendChild(whatsappPopup);
    
    setupPopupEvents();
}

function setupPopupEvents() {
    const closeBtn = whatsappPopup.querySelector('.popup-close');
    const cancelBtn = whatsappPopup.querySelector('.btn-cancel');
    const overlay = popupOverlay;
    
    [closeBtn, cancelBtn, overlay].forEach(element => {
        element.addEventListener('click', hideWhatsAppPopup);
    });
    
    const numberOptions = whatsappPopup.querySelectorAll('.number-option');
    let selectedNumber = 'option1';
    
    numberOptions.forEach(option => {
        option.addEventListener('click', function() {
            numberOptions.forEach(opt => opt.classList.remove('selected'));
            
            this.classList.add('selected');
            selectedNumber = this.getAttribute('data-number');
        });
    });
    
    if (numberOptions[0]) {
        numberOptions[0].classList.add('selected');
    }
    
    const sendBtn = whatsappPopup.querySelector('.btn-send-whatsapp');
    sendBtn.addEventListener('click', function() {
        sendWhatsAppOrder(selectedNumber);
    });
    
    whatsappPopup.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function showWhatsAppPopup(item) {
    document.getElementById('popupItemName').textContent = item.name;
    document.getElementById('popupCategory').textContent = item.category;
    document.getElementById('popupPrice').textContent = `LKR. ${parseFloat(item.price).toFixed(2)}`;
    document.getElementById('popupDescription').textContent = item.description;
    
    whatsappPopup.currentItem = item;
    
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    
    popupOverlay.style.display = 'block';
    whatsappPopup.style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('customerName').focus();
    }, 300);
}

function hideWhatsAppPopup() {
    popupOverlay.style.display = 'none';
    whatsappPopup.style.display = 'none';
}

function sendWhatsAppOrder(selectedNumberOption) {
    const item = whatsappPopup.currentItem;
    if (!item) return;
    
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    
    if (!customerName) {
        alert('Please enter your name');
        document.getElementById('customerName').focus();
        return;
    }
    
    if (!customerPhone || customerPhone.length < 9) {
        alert('Please enter a valid phone number');
        document.getElementById('customerPhone').focus();
        return;
    }
    
    const whatsappNumber = whatsappNumbers[selectedNumberOption];
    
    const whatsappMessage = encodeURIComponent(
        `🛒 *NEW ORDER REQUEST* 🛒\n\n` +
        `👤 *Customer Details:*\n` +
        `Name: ${customerName}\n` +
        `Phone: ${customerPhone}\n` +
        `Address: ${customerAddress || 'Not specified'}\n\n` +
        `📦 *Item Details:*\n` +
        `Item: ${item.name}\n` +
        `Category: ${item.category}\n` +
        `Price: LKR ${parseFloat(item.price).toFixed(2)}\n` +
        `Description: ${item.description}\n\n` +
        `⏰ *Order Information:*\n` +
        `Ordered via: Kd Online Shop Website\n` +
        `Time: ${new Date().toLocaleString()}\n\n` +
        `✅ Please confirm this order and provide payment details.`
    );
    
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    window.open(whatsappURL, '_blank');
    
    trackOrderClick(item.name, item.id, customerName, selectedNumberOption);
    
    hideWhatsAppPopup();
    
    showOrderSuccessMessage();
}

function showOrderSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.className = 'order-success-message';
    successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
            <h4>Order Request Sent!</h4>
            <p>Your order details have been prepared for WhatsApp. Please check your WhatsApp to complete the order.</p>
        </div>
    `;
    
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        successMsg.classList.remove('show');
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.remove();
            }
        }, 300);
    }, 5000);
}

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
                    data-item-description="${item.description}">
                    <i class="fab fa-whatsapp"></i> Order Now
                </button>
            </div>
        `;
        
        const orderBtn = itemCard.querySelector('.order-now-btn');
        orderBtn.addEventListener('click', function() {
            const itemData = {
                id: this.getAttribute('data-item-id'),
                name: this.getAttribute('data-item-name'),
                category: this.getAttribute('data-item-category'),
                price: this.getAttribute('data-item-price'),
                description: this.getAttribute('data-item-description')
            };
            
            showWhatsAppPopup(itemData);
        });
        
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
                    description: item.description
                };
                showWhatsAppPopup(itemData);
            });
        });
        
        itemsContainer.appendChild(itemCard);
    });
}

function trackOrderClick(itemName, itemId, customerName = '', numberOption = '') {
    console.log(`Order clicked for: ${itemName} (ID: ${itemId})`, {
        customer: customerName,
        numberOption: numberOption,
        timestamp: new Date().toISOString()
    });
    
}

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

function setupEventListeners() {
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm.length > 0) {
            const suggestions = getSearchSuggestions(searchTerm);
            showSearchSuggestions(suggestions);
            
            searchTimeout = setTimeout(() => {
                currentSearch = searchTerm.toLowerCase();
                applyFilters();
            }, 500);
        } else {
            hideSearchSuggestions();
            currentSearch = '';
            applyFilters();
        }
    });
    
    document.addEventListener('click', function(event) {
        const suggestionsDropdown = document.getElementById('searchSuggestions');
        if (suggestionsDropdown && 
            !suggestionsDropdown.contains(event.target) && 
            event.target !== searchInput) {
            hideSearchSuggestions();
        }
    });
    
    searchBtn.addEventListener('click', function() {
        currentSearch = searchInput.value.trim().toLowerCase();
        hideSearchSuggestions();
        applyFilters();
        
        if (currentSearch.length > 0) {
            scrollToItems();
        }
    });
    
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
    
    searchInput.addEventListener('keydown', function(e) {
        const suggestionsDropdown = document.getElementById('searchSuggestions');
        if (!suggestionsDropdown || suggestionsDropdown.style.display === 'none') return;
        
        const suggestions = suggestionsDropdown.querySelectorAll('.suggestion-item');
        let activeIndex = -1;
        
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
    
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        applyFilters();
    });
    
    clearFilters.addEventListener('click', function() {
        searchInput.value = '';
        sortSelect.value = 'newest';
        currentSearch = '';
        currentCategory = 'all';
        currentSort = 'newest';
        hideSearchSuggestions();
        
        categoryCards.forEach(card => card.classList.remove('active'));
        
        const allItemsCard = document.querySelector('.category-card[data-category="all"]');
        if (allItemsCard) {
            allItemsCard.classList.add('active');
        }
        
        applyFilters();
    });
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            categoryCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = category;
            applyFilters();
            
            if (category !== 'all') {
                scrollToItems();
            }
        });
    });
    
    const allItemsCard = document.querySelector('.category-card[data-category="all"]');
    if (allItemsCard) {
        allItemsCard.classList.add('active');
    }
    
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
        
        categoryList.addEventListener('scroll', updateCategoryNavigation);
        
        updateCategoryNavigation();
        
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
                    scrollCategories(-200);
                } else {
                    scrollCategories(200);
                }
            }
        }
    }
    
    window.addEventListener('resize', updateCategoryNavigation);
}

function scrollCategories(amount) {
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
        categoryList.scrollBy({
            left: amount,
            behavior: 'smooth'
        });
        
        setTimeout(updateCategoryNavigation, 300);
    }
}

function updateCategoryNavigation() {
    const categoryList = document.getElementById('categoryList');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!categoryList || !prevBtn || !nextBtn) return;
    
    const scrollLeft = categoryList.scrollLeft;
    const scrollWidth = categoryList.scrollWidth;
    const clientWidth = categoryList.clientWidth;
    
    if (scrollLeft <= 10) {
        prevBtn.classList.add('disabled');
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.classList.remove('disabled');
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }
    
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
        nextBtn.classList.add('disabled');
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.classList.remove('disabled');
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
    
    if (window.innerWidth >= 768) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }
}

function performSearch() {
    currentSearch = searchInput.value.trim().toLowerCase();
    applyFilters();
}

function applyFilters() {
    filteredItems = [...allItems];
    
    if (currentCategory !== 'all') {
        filteredItems = filteredItems.filter(item => 
            item.category.toLowerCase() === currentCategory.toLowerCase()
        );
    }
    
    if (currentSearch) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(currentSearch) ||
            item.description.toLowerCase().includes(currentSearch) ||
            item.category.toLowerCase().includes(currentSearch)
        );
    }
    
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

function updateItemsCount() {
    itemsCount.textContent = filteredItems.length;
}

function scrollToItems() {
    const itemsSection = document.querySelector('.items-section');
    if (itemsSection) {
        itemsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

setInterval(() => {

}, 300000);

window.addEventListener('online', function() {
    console.log('Connection restored. Reloading items...');
    loadItems();
    
    showStatusMessage('You are back online!', 'success');
});

window.addEventListener('offline', function() {
    console.log('Connection lost. Showing offline message...');
    
    showStatusMessage('You are currently offline. Some features may not be available.', 'warning');
});

function showStatusMessage(message, type) {
    const statusMsg = document.createElement('div');
    statusMsg.className = `status-message status-${type}`;
    statusMsg.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'wifi' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(statusMsg);
    
    setTimeout(() => {
        statusMsg.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        statusMsg.classList.remove('show');
        setTimeout(() => {
            if (statusMsg.parentNode) {
                statusMsg.remove();
            }
        }, 300);
    }, 5000);
}

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
