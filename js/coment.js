// Sistema de Opiniones: Lógica tradicional (sin módulos)
// Nota: Este archivo asume que las librerías de Firebase se cargan en el HTML como scripts globales.

// --- 1. CONFIGURACIÓN DE FIREBASE (PRODUCCIÓN) ---
const productionConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO_ID",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_ID",
    appId: "TU_APP_ID"
};

// --- VERIFICACIÓN DE ENTORNO ---
let firebaseConfig = {};
try {
    firebaseConfig = typeof __firebase_config !== 'undefined' 
        ? JSON.parse(__firebase_config) 
        : productionConfig;
} catch (e) {
    firebaseConfig = productionConfig;
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'mi-app-personalizada';

// Variables de estado
let db = null;
let userId = 'anonimo';
let filesToUpload = []; 
let currentOpinionIndex = 0;
let opinionsData = [];
let autoPlayInterval = null;
let userSubmittedOpinions = [];
let currentLightboxMedia = [];
let currentLightboxIndex = 0;

// Opiniones estáticas
const baseOpinions = [
    { 
        id: 1, 
        name: "Carlos Martínez", 
        date: "15 DE NOVIEMBRE, 2023", 
        rating: 5, 
        comment: "Excelente trabajo de Arominfo. La atención al detalle es impresionante.", 
        hasGallery: true, 
        media: [
            { type: "image", url: "img/Test1.jpeg" }, 
            { type: "image", url: "img/Test2.jpeg" },
            { type: "video", url: "img/Clientesfelices3.mp4"}
        ] 
    },
    { 
        id: 2, 
        name: "Juan Pérez", 
        date: "10 DE DICIEMBRE, 2023", 
        rating: 5, 
        comment: "¡Una experiencia increíble!", 
        hasGallery: false 
    }
];

// --- INICIALIZACIÓN DE FIREBASE ---
if (window.firebase && firebaseConfig.apiKey && firebaseConfig.apiKey !== "TU_API_KEY_AQUI") {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        const auth = firebase.auth();
        auth.signInAnonymously().catch(err => console.error("Error de Autenticación:", err));
        auth.onAuthStateChanged(u => { if(u) userId = u.uid; });
    } catch (e) {
        console.error("Error al conectar con Firebase:", e);
    }
}

// --- FUNCIONES DE ALMACENAMIENTO LOCAL ---
function saveLocal() { 
    localStorage.setItem('userOpinions_v2', JSON.stringify(userSubmittedOpinions)); 
}

function loadLocal() { 
    const s = localStorage.getItem('userOpinions_v2'); 
    if(s) userSubmittedOpinions = JSON.parse(s); 
}

// --- UTILIDADES DE INTERFAZ ---
function showMessage(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `fixed top-4 right-4 z-[3000] p-4 rounded-lg shadow-2xl text-white font-bold transition-all duration-500 transform ${type === 'error' ? 'bg-red-500' : 'bg-primary-green'}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { 
        el.style.opacity = '0'; 
        el.style.transform = 'translateY(-20px)';
        setTimeout(() => el.remove(), 500); 
    }, 3000);
}

// --- LÓGICA DEL LIGHTBOX ---
function openLightbox(media, start) {
    if (!media || media.length === 0) return;
    currentLightboxMedia = media;
    currentLightboxIndex = start;
    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateLightbox();
    }
}

function closeLightbox() { 
    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.classList.remove('active'); 
        document.body.style.overflow = ''; 
    }
}

function updateLightbox() {
    const item = currentLightboxMedia[currentLightboxIndex];
    const container = document.getElementById('lightboxMediaContainer');
    const counter = document.getElementById('lightboxCounter');
    
    if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxMedia.length}`;
    if (container && item) {
        container.innerHTML = item.type === 'image' 
            ? `<img src="${item.url}" class="lightbox-media" style="max-width:100%; max-height:85vh; object-fit:contain;">` 
            : `<video src="${item.url}" controls autoplay muted class="lightbox-media" style="max-width:100%; max-height:85vh;"></video>`;
    }
}

function navLightbox(dir) {
    if (currentLightboxMedia.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + dir + currentLightboxMedia.length) % currentLightboxMedia.length;
    updateLightbox();
}

// --- LÓGICA DEL CARRUSEL ---
function adjustArrowPosition() {
    const container = document.querySelector('#currentOpinionContainer > div');
    const prevBtn = document.getElementById('prevOpinionBtn');
    const nextBtn = document.getElementById('nextOpinionBtn');
    
    if (container && prevBtn && nextBtn) {
        const height = container.offsetHeight;
        if (height < 150) {
            prevBtn.classList.add('scale-75');
            nextBtn.classList.add('scale-75');
        } else {
            prevBtn.classList.remove('scale-75');
            nextBtn.classList.remove('scale-75');
        }
    }
}

function loadOpinion(idx) {
    opinionsData = [...baseOpinions, ...userSubmittedOpinions];
    if (opinionsData.length === 0) return;
    
    const op = opinionsData[idx];
    const container = document.getElementById('currentOpinionContainer');
    if (!container || !op) return;

    let stars = '';
    for(let i=1; i<=5; i++) {
        stars += `<i class="${i <= op.rating ? 'fas' : 'far'} fa-star text-accent-yellow text-xs md:text-base"></i>`;
    }
    
    let gallery = '';
    if (op.hasGallery && op.media && op.media.length > 0) {
       gallery = `<div class="mt-4 grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-3">${op.media.map((m, i) => {
            const mediaTag = m.type === 'video' 
                ? `<video src="${m.url}" class="w-full h-full object-cover"></video>
                   <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                       <i class="fas fa-play text-white text-lg md:text-2xl"></i>
                   </div>`
                : `<img src="${m.url}" class="w-full h-full object-cover">`;

            return `
            <div class="thumbnail aspect-square rounded-lg overflow-hidden bg-gray-200 relative cursor-pointer" data-idx="${i}">
                ${mediaTag}
                <div class="thumbnail-overlay md:flex hidden"><i class="fas fa-search-plus text-white text-xl"></i></div>
            </div>`;
        }).join('')}</div>`;
    }

    container.innerHTML = `
        <div class="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-12 border border-gray-100 border-l-[8px] md:border-l-[10px] border-l-primary-green shadow-lg transition-all duration-500 hover:shadow-xl">
            <div class="flex justify-between items-start mb-3">
                <div class="overflow-hidden">
                    <h3 class="font-bold text-gray-800 text-sm md:text-lg truncate">${op.name}</h3>
                    <p class="text-[10px] text-gray-500 uppercase">${op.date}</p>
                </div>
                <div class="flex gap-0.5 md:gap-1 flex-shrink-0">${stars}</div>
            </div>
            <div class="comment-text bg-gray-50 md:bg-white p-3 md:p-4 rounded-lg border border-gray-100 md:border-gray-200 text-gray-700 text-xs md:text-base italic shadow-inner" style="word-wrap:break-word; white-space:pre-wrap;">"${op.comment}"</div>
            ${gallery}
        </div>`;

    container.querySelectorAll('.thumbnail').forEach(t => {
        t.onclick = () => openLightbox(op.media, parseInt(t.dataset.idx));
        if (window.innerWidth >= 768) {
            t.onmouseenter = () => { if(t.querySelector('.thumbnail-overlay')) t.querySelector('.thumbnail-overlay').style.opacity = '1'; };
            t.onmouseleave = () => { if(t.querySelector('.thumbnail-overlay')) t.querySelector('.thumbnail-overlay').style.opacity = '0'; };
        }
    });

    adjustArrowPosition();
}

function navigateOpinion(dir) {
    const container = document.getElementById('currentOpinionContainer');
    if (!container || opinionsData.length <= 1) return;

    container.style.opacity = '0';
    setTimeout(() => {
        currentOpinionIndex = (currentOpinionIndex + dir + opinionsData.length) % opinionsData.length;
        loadOpinion(currentOpinionIndex);
        container.style.opacity = '1';
    }, 300);
}

// --- NUEVA LÓGICA DE DESPLAZAMIENTO TÁCTIL (SWIPE) PARA OPINIONES ---
function initOpinionTouch() {
    const container = document.getElementById('currentOpinionContainer');
    if (!container) return;

    let startX = 0;
    let endX = 0;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        clearInterval(autoPlayInterval); // Pausa el carrusel al tocar
    }, {passive: true});

    container.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        // Si el deslizamiento es mayor a 50px
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                navigateOpinion(1); // Deslizar a la izquierda -> Siguiente
            } else {
                navigateOpinion(-1); // Deslizar a la derecha -> Anterior
            }
        }
        // Reiniciar el auto-play después de 1 minuto
        autoPlayInterval = setInterval(() => navigateOpinion(1), 60000);
    }, {passive: true});
}

// --- MANEJO DE ARCHIVOS ---
const fileInput = document.getElementById('fileInput');
if (fileInput) {
    fileInput.onchange = e => {
        const newFiles = Array.from(e.target.files);
        if (filesToUpload.length + newFiles.length > 3) {
            showMessage("Límite alcanzado: Máximo 3 archivos.", "error");
            e.target.value = '';
            return;
        }
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                const isVideo = file.type.startsWith('video');
                filesToUpload.push({ type: isVideo ? 'video' : 'image', url: ev.target.result });
                const prev = document.createElement('div');
                prev.className = 'aspect-square rounded bg-gray-100 overflow-hidden border relative group';
                prev.innerHTML = `
                    ${isVideo ? `<video src="${ev.target.result}" class="w-full h-full object-cover" muted></video>` : `<img src="${ev.target.result}" class="w-full h-full object-cover">`}
                    <button type="button" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center" onclick="this.parentElement.remove();">X</button>
                `;
                document.getElementById('filePreviewContainer').appendChild(prev);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = ''; 
    };
}

// --- ENVÍO DEL FORMULARIO ---
const opinionForm = document.getElementById('opinionForm');
if (opinionForm) {
    opinionForm.onsubmit = async e => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const nombre = document.getElementById('nombre').value;
        const comment = document.getElementById('comentario').value;
        const rating = parseInt(document.getElementById('rating').value);

        btn.disabled = true; 
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Publicando...';

        const newOp = {
            id: Date.now(),
            name: nombre,
            date: new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' }).toUpperCase(),
            rating: rating,
            comment: comment,
            hasGallery: filesToUpload.length > 0,
            media: [...filesToUpload]
        };

        if (db) {
            try {
                const path = `artifacts/${appId}/public/data/reviews`;
                await db.collection(path).add({ ...newOp, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            } catch (err) { console.error("Error al guardar:", err); }
        }

        userSubmittedOpinions.unshift(newOp);
        saveLocal();
        loadOpinion(0);
        opinionForm.classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        showMessage("¡Comentario publicado!");
    };
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    loadOpinion(0);
    initOpinionTouch(); // Activar soporte táctil
    
    const bind = (id, action) => {
        const el = document.getElementById(id);
        if (el) el.onclick = action;
    };

    bind('prevOpinionBtn', () => navigateOpinion(-1));
    bind('nextOpinionBtn', () => navigateOpinion(1));
    bind('lightboxClose', closeLightbox);
    bind('lightboxPrev', e => { e.stopPropagation(); navLightbox(-1); });
    bind('lightboxNext', e => { e.stopPropagation(); navLightbox(1); });
    bind('newOpinionBtn', () => location.reload());

    document.querySelectorAll('#starRatingSystem label').forEach((s, i) => {
        s.onclick = () => {
            const val = 5 - i;
            document.getElementById('rating').value = val;
            const labels = ["Malo", "Regular", "Bueno", "Muy Bueno", "Excelente"];
            document.getElementById('ratingText').textContent = `${labels[val-1]} (${val} estrellas)`;
        };
    });

    const commentArea = document.getElementById('comentario');
    if (commentArea) {
        commentArea.oninput = () => document.getElementById('charCount').textContent = commentArea.value.length;
    }

    autoPlayInterval = setInterval(() => navigateOpinion(1), 60000);
    window.addEventListener('resize', adjustArrowPosition);
});