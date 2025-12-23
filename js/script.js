/*---------------------------------------------------
en este script van todas las funciones generales de la web
---------------------------------------------------*/

/*---------------------------------------------------
MENU RESPONSIVE
---------------------------------------------------*/
const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");

// Toggle al clickear el botón hamburguesa
menuBtn.addEventListener("click", () => {
    menu.classList.toggle("active");
    menuBtn.classList.toggle("open");
});

// --- Cierra el menú al scrollear ---
window.addEventListener("scroll", () => {
    if (menu.classList.contains("active")) {
        menu.classList.remove("active");
        menuBtn.classList.remove("open");
    }
});

// --- Cierra el menú al clickear un ítem ---
const menuItems = menu.querySelectorAll("a");
menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        menu.classList.remove("active");
        menuBtn.classList.remove("open");
    });
});

/*---------------------------------------------------
WHATSAPP ROTATORIO
---------------------------------------------------*/
const whatsappPhones = [
    "5491128180954",
    "5491156213704",
    "5491136649747",
    "5491140791494",
];

let currentPhoneIndex = parseInt(localStorage.getItem("currentPhoneIndex")) || 0;
const defaultMessage = "Hola! Estuve mirando la web y quería consultar sobre...";

const whatsappButton = document.getElementById("whatsappButton");
whatsappButton.addEventListener("click", (e) => {
    e.preventDefault(); 
    const phone = whatsappPhones[currentPhoneIndex];
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, "_blank");
    currentPhoneIndex = (currentPhoneIndex + 1) % whatsappPhones.length;
    localStorage.setItem("currentPhoneIndex", currentPhoneIndex);
});

// --- Globito de WhatsApp flotante ---
setTimeout(() => {
    const bubble = document.getElementById("whatsappBubble");
    if (bubble) {
        bubble.style.display = "block";
        bubble.style.animation = "fadeInUp 0.6s ease forwards";
        setTimeout(() => {
            bubble.style.animation = "fadeOutUp 0.6s ease forwards";
            setTimeout(() => { bubble.style.display = "none"; }, 600);
        }, 10000);
    }
}, 6000);

/*---------------------------------------------------
4. CARRUSEL HERO MINIMALISTA (CON SOPORTE TÁCTIL)
---------------------------------------------------*/
let currentHeroSlide = 0;
let totalSlides;
let heroBgSlides;
let heroContentSlides;
let carouselInterval;
let genericModal;
let modalContents;
let indicators;

function goToSlide(index) {
    if (heroBgSlides.length === 0) return;
    heroBgSlides[currentHeroSlide].classList.remove('active');
    heroContentSlides[currentHeroSlide].classList.remove('active');
    heroBgSlides[index].classList.add('active');
    heroContentSlides[index].classList.add('active');
    currentHeroSlide = index;
    updateIndicators(index);
}

function updateIndicators(index) {
    if (!indicators) return;
    indicators.forEach((indicator, i) => {
        if (i === index) { indicator.classList.add('active'); } 
        else { indicator.classList.remove('active'); }
    });
}


function startAutoSlide() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        goToSlide((currentHeroSlide + 1) % totalSlides);
    }, 5000); // Cambio automático cada 5 segundos
}

function initHeroCarousel() {
    const prevButton = document.getElementById('hero-prev');
    const nextButton = document.getElementById('hero-next');
    const heroSection = document.getElementById('inicio');
    indicators = document.querySelectorAll('.indicator');

    // --- LÓGICA TÁCTIL (SWIPE) REINTEGRADA ---
    let touchStartX = 0;
    let touchEndX = 0;

    if (heroSection) {
        heroSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(carouselInterval); 
        }, {passive: true});

        heroSection.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                goToSlide((currentHeroSlide + 1) % totalSlides);
            } else if (touchEndX - touchStartX > swipeThreshold) {
                goToSlide((currentHeroSlide - 1 + totalSlides) % totalSlides);
            }
            setTimeout(() => startAutoSlide(), 15000); 
        }, {passive: true});

        heroSection.addEventListener('mouseenter', () => clearInterval(carouselInterval));
        heroSection.addEventListener('mouseleave', () => startAutoSlide());
    }

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            clearInterval(carouselInterval);
            goToSlide((currentHeroSlide - 1 + totalSlides) % totalSlides);
            startAutoSlide();
        });
        nextButton.addEventListener('click', () => {
            clearInterval(carouselInterval);
            goToSlide((currentHeroSlide + 1) % totalSlides);
            startAutoSlide();
        });
    }

    if (indicators) {
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                clearInterval(carouselInterval);
                goToSlide(index);
                startAutoSlide();
            });
        });
    }

    startAutoSlide();
}

/*---------------------------------------------------
5. AUTOPLAY DE CARDS EN MÓVIL
---------------------------------------------------*/
let cardsInterval;
let cardsContainer;

function initCardsAutoScroll() {
    if (window.innerWidth >= 768) {
        if (cardsInterval) clearInterval(cardsInterval);
        return;
    }
    cardsContainer = document.querySelector('.card-grid-hero > div');
    if (!cardsContainer) return;
    clearInterval(cardsInterval);
    cardsInterval = setInterval(() => {
        const scrollWidth = cardsContainer.scrollWidth;
        const clientWidth = cardsContainer.clientWidth;
        const currentScroll = cardsContainer.scrollLeft;
        if (currentScroll + clientWidth >= scrollWidth - 10) {
            cardsContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            const cardWidth = cardsContainer.querySelector('.card-item').offsetWidth;
            cardsContainer.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
        }
    }, 2000);
}

function pauseCardsAutoScroll() { if (cardsInterval) clearInterval(cardsInterval); }

let cardsResumeTimeout;
function resumeCardsAutoScroll() {
    clearTimeout(cardsResumeTimeout);
    cardsResumeTimeout = setTimeout(() => { initCardsAutoScroll(); }, 3000);
}

// IMPLEMENTACIÓN ACTUALIZADA CON STOPPROPAGATION PARA EVITAR CONFLICTO CON HERO
function setupCardsInteraction() {
    const cardsContainer = document.querySelector('.card-grid-hero > div');
    if (!cardsContainer) return;

    cardsContainer.addEventListener('touchstart', (e) => {
        // Evita que el evento táctil llegue al carrusel Hero superior
        e.stopPropagation();
        pauseCardsAutoScroll();
    }, {passive: true});

    cardsContainer.addEventListener('touchend', (e) => {
        e.stopPropagation();
        resumeCardsAutoScroll();
    }, {passive: true});

    cardsContainer.addEventListener('scroll', () => {
        pauseCardsAutoScroll();
        resumeCardsAutoScroll();
    });
}

/*---------------------------------------------------
LÓGICA DEL MODAL GENÉRICO
---------------------------------------------------*/
function openModal(contentId) {
    if (modalContents) {
        modalContents.forEach(content => content.classList.add('hidden'));
    }
    const contentToShow = document.getElementById(contentId);
    if (contentToShow) contentToShow.classList.remove('hidden');
    if (genericModal) {
        genericModal.classList.remove('hidden');
        setTimeout(() => genericModal.classList.add('visible'), 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (genericModal) {
        genericModal.classList.remove('visible');
        setTimeout(() => {
            genericModal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
}

/*---------------------------------------------------
SISTEMA DE PUBLICIDAD SECUENCIAL INFINITA
---------------------------------------------------*/
const adsSequence = [
    { img: "img/Test1.jpeg", title: "Rio de Janeiro", text: "Descubre el Cristo Redentor con guías expertos.", link: "ExcurcionesRio.html" },
    { img: "img/Test2.jpeg", title: "Paraíso Buzios", text: "Las mejores posadas frente al mar te esperan.", link: "AlojamientosBuzios.html" },
    { img: "img/Test3.jpeg", title: "Soporte 24/7", text: "Estamos para ayudarte en todo tu viaje a Brasil.", link: "principal.html#contacto" }
];

let currentAdIndex = 0;

function initSideAd() {
    const banner = document.getElementById("side-pub-banner");
    const closeBtn = document.getElementById("side-pub-close");
    const dynamicContent = document.getElementById("side-pub-dynamic-content");
    if (!banner || !dynamicContent) return;

    function showNextAd() {
        const ad = adsSequence[currentAdIndex];
        dynamicContent.innerHTML = `
            <div class="side-pub-body">
                <a href="${ad.link}"><img src="${ad.img}" class="side-pub-img"></a>
                <div class="side-pub-info">
                    <h4>${ad.title}</h4>
                    <p>${ad.text}</p>
                    <a href="${ad.link}" class="side-pub-btn">Ver más <i class="fa-solid fa-chevron-right"></i></a>
                </div>
            </div>`;
        banner.classList.add("active");
    }
    setTimeout(showNextAd, 60000);
    if (closeBtn) {
        closeBtn.onclick = () => {
            banner.classList.remove("active");
            currentAdIndex = (currentAdIndex + 1) % adsSequence.length;
            setTimeout(showNextAd, 60000);
        };
    }
}

/*---------------------------------------------------
INICIALIZACIÓN GENERAL (DOMContentLoaded)
---------------------------------------------------*/
document.addEventListener('DOMContentLoaded', () => {
    heroBgSlides = document.querySelectorAll('.hero-bg-slide');
    heroContentSlides = document.querySelectorAll('.hero-content-slide');
    totalSlides = heroBgSlides.length;
    genericModal = document.getElementById('generic-modal');
    modalContents = document.querySelectorAll('.modal-content');

    initHeroCarousel();
    initCardsAutoScroll();
    setupCardsInteraction();
    initSideAd();

    if (genericModal) {
        genericModal.addEventListener('click', (event) => {
            if (event.target.id === 'generic-modal') closeModal();
        });
        const closeButtons = genericModal.querySelectorAll('.modal-close-btn');
        closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    }

    // CARGA DE ARCHIVOS EN OPINIONES (REINTEGRADO)
    const fileInput = document.getElementById("files");
    const fileList = document.getElementById("file-list");
    if (fileInput) { 
        fileInput.addEventListener("change", (event) => {
            const files = event.target.files;
            for (const file of files) {
                const listItem = document.createElement("li");
                listItem.classList.add("file-list-item");
                listItem.innerHTML = `<span class="file-name">${file.name}</span><button class="delete-file-btn">×</button>`;
                listItem.querySelector(".delete-file-btn").onclick = () => listItem.remove();
                fileList.appendChild(listItem);
            }
        });
    }
});

/*---------------------------------------------------
ACCESO OCULTO A ADMIN
---------------------------------------------------*/
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === "a") {
        const pass = prompt("Acceso administrador — ingrese la contraseña:");
        if (pass === "Aaron") {
            localStorage.setItem("isAdmin", "true");
            window.location.href = "administradorAaron.html";
        } else { alert("Contraseña incorrecta."); }
    }
});

/*---------------------------------------------------
NUEVA IMPLEMENTACIÓN: VIDEO PARA ASESORES (RESPONSIVE & TACTIL)
---------------------------------------------------*/
function verVideoAsesor(rutaVideo) {
    const modal = document.getElementById('videoAsesorModal');
    const video = document.getElementById('videoPlayerAsesor');
    
    if (modal && video) {
        video.src = rutaVideo;
        modal.classList.add('active'); 
        video.play();
        document.body.style.overflow = 'hidden';
    }
}

function cerrarVideoAsesor() {
    const modal = document.getElementById('videoAsesorModal');
    const video = document.getElementById('videoPlayerAsesor');
    
    if (modal && video) {
        video.pause();
        video.src = ""; 
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Escuchar clics en la ventana para cerrar si tocan el fondo negro del video
window.addEventListener('click', (e) => {
    const modalVideo = document.getElementById('videoAsesorModal');
    if (e.target === modalVideo) {
        cerrarVideoAsesor();
    }
});