// Dashboard Vue App
const app = new Vue({
    el: '#app',
    data: {
        // UI State
        activeView: 'dashboard',
        isDarkTheme: false,
        sidebarCollapsed: false,
        searchQuery: '',

        // Data
        transformHistory: [],

        // View metadata
        viewMetadata: {
            dashboard: {
                title: 'Dashboard',
                subtitle: 'Welcome to P4RS3LT0NGV3 - Universal Text Transformer'
            },
            transforms: {
                title: 'Text Transformations',
                subtitle: 'Transform text using 50+ different encodings, ciphers, and styles'
            },
            steganography: {
                title: 'Emoji Steganography',
                subtitle: 'Hide secret messages within emojis using variation selectors'
            },
            tokenade: {
                title: 'Tokenade Generator',
                subtitle: 'Create dense token payloads for LLM testing and analysis'
            },
            mutation: {
                title: 'Mutation Lab',
                subtitle: 'Generate mutated payload variations for comprehensive testing'
            },
            tokenizer: {
                title: 'Tokenizer Visualization',
                subtitle: 'Visualize how different tokenizers segment your text'
            },
            decoder: {
                title: 'Universal Decoder',
                subtitle: 'Automatically detect and decode any supported transformation'
            }
        }
    },

    mounted() {
        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkTheme = true;
        } else if (savedTheme === 'light') {
            this.isDarkTheme = false;
        } else {
            // Auto-detect system preference
            this.isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        // Load sidebar state
        const sidebarState = localStorage.getItem('sidebarCollapsed');
        if (sidebarState === 'true') {
            this.sidebarCollapsed = true;
        }

        // Load transform history from localStorage
        const history = localStorage.getItem('transformHistory');
        if (history) {
            try {
                this.transformHistory = JSON.parse(history);
            } catch (e) {
                this.transformHistory = [];
            }
        }

        // Listen for theme changes from system
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.isDarkTheme = e.matches;
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K for search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }

            // Cmd/Ctrl + B to toggle sidebar
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }

            // Cmd/Ctrl + D for dark mode
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Handle hash changes for direct linking
        this.handleHashChange();
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
    },

    methods: {
        setView(view) {
            this.activeView = view;
            window.location.hash = view;

            // Sync with iframe if needed
            if (view !== 'dashboard') {
                this.syncFrameWithView(view);
            }
        },

        getPageTitle() {
            return this.viewMetadata[this.activeView]?.title || 'Dashboard';
        },

        getPageSubtitle() {
            return this.viewMetadata[this.activeView]?.subtitle || '';
        },

        toggleTheme() {
            this.isDarkTheme = !this.isDarkTheme;
            localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
        },

        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
        },

        focusSearch() {
            const searchInput = document.querySelector('.sidebar-search input');
            if (searchInput) {
                searchInput.focus();
            }
        },

        openHistory() {
            // This would open a history modal/panel
            // For now, just switch to transforms view and show history
            this.setView('transforms');

            // Try to trigger history panel in iframe
            setTimeout(() => {
                const frame = document.getElementById('content-frame');
                if (frame && frame.contentWindow) {
                    try {
                        const frameApp = frame.contentWindow.app;
                        if (frameApp && frameApp.toggleCopyHistory) {
                            frameApp.toggleCopyHistory();
                        }
                    } catch (e) {
                        console.log('Could not access iframe:', e);
                    }
                }
            }, 500);
        },

        handleHashChange() {
            const hash = window.location.hash.slice(1);
            if (hash && this.viewMetadata[hash]) {
                this.activeView = hash;
            }
        },

        syncFrameWithView(view) {
            // Map views to tab names in the original app
            const tabMapping = {
                'transforms': 'transforms',
                'steganography': 'steganography',
                'tokenade': 'tokenade',
                'mutation': 'fuzzer',
                'tokenizer': 'tokenizer',
                'decoder': 'transforms' // decoder is part of transforms tab
            };

            const targetTab = tabMapping[view];

            setTimeout(() => {
                const frame = document.getElementById('content-frame');
                if (frame && frame.contentWindow) {
                    try {
                        const frameApp = frame.contentWindow.app;
                        if (frameApp && frameApp.switchToTab) {
                            frameApp.switchToTab(targetTab);
                        }
                    } catch (e) {
                        console.log('Could not sync iframe tab:', e);
                    }
                }
            }, 300);
        },

        handleFrameLoad() {
            // Sync theme with iframe
            const frame = document.getElementById('content-frame');
            if (frame && frame.contentWindow) {
                try {
                    const frameApp = frame.contentWindow.app;
                    if (frameApp) {
                        frameApp.isDarkTheme = this.isDarkTheme;
                    }
                } catch (e) {
                    console.log('Could not sync theme with iframe:', e);
                }
            }

            // Sync the view
            if (this.activeView !== 'dashboard') {
                this.syncFrameWithView(this.activeView);
            }
        },

        addToHistory(item) {
            this.transformHistory.unshift({
                ...item,
                timestamp: new Date().toISOString()
            });

            // Keep only last 100 items
            if (this.transformHistory.length > 100) {
                this.transformHistory = this.transformHistory.slice(0, 100);
            }

            // Save to localStorage
            localStorage.setItem('transformHistory', JSON.stringify(this.transformHistory));
        }
    },

    watch: {
        isDarkTheme(newVal) {
            // Also sync theme with iframe
            const frame = document.getElementById('content-frame');
            if (frame && frame.contentWindow) {
                try {
                    const frameApp = frame.contentWindow.app;
                    if (frameApp) {
                        frameApp.isDarkTheme = newVal;
                    }
                } catch (e) {
                    console.log('Could not sync theme change with iframe:', e);
                }
            }
        }
    }
});

// Make app globally accessible for iframe communication
window.dashboardApp = app;
