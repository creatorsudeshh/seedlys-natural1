/* Shared behaviour for the Seedlys Natural static website. */
(() => {
  "use strict";

  const products = window.SEEDLYS_PRODUCTS || [];
  const WHATSAPP_NUMBER = "917058241275"; // Seedlys contact number from the supplied business material.
  const CART_KEY = "seedlys-natural-cart-v1";
  const pageName = document.body.dataset.page;
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

  function formatPrice(price) {
    return typeof price === "number" && Number.isFinite(price) && price >= 0 ? money.format(price) : "₹ Price on request";
  }

  function readCart() {
    try {
      const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter((item) => products.some((product) => product.id === String(item.id)) && Number.isInteger(item.quantity) && item.quantity > 0)
        .map((item) => ({ id: String(item.id), quantity: item.quantity }));
    } catch {
      return [];
    }
  }

  let cart = readCart();

  function writeCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // The cart still works for this browser visit if storage is unavailable.
    }
    updateCartCounts();
    if (pageName === "cart") renderCartPage();
  }

  function itemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  function updateCartCounts() {
    document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = itemCount(); });
  }

  function productCard(product) {
    return `<article class="product-card" data-category="${product.category}">
      <a class="product-image" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${product.name} details">
        <span class="product-category">${product.categoryLabel}</span>
        <img src="${product.image}" alt="${product.imageAlt}" loading="lazy" />
        <span class="image-arrow" aria-hidden="true">↗</span>
      </a>
      <div class="product-card-copy"><div class="product-name-row"><div><p class="eyebrow-small">SEEDLYS NATURAL</p><h3><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3></div><button class="add-button" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to cart">+</button></div>
        <p class="product-summary">${product.description}</p><div class="product-card-foot"><span class="product-price">${formatPrice(product.price)}</span><a class="product-view" href="product.html?id=${encodeURIComponent(product.id)}">Details <span aria-hidden="true">→</span></a></div></div>
    </article>`;
  }

  function renderProductGrids() {
    document.querySelectorAll("[data-product-grid]").forEach((grid) => {
      const kind = grid.dataset.productGrid;
      let list = [...products];
      if (kind === "featured" && list.length > 3) list = list.slice(0, 3);
      if (kind === "related") list = list.filter((item) => item.id !== new URLSearchParams(location.search).get("id")).slice(0, 2);
      grid.innerHTML = list.map(productCard).join("");
    });
  }

  function addToCart(id) {
    const product = products.find((item) => item.id === String(id));
    if (!product) return;
    const current = cart.find((item) => item.id === product.id);
    if (current) current.quantity += 1;
    else cart.push({ id: product.id, quantity: 1 });
    writeCart();
    showToast(`${product.name} added to your cart`);
  }

  function changeQuantity(id, delta) {
    const item = cart.find((entry) => entry.id === String(id));
    if (!item) return;
    item.quantity += delta;
    if (item.quantity < 1) cart = cart.filter((entry) => entry.id !== item.id);
    writeCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== String(id));
    writeCart();
  }

  function calculateTotal() {
    const entries = cart.map((item) => ({ item, product: products.find((product) => product.id === item.id) })).filter((entry) => entry.product);
    if (entries.length !== cart.length || entries.some(({ product }) => typeof product.price !== "number" || !Number.isFinite(product.price) || product.price < 0)) return null;
    return entries.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
  }

  function renderCartPage() {
    const list = document.querySelector("[data-cart-items]");
    if (!list) return;
    const entries = cart.map((item) => ({ item, product: products.find((product) => product.id === item.id) })).filter((entry) => entry.product);
    if (!entries.length) {
      list.innerHTML = `<div class="empty-cart"><span class="empty-cart-mark" aria-hidden="true">✳</span><h2>Your basket is waiting.</h2><p>Add a favourite from the collection and send us an enquiry.</p><a class="button button-primary" href="shop.html">Browse the shop <span aria-hidden="true">↗</span></a></div>`;
    } else {
      list.innerHTML = entries.map(({ item, product }) => `<article class="cart-item">
        <a class="cart-item-image" href="product.html?id=${encodeURIComponent(product.id)}"><img src="${product.image}" alt="${product.imageAlt}" /></a>
        <div class="cart-item-info"><p class="eyebrow-small">${product.categoryLabel}</p><h3><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3><span class="cart-item-price">${formatPrice(product.price)}</span>
          <div class="quantity-control" aria-label="Quantity for ${product.name}"><button type="button" data-cart-change="-1" data-id="${product.id}" aria-label="Remove one ${product.name}">−</button><span>${item.quantity}</span><button type="button" data-cart-change="1" data-id="${product.id}" aria-label="Add one ${product.name}">+</button></div>
        </div><div class="cart-item-end"><strong>${typeof product.price === "number" ? money.format(product.price * item.quantity) : "₹ —"}</strong><button class="remove-link" type="button" data-cart-remove="${product.id}">Remove</button></div>
      </article>`).join("");
    }

    const total = calculateTotal();
    const totalNode = document.querySelector("[data-cart-total]");
    const itemCountNode = document.querySelector("[data-cart-item-count]");
    const priceNote = document.querySelector("[data-price-note]");
    const checkoutButton = document.querySelector("[data-checkout-button]");
    if (totalNode) totalNode.textContent = total === null ? "₹ Price on request" : money.format(total);
    if (itemCountNode) itemCountNode.textContent = itemCount();
    if (priceNote) priceNote.textContent = total === null ? "We’ll confirm the current price and final total with you on WhatsApp." : "Delivery charges, if any, will be confirmed on WhatsApp.";
    if (checkoutButton) checkoutButton.disabled = entries.length === 0;
  }

  function renderProductPage() {
    const panel = document.querySelector("[data-product-detail]");
    if (!panel) return;
    const requestedId = new URLSearchParams(location.search).get("id");
    const product = products.find((item) => item.id === requestedId || item.slug === requestedId);
    if (!product) {
      panel.innerHTML = `<div class="not-found"><p class="eyebrow">PRODUCT NOT FOUND</p><h1>Let’s find you something.</h1><p>This product link may have changed. Explore the full collection instead.</p><a class="button button-primary" href="shop.html">Visit the shop <span aria-hidden="true">↗</span></a></div>`;
      document.title = "Product not found | Seedlys Natural";
      return;
    }
    document.title = `${product.name} | Seedlys Natural`;
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (description) description.content = `${product.name} from Seedlys Natural. ${product.description} Ask us about current prices on WhatsApp.`;
    if (ogTitle) ogTitle.content = `${product.name} | Seedlys Natural`;
    if (ogDescription) ogDescription.content = product.description;
    const crumb = document.querySelector("[data-product-breadcrumb]");
    if (crumb) crumb.textContent = product.name;
    panel.innerHTML = `<div class="detail-image"><span class="product-category">${product.categoryLabel}</span><img src="${product.image}" alt="${product.imageAlt}" /></div><div class="detail-copy"><p class="eyebrow"><span></span> SEEDLYS NATURAL</p><h1>${product.name}</h1><p class="detail-lead">${product.description}</p><p class="detail-description">${product.detail}</p><div class="detail-price">${formatPrice(product.price)}<small>Pack sizes and availability confirmed on WhatsApp</small></div><button class="button button-primary detail-add" type="button" data-add-to-cart="${product.id}">Add to cart <span aria-hidden="true">+</span></button><a class="detail-whatsapp" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Seedlys Natural! I’d like to ask about ${product.name}. Please share the current price and pack size.`)}" target="_blank" rel="noreferrer">Ask about this product on WhatsApp <span aria-hidden="true">↗</span></a><div class="detail-divider"></div><h2>Ideas for enjoying it</h2><ul class="idea-list">${product.ideas.map((idea) => `<li><span aria-hidden="true">✳</span>${idea}</li>`).join("")}</ul><p class="detail-note">Please message us for ingredient and product information before ordering.</p></div>`;
  }

  function openWhatsApp(message) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleHomeOrderForm(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "Hello Seedlys Naturals! I’d like to enquire about an order.",
      `Name: ${form.get("name").trim()}`,
      `Phone: ${form.get("phone").trim()}`,
      `Delivery address: ${form.get("address").trim()}`,
      `Interested in: ${form.get("product")}`,
      "Please confirm availability, price and delivery. Thank you!"
    ].join("\n");
    // Continue in the same tab so the form really redirects to WhatsApp.
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function handleCheckout(event) {
    event.preventDefault();
    if (!cart.length) return;
    const form = new FormData(event.currentTarget);
    const lines = ["Hello Seedlys Natural! I’d like to place an order enquiry:"];
    cart.forEach((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (product) lines.push(`• ${product.name} — quantity ${item.quantity}${typeof product.price === "number" ? ` — ${money.format(product.price * item.quantity)}` : ""}`);
    });
    const total = calculateTotal();
    lines.push(`Name: ${form.get("name").trim()}`, `Phone: ${form.get("phone").trim()}`, `Address: ${form.get("address").trim()}`);
    lines.push(total === null ? "Please confirm the current product prices and total." : `Estimated product total: ${money.format(total)}`);
    lines.push("Please confirm delivery and share the available payment details. Thank you!");
    openWhatsApp(lines.join("\n"));
  }

  function handleContactForm(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = `Hello Seedlys Natural!\nName: ${form.get("name").trim()}\nPhone: ${form.get("phone").trim()}\nMessage: ${form.get("message").trim()}`;
    openWhatsApp(message);
  }

  function showToast(message) {
    let toast = document.querySelector("[data-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.dataset.toast = "";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function setUpFilters() {
    const buttons = document.querySelectorAll("[data-filter]");
    if (!buttons.length) return;
    buttons.forEach((button) => button.addEventListener("click", () => {
      buttons.forEach((chip) => chip.classList.toggle("is-active", chip === button));
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-product-grid='shop'] .product-card").forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
    }));
  }

  function setUpNavigation() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".primary-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  }

  function setUpClicks() {
    document.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-add-to-cart]");
      if (addButton) addToCart(addButton.dataset.addToCart);
      const quantityButton = event.target.closest("[data-cart-change]");
      if (quantityButton) changeQuantity(quantityButton.dataset.id, Number(quantityButton.dataset.cartChange));
      const removeButton = event.target.closest("[data-cart-remove]");
      if (removeButton) removeFromCart(removeButton.dataset.cartRemove);
    });
  }

  document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
  renderProductGrids();
  renderProductPage();
  updateCartCounts();
  renderCartPage();
  setUpFilters();
  setUpNavigation();
  setUpClicks();
  document.querySelector("[data-checkout-form]")?.addEventListener("submit", handleCheckout);
  document.querySelector("[data-contact-form]")?.addEventListener("submit", handleContactForm);
  document.querySelector("[data-home-order-form]")?.addEventListener("submit", handleHomeOrderForm);
  window.addEventListener("storage", () => { cart = readCart(); updateCartCounts(); renderCartPage(); });
})();
