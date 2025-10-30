/**
 * Form Validation Module
 * 
 * Provides real-time validation for all form fields with:
 * - Inline error messages
 * - Visual field states (valid/invalid)
 * - Character counters
 * - Smart submit button management
 * - Accessibility support
 */

const FormValidator = {
    // Validation rules
    rules: {
        skillName: {
            required: true,
            minLength: 3,
            maxLength: 50,
            message: 'Skill name must be 3-50 characters'
        },
        date: {
            required: true,
            notFuture: true,
            message: 'Date cannot be in the future'
        },
        hours: {
            required: true,
            min: 0.1,
            max: 24,
            message: 'Study hours must be between 0.1 and 24'
        },
        skills: {
            required: true,
            minSelected: 1,
            message: 'Please select at least one skill'
        }
    },

    // Debounce timer
    debounceTimers: {},

    /**
     * Initialize validation for a form
     */
    init(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Get all inputs with validation
        const inputs = form.querySelectorAll('[data-validate]');
        
        inputs.forEach(input => {
            const validationType = input.dataset.validate;
            
            // Add event listeners
            if (input.type === 'checkbox' || input.classList.contains('checkbox-group')) {
                // For checkbox groups
                if (input.classList.contains('checkbox-group')) {
                    input.addEventListener('change', (e) => {
                        if (e.target.type === 'checkbox') {
                            this.validateField(input, validationType);
                            this.updateSubmitButton(form);
                        }
                    });
                }
            } else {
                // For regular inputs
                input.addEventListener('blur', () => {
                    this.validateField(input, validationType);
                    this.updateSubmitButton(form);
                });

                input.addEventListener('input', () => {
                    // Debounced validation on input
                    clearTimeout(this.debounceTimers[input.id]);
                    this.debounceTimers[input.id] = setTimeout(() => {
                        this.validateField(input, validationType);
                        this.updateSubmitButton(form);
                    }, 300);
                });
            }
        });

        // Initialize character counters
        this.initCharCounters(form);

        // Initial validation state
        this.updateSubmitButton(form);
    },

    /**
     * Validate a single field
     */
    validateField(field, validationType) {
        const rule = this.rules[validationType];
        if (!rule) return true;

        let value, isValid, errorMessage;

        // Get value based on field type
        if (field.classList.contains('checkbox-group')) {
            const checkboxes = field.querySelectorAll('input[type="checkbox"]:checked');
            value = checkboxes.length;
            isValid = value >= (rule.minSelected || 1);
            errorMessage = rule.message;
        } else {
            value = field.value.trim();
            
            // Run validation checks
            if (rule.required && !value) {
                isValid = false;
                errorMessage = rule.message;
            } else if (value) {
                if (rule.minLength && value.length < rule.minLength) {
                    isValid = false;
                    errorMessage = rule.message;
                } else if (rule.maxLength && value.length > rule.maxLength) {
                    isValid = false;
                    errorMessage = rule.message;
                } else if (rule.notFuture && this.isFutureDate(value)) {
                    isValid = false;
                    errorMessage = rule.message;
                } else if (rule.min !== undefined || rule.max !== undefined) {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < rule.min || numValue > rule.max) {
                        isValid = false;
                        errorMessage = rule.message;
                    } else {
                        isValid = true;
                    }
                } else {
                    isValid = true;
                }
            } else {
                isValid = true; // Optional field
            }
        }

        // Update UI
        this.updateFieldUI(field, isValid, errorMessage);
        
        return isValid;
    },

    /**
     * Update field UI based on validation state
     */
    updateFieldUI(field, isValid, errorMessage) {
        const wrapper = field.closest('.input-wrapper') || field.parentElement;
        const errorContainer = document.getElementById(`${field.id}-error`);

        // Remove existing states
        wrapper.classList.remove('field-valid', 'field-invalid');

        if (field.value || field.classList.contains('checkbox-group')) {
            if (isValid) {
                wrapper.classList.add('field-valid');
                if (errorContainer) {
                    errorContainer.classList.remove('active');
                    errorContainer.textContent = '';
                    errorContainer.setAttribute('aria-live', 'off');
                }
            } else {
                wrapper.classList.add('field-invalid');
                if (errorContainer) {
                    errorContainer.classList.add('active');
                    errorContainer.textContent = errorMessage;
                    errorContainer.setAttribute('aria-live', 'assertive');
                }
            }
        } else {
            // Clear error for empty optional fields
            if (errorContainer) {
                errorContainer.classList.remove('active');
                errorContainer.textContent = '';
            }
        }
    },

    /**
     * Check if date is in the future
     */
    isFutureDate(dateString) {
        const inputDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate > today;
    },

    /**
     * Initialize character counters
     */
    initCharCounters(form) {
        const counters = form.querySelectorAll('.char-counter');
        
        counters.forEach(counter => {
            const inputId = counter.id.replace('-counter', '');
            const input = document.getElementById(inputId);
            
            if (input) {
                const maxLength = parseInt(input.getAttribute('maxlength'));
                
                // Update counter on input
                input.addEventListener('input', () => {
                    this.updateCharCounter(input, counter, maxLength);
                });
                
                // Initial update
                this.updateCharCounter(input, counter, maxLength);
            }
        });
    },

    /**
     * Update character counter
     */
    updateCharCounter(input, counter, maxLength) {
        const currentLength = input.value.length;
        const percentage = (currentLength / maxLength) * 100;
        
        counter.textContent = `${currentLength}/${maxLength}`;
        
        // Remove existing classes
        counter.classList.remove('warning', 'danger');
        
        // Add warning/danger classes based on percentage
        if (percentage >= 95) {
            counter.classList.add('danger');
        } else if (percentage >= 80) {
            counter.classList.add('warning');
        }
    },

    /**
     * Validate entire form
     */
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const inputs = form.querySelectorAll('[data-validate]');
        let isValid = true;

        inputs.forEach(input => {
            const validationType = input.dataset.validate;
            const fieldValid = this.validateField(input, validationType);
            if (!fieldValid) {
                isValid = false;
            }
        });

        return isValid;
    },

    /**
     * Update submit button state
     */
    updateSubmitButton(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const inputs = form.querySelectorAll('[data-validate]');
        let allValid = true;
        let missingFields = [];

        inputs.forEach(input => {
            const validationType = input.dataset.validate;
            const rule = this.rules[validationType];
            
            if (rule && rule.required) {
                let isValid = false;
                
                if (input.classList.contains('checkbox-group')) {
                    const checkboxes = input.querySelectorAll('input[type="checkbox"]:checked');
                    isValid = checkboxes.length > 0;
                    if (!isValid) missingFields.push('at least one skill');
                } else {
                    isValid = input.value.trim().length >= (rule.minLength || 1);
                    if (!isValid) {
                        const label = form.querySelector(`label[for="${input.id}"]`);
                        if (label) missingFields.push(label.textContent.replace('*', '').trim());
                    }
                }
                
                if (!isValid) allValid = false;
            }
        });

        // Update button state
        if (allValid) {
            submitBtn.disabled = false;
            submitBtn.title = '';
            submitBtn.removeAttribute('aria-label');
        } else {
            submitBtn.disabled = true;
            const tooltip = missingFields.length > 0 
                ? `Please fill in: ${missingFields.join(', ')}`
                : 'Please fill in all required fields';
            submitBtn.title = tooltip;
            submitBtn.setAttribute('aria-label', tooltip);
        }
    },

    /**
     * Validate time inputs (hours, minutes, seconds)
     */
    validateTimeInputs(form) {
        const hours = parseFloat(document.getElementById('log-hours').value) || 0;
        const minutes = parseFloat(document.getElementById('log-minutes').value) || 0;
        const seconds = parseFloat(document.getElementById('log-seconds').value) || 0;
        
        const totalHours = hours + (minutes / 60) + (seconds / 3600);
        
        const errorContainer = document.getElementById('log-time-error');
        const hoursInput = document.getElementById('log-hours');
        const wrapper = hoursInput.closest('.input-wrapper') || hoursInput.parentElement;
        
        if (totalHours < 0.1) {
            if (errorContainer) {
                errorContainer.classList.add('active');
                errorContainer.textContent = 'Study time must be at least 0.1 hours (6 minutes)';
                errorContainer.setAttribute('aria-live', 'assertive');
            }
            return false;
        } else if (totalHours > 24) {
            if (errorContainer) {
                errorContainer.classList.add('active');
                errorContainer.textContent = 'Study time cannot exceed 24 hours';
                errorContainer.setAttribute('aria-live', 'assertive');
            }
            return false;
        } else {
            if (errorContainer) {
                errorContainer.classList.remove('active');
                errorContainer.textContent = '';
            }
            return true;
        }
    },

    /**
     * Reset form validation
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Clear all validation states
        const wrappers = form.querySelectorAll('.input-wrapper');
        wrappers.forEach(wrapper => {
            wrapper.classList.remove('field-valid', 'field-invalid');
        });

        // Clear all error messages
        const errors = form.querySelectorAll('.error-message');
        errors.forEach(error => {
            error.classList.remove('active');
            error.textContent = '';
        });

        // Reset character counters
        const counters = form.querySelectorAll('.char-counter');
        counters.forEach(counter => {
            const inputId = counter.id.replace('-counter', '');
            const input = document.getElementById(inputId);
            if (input) {
                const maxLength = parseInt(input.getAttribute('maxlength'));
                counter.textContent = `0/${maxLength}`;
                counter.classList.remove('warning', 'danger');
            }
        });

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.title = 'Please fill in all required fields';
        }
    }
};

// Export for use in main.js
window.FormValidator = FormValidator;
