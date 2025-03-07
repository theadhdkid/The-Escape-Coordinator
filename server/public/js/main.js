// Animation helpers
function animateModal(show) {
    const modal = document.getElementById('newTripModal');
    if (show) {
        modal.style.display = 'flex';
        // Force a reflow to enable the animation
        modal.offsetHeight;
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    } else {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Form validation and helper functions
function validateDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Modal controls
function openModal() {
    animateModal(true);
    // Set minimum date to today for start and end dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start_date').min = today;
    document.getElementById('end_date').min = today;
}

function closeModal() {
    animateModal(false);
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    const newTripForm = document.getElementById('newTripForm');
    const allInputs = newTripForm.querySelectorAll('input');

    // Add floating label effect
    allInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });

    // Start date changes should update end date minimum
    document.getElementById('start_date').addEventListener('change', function(e) {
        document.getElementById('end_date').min = e.target.value;
    });

    newTripForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const formData = {
            title: document.getElementById('title').value,
            destination: document.getElementById('destination').value,
            start_date: document.getElementById('start_date').value,
            end_date: document.getElementById('end_date').value,
            budget: parseFloat(document.getElementById('budget').value)
        };

        // Validate dates
        if (!validateDates(formData.start_date, formData.end_date)) {
            alert('End date must be after start date');
            return;
        }

        // Show loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        try {
            const response = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                // Add success animation
                submitButton.classList.remove('loading');
                submitButton.classList.add('success');
                submitButton.textContent = 'Trip Created!';
                
                // Reset form and close modal after delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error('Failed to create trip');
            }
        } catch (error) {
            console.error('Error:', error);
            submitButton.classList.remove('loading');
            submitButton.classList.add('error');
            submitButton.textContent = 'Error!';
            setTimeout(() => {
                submitButton.classList.remove('error');
                submitButton.disabled = false;
                submitButton.textContent = 'Create Trip';
            }, 2000);
        }
    });
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('newTripModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Add escape key listener to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
// Edit Modal Controls
function openEditModal(id, title, destination, startDate, endDate, budget) {
    const modal = document.getElementById('editTripModal');
    
    // Set the values in the form
    document.getElementById('edit_trip_id').value = id;
    document.getElementById('edit_title').value = title;
    document.getElementById('edit_destination').value = destination;
    document.getElementById('edit_start_date').value = startDate;
    document.getElementById('edit_end_date').value = endDate;
    document.getElementById('edit_budget').value = budget;

    // Show the modal
    modal.style.display = 'flex';
    modal.offsetHeight; // Force reflow
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
}

function closeEditModal() {
    const modal = document.getElementById('editTripModal');
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Add this to your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // Edit Trip Form Handler
    const editTripForm = document.getElementById('editTripForm');
    if (editTripForm) {
        editTripForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const tripId = document.getElementById('edit_trip_id').value;
            const submitButton = this.querySelector('button[type="submit"]');
            
            const formData = {
                title: document.getElementById('edit_title').value,
                destination: document.getElementById('edit_destination').value,
                start_date: document.getElementById('edit_start_date').value,
                end_date: document.getElementById('edit_end_date').value,
                budget: parseFloat(document.getElementById('edit_budget').value)
            };

            // Validate dates
            if (!validateDates(formData.start_date, formData.end_date)) {
                alert('End date must be after start date');
                return;
            }

            // Show loading state
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            try {
                const response = await fetch(`/api/trips/${tripId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    submitButton.classList.remove('loading');
                    submitButton.classList.add('success');
                    submitButton.textContent = 'Changes Saved!';
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    throw new Error('Failed to update trip');
                }
            } catch (error) {
                console.error('Error:', error);
                submitButton.classList.remove('loading');
                submitButton.classList.add('error');
                submitButton.textContent = 'Error!';
                setTimeout(() => {
                    submitButton.classList.remove('error');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Save Changes';
                }, 2000);
            }
        });
    }
});

// Add to your existing window.onclick handler
window.onclick = function(event) {
    const newTripModal = document.getElementById('newTripModal');
    const editTripModal = document.getElementById('editTripModal');
    
    if (event.target === newTripModal) {
        closeModal();
    }
    if (event.target === editTripModal) {
        closeEditModal();
    }
}
// Delete trip functionality
function confirmDelete(tripId) {
    if (confirm('Are you sure you want to delete this trip?')) {
        deleteTrip(tripId);
    }
}

async function deleteTrip(tripId) {
    try {
        const response = await fetch(`/api/trips/${tripId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            // Reload the page to show updated list
            window.location.reload();
        } else {
            throw new Error('Failed to delete trip');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete trip');
    }
}