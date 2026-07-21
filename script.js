// ===== AUDIO CONTEXT & SOUND GENERATION =====
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.soundEnabled = true;
        this.initAudioContext();
        this.loadSoundPreference();
    }

    initAudioContext() {
        const audioContextClass = window.AudioContext || window.webkitAudioContext;
        if (audioContextClass) {
            this.audioContext = new audioContextClass();
        }
    }

    playClickSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // High-pitched click (beep)
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        
        osc1.frequency.setValueAtTime(800, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc1.start(now);
        osc1.stop(now + 0.05);
    }

    playHoverSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Soft hover tone
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        return this.soundEnabled;
    }

    loadSoundPreference() {
        const saved = localStorage.getItem('soundEnabled');
        if (saved !== null) {
            this.soundEnabled = saved === 'true';
        }
    }
}

// ===== THEME MANAGER =====
class ThemeManager {
    constructor() {
        this.theme = 'dark';
        this.loadTheme();
        this.applyTheme();
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeToggleIcon();
    }

    loadTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            this.theme = saved;
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.theme = prefersDark ? 'dark' : 'light';
        }
    }

    updateThemeToggleIcon() {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = this.theme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
class ScrollAnimationManager {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.1 }
        );
        this.initializeObserver();
    }

    initializeObserver() {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => this.observer.observe(section));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.8s ease-out';
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// ===== MAIN APPLICATION =====
class Portfolio {
    constructor() {
        this.soundManager = new SoundManager();
        this.themeManager = new ThemeManager();
        this.scrollAnimationManager = new ScrollAnimationManager();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSoundToggle();
        this.setupThemeToggle();
        this.setupSmoothScrolling();
        this.setupFormHandling();
        this.setupSoundEffects();
        this.setupResumeDownload();
    }

    setupEventListeners() {
        // Handle scroll for navbar effects
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupSoundToggle() {
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                const enabled = this.soundManager.toggleSound();
                this.updateSoundToggleUI(enabled);
            });
            
            // Set initial state
            this.updateSoundToggleUI(this.soundManager.soundEnabled);
        }
    }

    updateSoundToggleUI(enabled) {
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            if (enabled) {
                soundToggle.classList.remove('muted');
                soundToggle.querySelector('.sound-icon').textContent = '🔊';
                soundToggle.title = 'Sound: ON';
            } else {
                soundToggle.classList.add('muted');
                soundToggle.querySelector('.sound-icon').textContent = '🔇';
                soundToggle.title = 'Sound: OFF';
            }
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.themeManager.toggleTheme();
                this.soundManager.playClickSound();
            });
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    this.soundManager.playClickSound();
                }
            });
        });
    }

    setupSoundEffects() {
        // Click sounds on buttons
        document.querySelectorAll('[data-sound="click"]').forEach(element => {
            element.addEventListener('click', () => {
                this.soundManager.playClickSound();
            });
        });

        // Hover sounds on cards
        document.querySelectorAll('[data-sound="hover"]').forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.soundManager.playHoverSound();
            });
        });
    }

    setupFormHandling() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.soundManager.playClickSound();
                
                // Simulate form submission
                const button = contactForm.querySelector('button[type="submit"]');
                const originalText = button.textContent;
                button.textContent = '✓ Message Sent!';
                button.disabled = true;
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                    contactForm.reset();
                }, 2000);
            });
        }
    }

    setupResumeDownload() {
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.soundManager.playClickSound();
                this.downloadResume();
            });
        }
    }

    downloadResume() {
        // Create a simple resume PDF or document
        const resumeContent = `
Asmita Ghogare
MSc IMCA Student | Python Developer | ML & Mathematics Enthusiast

CONTACT INFORMATION
Email: asmita.ghogare@example.com
LinkedIn: linkedin.com/in/asmita-ghogare-b5504a385
GitHub: github.com/asmitaghogare8-bot

PROFESSIONAL SUMMARY
Dedicated software developer and data enthusiast with strong foundation in mathematics and computer science. Proficient in backend development, machine learning, and cryptography. Seeking opportunities in software development, Java development, and backend engineering roles.

TECHNICAL SKILLS
Programming Languages: Java, Python, C, C++
Backend & Frameworks: Spring Boot, Spring Data JPA, Hibernate, REST APIs
Frontend: HTML5, CSS3, JavaScript, Angular Basics
Databases: MySQL, PostgreSQL, SQLite
Developer Tools: Git, GitHub, Maven, VS Code, IntelliJ IDEA
Specialized Areas: Machine Learning, Cryptography, Data Structures, Algorithms

EDUCATION
MSc IMCA (Information & Communication Technology for Mathematics)
[University Name] - Currently Pursuing

CERTIFICATIONS & ACHIEVEMENTS
• Blue Pineapple Campus Connect - 8-Week Industry Training Program
• Google Cybersecurity Professional Certificate - Coursera
• Data Analytics Certificate - Coursera
• Microsoft Excel Certificate - Simplilearn
• NCC 'C' Certificate
• Mathematics Workshop - IISER Pune & Bhaskaracharya Pratishthana

PROJECTS
Campus Event Management System
- Comprehensive web application for event management with RBAC
- Technologies: Java, Spring Boot, MySQL, REST API, HTML/CSS

SQL Query Validator
- Tool for SQL validation, optimization, and analysis
- Technologies: Python, Flask, SQLAlchemy, JavaScript

Machine Learning Classification Model
- Complete ML pipeline with data preprocessing and model training
- Technologies: Python, scikit-learn, Pandas, NumPy

KEY INTERESTS
Backend Development | AI & Machine Learning | Cryptography | 
Data Structures | Mathematical Modeling | System Design

CAREER OBJECTIVES
Seeking opportunities as Software Development Intern, Java Developer Intern, 
Backend Developer Intern, or Full Stack Developer Intern to apply technical 
expertise and contribute to innovative projects.
        `;

        // Create and download text file
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(resumeContent));
        element.setAttribute('download', 'Asmita_Ghogare_Resume.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }

    handleResize() {
        // Handle responsive behaviors if needed
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    new Portfolio();
    
    // Add dynamic welcome message
    console.log('%cWelcome to Asmita Ghogare\'s Portfolio! 🚀', 
        'font-size: 20px; color: #6366f1; font-weight: bold;');
    console.log('%cCheck out the projects and connect on LinkedIn or GitHub!', 
        'font-size: 14px; color: #64748b;');
});