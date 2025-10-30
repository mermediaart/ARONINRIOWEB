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
const menuItems = menu.querySelectorAll("a"); // todos los <a> dentro del menú
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    menu.classList.remove("active");
    menuBtn.classList.remove("open");
  });
});

// Array de teléfonos
const whatsappPhones = [
  "5491128180954",
  "5491156213704",
  "5491136649747",
  "5491140791494",
];

// Guardar índice actual en localStorage para que persista entre recargas
let currentPhoneIndex =
  parseInt(localStorage.getItem("currentPhoneIndex")) || 0;

// Mensaje predeterminado
const defaultMessage =
  "Hola! Estuve mirando la web y quería consultar sobre...";

// Asignar el link al botón
const whatsappButton = document.getElementById("whatsappButton");
whatsappButton.addEventListener("click", (e) => {
  e.preventDefault(); // evita href genérico

  // Tomar el teléfono actual
  const phone = whatsappPhones[currentPhoneIndex];

  // Abrir WhatsApp con mensaje
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(
    defaultMessage
  )}`;
  window.open(url, "_blank");

  // Incrementar índice para la próxima vez
  currentPhoneIndex = (currentPhoneIndex + 1) % whatsappPhones.length;
  localStorage.setItem("currentPhoneIndex", currentPhoneIndex);
});

// --- Globito de WhatsApp flotante ---
setTimeout(() => {
  const bubble = document.getElementById("whatsappBubble");
  bubble.style.display = "block";
  bubble.style.animation = "fadeInUp 0.6s ease forwards";

  setTimeout(() => {
    bubble.style.animation = "fadeOutUp 0.6s ease forwards";
    setTimeout(() => {
      bubble.style.display = "none";
    }, 600);
  }, 10000);
}, 6000);

/*---------------------------------------------------
CARRUSEL INICIO
---------------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
  // --- CÓDIGO DEL CARRUSEL ---
  const slides = document.querySelectorAll(".carousel-slide"); // todas las diapositivas
  const dots = document.querySelectorAll(".carousel-dot"); // todos los puntos indicadores
  const prevBtn = document.querySelector(".prev"); // botón anterior
  const nextBtn = document.querySelector(".next"); // botón siguiente
  let currentIndex = 0; // Índice actual del slide que se muestra
  let interval; // Variable para guardar el intervalo del auto-slide

  // --- Función que muestra un slide específico según su índice ---
  function showSlide(index) {
    // Recorre todos los slides y activa solo el que coincide con el índice recibido
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
      // También actualiza los "puntos" (indicadores de navegación)
      dots[i].classList.toggle("active", i === index);
    });
    // Actualiza el índice actual
    currentIndex = index;
  }

  // --- Función que muestra el siguiente slide ---
  function nextSlide() {
    // Calcula el índice del siguiente slide, vuelve al primero si está en el último
    showSlide((currentIndex + 1) % slides.length);
  }

  // --- Función que muestra el slide anterior ---
  function prevSlide() {
    // Calcula el índice del slide anterior, vuelve al último si está en el primero
    showSlide((currentIndex - 1 + slides.length) % slides.length);
  }

  // --- Eventos para los botones de navegación ---
  nextBtn.addEventListener("click", nextSlide); // Botón "siguiente"
  prevBtn.addEventListener("click", prevSlide); // Botón "anterior"

  // --- Eventos para los puntos de navegación (dots) ---
  dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));

  // --- Función para iniciar el auto-slide (cambio automático cada 5 segundos) ---
  function startAutoSlide() {
    interval = setInterval(nextSlide, 5000);
  }

  // --- Función para detener el auto-slide ---
  function stopAutoSlide() {
    clearInterval(interval);
  }

  // --- Pausa el auto-slide cuando el usuario pasa el mouse sobre el carrusel ---
  document
    .querySelector(".hero-carousel")
    .addEventListener("mouseenter", stopAutoSlide);

  // --- Reanuda el auto-slide cuando el usuario saca el mouse del carrusel ---
  document
    .querySelector(".hero-carousel")
    .addEventListener("mouseleave", startAutoSlide);

  // --- Inicializa el carrusel ---
  showSlide(currentIndex); // Muestra el primer slide
  startAutoSlide(); // Inicia el auto-slide automático

  // ---------------------------------------------------------------
  // CARGA DE ARCHIVOS EN OPINIONES
  // ---------------------------------------------------------------

  // Referencia al input de archivos y al contenedor de lista
  const fileInput = document.getElementById("files");
  const fileList = document.getElementById("file-list");

  // Evento cuando se seleccionan archivos
  fileInput.addEventListener("change", (event) => {
    // Obtiene la lista de archivos seleccionados
    const files = event.target.files;

    // Recorre cada archivo seleccionado
    for (const file of files) {
      // Crea un <li> para mostrar el archivo
      const listItem = document.createElement("li");
      listItem.classList.add("file-list-item");

      // Crea un <span> con el nombre del archivo
      const fileNameSpan = document.createElement("span");
      fileNameSpan.textContent = file.name;
      fileNameSpan.classList.add("file-name");

      // Crea un botón para eliminar el archivo de la lista
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "×"; // Símbolo de "cerrar"
      deleteButton.classList.add("delete-file-btn");

      // Evento para eliminar el archivo de la lista al hacer clic
      deleteButton.addEventListener("click", () => {
        listItem.remove();
      });

      // Inserta el nombre del archivo y el botón en el <li>
      listItem.appendChild(fileNameSpan);
      listItem.appendChild(deleteButton);

      // Agrega el <li> al contenedor de la lista
      fileList.appendChild(listItem);
    }
  });
});

/*
  ACCESO OCULTO A ADMIN
  Atajo: Ctrl + Shift + A
  Al ingresar la contraseña correcta guarda isAdmin=true en localStorage
  y redirige a admin.html
*/
document.addEventListener("keydown", (e) => {
  // detecta Ctrl + Shift + A (A o a)
  if (e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === "a") {
    // evita que se active cuando el usuario está escribiendo en un input/textarea
    const active = document.activeElement;
    const typingTags = ["INPUT", "TEXTAREA"];
    if (active && typingTags.includes(active.tagName)) return;

    const pass = prompt("Acceso administrador — ingrese la contraseña:");
    // Cambiá la contraseña aquí por una más segura antes de publicar
    const ADMIN_PASS = "Aaron";
    if (pass === ADMIN_PASS) {
      localStorage.setItem("isAdmin", "true");
      // Aviso (opcional) y redirección al panel
      alert("Acceso correcto. Redirigiendo al panel de administración...");
      window.location.href = "administradorAaron.html";
    } else {
      alert("Contraseña incorrecta.");
    }
  }
});
