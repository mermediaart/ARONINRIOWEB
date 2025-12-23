// Espera a que el DOM cargue
// Esto asegura que todo el HTML esté cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
  // --- Inicializar carrito ---
  // Carga el carrito desde localStorage si existe, o crea uno vacío con 4 categorías
  let cart = JSON.parse(localStorage.getItem("cart")) || {
    alojamientos: [],
    excursiones: [],
    traslados: [],
    ofertas: [],
  };

  // --- Referencias DOM del carrito ---
  // Guardamos referencias a los elementos importantes del carrito y modal
  const cartItemsElement = document.getElementById("cart-items"); // Lista de items
  const cartCountElement = document.getElementById("cart-count"); // Contador de items
  const cartTotalElement = document.getElementById("cart-total"); // Total carrito
  const cartIcon = document.getElementById("cart-icon"); // Botón abrir carrito
  const cartPanel = document.getElementById("cart-panel"); // Panel del carrito
  const clearBtn = document.getElementById("cart-clear"); // Botón vaciar carrito
  const sendBtn = document.getElementById("cart-send"); // Botón enviar carrito por WhatsApp
  const cartOverlay = document.getElementById("cart-overlay"); // Fondo semitransparente
  const cartClose = document.getElementById("cart-close"); // Botón cerrar carrito

  // --- Modal ---
  // Elementos del modal que se abre al hacer click en un producto
  const modal = document.getElementById("modal-options"); // Modal completo
  const modalTitle = document.getElementById("modal-title");
  const modalDescriptionElement = document.getElementById("modal-description");
  const modalOptionsContainer = document.querySelector(
    ".modal-options-container"
  );
  const modalPriceValue = document.getElementById("modal-price-value"); // Precio en modal
  const addToCartModalButton = document.getElementById("add-to-cart-modal"); // Botón agregar a carro
  const closeButton = document.querySelector(".close-button"); // Botón cerrar modal

  // --- Carrusel dentro de la modal ---
  const modalSlidesContainer = document.querySelector(
    ".modal-slides-container"
  );
  const prevSlideBtn = document.querySelector(".prev-slide");
  const nextSlideBtn = document.querySelector(".next-slide");

  // Variables globales del modal
  let currentSlide = 0;
  let imagesData = [];
  let currentItem = {};

  // --- Actualizar precio en modal según categoría y opciones ---
  function updateModalPrice() {
    let total = 0;
    if (
      currentItem.category === "traslados" ||
      (currentItem.category === "ofertas" &&
        currentItem.options &&
        Object.keys(currentItem.options).length > 0)
    ) {
      const quantitySelect = document.getElementById("modal-quantity");
      const selectedValue = quantitySelect.value;
      const quantity =
        selectedValue === "Más de 10" ? 11 : parseInt(selectedValue) || 1;
      total = currentItem.basePrice * quantity;
    } else if (currentItem.category === "alojamientos") {
      const nights = parseInt(currentItem.options.Noches) || 1;
      const people = parseInt(currentItem.options.Personas) || 1;
      total = nights * 50 + people * 120;
    } else {
      const quantityInput = document.getElementById("modal-quantity");
      const quantity = parseInt(quantityInput?.value) || 1;
      total = currentItem.basePrice * quantity;
    }
    modalPriceValue.textContent = total.toFixed(2);
  }

  // --- Actualizar vista del carrito ---
  function updateCartView() {
    if (!cartItemsElement || !cartCountElement || !cartTotalElement) return;
    cartItemsElement.innerHTML = "";
    let total = 0, // Total del carrito
      count = 0; // Contador de items

    // Recorre cada categoría
    function renderCategory(categoryName, items) {
      if (!items.length) return;

      const h3 = document.createElement("h3");
      h3.textContent = categoryName;
      cartItemsElement.appendChild(h3);

      items.forEach((item, index) => {
        const li = document.createElement("li");
        let itemTotal = item.price;
        let displayQuantity = item.quantity;

        // --- Modificación aquí ---
        if (item.category === "traslados" || item.category === "ofertas") {
          displayQuantity =
            item.options["Grupo de personas"] ||
            item.options["Cantidad de personas"] ||
            item.quantity ||
            1;
        } else if (item.category === "excursiones") {
          displayQuantity =
            item.options?.["Cantidad de personas"] || item.quantity || 1;
        }

        li.innerHTML = `
      <div class="cart-item-main">
        <h4 class="cart-item-title">${item.name}</h4>
        <span class="cart-item-price">R$${itemTotal.toFixed(2)}</span>
      </div>
    `;

        // Detalles extras
        if (item.options && Object.keys(item.options).length > 0) {
          const optionsList = document.createElement("ul");
          optionsList.classList.add("cart-item-details");

          if (item.category === "alojamientos") {
            const nights = item.options.Noches || 1;
            const people = item.options.Personas || 1;
            const optionItem = document.createElement("li");
            optionItem.textContent = `Noches: ${nights}  |  Personas: ${people}`;
            optionsList.appendChild(optionItem);
          } else if (
            item.category === "traslados" ||
            item.category === "ofertas" ||
            item.category === "excursiones"
          ) {
            const quantity =
              item.options["Grupo de personas"] ||
              item.options["Cantidad de personas"] ||
              item.quantity ||
              1;
            const optionItem = document.createElement("li");
            optionItem.textContent = `Cantidad: ${quantity}`;
            optionsList.appendChild(optionItem);
          }

          if (item.options?.Accesibilidad) {
            const optionItem = document.createElement("li");
            optionItem.textContent = `Accesibilidad: ${item.options.Accesibilidad}`;
            optionsList.appendChild(optionItem);
          }

          li.appendChild(optionsList);
        }

        // Botón eliminar
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-item-btn");
        removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        removeBtn.addEventListener("click", () => {
          items.splice(index, 1);
          saveCart();
        });
        li.appendChild(removeBtn);

        cartItemsElement.appendChild(li);
        count += 1; // Cada item agregado suma 1 al contador, sin importar personas Antes: count += displayQuantity;
        total += itemTotal;
      });
    }

    // Renderizar todas las categorías
    renderCategory("Alojamientos", cart.alojamientos);
    renderCategory("Excursiones", cart.excursiones);
    renderCategory("Traslados", cart.traslados);
    renderCategory("Ofertas", cart.ofertas);

    // Actualiza el contador de items en el carrito
    cartCountElement.textContent = count;
    cartTotalElement.textContent = total.toFixed(2);

    // actualizar el número junto al título "Tu carrito"
    const cartCountInline = document.getElementById("cart-count-inline");
    if (cartCountInline) cartCountInline.textContent = count;

    // --- Actualiza el contador de items en el carrito ---
    cartCountElement.textContent = count;
    cartTotalElement.textContent = total.toFixed(2);

    // --- Mostrar mensaje y botón si carrito vacío ---
    const allItems =
      cart.alojamientos.length +
      cart.excursiones.length +
      cart.traslados.length +
      cart.ofertas.length;
    if (allItems === 0) {
      // Texto "Aún no has agregado nada al carrito"
      const emptyText = document.createElement("p");
      emptyText.textContent = "Aún no has agregado nada al carrito.";
      emptyText.style.textAlign = "center";
      emptyText.style.marginTop = "1rem";
      cartItemsElement.appendChild(emptyText); // Ocultar botones enviar y vaciar
      sendBtn.style.display = "none";
      clearBtn.style.display = "none"; // Botón "Ver ofertas"
      if (!document.getElementById("cart-view-offers")) {
        const viewOffersBtn = document.createElement("button");
        viewOffersBtn.id = "cart-view-offers";
        viewOffersBtn.textContent = "Ver ofertas";
        viewOffersBtn.style.width = "100%";
        viewOffersBtn.style.padding = "0.8rem";
        viewOffersBtn.style.marginTop = "0.5rem";
        viewOffersBtn.style.borderRadius = "10px";
        viewOffersBtn.style.fontWeight = "bold";
        viewOffersBtn.style.cursor = "pointer";
        viewOffersBtn.style.background = "#06d849";
        viewOffersBtn.style.color = "#fff";

        viewOffersBtn.addEventListener("click", () => {
          // --- Cerrar carrito y overlay ---
          const cartPanel = document.getElementById("cart-panel");
          const cartOverlay = document.getElementById("cart-overlay");
          cartPanel.classList.remove("show");
          cartOverlay.classList.remove("active");

          // --- Ir a la sección de ofertas ---
          window.location.href = "principal.html#ofertas";
        });

        document.querySelector(".cart-footer").appendChild(viewOffersBtn);
      }
      return; // Salimos, no renderizamos más
    } else {
      // Si hay items, asegurarnos de mostrar botones y quitar "Ver ofertas"
      sendBtn.style.display = "block";
      clearBtn.style.display = "block";
      const existingBtn = document.getElementById("cart-view-offers");
      if (existingBtn) existingBtn.remove();
    }
  }

  // --- Guardar carrito ---
  function saveCart() {
    // Guarda el carrito en localStorage para que persista
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartView(); // Actualiza la vista

    // Abrir carrito automáticamente
    if (cartPanel && cartOverlay) {
      cartPanel.classList.add("show"); // Muestra panel
      cartOverlay.classList.add("active"); // Activa overlay
    }
  }

  // --- Agregar item al carrito ---
  function addToCart(name, price, category, options = {}, quantity = 1) {
    let finalPrice = price;
    // Calcula precio según categoría
    if (category === "alojamientos") {
      const nights = parseInt(options.Noches) || 1;
      const people = parseInt(options.Personas) || 1;
      finalPrice = nights * 50 + people * 120;
    } else if (
      category === "traslados" ||
      (category === "ofertas" && options["Cantidad de personas"])
    ) {
      if (
        options["Grupo de personas"] === "Más de 10" ||
        options["Cantidad de personas"] === "Más de 10"
      )
        quantity = 11;
      else
        quantity =
          parseInt(
            options["Grupo de personas"] || options["Cantidad de personas"]
          ) || 1;
      finalPrice = price * quantity;
    }

    // Verifica si el item ya existe con las mismas opciones
    const itemFound = cart[category].find(
      (item) =>
        item.name === name &&
        JSON.stringify(item.options) === JSON.stringify(options)
    );
    if (itemFound) {
      // Si existe, suma cantidad y precio
      itemFound.quantity += quantity;
      itemFound.price += finalPrice;
    } else {
      // Si no existe, agrega un nuevo item
      cart[category].push({
        name,
        price: finalPrice,
        category,
        quantity,
        options,
      });
    }

    saveCart(); // Guarda cambios
  }

  // --- Función abrir modal ---
  function openModal(cardData) {
    // Rellena modal con datos del producto
    modalTitle.textContent = cardData.name;
    modalDescriptionElement.textContent = cardData.description;
    modalOptionsContainer.innerHTML = "";

    currentItem = {
      name: cardData.name,
      basePrice: cardData.price,
      category: cardData.category,
      options: JSON.parse(cardData.options) || {},
    };

    // Carrusel de imágenes
    imagesData = JSON.parse(cardData.images);
    modalSlidesContainer.innerHTML = "";
    imagesData.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      modalSlidesContainer.appendChild(img);
    });
    currentSlide = 0;
    updateCarousel();

    const hasOptions = cardData.options && cardData.options.length > 0;

    // Generar inputs/selects según categoría
    if (cardData.category === "alojamientos") {
      const options = JSON.parse(cardData.options);
      options.forEach((optionGroup) => {
        for (const key in optionGroup) {
          const label = document.createElement("label");
          label.textContent = key + ":";
          const select = document.createElement("select");
          select.id = `option-${key.toLowerCase()}`;
          optionGroup[key].forEach((optionValue) => {
            const option = document.createElement("option");
            option.value = optionValue;
            option.textContent = optionValue;
            select.appendChild(option);
          });
          currentItem.options[key] = select.value;
          select.addEventListener("change", (e) => {
            currentItem.options[key] = e.target.value;
            updateModalPrice();
          });
          modalOptionsContainer.appendChild(label);
          modalOptionsContainer.appendChild(select);
        }
      });
    } else if (
      cardData.category === "traslados" ||
      (cardData.category === "ofertas" && hasOptions)
    ) {
      // Para traslados u ofertas con opciones
      const options = JSON.parse(cardData.options);
      const key = Object.keys(options[0])[0];
      const values = options[0][key];

      const label = document.createElement("label");
      label.textContent = key + ":";

      const select = document.createElement("select");
      select.id = "modal-quantity";

      values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });

      select.addEventListener("change", updateModalPrice);
      modalOptionsContainer.appendChild(label);
      modalOptionsContainer.appendChild(select);
    } else {
      // Para otros productos simples
      const quantityLabel = document.createElement("label");
      quantityLabel.textContent = "Cantidad:";

      const quantityInput = document.createElement("input");
      quantityInput.type = "number";
      quantityInput.id = "modal-quantity";
      quantityInput.value = "1";
      quantityInput.min = "1";
      quantityInput.style.width = "80px";
      quantityInput.style.padding = "5px";
      quantityInput.addEventListener("input", updateModalPrice);

      modalOptionsContainer.appendChild(quantityLabel);
      modalOptionsContainer.appendChild(quantityInput);
    }

    updateModalPrice(); // Calcula precio inicial
    modal.classList.add("show"); // Muestra modal

    // Checkbox de accesibilidad

    const accessibilityContainer = document.createElement("div"); // contenedor para radios
    accessibilityContainer.style.display = "flex"; // pone los elementos en fila
    accessibilityContainer.style.gap = "10px"; // separa Sí y No
    accessibilityContainer.style.alignItems = "center"; // centra verticalmente

    const accessibilityLabel = document.createElement("span");
    accessibilityLabel.innerHTML =
      "¿Requiere accesibilidad especial?<br> (ej: movilidad reducida, lesión temporal, etc.)";
    accessibilityLabel.style.marginRight = "10px"; // separa texto del radio
    accessibilityLabel.style.display = "inline-block";
    accessibilityLabel.style.lineHeight = "1.2"; // ajusta separación entre líneas

    // Radio Sí
    const accessibilityYes = document.createElement("input");
    accessibilityYes.type = "radio";
    accessibilityYes.name = "accessibility";
    accessibilityYes.value = "Sí";
    accessibilityYes.required = true;

    const labelYes = document.createElement("label");
    labelYes.textContent = "Sí";
    labelYes.style.marginRight = "10px"; // separa de siguiente radio
    labelYes.prepend(accessibilityYes); // mete el input dentro del label

    // Radio No
    const accessibilityNo = document.createElement("input");
    accessibilityNo.type = "radio";
    accessibilityNo.name = "accessibility";
    accessibilityNo.value = "No";
    accessibilityNo.required = true;

    const labelNo = document.createElement("label");
    labelNo.textContent = "No";
    labelNo.prepend(accessibilityNo);

    // Agregar al contenedor
    accessibilityContainer.appendChild(accessibilityLabel);
    accessibilityContainer.appendChild(labelYes);
    accessibilityContainer.appendChild(labelNo);

    // Agregar contenedor al modal
    modalOptionsContainer.appendChild(accessibilityContainer);

    // Inicializamos opción por defecto
    currentItem.options["Accesibilidad"] = "No";

    // Actualizamos al cambiar
    [accessibilityYes, accessibilityNo].forEach((radio) =>
      radio.addEventListener("change", (e) => {
        currentItem.options["Accesibilidad"] = e.target.value;
      })
    );
  }

  // --- Carrusel de imágenes ---
  function updateCarousel() {
    modalSlidesContainer.style.transform = `translateX(${
      -currentSlide * 100
    }%)`; // Desplaza imágenes horizontalmente
  }
  prevSlideBtn.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + imagesData.length) % imagesData.length;
    updateCarousel();
  });
  nextSlideBtn.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % imagesData.length;
    updateCarousel();
  });
  // Cerrar modal
  closeButton.addEventListener("click", () => {
    modal.classList.remove("show");
  });
  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("show");
  });

  // Abrir modal al click en tarjeta
  document.querySelectorAll(".card").forEach((card) =>
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "A") return;
      const cardData = {
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        options: card.dataset.options,
        images: card.dataset.images,
        category: card.dataset.category,
        description: card.dataset.description,
      };
      openModal(cardData);
    })
  );

  // Agregar al carrito desde modal
  addToCartModalButton.addEventListener("click", () => {
    let quantity = 1,
      selectedOptions = {};

    // --- Validación de filtros ---
    if (currentItem.category === "alojamientos") {
      // Recorremos las opciones
      for (const key in currentItem.options) {
        if (!currentItem.options[key]) {
          alert(
            `Por favor selecciona una opción para "${key}" antes de agregar al carrito.`
          );
          return; // sale de la función
        }
        selectedOptions[key] = currentItem.options[key];
      }
    } else if (
      currentItem.category === "traslados" ||
      (currentItem.category === "ofertas" && currentItem.options?.length > 0)
    ) {
      const selectElement = document.getElementById("modal-quantity");
      if (!selectElement || !selectElement.value) {
        alert("Por favor selecciona la cantidad antes de agregar al carrito.");
        return;
      }
      const optionKey = Object.keys(currentItem.options[0])[0];
      selectedOptions[optionKey] = selectElement.value;
    } else {
      const inputElement = document.getElementById("modal-quantity");
      if (!inputElement || inputElement.value < 1) {
        alert(
          "Por favor ingresa una cantidad válida antes de agregar al carrito."
        );
        return;
      }
      quantity = parseInt(inputElement.value);
    }

    // --- Validación de accesibilidad ---
    const accessibilityRadios = document.getElementsByName("accessibility");
    const selectedAccessibility = Array.from(accessibilityRadios).find(
      (radio) => radio.checked
    );
    if (!selectedAccessibility) {
      alert(
        "Por favor selecciona si requiere accesibilidad antes de agregar al carrito."
      );
      return;
    }
    selectedOptions["Accesibilidad"] = selectedAccessibility.value;

    // --- Agregar al carrito ---
    addToCart(
      currentItem.name,
      currentItem.basePrice,
      currentItem.category,
      selectedOptions,
      quantity
    );

    modal.classList.remove("show"); // Cierra modal
  });

  // --- Función cerrar carrito ---
  function closeCart() {
    cartPanel.classList.remove("show"); // Oculta panel
    cartOverlay.classList.remove("active"); // Desactiva overlay
  }
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // --- Función abrir carrito ----
  if (cartIcon && cartPanel)
    cartIcon.addEventListener("click", () => {
      cartPanel.classList.add("show"); // Muestra el panel
      cartOverlay.classList.add("active"); // Activa overlay
    });
  // --- Vaciar carrito ---
  if (clearBtn)
    clearBtn.addEventListener("click", () => {
      cart = { alojamientos: [], excursiones: [], traslados: [], ofertas: [] };
      saveCart();
    });

  /// --- Enviar carrito por WhatsApp ---
  if (sendBtn)
    sendBtn.addEventListener("click", () => {
      const phones = [
        "5491128180954",
        "5491156213704",
        "5491136649747",
        "5491140791494",
      ];
      let currentPhoneIndex =
        parseInt(localStorage.getItem("currentPhoneIndex")) || 0;
      const selectedPhone = phones[currentPhoneIndex];
      currentPhoneIndex = (currentPhoneIndex + 1) % phones.length;
      localStorage.setItem("currentPhoneIndex", currentPhoneIndex);

      // Número de pedido aleatorio
      const orderNumber = Math.floor(Math.random() * 10);

      let message = ` *¡Nuevo pedido!*  \n*N° de pedido:* ${orderNumber}\n\n`;

      function buildMessage(categoryName, items) {
        if (items.length === 0) return;

        switch (categoryName) {
          case "Alojamientos":
            message += " *Alojamiento*\n";
            items.forEach((item) => {
              const nights = item.options?.Noches || 1;
              const people = item.options?.Personas || 1;
              message += `• _${
                item.name
              }_\n• _${people} personas – ${nights} noches_\n *$${item.price.toFixed(
                2
              )} REALES*\n\n`;
            });
            break;

          case "Traslados":
            message += " *Traslados*\n";
            items.forEach((item) => {
              const quantity =
                item.options?.["Grupo de personas"] ||
                item.options?.["Cantidad de personas"] ||
                1;
              message += `• _${
                item.name
              }_\n• _${quantity} personas_\n *$${item.price.toFixed(
                2
              )} REALES*\n\n`;
            });
            break;

          case "Excursiones":
          case "Ofertas":
            message += " *Excursiones / Actividades*\n";
            items.forEach((item) => {
              const quantity = item.quantity || 1;
              message += `• _${
                item.name
              }_\n• _${quantity} personas_\n *$${item.price.toFixed(
                2
              )} REALES*\n\n`;
            });
            break;
        }
      }

      ["Alojamientos", "Traslados", "Excursiones", "Ofertas"].forEach((cat) =>
        buildMessage(cat, cart[cat.toLowerCase()])
      );

      // Agregamos sección de accesibilidad según cada item
      ["Alojamientos", "Traslados", "Excursiones", "Ofertas"].forEach((cat) => {
        cart[cat.toLowerCase()].forEach((item) => {
          if (item.options?.Accesibilidad) {
            message += `• _${item.name}_ - Accesibilidad especial: ${item.options.Accesibilidad}\n`;
          }
        });
      });
      message += "\n";

      // Total
      const total = (
        cart.alojamientos.reduce((s, i) => s + i.price, 0) +
        cart.excursiones.reduce((s, i) => s + i.price, 0) +
        cart.traslados.reduce((s, i) => s + i.price, 0) +
        cart.ofertas.reduce((s, i) => s + i.price, 0)
      ).toFixed(2);
      message += `*Total a pagar: $${total} REALES*`;

      // Abrir WhatsApp
      window.open(
        `https://wa.me/${selectedPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    });

  // Inicializar vista al cargar la página
  updateCartView(); // Muestra items guardados al cargar la página

  // --- Exponer función global ---
  window.addToCart = addToCart; // Permite agregar items desde otras funciones
});
