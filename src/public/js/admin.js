// Initialize tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

// Initialize popovers
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

// Confirmation dialog for delete actions
document.addEventListener('DOMContentLoaded', function() {
  const deleteButtons = document.querySelectorAll('.btn-delete');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('Bạn có chắc chắn muốn xóa?')) {
        e.preventDefault();
      }
    });
  });
  
  // Data tables initialization if available
  if (typeof $.fn.DataTable !== 'undefined') {
    $('.datatable').DataTable({
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Vietnamese.json'
      }
    });
  }
  
  // File input preview
  const fileInputs = document.querySelectorAll('.custom-file-input');
  
  fileInputs.forEach(input => {
    input.addEventListener('change', function(e) {
      const fileName = this.files[0].name;
      const nextSibling = this.nextElementSibling;
      nextSibling.innerText = fileName;
      
      // Image preview if possible
      if (this.dataset.preview) {
        const previewElement = document.querySelector(this.dataset.preview);
        if (previewElement && this.files && this.files[0]) {
          const reader = new FileReader();
          reader.onload = function(e) {
            previewElement.src = e.target.result;
          }
          reader.readAsDataURL(this.files[0]);
        }
      }
    });
  });
}); 