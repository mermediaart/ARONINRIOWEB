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
SUBMENU
---------------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
    const sideMenu = document.getElementById("sideMenu");
    const sideToggle = document.getElementById("sideMenuToggle");

    if (sideToggle) {
        sideToggle.addEventListener("click", () => {
            sideMenu.classList.toggle("active");
        });
    }

    // Opcional: Cerrar menú al hacer clic en un link (en móvil)
    const sideLinks = document.querySelectorAll(".side-link");
    sideLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                sideMenu.classList.remove("active");
            }
        });
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
if (whatsappButton) {
    whatsappButton.addEventListener("click", (e) => {
        e.preventDefault(); 
        const phone = whatsappPhones[currentPhoneIndex];
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;
        window.open(url, "_blank");
        currentPhoneIndex = (currentPhoneIndex + 1) % whatsappPhones.length;
        localStorage.setItem("currentPhoneIndex", currentPhoneIndex);
    });
}

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
    if (!heroBgSlides || heroBgSlides.length === 0) return;
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
    if (totalSlides > 0) {
        carouselInterval = setInterval(() => {
            goToSlide((currentHeroSlide + 1) % totalSlides);
        }, 5000);
    }
}

function initHeroCarousel() {
    const prevButton = document.getElementById('hero-prev');
    const nextButton = document.getElementById('hero-next');
    const heroSection = document.getElementById('inicio');
    indicators = document.querySelectorAll('.indicator');

    // --- CORRECCIÓN: CONECTAMOS LAS VARIABLES CON EL HTML ---
    heroBgSlides = document.querySelectorAll('.hero-bg-slide');
    heroContentSlides = document.querySelectorAll('.hero-content-slide');
    totalSlides = heroBgSlides.length;
    // --------------------------------------------------------

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

function setupCardsInteraction() {
    const container = document.querySelector('.card-grid-hero > div');
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        pauseCardsAutoScroll();
    }, {passive: true});

    container.addEventListener('touchend', (e) => {
        e.stopPropagation();
        resumeCardsAutoScroll();
    }, {passive: true});

    container.addEventListener('scroll', () => {
        pauseCardsAutoScroll();
        resumeCardsAutoScroll();
    });
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
INICIALIZACIÓN DE CALENDARIOS (NUEVO)
---------------------------------------------------*/
function initCalendars() {
    // Definimos mañana como fecha mínima (no permite reservar el mismo día)
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);

    const configBase = {
        locale: "es",
        minDate: mañana,
        dateFormat: "d/m/Y",
        disableMobile: "true"
    };

    // Inicializar Ingreso
    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");

    if (checkinInput && checkoutInput) {
        const checkinPicker = flatpickr("#checkin", {
            ...configBase,
            onChange: function(selectedDates, dateStr) {
                // Al elegir ingreso, el checkout debe ser mínimo al día siguiente
                const nextDay = new Date(selectedDates[0]);
                nextDay.setDate(nextDay.getDate() + 1);
                checkoutPicker.set("minDate", nextDay);
            }
        });

        const checkoutPicker = flatpickr("#checkout", configBase);
    }
}

/*---------------------------------------------------
LÓGICA UNIFICADA DEL MODAL GENÉRICO
---------------------------------------------------*/
document.addEventListener('DOMContentLoaded', () => {
    const genericModal = document.getElementById('generic-modal');
    const closeBtn = document.getElementById('close-generic-modal');

    
/*---------------------------------------------------
BLOQUEO DE SCROLL GARANTIZADO
---------------------------------------------------*/
window.openModal = function(contentId) {
    const genericModal = document.getElementById('generic-modal');
    const targetContent = document.getElementById(contentId);

    if (genericModal && targetContent) {
        const allContents = genericModal.querySelectorAll('.modal-content, .modal-content-new');
        allContents.forEach(c => c.classList.add('hidden'));
        targetContent.classList.remove('hidden');

        genericModal.style.display = 'flex';
        setTimeout(() => genericModal.classList.add('visible'), 10);

        // BLOQUEO DE FONDO SOLAMENTE
        document.body.classList.add('modal-open');
    }
};

window.closeModal = function() {
    const genericModal = document.getElementById('generic-modal');
    if (genericModal) {
        genericModal.classList.remove('visible');
        document.body.classList.remove('modal-open');
        setTimeout(() => { genericModal.style.display = 'none'; }, 300);
    }
};
});


/*---------------------------------------------------
FUNCIONES PARA EL MODAL DE VIDEOS DE ASESORES
---------------------------------------------------*/

function verVideoAsesor(videoSrc) {
    const modal = document.getElementById('videoAsesorModal');
    const videoPlayer = document.getElementById('videoPlayerAsesor');
    const source = videoPlayer.querySelector('source');

    if (modal && videoPlayer && source) {
        // Asignar la ruta del video al source
        source.src = videoSrc;
        
        // Recargar el video para que tome el nuevo origen
        videoPlayer.load();
        
        // Mostrar el modal
        modal.classList.add('active');
        
        // Reproducir automáticamente (opcional)
        videoPlayer.play().catch(error => {
            console.log("La autoreproducción fue bloqueada por el navegador");
        });

        // Bloquear scroll del fondo
        document.body.style.overflow = 'hidden';
        if (typeof UIController !== 'undefined') {
            UIController.lockScroll();
        }
    }
}

function cerrarVideoAsesor() {
    const modal = document.getElementById('videoAsesorModal');
    const videoPlayer = document.getElementById('videoPlayerAsesor');

    if (modal && videoPlayer) {
        // Pausar el video
        videoPlayer.pause();
        
        // Ocultar el modal
        modal.classList.remove('active');
        
        // Habilitar scroll
        document.body.style.overflow = 'auto';
        if (typeof UIController !== 'undefined') {
            UIController.unlockScroll();
        }
    }
}
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

// --- INICIALIZACIÓN GENERAL ---
document.addEventListener("DOMContentLoaded", () => {
    initHeroCarousel();
    initCardsAutoScroll();
    setupCardsInteraction();
    initSideAd();
});