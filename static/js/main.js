/**
 * Skill Tracker - Main JavaScript Application
 * 
 * This file contains all the client-side logic for the Skill Tracker app.
 * 
 * Architecture:
 * - API module: Handles all server communication
 * - UI module: Manages DOM manipulation and rendering
 * - App module: Coordinates everything and handles events
 * 
 * Design Decisions:
 * - Vanilla JavaScript for learning and simplicity
 * - Module pattern for organization
 * - Event delegation for performance
 * - Progressive enhancement (works even with limited JS)
 * - Error handling with user-friendly messages
 */

// === API MODULE ===
// Handles all communication with the Flask backend
const API = {
    baseUrl: '/api',
    loadingCounter: 0,
    loadingTimeout: null,
    
    // Generic fetch wrapper with error handling
    async request(endpoint, options = {}) {
        try {
            UI.showGlobalLoading(true);
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };
            
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            UI.showToast(`Error: ${error.message}`, 'error');
            throw error;
        } finally {
            UI.showGlobalLoading(false);
        }
    },

    // Skills API methods
    skills: {
        async getAll(filters = {}) {
            const params = new URLSearchParams(filters);
            const queryString = params.toString() ? `?${params.toString()}` : '';
            return API.request(`/skills${queryString}`);
        },
        
        async create(skillData) {
            return API.request('/skills', {
                method: 'POST',
                body: JSON.stringify(skillData)
            });
        },
        
        async update(id, skillData) {
            return API.request(`/skills/${id}`, {
                method: 'PUT',
                body: JSON.stringify(skillData)
            });
        },
        
        async delete(id) {
            return API.request(`/skills/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Study logs API methods
    logs: {
        async getAll(filters = {}) {
            const params = new URLSearchParams(filters);
            const queryString = params.toString() ? `?${params.toString()}` : '';
            return API.request(`/logs${queryString}`);
        },
        
        async create(logData) {
            return API.request('/logs', {
                method: 'POST',
                body: JSON.stringify(logData)
            });
        },
        
        async delete(id) {
            return API.request(`/logs/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Statistics API
    async getStats() {
        return API.request('/stats');
    }
};

// === UI MODULE ===
// Handles all user interface updates and DOM manipulation
const UI = {
    // Navigation and section management
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeNavBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        }
        
        // Load section data
        this.loadSectionData(sectionName);
    },
    
    async loadSectionData(sectionName) {
        try {
            switch (sectionName) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'skills':
                    await this.loadSkills();
                    break;
                case 'logs':
                    await this.loadLogs();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${sectionName}:`, error);
        }
    },

    // Dashboard rendering
    async loadDashboard() {
        try {
            // Show skeleton loading for stats
            this.showStatsSkeleton(true);
            
            const stats = await API.getStats();
            
            // Hide skeleton and update stat cards
            this.showStatsSkeleton(false);
            document.getElementById('daily-streak').textContent = stats.daily_streak;
            document.getElementById('weekly-hours').textContent = stats.weekly_hours.toFixed(1);
            document.getElementById('monthly-hours').textContent = stats.monthly_hours.toFixed(1);
            document.getElementById('skills-learned').textContent = stats.skill_counts['Learned'] || 0;
            
            // Render recent activity
            this.renderRecentActivity(stats.recent_activity);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showStatsSkeleton(false);
        }
    },
    
    showStatsSkeleton(show) {
        const statsGrid = document.querySelector('.stats-grid');
        if (show) {
            statsGrid.innerHTML = Array(4).fill(0).map(() => `
                <div class="skeleton-stat-card" role="status" aria-busy="true" aria-label="Loading statistics">
                    <div class="skeleton skeleton-stat-number"></div>
                    <div class="skeleton skeleton-stat-label"></div>
                </div>
            `).join('');
        }
    },
    
    renderRecentActivity(activities) {
        const container = document.getElementById('recent-activity-list');
        
        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <div class="empty-icon-calendar">
                            <div class="calendar-dots">
                                <div class="calendar-dot"></div>
                                <div class="calendar-dot"></div>
                                <div class="calendar-dot"></div>
                                <div class="calendar-dot"></div>
                            </div>
                        </div>
                    </div>
                    <h3 class="empty-state-title">No Recent Activity</h3>
                    <p class="empty-state-description">Start logging your study sessions to see your recent activity here.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-date">${this.formatDate(activity.date)}</div>
                <div class="activity-details">
                    ${activity.hours}h • ${activity.skills_count} skill${activity.skills_count !== 1 ? 's' : ''}
                </div>
            </div>
        `).join('');
    },

    // Skills rendering
    async loadSkills() {
        try {
            // Show skeleton loading
            this.showSkillsSkeleton(true);
            
            const filters = this.getSkillFilters();
            const skills = await API.skills.getAll(filters);
            
            this.renderSkills(skills, filters);
            this.updateCategoryFilter(skills);
        } catch (error) {
            console.error('Error loading skills:', error);
            this.showSkillsSkeleton(false);
        }
    },
    
    showSkillsSkeleton(show) {
        const container = document.getElementById('skills-container');
        if (show) {
            container.innerHTML = Array(3).fill(0).map(() => `
                <div class="skeleton-skill-card" role="status" aria-busy="true" aria-label="Loading skills">
                    <div class="skeleton-skill-header">
                        <div class="skeleton skeleton-skill-name"></div>
                        <div class="skeleton skeleton-skill-actions"></div>
                    </div>
                    <div class="skeleton skeleton-skill-category"></div>
                    <div class="skeleton skeleton-skill-status"></div>
                </div>
            `).join('');
        }
    },
    
    getSkillFilters() {
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        
        const filters = {};
        if (categoryFilter) filters.category = categoryFilter;
        if (statusFilter) filters.status = statusFilter;
        
        return filters;
    },
    
    renderSkills(skills, filters = {}) {
        const container = document.getElementById('skills-container');
        
        if (!skills || skills.length === 0) {
            // Check if filters are applied
            const hasFilters = filters.category || filters.status;
            
            if (hasFilters) {
                // No results for filter
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <div class="empty-icon-search"></div>
                        </div>
                        <h3 class="empty-state-title">No Matches Found</h3>
                        <p class="empty-state-description">Try adjusting your filters to see more results.</p>
                    </div>
                `;
            } else {
                // No skills at all
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <div class="empty-icon-book"></div>
                        </div>
                        <h3 class="empty-state-title">Start Your Learning Journey</h3>
                        <p class="empty-state-description">Add your first skill to begin tracking your progress and building your expertise.</p>
                        <button class="btn btn-primary empty-state-cta" onclick="document.getElementById('add-skill-btn').click()">+ Add Your First Skill</button>
                    </div>
                `;
            }
            return;
        }
        
        container.innerHTML = skills.map(skill => `
            <div class="skill-card" data-skill-id="${skill.id}">
                <div class="skill-header">
                    <h3 class="skill-name">${this.escapeHtml(skill.name)}</h3>
                    <div class="skill-actions">
                        <button onclick="App.editSkill(${skill.id})" title="Edit skill" aria-label="Edit ${this.escapeHtml(skill.name)}">✏️</button>
                        <button onclick="App.deleteSkill(${skill.id})" title="Delete skill" aria-label="Delete ${this.escapeHtml(skill.name)}">🗑️</button>
                    </div>
                </div>
                
                ${skill.category ? `<div class="skill-category">${this.escapeHtml(skill.category)}</div>` : ''}
                
                <div class="skill-status ${skill.status.toLowerCase().replace(' ', '-')}">
                    ${this.getStatusIcon(skill.status)} ${skill.status}
                </div>
            </div>
        `).join('');
    },
    
    updateCategoryFilter(skills) {
        const categoryFilter = document.getElementById('category-filter');
        const currentValue = categoryFilter.value;
        
        // Get unique categories
        const categories = [...new Set(skills
            .filter(skill => skill.category)
            .map(skill => skill.category)
            .sort())];
        
        // Update filter options
        categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            categories.map(category => 
                `<option value="${this.escapeHtml(category)}" ${category === currentValue ? 'selected' : ''}>${this.escapeHtml(category)}</option>`
            ).join('');
    },

    // Study logs rendering
    async loadLogs() {
        try {
            // Show skeleton loading
            this.showLogsSkeleton(true);
            
            const logs = await API.logs.getAll({ limit: 20 });
            this.renderLogs(logs);
        } catch (error) {
            console.error('Error loading logs:', error);
            this.showLogsSkeleton(false);
        }
    },
    
    showLogsSkeleton(show) {
        const container = document.getElementById('logs-container');
        if (show) {
            container.innerHTML = Array(5).fill(0).map(() => `
                <div class="skeleton-log-card" role="status" aria-busy="true" aria-label="Loading study logs">
                    <div class="skeleton-log-header">
                        <div class="skeleton skeleton-log-date"></div>
                        <div class="skeleton skeleton-log-hours"></div>
                    </div>
                    <div class="skeleton-log-skills">
                        <div class="skeleton skeleton-log-skill-tag"></div>
                        <div class="skeleton skeleton-log-skill-tag"></div>
                    </div>
                    <div class="skeleton skeleton-log-notes"></div>
                    <div class="skeleton skeleton-log-actions"></div>
                </div>
            `).join('');
        }
    },
    
    renderLogs(logs) {
        const container = document.getElementById('logs-container');
        
        if (!logs || logs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <div class="empty-icon-calendar">
                            <div class="calendar-dots">
                                <div class="calendar-dot"></div>
                                <div class="calendar-dot"></div>
                                <div class="calendar-dot"></div>
                                <div class="calendar-dot"></div>
                            </div>
                        </div>
                    </div>
                    <h3 class="empty-state-title">Log Your First Study Session</h3>
                    <p class="empty-state-description">Start tracking your learning journey by logging your study sessions and building consistent habits.</p>
                    <button class="btn btn-primary empty-state-cta" onclick="document.getElementById('add-log-btn').click()">+ Log Study Session</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = logs.map(log => `
            <div class="log-card" data-log-id="${log.id}">
                <div class="log-header">
                    <div class="log-date">${this.formatDate(log.date)}</div>
                    <div class="log-hours">${log.hours}h</div>
                </div>
                
                ${log.skills.length > 0 ? `
                    <div class="log-skills">
                        ${log.skills.map(skill => `<span class="log-skill-tag">${this.escapeHtml(skill.name)}</span>`).join('')}
                    </div>
                ` : ''}
                
                ${log.notes ? `<div class="log-notes">${this.escapeHtml(log.notes)}</div>` : ''}
                
                <div class="log-actions">
                    <button class="btn btn-danger" onclick="App.deleteLog(${log.id})" aria-label="Delete log from ${this.formatDate(log.date)}">Delete</button>
                </div>
            </div>
        `).join('');
    },

    // Modal management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Form handling
    async populateSkillCheckboxes() {
        try {
            const skills = await API.skills.getAll();
            const container = document.getElementById('skill-checkboxes');
            
            if (!skills || skills.length === 0) {
                container.innerHTML = '<p>No skills available. Add some skills first!</p>';
                return;
            }
            
            container.innerHTML = skills.map(skill => `
                <div class="checkbox-item">
                    <input type="checkbox" id="skill-${skill.id}" value="${skill.id}">
                    <label for="skill-${skill.id}">${this.escapeHtml(skill.name)}</label>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading skills for form:', error);
        }
    },

    // Utility methods
    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (show) {
            spinner.classList.add('active');
        } else {
            spinner.classList.remove('active');
        }
    },
    
    showGlobalLoading(show) {
        const loadingBar = document.getElementById('global-loading-bar');
        const progress = loadingBar.querySelector('.global-loading-bar-progress');
        const mainContent = document.querySelector('.app-main');
        
        if (show) {
            API.loadingCounter++;
            
            if (API.loadingCounter === 1) {
                loadingBar.classList.add('active');
                loadingBar.setAttribute('aria-busy', 'true');
                mainContent.classList.add('loading-blur');
                
                // Animate to 90% quickly
                progress.style.width = '0%';
                setTimeout(() => {
                    progress.style.width = '90%';
                }, 50);
                
                // Set indeterminate after 2 seconds
                API.loadingTimeout = setTimeout(() => {
                    loadingBar.classList.add('indeterminate');
                    progress.style.width = '30%';
                }, 2000);
            }
        } else {
            API.loadingCounter = Math.max(0, API.loadingCounter - 1);
            
            if (API.loadingCounter === 0) {
                clearTimeout(API.loadingTimeout);
                loadingBar.classList.remove('indeterminate');
                
                // Complete to 100%
                progress.style.width = '100%';
                
                // Hide after animation
                setTimeout(() => {
                    loadingBar.classList.remove('active');
                    loadingBar.setAttribute('aria-busy', 'false');
                    mainContent.classList.remove('loading-blur');
                    progress.style.width = '0%';
                }, 300);
            }
        }
    },
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        
        const dateOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const datePart = date.toLocaleDateString(undefined, dateOptions);
        const timePart = date.toLocaleTimeString(undefined, timeOptions);
        
        return `${datePart} at ${timePart}`;
    },
    
    getStatusIcon(status) {
        switch (status) {
            case 'To Learn': return '📚';
            case 'In Progress': return '🔄';
            case 'Learned': return '✅';
            default: return '❓';
        }
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    setFormLoading(form, submitBtn, isLoading) {
        const formGroups = form.querySelectorAll('.form-group');
        
        if (isLoading) {
            // Disable all form inputs
            formGroups.forEach(group => {
                group.classList.add('disabled');
                const inputs = group.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    input.disabled = true;
                    input.setAttribute('aria-busy', 'true');
                });
            });
            
            // Add loading state to submit button
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
            
            // Wrap button text and add spinner
            const btnText = submitBtn.textContent;
            submitBtn.innerHTML = `<span class="btn-text">${btnText}</span><span class="btn-spinner"></span>`;
        } else {
            // Re-enable all form inputs
            formGroups.forEach(group => {
                group.classList.remove('disabled');
                const inputs = group.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    input.disabled = false;
                    input.removeAttribute('aria-busy');
                });
            });
            
            // Remove loading state from submit button
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            
            // Restore button text
            const btnTextSpan = submitBtn.querySelector('.btn-text');
            if (btnTextSpan) {
                submitBtn.textContent = btnTextSpan.textContent;
            }
        }
    },
    
    async showSuccessAnimation(submitBtn) {
        return new Promise((resolve) => {
            // Remove spinner
            const spinner = submitBtn.querySelector('.btn-spinner');
            if (spinner) {
                spinner.remove();
            }
            
            // Add success icon
            const successIcon = document.createElement('span');
            successIcon.className = 'btn-success-icon';
            successIcon.textContent = '✓';
            submitBtn.appendChild(successIcon);
            
            // Wait for animation to complete
            setTimeout(() => {
                resolve();
            }, 500);
        });
    }
};

// === THEME MANAGEMENT ===
// Handles dark/light theme switching
const ThemeManager = {
    // Get current theme from localStorage or system preference
    getCurrentTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Check system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark ? 'dark' : 'light';
    },
    
    // Apply theme to document
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    },
    
    // Toggle between light and dark themes
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Show feedback to user
        UI.showToast(`Switched to ${newTheme} mode`, 'info');
    },
    
    // Initialize theme on page load
    init() {
        const theme = this.getCurrentTheme();
        this.applyTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
            }
        });
    }
};

// === MAIN APPLICATION ===
// Coordinates all application logic and handles events
const App = {
    currentEditingSkill: null,
    
    // Initialize the application
    init() {
        this.bindEvents();
        this.setDefaultDate();
        ThemeManager.init(); // Initialize theme management
        UI.showSection('dashboard'); // Start with dashboard
    },
    
    // Event binding
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                UI.showSection(section);
            });
        });
        
        // Modal controls
        this.bindModalEvents();
        
        // Form submissions
        this.bindFormEvents();
        
        // Filter changes
        document.getElementById('category-filter').addEventListener('change', () => UI.loadSkills());
        document.getElementById('status-filter').addEventListener('change', () => UI.loadSkills());
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => ThemeManager.toggleTheme());
    },
    
    bindModalEvents() {
        // Skill modal
        document.getElementById('add-skill-btn').addEventListener('click', () => this.showAddSkillModal());
        document.getElementById('close-skill-modal').addEventListener('click', () => UI.hideModal('skill-modal'));
        document.getElementById('cancel-skill').addEventListener('click', () => UI.hideModal('skill-modal'));
        
        // Log modal
        document.getElementById('add-log-btn').addEventListener('click', () => this.showAddLogModal());
        document.getElementById('close-log-modal').addEventListener('click', () => UI.hideModal('log-modal'));
        document.getElementById('cancel-log').addEventListener('click', () => UI.hideModal('log-modal'));
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    UI.hideModal(modal.id);
                }
            });
        });
    },
    
    bindFormEvents() {
        // Skill form
        document.getElementById('skill-form').addEventListener('submit', (e) => this.handleSkillSubmit(e));
        
        // Log form
        document.getElementById('log-form').addEventListener('submit', (e) => this.handleLogSubmit(e));
    },
    
    setDefaultDate() {
        // Set today as default date for log form
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('log-date').value = today;
    },

    // Skill management
    showAddSkillModal() {
        this.currentEditingSkill = null;
        document.getElementById('skill-modal-title').textContent = 'Add New Skill';
        document.getElementById('skill-form').reset();
        FormValidator.resetForm('skill-form');
        FormValidator.init('skill-form');
        UI.showModal('skill-modal');
    },
    
    async editSkill(skillId) {
        try {
            const skills = await API.skills.getAll();
            const skill = skills.find(s => s.id === skillId);
            
            if (!skill) {
                UI.showToast('Skill not found', 'error');
                return;
            }
            
            this.currentEditingSkill = skill;
            document.getElementById('skill-modal-title').textContent = 'Edit Skill';
            document.getElementById('skill-name').value = skill.name;
            document.getElementById('skill-category').value = skill.category || '';
            document.getElementById('skill-status').value = skill.status;
            
            FormValidator.resetForm('skill-form');
            FormValidator.init('skill-form');
            
            // Trigger validation for pre-filled fields
            const skillNameInput = document.getElementById('skill-name');
            FormValidator.validateField(skillNameInput, 'skillName');
            FormValidator.updateSubmitButton(document.getElementById('skill-form'));
            
            UI.showModal('skill-modal');
        } catch (error) {
            console.error('Error loading skill for editing:', error);
        }
    },
    
    async handleSkillSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Validate form
        if (!FormValidator.validateForm('skill-form')) {
            UI.showToast('Please fix the errors before submitting', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const skillData = {
            name: formData.get('name').trim(),
            category: formData.get('category').trim(),
            status: formData.get('status')
        };
        
        try {
            // Show loading state
            UI.setFormLoading(form, submitBtn, true);
            
            if (this.currentEditingSkill) {
                // Update existing skill
                await API.skills.update(this.currentEditingSkill.id, skillData);
                UI.showToast('Skill updated successfully', 'success');
            } else {
                // Create new skill
                await API.skills.create(skillData);
                UI.showToast('Skill added successfully', 'success');
            }
            
            // Show success animation
            await UI.showSuccessAnimation(submitBtn);
            
            UI.hideModal('skill-modal');
            UI.loadSkills(); // Reload skills list
        } catch (error) {
            // Error already shown by API module
            UI.setFormLoading(form, submitBtn, false);
        }
    },
    
    async deleteSkill(skillId) {
        if (!confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
            return;
        }
        
        try {
            await API.skills.delete(skillId);
            UI.showToast('Skill deleted successfully', 'success');
            UI.loadSkills();
        } catch (error) {
            // Error already shown by API module
        }
    },

    // Study log management
    async showAddLogModal() {
        await UI.populateSkillCheckboxes();
        document.getElementById('log-form').reset();
        this.setDefaultDate();
        FormValidator.resetForm('log-form');
        FormValidator.init('log-form');
        
        // Add time validation listeners
        const timeInputs = ['log-hours', 'log-minutes', 'log-seconds'];
        timeInputs.forEach(id => {
            const input = document.getElementById(id);
            input.addEventListener('input', () => {
                FormValidator.validateTimeInputs(document.getElementById('log-form'));
                FormValidator.updateSubmitButton(document.getElementById('log-form'));
            });
        });
        
        UI.showModal('log-modal');
    },
    
    async handleLogSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Validate form
        if (!FormValidator.validateForm('log-form')) {
            UI.showToast('Please fix the errors before submitting', 'error');
            return;
        }
        
        // Validate time inputs
        if (!FormValidator.validateTimeInputs(form)) {
            UI.showToast('Please enter a valid study time', 'error');
            return;
        }
        
        const formData = new FormData(form);
        
        // Get time components
        const hours = parseInt(formData.get('hours')) || 0;
        const minutes = parseInt(formData.get('minutes')) || 0;
        const seconds = parseInt(formData.get('seconds')) || 0;
        
        // Convert to total hours (decimal)
        const totalHours = hours + (minutes / 60) + (seconds / 3600);
        
        const logData = {
            date: formData.get('date'),
            hours: totalHours,
            notes: formData.get('notes').trim()
        };
        
        // Get selected skills
        const skillCheckboxes = document.querySelectorAll('#skill-checkboxes input[type="checkbox"]:checked');
        logData.skill_ids = Array.from(skillCheckboxes).map(cb => parseInt(cb.value));
        
        try {
            // Show loading state
            UI.setFormLoading(form, submitBtn, true);
            
            await API.logs.create(logData);
            UI.showToast('Study session logged successfully', 'success');
            
            // Show success animation
            await UI.showSuccessAnimation(submitBtn);
            
            UI.hideModal('log-modal');
            UI.loadLogs();
            
            // Refresh dashboard if it's currently visible
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection.classList.contains('active')) {
                UI.loadDashboard();
            }
        } catch (error) {
            // Error already shown by API module
            UI.setFormLoading(form, submitBtn, false);
        }
    },
    
    async deleteLog(logId) {
        if (!confirm('Are you sure you want to delete this study log?')) {
            return;
        }
        
        try {
            await API.logs.delete(logId);
            UI.showToast('Study log deleted successfully', 'success');
            UI.loadLogs();
            
            // Refresh dashboard if it's currently visible
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection.classList.contains('active')) {
                UI.loadDashboard();
            }
        } catch (error) {
            // Error already shown by API module
        }
    }
};

// === APPLICATION STARTUP ===
// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Skill Tracker App Starting...');
    App.init();
});

// Handle errors globally
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    UI.showToast('An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    UI.showToast('An unexpected error occurred', 'error');
    e.preventDefault();
});
