// Date validation helper
function validateActivityDate(activityDate, tripStartDate, tripEndDate) {
    const activity = new Date(activityDate);
    const start = new Date(tripStartDate);
    const end = new Date(tripEndDate);
    return activity >= start && activity <= end;
}

// Activity Modal Controls
function openActivityModal() {
    const modal = document.getElementById('addActivityModal');
    const tripStartDate = document.getElementById('trip_start_date').value;
    const tripEndDate = document.getElementById('trip_end_date').value;
    
    // Set date input min and max to trip dates
    const dateInput = document.getElementById('activity_date');
    dateInput.min = tripStartDate;
    dateInput.max = tripEndDate;
    
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
}

function closeActivityModal() {
    const modal = document.getElementById('addActivityModal');
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Edit Activity Modal Controls
function openEditActivityModal(id, name, date, cost, description) {
    const modal = document.getElementById('editActivityModal');
    const tripStartDate = document.getElementById('trip_start_date').value;
    const tripEndDate = document.getElementById('trip_end_date').value;
    
    // Set date input min and max to trip dates
    const dateInput = document.getElementById('edit_activity_date');
    dateInput.min = tripStartDate;
    dateInput.max = tripEndDate;
    
    // Populate form fields
    document.getElementById('edit_activity_id').value = id;
    document.getElementById('edit_activity_name').value = name;
    document.getElementById('edit_activity_date').value = date;
    document.getElementById('edit_activity_cost').value = cost;
    document.getElementById('edit_activity_description').value = description;
    
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
}

function closeEditActivityModal() {
    const modal = document.getElementById('editActivityModal');
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Delete Activity
async function handleDeleteActivity(activityId) {
    if (confirm('Are you sure you want to delete this activity?')) {
        try {
            const response = await fetch(`/api/activities/${activityId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Failed to delete activity');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete activity');
        }
    }
}

// Form Handling
document.addEventListener('DOMContentLoaded', function() {
    // Set up delete button handlers
    document.querySelectorAll('.delete-activity-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const activityId = this.dataset.activityId;
            handleDeleteActivity(activityId);
        });
    });

    // Add Activity Form
    const addActivityForm = document.getElementById('addActivityForm');
    if (addActivityForm) {
        addActivityForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const tripId = document.getElementById('trip_id').value;
            const tripStartDate = document.getElementById('trip_start_date').value;
            const tripEndDate = document.getElementById('trip_end_date').value;
            const activityDate = document.getElementById('activity_date').value;
            
            // Validate activity date
            if (!validateActivityDate(activityDate, tripStartDate, tripEndDate)) {
                alert('Activity date must be within the trip dates');
                return;
            }

            const submitButton = this.querySelector('button[type="submit"]');
            
            const formData = {
                name: document.getElementById('activity_name').value,
                date: activityDate,
                cost: parseFloat(document.getElementById('activity_cost').value),
                description: document.getElementById('activity_description').value
            };

            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            try {
                const response = await fetch(`/api/trips/${tripId}/activities`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    submitButton.classList.remove('loading');
                    submitButton.classList.add('success');
                    submitButton.textContent = 'Activity Added!';
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    throw new Error('Failed to add activity');
                }
            } catch (error) {
                console.error('Error:', error);
                submitButton.classList.remove('loading');
                submitButton.classList.add('error');
                submitButton.textContent = 'Error!';
                setTimeout(() => {
                    submitButton.classList.remove('error');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Add Activity';
                }, 2000);
            }
        });
    }

    // Edit Activity Form
    const editActivityForm = document.getElementById('editActivityForm');
    if (editActivityForm) {
        editActivityForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const tripStartDate = document.getElementById('trip_start_date').value;
            const tripEndDate = document.getElementById('trip_end_date').value;
            const activityDate = document.getElementById('edit_activity_date').value;
            
            // Validate activity date
            if (!validateActivityDate(activityDate, tripStartDate, tripEndDate)) {
                alert('Activity date must be within the trip dates');
                return;
            }

            const activityId = document.getElementById('edit_activity_id').value;
            const submitButton = this.querySelector('button[type="submit"]');
            
            const formData = {
                name: document.getElementById('edit_activity_name').value,
                date: activityDate,
                cost: parseFloat(document.getElementById('edit_activity_cost').value),
                description: document.getElementById('edit_activity_description').value
            };

            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            try {
                const response = await fetch(`/api/activities/${activityId}`, {
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
                    throw new Error('Failed to update activity');
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

    // Close modals when clicking outside
    window.onclick = function(event) {
        const addModal = document.getElementById('addActivityModal');
        const editModal = document.getElementById('editActivityModal');
        
        if (event.target === addModal) {
            closeActivityModal();
        }
        if (event.target === editModal) {
            closeEditActivityModal();
        }
    }

    // Add escape key listener
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeActivityModal();
            closeEditActivityModal();
        }
    });
});