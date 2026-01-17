/**
 * SCROLL-ANIMATIONS.JS — Premium Scroll Reveal System
 * Ploméo © 2026
 *
 * Features:
 * - IntersectionObserver for reveal animations
 * - Stagger support via data-attributes
 * - Scroll progress bar
 * - Enhanced modal system (focus trap, scroll lock)
 * - Scroll cue indicator
 * - Respects prefers-reduced-motion
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        // IntersectionObserver options
        observerOptions: {
            root: null,
            rootMargin: '0px 0px -15% 0px', // Trigger when 15% from bottom
            threshold: 0.15
        },
        // Selectors
        selectors: {
            reveal: '.reveal, .reveal--up, .reveal--fade, .reveal--scale, .reveal--up-small, .reveal--left, .reveal--right, .reveal--stagger',
            scrollProgress: '.scroll-progress__bar',
            scrollCue: '.scroll-cue',
            modal: '.modal',
            modalBackdrop: '.modal__backdrop',
            modalClose: '.modal__close'
        },
        // CSS classes
        classes: {
            visible: 'visible',
            modalOpen: 'modal-open',
            modalActive: 'active',
            hidden: 'hidden'
        }
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Check if user prefers reduced motion
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get scrollbar width for scroll lock
     */
    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    // ============================================
    // 1. SCROLL REVEAL SYSTEM
    // ============================================

    class ScrollReveal {
        constructor() {
            this.observer = null;
            this.elements = [];
            this.init();
        }

        init() {
            // Skip if reduced motion preferred
            if (prefersReducedMotion()) {
                this.showAllImmediately();
                return;
            }

            this.elements = document.querySelectorAll(CONFIG.selectors.reveal);

            if (this.elements.length === 0) return;

            this.createObserver();
            this.observeElements();
        }

        createObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.revealElement(entry.target);
                    }
                });
            }, CONFIG.observerOptions);
        }

        observeElements() {
            this.elements.forEach(element => {
                // Skip hero elements (animated on page load)
                if (element.closest('.hero') && !element.classList.contains('scroll-cue')) {
                    element.classList.add(CONFIG.classes.visible);
                    return;
                }
                this.observer.observe(element);
            });
        }

        revealElement(element) {
            // Apply custom delay if specified
            const delay = element.dataset.delay;

            if (delay) {
                setTimeout(() => {
                    element.classList.add(CONFIG.classes.visible);
                }, parseInt(delay, 10));
            } else {
                element.classList.add(CONFIG.classes.visible);
            }

            // Stop observing after reveal (one-time animation)
            this.observer.unobserve(element);
        }

        showAllImmediately() {
            // For reduced motion: show all elements without animation
            document.querySelectorAll(CONFIG.selectors.reveal).forEach(el => {
                el.classList.add(CONFIG.classes.visible);
            });
        }
    }

    // ============================================
    // 2. SCROLL PROGRESS BAR
    // ============================================

    class ScrollProgress {
        constructor() {
            this.progressBar = null;
            this.init();
        }

        init() {
            this.createProgressBar();
            this.bindEvents();
            this.updateProgress();
        }

        createProgressBar() {
            // Create progress bar container
            const container = document.createElement('div');
            container.className = 'scroll-progress';
            container.setAttribute('aria-hidden', 'true');

            const bar = document.createElement('div');
            bar.className = 'scroll-progress__bar';

            container.appendChild(bar);
            document.body.prepend(container);

            this.progressBar = bar;
        }

        bindEvents() {
            // Use passive listener for better scroll performance
            window.addEventListener('scroll', () => {
                requestAnimationFrame(() => this.updateProgress());
            }, { passive: true });
        }

        updateProgress() {
            if (!this.progressBar) return;

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? scrollTop / docHeight : 0;

            this.progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
        }
    }

    // ============================================
    // 3. SCROLL CUE (Hero indicator)
    // ============================================

    class ScrollCue {
        constructor() {
            this.element = null;
            this.hasScrolled = false;
            this.init();
        }

        init() {
            // Don't show if reduced motion
            if (prefersReducedMotion()) return;

            this.createScrollCue();
            this.bindEvents();
        }

        createScrollCue() {
            const hero = document.querySelector('.hero');
            if (!hero) return;

            const cue = document.createElement('div');
            cue.className = 'scroll-cue';
            cue.innerHTML = `
                <div class="scroll-cue__mouse">
                    <div class="scroll-cue__wheel"></div>
                </div>
                <span class="scroll-cue__text">Scroll</span>
            `;

            hero.appendChild(cue);
            this.element = cue;
        }

        bindEvents() {
            const hideOnScroll = debounce(() => {
                if (!this.hasScrolled && window.scrollY > 100) {
                    this.hide();
                    this.hasScrolled = true;
                }
            }, 50);

            window.addEventListener('scroll', hideOnScroll, { passive: true });
        }

        hide() {
            if (this.element) {
                this.element.classList.add(CONFIG.classes.hidden);
            }
        }
    }

    // ============================================
    // 4. ENHANCED MODAL SYSTEM
    // ============================================

    class ModalEnhancer {
        constructor() {
            this.activeModal = null;
            this.lastFocusedElement = null;
            this.focusableElements = [];
            this.scrollbarWidth = 0;
            this.init();
        }

        init() {
            this.scrollbarWidth = getScrollbarWidth();
            document.documentElement.style.setProperty('--scrollbar-width', `${this.scrollbarWidth}px`);

            this.bindGlobalEvents();
            this.enhanceExistingModals();
        }

        bindGlobalEvents() {
            // ESC key to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.activeModal) {
                    this.closeModal(this.activeModal);
                }
            });

            // Tab trap within modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && this.activeModal) {
                    this.handleTabKey(e);
                }
            });
        }

        enhanceExistingModals() {
            // Find all modal triggers and enhance them
            const modalTriggers = document.querySelectorAll('[data-modal-target]');
            modalTriggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    const modalId = trigger.dataset.modalTarget;
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        this.openModal(modal, trigger);
                    }
                });
            });

            // Enhance close buttons
            document.querySelectorAll(CONFIG.selectors.modalClose).forEach(btn => {
                btn.addEventListener('click', () => {
                    const modal = btn.closest(CONFIG.selectors.modal);
                    if (modal) {
                        this.closeModal(modal);
                    }
                });
            });

            // Backdrop click to close
            document.querySelectorAll(CONFIG.selectors.modalBackdrop).forEach(backdrop => {
                backdrop.addEventListener('click', () => {
                    const modal = backdrop.closest(CONFIG.selectors.modal);
                    if (modal) {
                        this.closeModal(modal);
                    }
                });
            });
        }

        openModal(modal, trigger = null) {
            // Store trigger for focus return
            this.lastFocusedElement = trigger || document.activeElement;
            this.activeModal = modal;

            // Lock body scroll
            document.body.classList.add(CONFIG.classes.modalOpen);

            // Show modal
            modal.classList.add(CONFIG.classes.modalActive);

            // Get focusable elements
            this.focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            // Focus first focusable element or modal itself
            setTimeout(() => {
                if (this.focusableElements.length > 0) {
                    this.focusableElements[0].focus();
                } else {
                    modal.setAttribute('tabindex', '-1');
                    modal.focus();
                }
            }, 100);

            // Announce to screen readers
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('role', 'dialog');
        }

        closeModal(modal) {
            // Hide modal
            modal.classList.remove(CONFIG.classes.modalActive);

            // Unlock body scroll
            document.body.classList.remove(CONFIG.classes.modalOpen);

            // Return focus to trigger
            if (this.lastFocusedElement) {
                setTimeout(() => {
                    this.lastFocusedElement.focus();
                }, 100);
            }

            this.activeModal = null;
            this.focusableElements = [];
        }

        handleTabKey(e) {
            if (this.focusableElements.length === 0) return;

            const firstElement = this.focusableElements[0];
            const lastElement = this.focusableElements[this.focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        // Public API for external use
        static open(modalId, trigger) {
            const modal = document.getElementById(modalId);
            if (modal && window.plomeoModalEnhancer) {
                window.plomeoModalEnhancer.openModal(modal, trigger);
            }
        }

        static close(modalId) {
            const modal = document.getElementById(modalId);
            if (modal && window.plomeoModalEnhancer) {
                window.plomeoModalEnhancer.closeModal(modal);
            }
        }
    }

    // ============================================
    // 5. STAGGER ANIMATION HELPER
    // ============================================

    class StaggerHelper {
        /**
         * Apply stagger delays to child elements
         * @param {HTMLElement} container - Parent container
         * @param {string} childSelector - Selector for children
         * @param {number} baseDelay - Starting delay in ms
         * @param {number} increment - Delay increment per child
         */
        static apply(container, childSelector, baseDelay = 0, increment = 80) {
            const children = container.querySelectorAll(childSelector);
            children.forEach((child, index) => {
                child.style.transitionDelay = `${baseDelay + (index * increment)}ms`;
            });
        }

        /**
         * Remove stagger delays (useful for re-triggering)
         */
        static remove(container, childSelector) {
            const children = container.querySelectorAll(childSelector);
            children.forEach(child => {
                child.style.transitionDelay = '';
            });
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initModules);
        } else {
            initModules();
        }
    }

    function initModules() {
        // Initialize scroll reveal
        new ScrollReveal();

        // Initialize scroll progress bar
        new ScrollProgress();

        // Initialize scroll cue
        // new ScrollCue(); // Désactivé - bouton scroll supprimé

        // Initialize modal enhancements
        window.plomeoModalEnhancer = new ModalEnhancer();

        // Expose StaggerHelper globally
        window.PlomeoStagger = StaggerHelper;

        // Console log for debugging (remove in production)
        console.log('[Ploméo] Scroll animations initialized');
    }

    // Start initialization
    init();

})();
