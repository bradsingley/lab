/**
 * MAI UI Design System - JavaScript Implementation
 * Following MAI motion and interaction patterns
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // Schedule Tabs (MAI Tablist Pattern)
    // ============================================
    const tablist = document.querySelector('.mai-tablist');
    const tabs = document.querySelectorAll('.mai-tab');
    const panels = document.querySelectorAll('.mai-schedule-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active state from all tabs and panels
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panels.forEach(p => {
                p.classList.remove('active');
                p.hidden = true;
            });

            // Add active state to clicked tab and corresponding panel
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            const day = tab.dataset.day;
            const panel = document.querySelector(`.mai-schedule-panel[data-day="${day}"]`);
            if (panel) {
                panel.classList.add('active');
                panel.hidden = false;
            }
        });

        // Keyboard navigation (MAI accessibility pattern)
        tab.addEventListener('keydown', (e) => {
            const tabArray = Array.from(tabs);
            const currentIndex = tabArray.indexOf(tab);
            let newIndex;

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = currentIndex > 0 ? currentIndex - 1 : tabArray.length - 1;
                    tabArray[newIndex].focus();
                    tabArray[newIndex].click();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = currentIndex < tabArray.length - 1 ? currentIndex + 1 : 0;
                    tabArray[newIndex].focus();
                    tabArray[newIndex].click();
                    break;
                case 'Home':
                    e.preventDefault();
                    tabArray[0].focus();
                    tabArray[0].click();
                    break;
                case 'End':
                    e.preventDefault();
                    tabArray[tabArray.length - 1].focus();
                    tabArray[tabArray.length - 1].click();
                    break;
            }
        });
    });

    // ============================================
    // Smooth Scrolling (MAI Motion Pattern)
    // Uses MAI easing: cubic-bezier(0.4, 0, 0.2, 1)
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbar = document.querySelector('.mai-navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // Navbar Scroll Effect (MAI Acrylic Treatment)
    // Enhances blur and shadow on scroll
    // ============================================
    const navbar = document.querySelector('.mai-navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.96)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.92)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });

    // ============================================
    // Scroll Reveal Animation (MAI Motion System)
    // Uses MAI duration and easing tokens
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animatedElements = document.querySelectorAll(
        '.mai-content-card, .mai-speaker-card, .mai-pricing-card, .mai-stat-card'
    );

    // Check for reduced motion preference (MAI accessibility)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        // Set initial state
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // Button Ripple Effect (MAI Interactive Feedback)
    // ============================================
    const buttons = document.querySelectorAll('.mai-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Skip if reduced motion is preferred
            if (prefersReducedMotion) return;
            
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.4s cubic-bezier(0, 0, 0.2, 1);
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    });

    // Add ripple keyframes
    if (!document.querySelector('#mai-ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'mai-ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // Stats Counter Animation
    // ============================================
    const statNumbers = document.querySelectorAll('.mai-stat-number');
    
    const animateCounter = (element) => {
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const target = parseInt(text.replace(/[^0-9]/g, ''));
        
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const duration = 1000;
        const stepTime = duration / 50;
        
        element.textContent = '0' + (hasPlus ? '+' : '');
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (hasPlus ? '+' : '');
        }, stepTime);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !prefersReducedMotion) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => statsObserver.observe(stat));
});
