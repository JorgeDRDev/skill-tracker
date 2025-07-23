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
    
    // Generic fetch wrapper with error handling
    async request(endpoint, options = {}) {
        try {
            UI.showLoading(true);
            
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
            UI.showLoading(false);
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
            const stats = await API.getStats();
            
            // Update stat cards
            document.getElementById('daily-streak').textContent = stats.daily_streak;
            document.getElementById('weekly-hours').textContent = stats.weekly_hours.toFixed(1);
            document.getElementById('monthly-hours').textContent = stats.monthly_hours.toFixed(1);
            document.getElementById('skills-learned').textContent = stats.skill_counts['Learned'] || 0;
            
            // Render recent activity
            this.renderRecentActivity(stats.recent_activity);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    },
    
    renderRecentActivity(activities) {
        const container = document.getElementById('recent-activity-list');
        
        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="activity-item">No recent study activity</p>';
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
            const filters = this.getSkillFilters();
            const skills = await API.skills.getAll(filters);
            
            this.renderSkills(skills);
            this.updateCategoryFilter(skills);
        } catch (error) {
            console.error('Error loading skills:', error);
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
    
    renderSkills(skills) {
        const container = document.getElementById('skills-container');
        
        if (!skills || skills.length === 0) {
            container.innerHTML = `
                <div class="skill-card">
                    <p>No skills found. Add your first skill to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = skills.map(skill => `
            <div class="skill-card" data-skill-id="${skill.id}">
                <div class="skill-header">
                    <h3 class="skill-name">${this.escapeHtml(skill.name)}</h3>
                    <div class="skill-actions">
                        <button onclick="App.editSkill(${skill.id})" title="Edit skill">✏️</button>
                        <button onclick="App.deleteSkill(${skill.id})" title="Delete skill">🗑️</button>
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
            const logs = await API.logs.getAll({ limit: 20 });
            this.renderLogs(logs);
        } catch (error) {
            console.error('Error loading logs:', error);
        }
    },
    
    renderLogs(logs) {
        const container = document.getElementById('logs-container');
        
        if (!logs || logs.length === 0) {
            container.innerHTML = `
                <div class="log-card">
                    <p>No study logs yet. Log your first study session!</p>
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
                    <button class="btn btn-danger" onclick="App.deleteLog(${log.id})">Delete</button>
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
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
            
            UI.showModal('skill-modal');
        } catch (error) {
            console.error('Error loading skill for editing:', error);
        }
    },
    
    async handleSkillSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const skillData = {
            name: formData.get('name').trim(),
            category: formData.get('category').trim(),
            status: formData.get('status')
        };
        
        // Basic validation
        if (!skillData.name) {
            UI.showToast('Skill name is required', 'error');
            return;
        }
        
        try {
            if (this.currentEditingSkill) {
                // Update existing skill
                await API.skills.update(this.currentEditingSkill.id, skillData);
                UI.showToast('Skill updated successfully', 'success');
            } else {
                // Create new skill
                await API.skills.create(skillData);
                UI.showToast('Skill added successfully', 'success');
            }
            
            UI.hideModal('skill-modal');
            UI.loadSkills(); // Reload skills list
        } catch (error) {
            // Error already shown by API module
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
        UI.showModal('log-modal');
    },
    
    async handleLogSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const logData = {
            date: formData.get('date'),
            hours: parseFloat(formData.get('hours')),
            notes: formData.get('notes').trim()
        };
        
        // Get selected skills
        const skillCheckboxes = document.querySelectorAll('#skill-checkboxes input[type="checkbox"]:checked');
        logData.skill_ids = Array.from(skillCheckboxes).map(cb => parseInt(cb.value));
        
        // Basic validation
        if (!logData.date) {
            UI.showToast('Date is required', 'error');
            return;
        }
        
        if (!logData.hours || logData.hours <= 0) {
            UI.showToast('Hours must be a positive number', 'error');
            return;
        }
        
        try {
            await API.logs.create(logData);
            UI.showToast('Study session logged successfully', 'success');
            UI.hideModal('log-modal');
            UI.loadLogs();
            
            // Refresh dashboard if it's currently visible
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection.classList.contains('active')) {
                UI.loadDashboard();
            }
        } catch (error) {
            // Error already shown by API module
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
