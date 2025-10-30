// ----------------------
// COMENTARIOS YA ALMACENADOS
// ----------------------
const defaultReviews = [
  {
    name: "Luis Casillas",
    email: "",
    rating: 5,
    location: "Rosario, Argentina",
    comment:
      "Una experiencia increíble. Todo organizado con detalle, sin preocupaciones.",
    files: [
      "Img/Clientesfelices.mp4",
      "Img/clientes/clientes-1.jpg",
      "Img/clientes/clientes-2.jpeg",
    ],
  },
  {
    name: "María González",
    email: "",
    rating: 5,
    location: "Córdoba, Argentina",
    comment:
      "Gracias a Aaron Travel vivimos las mejores vacaciones. ¡Volveríamos sin dudarlo!",
    files: [
      "Img/Clientesfelices2.mp4",
      "Img/clientes/clientes-3.jpeg",
      "Img/clientes/clientes-4.jpeg",
    ],
  },
  {
    name: "Mariana Pérez",
    email: "",
    rating: 5,
    location: "Entre Ríos, Argentina",
    comment:
      "Hermosa atención, nos ayudaron a resolver problemas con traslados. 100% recomendado.",
    files: [
      "Img/Clientesfelices4.mp4",
      "Img/clientes/clientes-5.jpeg",
      "Img/clientes/clientes-6.jpeg",
    ],
  },
  {
    name: "Eliana Trujillo",
    email: "",
    rating: 5,
    location: "Buenos Aires, Argentina",
    comment:
      "Gracias a Aaron Travel, súper felices y conformes con el viaje, salió todo como esperábamos.",
    files: [
      "Img/Clientesfelices3.mp4",
      "Img/clientes/clientes-7.jpeg",
      "Img/clientes/clientes-8.jpeg",
    ],
  },
];
// 💣 Reinicia el localStorage con los nuevos defaultReviews
localStorage.setItem("reviews", JSON.stringify(defaultReviews));
let reviews = defaultReviews;

/*------------------------------------------------- 
ENVIAR RESEÑA Y ADMINISTRARLA
-------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  // ----------------------
  // ENVÍO DE RESEÑA
  // ----------------------
  const form = document.getElementById("review-form");
  const reviewList = document.getElementById("review-list");
  const adminBtn = document.getElementById("admin-btn");
  let isAdmin = false;
  const adminPass = "1234"; // Cambiar por contraseña segura

  // Función para renderizar reseñas en lista de admin
  function renderReviews() {
    if (!reviewList) return;

    reviewList.innerHTML = "";
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];

    reviews.forEach((rev, index) => {
      const div = document.createElement("div");
      div.classList.add("review-card");
      div.innerHTML = `
        <strong>${rev.name}</strong> - ${rev.rating} ⭐<br>
        ${rev.comment}<br>
        ${
          rev.files
            ? rev.files
                .map(
                  (f) =>
                    `<img src="${f}" alt="Archivo" style="max-width:100px;margin:5px;">`
                )
                .join(" ")
            : ""
        }
        ${
          isAdmin
            ? `<br><button class="delete-btn" data-index="${index}">Eliminar</button>`
            : ""
        }
      `;
      reviewList.appendChild(div);
    });

    if (isAdmin) {
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const index = parseInt(btn.dataset.index);
          deleteReview(index);
        });
      });
    }
  }

  function deleteReview(index) {
    if (!confirm("¿Estás seguro que quieres eliminar este comentario?")) return;
    let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.splice(index, 1);
    localStorage.setItem("reviews", JSON.stringify(reviews));
    renderReviews();
  }

  // ----------------------
  // ENVÍO DE FORMULARIO
  // ----------------------
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

      const name = form.name.value;
      const email = form.email.value;
      const location = form.locacion.value;
      const rating = form.rating.value;
      const comment = form.comment.value;

      const filesInput = form.files.files;
      const filesArray = [];

      for (let i = 0; i < filesInput.length; i++) {
        const reader = new FileReader();
        reader.onload = function (event) {
          filesArray.push(event.target.result);
          if (filesArray.length === filesInput.length) saveReview();
        };
        reader.readAsDataURL(filesInput[i]);
      }

      if (filesInput.length === 0) saveReview();

      function saveReview() {
        const review = {
          name,
          email,
          rating,
          comment,
          location,
          files: filesArray,
        };
        reviews.push(review);
        localStorage.setItem("reviews", JSON.stringify(reviews));
        form.reset();

        // 🧹 Limpia el listado visual de archivos
        const fileListContainer = document.getElementById("file-list");
        if (fileListContainer) fileListContainer.innerHTML = "";

        // Limpia el input de archivos manualmente (en algunos navegadores persiste)
        const fileInput = document.getElementById("files");
        if (fileInput) fileInput.value = "";

        // Mensaje visual de éxito
        alert("¡Gracias por tu comentario! Te esperamos para tu próximo viaje");

        // Re-renderiza el contenido actualizado
        renderReviews();
        addReviewToCarousel(review);
        initCarousel();
      }
    });
  }

  // ----------------------
  // AÑADIR REVIEW AL CARRUSEL
  // ----------------------
  function addReviewToCarousel(review) {
    const carousel = document.querySelector(".opiniones-carousel");
    if (!carousel) return;

    const slide = document.createElement("div");
    slide.classList.add("opinion-slide");

    let mediaContent = "";
    if (review.files && review.files.length > 0) {
      mediaContent += `<div class="media-gallery">`;

      review.files.forEach((file, i) => {
        const isVideo = file.startsWith("data:video") || file.endsWith(".mp4");
        const displayStyle = i === 0 ? "flex" : "none"; // solo muestra la primera

        if (isVideo) {
          mediaContent += `
          <div class="media-item" style="display:${displayStyle}">
            <video muted playsinline>
              <source src="${file}" type="video/mp4">
            </video>
          </div>`;
        } else {
          mediaContent += `
          <div class="media-item" style="display:${displayStyle}">
            <img src="${file}" alt="Archivo ${i + 1}">
          </div>`;
        }
      });

      mediaContent += `
      ${
        review.files.length > 1
          ? `<div class="gallery-indicator">+${review.files.length - 1}</div>`
          : ""
      }
    </div>`;
    }

    slide.innerHTML = `
    <div class="opinion-content">
      <div class="opinion-left">
        <h3>${review.name}</h3>
        <p class="stars">${"⭐".repeat(review.rating)}</p>
        <p class="location">${review.location}</p>
        <p class="comment">“${review.comment}”</p>
      </div>
      <div class="opinion-right">
        ${mediaContent || ""}
      </div>
    </div>
  `;

    const opinionContentDiv = slide.querySelector(".opinion-content");
    if (!review.files || review.files.length === 0) {
      opinionContentDiv.classList.add("no-media");
    }

    const prevBtn = document.querySelector(".prev-btn");
    carousel.insertBefore(slide, prevBtn);
  }

  // ----------------------
  // RENDERIZAR CARRUSEL DESDE LOCALSTORAGE
  // ----------------------
  function renderCarouselFromLocalStorage() {
    const carousel = document.querySelector(".opiniones-carousel");
    if (!carousel) return;

    carousel.querySelectorAll(".opinion-slide").forEach((s) => s.remove());

    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.forEach((rev) => addReviewToCarousel(rev));
  }

  // ----------------------
  // FUNCIONES DEL CARRUSEL
  // ----------------------
  function initCarousel() {
    const slides = document.querySelectorAll(".opinion-slide");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    let index = 0;

    function showSlide(i) {
      slides.forEach((slide) => {
        slide.classList.remove("active");
        const video = slide.querySelector("video");
        if (video) video.pause();
      });

      slides[i].classList.add("active");
      const activeVideo = slides[i].querySelector("video");
      if (activeVideo) activeVideo.play();
    }

    prevBtn.addEventListener("click", () => {
      index = index === 0 ? slides.length - 1 : index - 1;
      showSlide(index);
    });

    nextBtn.addEventListener("click", () => {
      index = index === slides.length - 1 ? 0 : index + 1;
      showSlide(index);
    });

    if (slides.length > 0) showSlide(index);
  }

  // Renderizar carrusel con todo lo que haya en localStorage
  renderCarouselFromLocalStorage();
  initCarousel();
});

// --- LIGHTBOX ---
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.querySelector(".lightbox-content");
const closeLightbox = document.querySelector(".lightbox .close");
const prevBtn = document.querySelector(".lightbox-prev");
const nextBtn = document.querySelector(".lightbox-next");

let mediaItems = []; // galería actual
let currentIndex = 0;

document.addEventListener("click", (e) => {
  // Abrir lightbox
  if (e.target.matches(".opinion-right img, .opinion-right video")) {
    const gallery = [
      ...e.target.closest(".opinion-right").querySelectorAll("img, video"),
    ];
    mediaItems = gallery;
    currentIndex = gallery.indexOf(e.target);
    showMedia(currentIndex);
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // evita scroll de fondo
  }
});

function showMedia(index) {
  const item = mediaItems[index];
  if (!item) return;

  const clone = item.cloneNode(true);
  clone.removeAttribute("style");
  if (clone.tagName === "VIDEO") {
    clone.controls = true;
    clone.muted = false;
    clone.play();
  }
  lightboxContent.innerHTML = "";
  lightboxContent.appendChild(clone);
}

function closeLb() {
  lightbox.classList.remove("active");
  lightboxContent.innerHTML = "";
  mediaItems = [];
  currentIndex = 0;
  document.body.style.overflow = ""; // vuelve el scroll
}

closeLightbox.addEventListener("click", closeLb);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLb();
});

// Navegación
prevBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
  showMedia(currentIndex);
});

nextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % mediaItems.length;
  showMedia(currentIndex);
});

// Teclado
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;
  if (e.key === "ArrowRight") nextBtn.click();
  if (e.key === "ArrowLeft") prevBtn.click();
  if (e.key === "Escape") closeLb();
});
