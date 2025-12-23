// ----------------------
// PANEL ADMINISTRADOR AARON
// ----------------------

let isEditor = false; // estado de edición
const adminBtn = document.getElementById("admin-btn");
const logoutBtn = document.getElementById("logout-admin");

// Render inicial de reseñas
renderReviews();

// --- BOTÓN EDITOR ---
adminBtn.addEventListener("click", () => {
  const inputPass = prompt("Ingrese la contraseña de Asesor:");
  if (inputPass === "1234") {
    isEditor = true;
    adminBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    alert("Modo Editor activado. Ya puedes editar o eliminar reseñas.");
    renderReviews();
  } else {
    alert("Contraseña incorrecta.");
  }
});

// --- BOTÓN CERRAR EDITOR ---
logoutBtn.addEventListener("click", () => {
  isEditor = false;
  logoutBtn.style.display = "none";
  adminBtn.style.display = "inline-block";
  alert("Modo Editor desactivado.");
  renderReviews();
});

// ----------------------
// RENDERIZAR RESEÑAS
// ----------------------
function renderReviews() {
  const reviewList = document.getElementById("review-list");
  if (!reviewList) return;

  reviewList.innerHTML = "";
  const reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  reviews.forEach((rev, index) => {
    const div = document.createElement("div");
    div.classList.add("review-card");

    div.innerHTML = `
      <strong>${rev.name}</strong> - ${rev.rating} ⭐<br>
      <p class="location">${rev.location || ""}</p>
      <p class="comment">${rev.comment}</p>
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
        isEditor
          ? `<br>
             <button class="edit-btn" data-index="${index}">Editar</button>
             <button class="delete-btn" data-index="${index}">Eliminar</button>`
          : ""
      }
    `;
    reviewList.appendChild(div);
  });

  // Activar botones si es editor
  if (isEditor) {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        editReview(index);
      });
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index);
        deleteReview(index);
      });
    });
  }
}

// ----------------------
// ELIMINAR RESEÑA
// ----------------------
function deleteReview(index) {
  if (!confirm("¿Seguro deseas eliminar esta reseña?")) return;
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.splice(index, 1);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  renderReviews();
}

// ----------------------
// EDITAR RESEÑA
// ----------------------
function editReview(index) {
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  const review = reviews[index];
  const newComment = prompt("Editar comentario:", review.comment);
  const newRating = prompt("Editar calificación (1-5):", review.rating);

  if (newComment !== null) review.comment = newComment;
  if (newRating !== null && !isNaN(newRating))
    review.rating = parseInt(newRating);

  reviews[index] = review;
  localStorage.setItem("reviews", JSON.stringify(reviews));
  renderReviews();
}
// ----------------------
// ACCESO OCULTO AL PANEL DE ADMINISTRADOR
// ----------------------
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
    const pass = prompt("Ingrese la contraseña de administrador:");
    if (pass === "Aaron") {
      alert("Acceso concedido. Redirigiendo al panel de administrador...");
      window.location.href = "administradoraAaron.html";
    } else {
      alert("Contraseña incorrecta.");
    }
  }
});
