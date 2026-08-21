

// --- PRELOADER LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    
    // 1. Force page to start at top (prevents scroll jumping)
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    } else {
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        }
    }

    // 2. Add "loading" class to body to stop scrolling
    document.body.classList.add('loading');

    // 3. Wait for everything to load (images, styles, scripts)
    window.addEventListener('load', () => {
        
        setTimeout(() => {
            // A. Hide Preloader
            preloader.classList.add('hide');
            document.body.classList.remove('loading');
            
            // B. TRIGGER HERO ANIMATIONS NOW
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.classList.add('animate-hero');
            }
            
        }, 1500);
    });

        // --- CERTIFICATE LIGHTBOX LOGIC ---
    // --- LIGHTBOX LOGIC (Certificates & Client Projects) ---
    // Select both certificate images and client project preview images
    const expandableImages = document.querySelectorAll('.cert-visual img, .client-preview img');
    const body = document.body;

    // 1. Create Lightbox Elements dynamically
    const lightbox = document.createElement('div');
    lightbox.className = 'cert-lightbox'; // Reusing the sleek cert-lightbox CSS
    lightbox.innerHTML = `
        <span class="cert-lightbox-close">&times;</span>
        <img src="" alt="Expanded Preview">
    `;
    body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.cert-lightbox-close');

    // 2. Open Lightbox on Click
    expandableImages.forEach(img => {
        // Force the zoom-in cursor so users know it's clickable
        img.style.cursor = 'zoom-in';
        
        // Listen for the click on the image itself
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents triggering other click events
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            body.style.overflow = 'hidden'; // Disable page scrolling while open
        });
    });

    // 3. Close Lightbox Logic
    function closeLightbox() {
        lightbox.classList.remove('active');
        body.style.overflow = ''; // Restore page scrolling
    }

    // Close when clicking the 'X'
    closeBtn.addEventListener('click', closeLightbox);

    // Close when clicking the dark background outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
});

// This removes the "delay" before scrolling starts
window.addEventListener('touchstart', function() {}, { passive: true });
window.addEventListener('touchmove', function() {}, { passive: true });

// ==========================================
// MILLION DOLLAR "CYBER DECODE" TYPING EFFECT
// ==========================================

const typingElement = document.getElementById("premium-typing-text");

if (typingElement) {
    // Your High-Value Skillsets
    const roles = [
        "Sr. Shopify Developer",
        "Shopify Plus / Liquid",
        "Full-Stack Web Developer",
        "Speed Optimization",
        "Python Automation",
        "AI & RAG Systems",
        "WordPress / WooCommerce",
    ];

    // The random characters used during the "decode" scramble phase
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    
    let roleIndex = 0;
    let frameRequest;
    let frame = 0;
    
    // Animation Configuration
    const frameRate = 3;       // Speed of character scrambling
    const pauseTime = 2500;    // Time word stays fully visible (2.5s)
    
    // The core scramble function
    class ScrambleText {
        constructor(el) {
            this.el = el;
            this.queue = [];
        }
        
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                // The math determines how long the "scramble" lasts for each letter
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end, char: '' });
            }
            
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        
        update() {
            let output = '';
            let complete = 0;
            
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    // Highlight the scrambled characters in neon blue
                    output += `<span style="color: #00f0ff; text-shadow: 0 0 5px #00f0ff;">${char}</span>`;
                } else {
                    output += from;
                }
            }
            
            this.el.innerHTML = output;
            
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update.bind(this));
                this.frame += frameRate;
            }
        }
        
        randomChar() {
            return chars[Math.floor(Math.random() * chars.length)];
        }
    }

    const scrambler = new ScrambleText(typingElement);

    // The Infinite Loop
    function nextRole() {
        scrambler.setText(roles[roleIndex]).then(() => {
            setTimeout(nextRole, pauseTime);
        });
        roleIndex = (roleIndex + 1) % roles.length;
    }

    // Start the animation slightly after page load
    setTimeout(nextRole, 500);
}

// --- 2. MOBILE MENU TOGGLE ---
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.getElementById('navLinks');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// --- 3. OPTIMIZED HEADER SCROLL (High Performance) ---
const header = document.getElementById('header');
let lastScrollY = window.scrollY;
let ticking = false;

function updateHeader() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
    }
}, { passive: true }); // 'passive: true' tells browser not to wait for JS

// --- 4. SCROLL ANIMATIONS (Fade In) ---
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px 50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// --- 5. ADVANCED GALLERY LOGIC ---
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    const gallery = card.querySelector('.project-gallery');
    if(!gallery) return; // Skip if no gallery

    const slides = card.querySelectorAll('.gallery-item');
    const dotsContainer = card.querySelector('.dots-container');
    const prevBtn = card.querySelector('.prev-btn');
    const nextBtn = card.querySelector('.next-btn');
    
    let slideIndex = 0;
    const totalSlides = slides.length;

    // A. Create Dots
    if (dotsContainer) {
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                slideIndex = index;
                updateGallery();
            });
            
            dotsContainer.appendChild(dot);
        });
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    // B. Update Gallery Position
    function updateGallery() {
        const itemWidth = gallery.querySelector('.gallery-item').clientWidth;
        gallery.scrollTo({
            left: itemWidth * slideIndex,
            behavior: 'smooth'
        });
        
        if(dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[slideIndex]) dots[slideIndex].classList.add('active');
        }
    }

    // C. Arrow Buttons
    if(nextBtn && prevBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            slideIndex = (slideIndex + 1) % totalSlides;
            updateGallery();
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
            updateGallery();
        });
    }

    // D. Auto-Scroll
    let autoScrollInterval;
    const startAutoScroll = () => {
        autoScrollInterval = setInterval(() => {
            slideIndex = (slideIndex + 1) % totalSlides;
            updateGallery();
        }, 3000);
    };
    const stopAutoScroll = () => clearInterval(autoScrollInterval);

    startAutoScroll();
    card.addEventListener('mouseenter', stopAutoScroll);
    card.addEventListener('mouseleave', startAutoScroll);
    
    // E. Sync Scroll (Manual Swipe)
    gallery.addEventListener('scroll', () => {
        if (!card.matches(':hover')) {
                const itemWidth = gallery.querySelector('.gallery-item').clientWidth;
                const newIndex = Math.round(gallery.scrollLeft / itemWidth);
                if (newIndex !== slideIndex && newIndex < totalSlides) {
                    slideIndex = newIndex;
                    if(dots.length > 0) {
                        dots.forEach(dot => dot.classList.remove('active'));
                        if(dots[slideIndex]) dots[slideIndex].classList.add('active');
                    }
                }
        }
    });
});

// --- 6. SMOOTH SCROLL FOR ANCHORS ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// --- 7. FORM SUBMISSION ---
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop page reload
        
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // 1. Change button state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // 2. Send data to Formspree (Replace URL below with your own)
            const response = await fetch("https://formspree.io/f/xjklzvyz", {
                method: "POST",
                body: new FormData(e.target),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // 3. Success State
                submitBtn.textContent = '✓ Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                e.target.reset();
            } else {
                // 4. Error State
                throw new Error('Failed to send');
            }
        } catch (error) {
            submitBtn.textContent = '❌ Error. Try Again.';
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        }

        // 5. Reset button after 3 seconds
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }, 3000);
    });
}

// --- 8. PARALLAX SHAPES ---
window.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 20;
        const xPos = (x - 0.5) * speed;
        const yPos = (y - 0.5) * speed;
        shape.style.transform = `translate(${xPos}px, ${yPos}px)`;
    });
});


// Check if device supports hovering (Mouse)
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {

    // Only create if not exists
    if (!document.querySelector('.custom-cursor-element')) {
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor-element');
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid var(--primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease, opacity 0.2s ease; /* Added opacity transition */
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursor.style.opacity = '1'; // Show when moving
        });

        // Hide cursor when mouse leaves the window
        document.addEventListener('mouseout', () => {
            cursor.style.opacity = '0';
        });

        // Hover effect for interactive elements
        document.querySelectorAll('a, button, .project-card, .skill-tag').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.background = 'rgba(0, 240, 255, 0.2)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.background = 'transparent';
            });
        });
    }
}

// ==========================================
// CLIENT WORK MARQUEE
// The track is rendered as several identical sets and the transform is kept
// inside the middle one, so there is always a full set off-screen to the left
// AND the right - no empty gap on first paint, and none when the arrows move
// the row faster than it can wrap.
// ==========================================
(function () {
    var track = document.getElementById("cw-track");
    var wrap  = track && track.closest(".cw");
    if (!track || !wrap) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var SPEED = 34;   // px per second
    var JUMP  = 3;    // cards moved per arrow click

    var master = Array.prototype.slice.call(track.querySelectorAll(".cw__card"))
                      .map(function (el) { return el.cloneNode(true); });
    if (!master.length) return;

    var period = 0, pos = 0, target = 0, held = false, last = 0, step = 0;

    function build() {
        track.innerHTML = "";
        master.forEach(function (el) { track.appendChild(el.cloneNode(true)); });

        var gap = parseFloat(getComputedStyle(track).columnGap) || 28;
        period = track.scrollWidth + gap;
        step   = master[0].getBoundingClientRect().width + gap;

        // enough copies that the window can never see past the ends
        var need = Math.max(3, Math.ceil(wrap.clientWidth / Math.max(period, 1)) + 2);
        for (var s = 1; s < need; s++) {
            master.forEach(function (el) {
                var c = el.cloneNode(true);
                c.setAttribute("data-clone", "");
                c.setAttribute("aria-hidden", "true");
                // only the originals should be reachable by keyboard
                Array.prototype.forEach.call(c.querySelectorAll("a"), function (a) {
                    a.setAttribute("tabindex", "-1");
                });
                track.appendChild(c);
            });
        }

        var lead = Math.max(0, (wrap.clientWidth - step) / 2);   // first card centred
        pos = target = -lead;
        render();
    }

    function render() {
        var m = ((pos % period) + period) % period;
        track.style.transform = "translate3d(" + (-(period + m)).toFixed(1) + "px,0,0)";
    }

    function frame(now) {
        var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        if (!held) target += SPEED * dt;
        pos += (target - pos) * Math.min(1, dt * 11);   // arrows glide, then land
        render();
        requestAnimationFrame(frame);
    }

    wrap.addEventListener("pointerenter", function () { held = true; });
    wrap.addEventListener("pointerleave", function () { held = false; });
    wrap.addEventListener("focusin",  function () { held = true; });
    wrap.addEventListener("focusout", function () { held = false; });
    document.addEventListener("visibilitychange", function () { held = document.hidden; });

    var prev = wrap.querySelector(".cw__nav--prev");
    var next = wrap.querySelector(".cw__nav--next");
    if (prev) prev.addEventListener("click", function () { target -= step * JUMP; });
    if (next) next.addEventListener("click", function () { target += step * JUMP; });

    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 250); });

    if (!reduced) requestAnimationFrame(frame);
})();
