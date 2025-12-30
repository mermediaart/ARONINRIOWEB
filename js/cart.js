/*-------------------------------------------------------------------
  ARCHIVO: js/cart.js
-------------------------------------------------------------------*/

/* 1. CONFIGURACIÓN DE PROMOCIONES */
const CONFIG_PROMOS = {
  // CONFIGURACIÓN DE PAQUETES
  "Paquete Buzios": { 
    inicio: "2026-03-01", 
    fin: "2026-03-08",
    precioDolar: 799,   // Precio unitario en USD
    fixedUSD: true      // ACTIVA EL MODO DÓLAR
  },
  "Traslado Privado + City Tour":{ 
    inicio: "2026-04-06", 
    fin: "2026-04-15",
    precioDolar: 900,
    fixedUSD: true 
  }
};

/* 2. ESTILOS DINÁMICOS */
const style = document.createElement('style');
style.innerHTML = `
  .flatpickr-day.promo-day { background: rgba(51, 228, 225, 0.2) !important; border: 1px solid #33e4e1 !important; color: #008f8c !important; font-weight: bold; }
  .flatpickr-day.promo-day:hover { background: #33e4e1 !important; color: white !important; }
  .flatpickr-day.selected.startRange, .flatpickr-day.selected.endRange, .flatpickr-day.selected { background: #33e4e1 !important; border-color: #33e4e1 !important; }
  .flatpickr-calendar.static { margin-top: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); z-index: 99999 !important; }
  
  /* ESTILOS MODO DÓLAR */
  .fixed-date-display { background: #f0f8ff; border: 1px solid #cce7ff; padding: 10px; border-radius: 5px; margin-bottom: 10px; color: #0056b3; font-weight: bold; text-align: center; }
  .fixed-date-label { display: block; font-size: 0.8em; color: #666; font-weight: normal; }
  .usd-price-tag { color: #28a745; font-weight: bold; font-size: 1.2em; display: block; margin-top: 5px;}
`;
document.head.appendChild(style);

/* 3. LÓGICA PRINCIPAL */
window.UIController = {
  lockScroll: function () { 
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important'); 
  },
  unlockScroll: function () { 
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
  }
};

document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || { alojamientos: [], excursiones: [], traslados: [], ofertas: [] };

  // Referencias DOM
  const cartItemsElement = document.getElementById("cart-items");
  const cartCountElement = document.getElementById("cart-count");
  const cartTotalElement = document.getElementById("cart-total");
  const cartIcon = document.getElementById("cart-icon");
  const cartPanel = document.getElementById("cart-panel");
  const clearBtn = document.getElementById("cart-clear");
  const sendBtn = document.getElementById("cart-send");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartClose = document.getElementById("cart-close");

  // Referencias Modal
  const modal = document.getElementById("modal-options");
  const modalTitle = document.getElementById("modal-title");
  const modalDescriptionElement = document.getElementById("modal-description");
  const modalOptionsContainer = document.querySelector(".modal-options-container");
  const modalPriceValue = document.getElementById("modal-price-value");
  const addToCartModalButton = document.getElementById("add-to-cart-modal");
  const closeButton = document.querySelector(".close-button");
  const modalSlidesContainer = document.querySelector(".modal-slides-container");
  const prevSlideBtn = document.querySelector(".prev-slide");
  const nextSlideBtn = document.querySelector(".next-slide");

  let currentSlide = 0;
  let imagesData = [];
  let currentItem = {};
  let fpInstanceIn = null;
  let fpInstanceOut = null;

  // --- Helpers ---
  function calculateNights(dateInStr, dateOutStr) {
    if (!dateInStr || !dateOutStr) return 1;
    const d1 = new Date(dateInStr);
    const d2 = new Date(dateOutStr);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }

  function createSelect(labelText, id, min, max, initialValue = 1) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("input-group");
    const label = document.createElement("label");
    label.textContent = labelText;
    const select = document.createElement("select");
    select.id = id;
    for (let i = min; i <= max; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      if (i === initialValue) option.selected = true;
      select.appendChild(option);
    }
    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return { wrapper, select };
  }

  function createDateInput(labelText, id) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("input-group");
    const label = document.createElement("label");
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "text"; 
    input.id = id;
    input.placeholder = "Seleccionar fecha...";
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }

  // --- PRECIOS MODAL ---
  function updateModalPrice() {
    const priceContainer = document.querySelector(".modal-price-info");
    if (!priceContainer) return;

    const promoConfig = CONFIG_PROMOS[currentItem.name];

    // --- CASO 1: PAQUETE FIJO EN DÓLARES ---
    if (promoConfig && promoConfig.fixedUSD) {
        const peopleSelect = document.getElementById("modal-simple-people");
        const quantity = peopleSelect ? parseInt(peopleSelect.value) : 1;
        
        // Cálculo en Dólares
        const totalUSD = quantity * promoConfig.precioDolar;

        priceContainer.style.display = "block";
        modalPriceValue.innerHTML = `<span class="usd-price-tag">USD ${totalUSD}</span>`;
        return; 
    }

    // --- CASO 2: LÓGICA NORMAL (Reales) ---
    const adults = parseInt(document.getElementById("modal-adults")?.value) || 1;
    const adolescents = parseInt(document.getElementById("modal-adolescents")?.value || 0);
    const minors = parseInt(document.getElementById("modal-minors")?.value) || 0;
    const totalPeople = adults + adolescents + minors;
    const dateIn = document.getElementById("modal-date-in")?.value;
    const dateOut = document.getElementById("modal-date-out")?.value;

    let precioFinalUnitario = currentItem.basePrice;
    let esPaqueteFijo = false;

    if (promoConfig && dateIn) {
        if (currentItem.category === "excursiones") {
            const dIn = new Date(dateIn + "T00:00:00").getTime();
            const start = new Date(promoConfig.inicio + "T00:00:00").getTime();
            const end = new Date(promoConfig.fin + "T00:00:00").getTime();
            if (dIn >= start && dIn <= end) {
                 precioFinalUnitario = promoConfig.precioFijo;
                 esPaqueteFijo = true;
            }
        } else if (dateOut && dateIn === promoConfig.inicio && dateOut === promoConfig.fin) {
            precioFinalUnitario = promoConfig.precioFijo;
            esPaqueteFijo = true;
        }
    }

    const total = precioFinalUnitario * totalPeople;

    if (esPaqueteFijo) {
      priceContainer.style.display = "block";
      modalPriceValue.innerHTML = `D$ ${total.toFixed(2)} <span style="font-size:0.8em; color:#06d849;">(Promo)</span>`;
    } else if (currentItem.precioTipo === "variable" || currentItem.basePrice === 0) {
      priceContainer.style.display = "none";
    } else {
      priceContainer.style.display = "block";
      modalPriceValue.textContent = "D$ " + total.toFixed(2);
    }
  }

  // --- VISTA DEL CARRITO (AQUÍ ESTÁ EL CAMBIO) ---
  function updateCartView() {
    if (!cartItemsElement || !cartCountElement || !cartTotalElement) return;
    cartItemsElement.innerHTML = "";
    
    let totalVisibleRS = 0; 
    let totalVisibleUSD = 0;
    let count = 0;

    function renderCategory(categoryName, items) {
      if (!items.length) return;
      const h3 = document.createElement("h3");
      h3.textContent = categoryName;
      cartItemsElement.appendChild(h3);
      
      items.forEach((item, index) => {
        const li = document.createElement("li");
        
        // Verificamos si es USD
        const esUSD = item.options && item.options.isFixedUSD;
        let precioDisplay = "";

        if (esUSD) {
            totalVisibleUSD += item.price; // Sumamos al TOTAL (SUBTOTAL)
            
            // --- CAMBIO CLAVE AQUÍ ---
            // Dejamos precioDisplay vacío para que NO salga al lado del nombre
            precioDisplay = ""; 
        } else {
            if (item.category === "ofertas" && item.price > 0) {
                totalVisibleRS += item.price;
                precioDisplay = `(D$ ${item.price.toFixed(2)})`;
            }
        }

        li.innerHTML = `<div class="cart-item-main"><h4 class="cart-item-title">${item.name} <span style="font-weight:bold; color:#28a745;">${precioDisplay}</span></h4></div>`;
        
        const optionsList = document.createElement("ul");
        optionsList.classList.add("cart-item-details");
        
        if (item.options["Fecha Ida"]) {
            optionsList.innerHTML += item.options["Fecha Vuelta"] ? `<li>${item.options["Fecha Ida"]} al ${item.options["Fecha Vuelta"]}</li>` : `<li>${item.options["Fecha Ida"]}</li>`;
        }
        
        if (esUSD) {
            optionsList.innerHTML += `<li>Pasajeros: ${item.options["TotalPersonas"]}</li>`;
        } else {
            let pTxt = [`Adultos: ${item.options["Adultos"]}`];
            if(item.options["Adolescentes"] > 0) pTxt.push(`Adol: ${item.options["Adolescentes"]}`);
            if(item.options["Menores"] > 0) pTxt.push(`Menores: ${item.options["Menores"]}`);
            optionsList.innerHTML += `<li>${pTxt.join(" | ")}</li>`;
        }
        
        li.appendChild(optionsList);
        
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-item-btn");
        removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        removeBtn.addEventListener("click", () => { items.splice(index, 1); saveCart(); });
        li.appendChild(removeBtn);
        cartItemsElement.appendChild(li);
        count++;
      });
    }

    renderCategory("Alojamientos", cart.alojamientos);
    renderCategory("Paquetes", cart.ofertas);
    renderCategory("Excursiones", cart.excursiones);
    renderCategory("Traslados", cart.traslados);

    cartCountElement.textContent = count;
    
    // --- CÁLCULO DEL TEXTO FINAL DEL SUBTOTAL ---
    let textoTotal = "";
    
    if (totalVisibleUSD > 0 && totalVisibleRS === 0) {
        // Solo Dólares
        textoTotal = `USD ${totalVisibleUSD}`;
    } 
    else if (totalVisibleRS > 0 && totalVisibleUSD === 0) {
        // Solo Reales
        textoTotal = `R$ ${totalVisibleRS.toFixed(2)}`;
    }
    else if (totalVisibleRS > 0 && totalVisibleUSD > 0) {
        // Mixto (si tienes ambos, muestra ambos claramente)
        textoTotal = `R$ ${totalVisibleRS.toFixed(2)} + USD ${totalVisibleUSD}`;
    } 
    else {
        // Cero (Carrito vacío) -> AQUÍ ESTÁ EL CAMBIO
        textoTotal = `USD 0.00`;
    }

    cartTotalElement.textContent = textoTotal;
    
    if (count === 0) {
      if(cartItemsElement) cartItemsElement.innerHTML = "<p>Carrito vacío.</p>";
      if(sendBtn) sendBtn.style.display = "none";
      if(clearBtn) clearBtn.style.display = "none";
    } else {
      if(sendBtn) sendBtn.style.display = "block";
      if(clearBtn) clearBtn.style.display = "block";
    }
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartView();
  }

  function addToCart(name, price, category, options = {}, quantity = 1) {
    let finalPrice = price;
    
    if (options.isFixedUSD) {
        finalPrice = price * parseInt(options.TotalPersonas);
    } else {
        const totalPeople = parseInt(options["Adultos"]) + parseInt(options["Adolescentes"] || 0) + parseInt(options["Menores"]);
        if (category === "alojamientos") {
            const nights = calculateNights(options["Fecha Ida"], options["Fecha Vuelta"]);
            finalPrice = (nights * 50) + (totalPeople * 120);
        } else if (category === "ofertas" || category === "excursiones") {
            const promoConfig = CONFIG_PROMOS[name];
            let aplicaPromo = false;
            if (promoConfig) {
                 if (category === "excursiones" && options["Fecha Ida"]) {
                     const dIn = new Date(options["Fecha Ida"] + "T00:00:00").getTime();
                     const start = new Date(promoConfig.inicio + "T00:00:00").getTime();
                     const end = new Date(promoConfig.fin + "T00:00:00").getTime();
                     if(dIn >= start && dIn <= end) aplicaPromo = true;
                 } else if (options["Fecha Ida"] === promoConfig.inicio && options["Fecha Vuelta"] === promoConfig.fin) {
                     aplicaPromo = true;
                 }
            }
            finalPrice = aplicaPromo ? promoConfig.precioFijo * totalPeople : price * totalPeople;
        } else {
            finalPrice = price * totalPeople;
        }
    }
    
    cart[category].push({ name, price: finalPrice, category, quantity, options });
    saveCart();
    if(cartPanel) cartPanel.classList.add("show");
    if(cartOverlay) cartOverlay.classList.add("active");
  }

  function updateCarousel() {
    if(!modalSlidesContainer) return;
    const offset = -currentSlide * 100;
    modalSlidesContainer.style.transform = `translateX(${offset}%)`;
    const slides = modalSlidesContainer.querySelectorAll(".modal-slide");
    slides.forEach((slide, index) => {
      if (index === currentSlide) {
        slide.style.opacity = "1";
        slide.style.pointerEvents = "auto";
        if (slide.tagName === "VIDEO") { slide.muted = true; slide.load(); slide.play().catch(()=>{}); }
      } else {
        slide.style.opacity = "0.3";
        slide.style.pointerEvents = "none";
        if (slide.tagName === "VIDEO") { slide.pause(); slide.currentTime = 0; }
      }
    });
  }

  function openModal(cardData) {
    if(!modal) return; 
    modalTitle.textContent = cardData.name;
    modalDescriptionElement.textContent = cardData.description;
    modalOptionsContainer.innerHTML = "";

    currentItem = {
      name: cardData.name,
      basePrice: cardData.price,
      precioTipo: cardData.precioTipo || "fijo",
      category: cardData.category,
      cuartos: cardData.cuartos || 1,
      options: {}
    };

    imagesData = JSON.parse(cardData.images);
    modalSlidesContainer.innerHTML = "";
    imagesData.forEach((src) => {
      let slideElement = src.toLowerCase().endsWith('.mp4') ? document.createElement("video") : document.createElement("img");
      slideElement.src = src;
      if(slideElement.tagName === "VIDEO") { slideElement.controls = true; }
      slideElement.classList.add("modal-slide");
      slideElement.style.cssText = "flex: 0 0 100%; width: 100%; height: 100%; object-fit: contain;";
      modalSlidesContainer.appendChild(slideElement);
    });
    currentSlide = 0;
    updateCarousel();

    const promoConfig = CONFIG_PROMOS[cardData.name];

    // --- DETECCIÓN MODO USD ---
    if (promoConfig && promoConfig.fixedUSD) {
        // Texto Fechas
        const dateDiv = document.createElement("div");
        dateDiv.innerHTML = `
            <div class="fixed-date-display">
                <span class="fixed-date-label">FECHAS CERRADAS</span>
                ${promoConfig.inicio}  ➔  ${promoConfig.fin}
                <span class="fixed-date-label" style="margin-top:5px">No se permiten cambios de fecha</span>
            </div>
        `;
        modalOptionsContainer.appendChild(dateDiv);

        // Selector Personas Único
        const peopleInput = createSelect("Cantidad de Personas:", "modal-simple-people", 1, 20, 1);
        modalOptionsContainer.appendChild(peopleInput.wrapper);
        peopleInput.select.addEventListener("change", updateModalPrice);
        
    } else {
        // MODO NORMAL
        const fpConfig = { locale: "es", minDate: "today", dateFormat: "Y-m-d", disableMobile: "true", static: true, onChange: updateModalPrice };
        if (currentItem.category === "excursiones") {
            modalOptionsContainer.appendChild(createDateInput("Fecha:", "modal-date-in"));
            fpInstanceIn = flatpickr("#modal-date-in", fpConfig);
        } else {
            modalOptionsContainer.appendChild(createDateInput("Ida:", "modal-date-in"));
            modalOptionsContainer.appendChild(createDateInput("Vuelta:", "modal-date-out"));
            
            if (promoConfig && currentItem.category === "ofertas") {
                fpInstanceIn = flatpickr("#modal-date-in", { ...fpConfig, onChange: (selectedDates, dateStr, instance) => {
                     if (selectedDates.length > 0) {
                         const ts = selectedDates[0].getTime();
                         if (ts >= new Date(promoConfig.inicio + "T00:00:00").getTime() && ts <= new Date(promoConfig.fin + "T00:00:00").getTime()) {
                             instance.setDate(promoConfig.inicio);
                             if(fpInstanceOut) fpInstanceOut.setDate(promoConfig.fin);
                         } 
                     }
                     updateModalPrice();
                }});
                fpInstanceOut = flatpickr("#modal-date-out", fpConfig);
            } else {
                fpInstanceIn = flatpickr("#modal-date-in", fpConfig);
                fpInstanceOut = flatpickr("#modal-date-out", fpConfig);
            }
        }

        const adultsInput = createSelect("Adultos (+18):", "modal-adults", 1, 20, 1);
        const minorsInput = createSelect("Menores:", "modal-minors", 0, 10, 0);
        modalOptionsContainer.appendChild(adultsInput.wrapper);
        if (currentItem.category === "ofertas" || currentItem.category === "excursiones") {
            const adolescentsInput = createSelect("Adolescentes (11-17):", "modal-adolescents", 0, 10, 0);
            modalOptionsContainer.appendChild(adolescentsInput.wrapper);
            minorsInput.wrapper.querySelector("label").textContent = "Menores (-10):";
            adolescentsInput.select.addEventListener("change", updateModalPrice);
        }
        modalOptionsContainer.appendChild(minorsInput.wrapper);
        adultsInput.select.addEventListener("change", updateModalPrice);
        minorsInput.select.addEventListener("change", updateModalPrice);
    }
    
    updateModalPrice();
    UIController.lockScroll(); 
    modal.classList.add("show");
  }

  // --- EVENTS ---
  if(prevSlideBtn) prevSlideBtn.addEventListener("click", (e) => { e.stopPropagation(); currentSlide = (currentSlide - 1 + imagesData.length) % imagesData.length; updateCarousel(); });
  if(nextSlideBtn) nextSlideBtn.addEventListener("click", (e) => { e.stopPropagation(); currentSlide = (currentSlide + 1) % imagesData.length; updateCarousel(); });
  if(closeButton) closeButton.addEventListener("click", () => {
    if(modal) modal.classList.remove("show");
    UIController.unlockScroll();
    if(modalSlidesContainer) modalSlidesContainer.querySelectorAll("video").forEach(v => v.pause());
  });

  if(cartIcon) cartIcon.addEventListener("click", () => { if(cartPanel) cartPanel.classList.add("show"); if(cartOverlay) cartOverlay.classList.add("active"); });
  const closeCartLogic = () => { if(cartPanel) cartPanel.classList.remove("show"); if(cartOverlay) cartOverlay.classList.remove("active"); };
  if(cartClose) cartClose.addEventListener("click", closeCartLogic);
  if(cartOverlay) cartOverlay.addEventListener("click", closeCartLogic);

  if (clearBtn) clearBtn.addEventListener("click", () => { if(confirm("¿Vaciar carrito?")) { cart = { alojamientos: [], excursiones: [], traslados: [], ofertas: [] }; saveCart(); } });

  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
        const cartPhones = ["5491128180954", "5491156213704", "5491136649747"]; 
        let mensaje = "Hola que tal! Quiero consultar por:%0A%0A";
        let tieneItems = false;
        let totalRS = 0;
        let totalUSD = 0;

        function agregarCategoria(titulo, items) {
            if (items.length > 0) {
                tieneItems = true;
                mensaje += `*--- ${titulo} ---*%0A`;
                items.forEach(item => {
                    const esUSD = item.options && item.options.isFixedUSD;
                    mensaje += `• ${item.name}`;
                    
                    if(esUSD) {
                         mensaje += ` (USD ${item.price})`;
                         totalUSD += item.price;
                         mensaje += `%0A   Fechas Fijas: ${item.options["Fecha Ida"]} al ${item.options["Fecha Vuelta"]}`;
                         mensaje += `%0A   Personas: ${item.options["TotalPersonas"]}%0A%0A`;
                    } else {
                        if(item.category === "ofertas" && item.price > 0) { 
                            mensaje += ` (R$ ${item.price.toFixed(2)})`; 
                            totalRS += item.price; 
                        } else { mensaje += ` (A cotizar)`; }
                        
                        mensaje += `%0A   Fechas: ${item.options["Fecha Ida"] || "-"} / ${item.options["Fecha Vuelta"] || "-"}`;
                        
                        let partes = [`Adultos: ${item.options["Adultos"]}`];
                        if(item.options["Adolescentes"] > 0) partes.push(`Adol: ${item.options["Adolescentes"]}`);
                        if(item.options["Menores"] > 0) partes.push(`Menores: ${item.options["Menores"]}`);
                        mensaje += `%0A   ${partes.join(", ")}%0A%0A`;
                    }
                });
            }
        }

        agregarCategoria("ALOJAMIENTOS", cart.alojamientos);
        agregarCategoria("PAQUETES", cart.ofertas);
        agregarCategoria("EXCURSIONES", cart.excursiones);
        agregarCategoria("TRASLADOS", cart.traslados);

        if (!tieneItems) { alert("Carrito vacío"); return; }

        if (totalRS > 0) mensaje += `*TOTAL R$: R$ ${totalRS.toFixed(2)}*%0A`;
        if (totalUSD > 0) mensaje += `*TOTAL USD: USD ${totalUSD}*%0A`;
        mensaje += `(Sujeto a confirmación)`;

        let phoneIndex = parseInt(localStorage.getItem("whatsappIndex")) || 0;
        const phone = cartPhones[phoneIndex];
        localStorage.setItem("whatsappIndex", (phoneIndex + 1) % cartPhones.length);
        window.open(`https://wa.me/${phone}?text=${mensaje}`, "_blank");
    });
  }

  document.querySelectorAll(".card").forEach((card) =>
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "A") return;
      openModal({
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        images: card.dataset.images,
        category: card.dataset.category,
        description: card.dataset.description,
        precioTipo: card.dataset.precioTipo
      });
    })
  );

  if(addToCartModalButton) addToCartModalButton.addEventListener("click", () => {
    const promoConfig = CONFIG_PROMOS[currentItem.name];
    
    // CASO USD
    if (promoConfig && promoConfig.fixedUSD) {
        const simplePeopleInput = document.getElementById("modal-simple-people");
        if (!simplePeopleInput || simplePeopleInput.value.trim() === "") {
             alert("Selecciona la cantidad de personas."); return; 
        }
        
        const selectedOptions = {
            "Fecha Ida": promoConfig.inicio,
            "Fecha Vuelta": promoConfig.fin,
            "TotalPersonas": simplePeopleInput.value,
            "isFixedUSD": true
        };
        addToCart(currentItem.name, promoConfig.precioDolar, currentItem.category, selectedOptions);
    } else {
        // CASO NORMAL
        const dateInInput = document.getElementById("modal-date-in");
        const dateOutInput = document.getElementById("modal-date-out");
        const adultsInput = document.getElementById("modal-adults");
        
        if (dateInInput && dateInInput.value.trim() === "") { alert("Falta fecha ida"); return; }
        if (dateOutInput && dateOutInput.value.trim() === "") { alert("Falta fecha vuelta"); return; }
        if (adultsInput && (adultsInput.value.trim() === "" || parseInt(adultsInput.value) < 1)) { alert("Falta Adultos"); return; }
        
        const selectedOptions = {
          "Fecha Ida": dateInInput ? dateInInput.value : "",
          "Fecha Vuelta": dateOutInput ? dateOutInput.value : "",
          "Adultos": adultsInput.value,
          "Adolescentes": document.getElementById("modal-adolescents")?.value || "0", 
          "Menores": document.getElementById("modal-minors")?.value || "0"
        };
        addToCart(currentItem.name, currentItem.basePrice, currentItem.category, selectedOptions);
    }
    if(modal) modal.classList.remove("show");
    UIController.unlockScroll();
  });

  updateCartView();
});