let currentHeroSlide = 0;
// Obtiene todos los slides de fondo y de contenido
const heroBgSlides = document.querySelectorAll('.hero-bg-slide');
const heroContentSlides = document.querySelectorAll('.hero-content-slide');
const totalSlides = heroBgSlides.length;
let carouselInterval;
let genericModal; // Declaradas globalmente, pero inicializadas en DOMContentLoaded
let modalContents; 

// Función que inicializa los eventos del carrusel
function initHeroCarousel() {
    // Manejador del botón Anterior
    document.getElementById('hero-prev').addEventListener('click', () => {
        goToSlide((currentHeroSlide - 1 + totalSlides) % totalSlides);
    });
    
    // Manejador del botón Siguiente
    document.getElementById('hero-next').addEventListener('click', () => {
        goToSlide((currentHeroSlide + 1) % totalSlides);
    });
    
    startAutoSlide();
    
    // Pausar el carrusel al pasar el mouse o al tocar (UX: User Experience)
    const heroSection = document.getElementById('inicio');
    heroSection.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    heroSection.addEventListener('mouseleave', () => startAutoSlide());
    heroSection.addEventListener('touchstart', () => clearInterval(carouselInterval));
    heroSection.addEventListener('touchend', () => startAutoSlide());
}

// Inicia el cambio automático de diapositivas cada 20 segundos
function startAutoSlide() {
    carouselInterval = setInterval(() => {
        goToSlide((currentHeroSlide + 1) % totalSlides);
    }, 20000); 
}

// Lógica para cambiar a la diapositiva en el índice 'index'
function goToSlide(index) {
    // Oculta el slide actual
    heroBgSlides[currentHeroSlide].classList.remove('active');
    heroContentSlides[currentHeroSlide].classList.remove('active');
    
    // Muestra el nuevo slide
    heroBgSlides[index].classList.add('active');
    heroContentSlides[index].classList.add('active');
    
    // Actualiza el índice
    currentHeroSlide = index;
}

// --- LÓGICA DEL MODAL ---

function openModal(contentId) {
    // 1. Ocultar todos los contenidos de modal
    modalContents.forEach(content => {
        content.classList.add('hidden');
    });

    // 2. Mostrar el contenido solicitado
    const contentToShow = document.getElementById(contentId);
    if (contentToShow) {
        contentToShow.classList.remove('hidden');
    }

    // 3. Mostrar el modal (overlay)
    genericModal.classList.remove('hidden');
    // Esperar un tick para aplicar la transición de escala/opacidad del CSS
    setTimeout(() => {
        genericModal.classList.add('visible');
    }, 10);
    
    // 4. Deshabilitar el scroll del cuerpo
    document.body.style.overflow = 'hidden';
}

// Cierra el modal y restablece el scroll
function closeModal() {
    genericModal.classList.remove('visible');
    // Ocultar el modal después de la transición
    setTimeout(() => {
        genericModal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300); // 300ms debe coincidir con la transición en CSS
}

// Ejecutar la inicialización y definir variables DOM después de cargar el contenido
document.addEventListener('DOMContentLoaded', () => {
    // Definición de variables DOM (elementos del modal)
    genericModal = document.getElementById('generic-modal'); 
    modalContents = document.querySelectorAll('.modal-content'); 

    // Inicializar el carrusel
    initHeroCarousel();

    // Listener para cerrar el modal al hacer clic en el overlay (asegura que se inicialice después de genericModal)
    if (genericModal) {
        genericModal.addEventListener('click', (event) => {
            // Solo cerrar si el clic es directamente en el overlay (no en el modal-container)
            if (event.target.id === 'generic-modal') {
                closeModal();
            }
        });
    }
})

// Ejecutar la inicialización cuando el documento esté listo
document.addEventListener('DOMContentLoaded', initHeroCarousel);