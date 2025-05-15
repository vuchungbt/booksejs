// Add to cart quantity
const quantityInputs = document.querySelectorAll('.quantity-input');

if (quantityInputs) {
  quantityInputs.forEach(input => {
    const minusBtn = input.previousElementSibling;
    const plusBtn = input.nextElementSibling;
    
    if (minusBtn && plusBtn) {
      minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value);
        if (currentValue > 1) {
          input.value = currentValue - 1;
          // If inside a form with update button, trigger change event
          input.dispatchEvent(new Event('change'));
        }
      });
      
      plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value);
        const max = parseInt(input.getAttribute('max') || 99);
        if (currentValue < max) {
          input.value = currentValue + 1;
          // If inside a form with update button, trigger change event
          input.dispatchEvent(new Event('change'));
        }
      });
    }
  });
}

// Auto submit quantity change in cart
const cartQuantityForms = document.querySelectorAll('.cart-quantity-form');
if (cartQuantityForms) {
  cartQuantityForms.forEach(form => {
    const input = form.querySelector('input[name="quantity"]');
    if (input) {
      input.addEventListener('change', () => {
        form.submit();
      });
    }
  });
}

// Image preview for file uploads
const fileInputs = document.querySelectorAll('input[type="file"][data-preview]');
if (fileInputs) {
  fileInputs.forEach(input => {
    const previewId = input.getAttribute('data-preview');
    const preview = document.getElementById(previewId);
    
    if (preview) {
      input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            preview.src = e.target.result;
          }
          
          reader.readAsDataURL(this.files[0]);
        }
      });
    }
  });
}

// Initialize Bootstrap tooltips
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
if (tooltipTriggerList.length > 0) {
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Banner slider autoplay
const bannerCarousel = document.getElementById('banner-carousel');
if (bannerCarousel) {
  const carousel = new bootstrap.Carousel(bannerCarousel, {
    interval: 5000
  });
}