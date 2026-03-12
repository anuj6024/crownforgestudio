/**
 * UI Interaction Module
 * Handles UI specific logic like mobile menu toggles, modals, etc.
 */

export const initMobileMenu = () => {
    const menuBtn = document.querySelector('button.md\\:hidden');
    const nav = document.querySelector('nav');
    
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            // Simple toggle for demonstration
            nav.classList.toggle('hidden');
            nav.classList.toggle('flex');
            nav.classList.toggle('flex-col');
            nav.classList.toggle('absolute');
            nav.classList.toggle('top-16');
            nav.classList.toggle('left-0');
            nav.classList.toggle('w-full');
            nav.classList.toggle('bg-brand-dark');
            nav.classList.toggle('p-4');
        });
    }
};

export const initScrollEffects = () => {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('shadow-lg');
            header.classList.add('bg-brand-dark/95');
        } else {
            header.classList.remove('shadow-lg');
            header.classList.remove('bg-brand-dark/95');
        }
    });
};

export const initMediaGallery = () => {
    const triggers = document.querySelectorAll('[data-gallery-open]');
    if (!triggers.length) return;

    let modalEl = null;
    let trackEl = null;
    let slides = [];
    let index = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const closeModal = () => {
        if (modalEl) modalEl.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    const openModal = (title, videoId, images) => {
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'cf-gallery-modal';
            modalEl.className = 'fixed inset-0 z-[100] hidden';
            modalEl.innerHTML = `
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative z-10 h-full w-full flex flex-col">
                    <div class="flex items-center justify-between p-4 md:p-6">
                        <h3 class="text-white text-lg md:text-2xl font-bold" id="cf-gallery-title"></h3>
                        <button class="text-white/80 hover:text-white px-3 py-2 rounded" id="cf-gallery-close">Close ✕</button>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="relative h-full">
                            <div class="absolute inset-y-0 left-0 flex items-center z-20 pointer-events-none">
                                <button id="cf-gallery-prev" aria-label="Previous" class="pointer-events-auto m-2 md:m-4 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white font-bold">‹</button>
                            </div>
                            <div class="absolute inset-y-0 right-0 flex items-center z-20 pointer-events-none">
                                <button id="cf-gallery-next" aria-label="Next" class="pointer-events-auto m-2 md:m-4 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white font-bold">›</button>
                            </div>
                            <div id="cf-gallery-track" class="h-full w-full flex transition-transform duration-500 ease-in-out will-change-transform"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEl);
            trackEl = modalEl.querySelector('#cf-gallery-track');
            modalEl.querySelector('#cf-gallery-close').addEventListener('click', closeModal);
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl.querySelector('.absolute.inset-0')) closeModal();
            });
            modalEl.querySelector('#cf-gallery-prev').addEventListener('click', () => slideTo(index - 1));
            modalEl.querySelector('#cf-gallery-next').addEventListener('click', () => slideTo(index + 1));

            // swipe / drag
            const onPointerDown = (e) => {
                isDragging = true;
                startX = e.clientX || e.touches?.[0]?.clientX || 0;
                trackEl.style.transitionDuration = '0ms';
            };
            const onPointerMove = (e) => {
                if (!isDragging) return;
                currentX = (e.clientX || e.touches?.[0]?.clientX || 0) - startX;
                const offset = -index * trackEl.clientWidth + currentX;
                trackEl.style.transform = `translateX(${offset}px)`;
            };
            const onPointerUp = () => {
                if (!isDragging) return;
                isDragging = false;
                trackEl.style.transitionDuration = '500ms';
                if (currentX > 80) slideTo(index - 1);
                else if (currentX < -80) slideTo(index + 1);
                else slideTo(index);
                currentX = 0;
            };
            trackEl.addEventListener('mousedown', onPointerDown);
            trackEl.addEventListener('mousemove', onPointerMove);
            trackEl.addEventListener('mouseup', onPointerUp);
            trackEl.addEventListener('mouseleave', onPointerUp);
            trackEl.addEventListener('touchstart', onPointerDown, { passive: true });
            trackEl.addEventListener('touchmove', onPointerMove, { passive: true });
            trackEl.addEventListener('touchend', onPointerUp);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeModal();
                if (e.key === 'ArrowLeft') slideTo(index - 1);
                if (e.key === 'ArrowRight') slideTo(index + 1);
            });
        }

        // populate
        modalEl.querySelector('#cf-gallery-title').textContent = title || 'Media';
        trackEl.innerHTML = '';
        slides = [];
        index = 0;

        if (videoId) {
            const videoSlide = document.createElement('div');
            videoSlide.className = 'min-w-full h-full flex items-center justify-center bg-black';
            videoSlide.innerHTML = `
                <iframe class="w-full h-full" src="https://www.youtube.com/embed/${videoId}" title="Trailer" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            `;
            trackEl.appendChild(videoSlide);
            slides.push(videoSlide);
        }

        (images || []).forEach(src => {
            const imgSlide = document.createElement('div');
            imgSlide.className = 'min-w-full h-full flex items-center justify-center bg-black';
            imgSlide.innerHTML = `<img src="${src.trim()}" class="w-full h-full object-cover" alt="">`;
            trackEl.appendChild(imgSlide);
            slides.push(imgSlide);
        });

        slideTo(0, true);
        modalEl.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    };

    const slideTo = (i, instant = false) => {
        index = Math.max(0, Math.min(i, slides.length - 1));
        if (!trackEl) return;
        trackEl.style.transitionDuration = instant ? '0ms' : '500ms';
        const offset = -index * trackEl.clientWidth;
        trackEl.style.transform = `translateX(${offset}px)`;
    };

    triggers.forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.getAttribute('data-gallery-title') || 'Media';
            const videoId = btn.getAttribute('data-video') || '';
            const imagesAttr = btn.getAttribute('data-images') || '';
            const images = imagesAttr.split(',').filter(Boolean);
            openModal(title, videoId, images);
        });
    });
};
