// ======================================================
// CONFIGURATION
// ======================================================

const API_BASE_URL = "http://localhost:5000/api";

const API_URL = `${API_BASE_URL}/products`;

const ORDER_API_URL = `${API_BASE_URL}/orders`;

const ADMIN_API_URL = `${API_BASE_URL}/admin/active`;


// ======================================================
// GLOBAL STATE
// ======================================================

let products = [];

let cart = [];

let lastOrder = null;

let adminWhatsApp = "";


// ======================================================
// DOM ELEMENTS
// ======================================================

const productList =
  document.getElementById("product-list");

const cartButton =
  document.getElementById("cart-button");

const cartModal =
  document.getElementById("cart-modal");

const closeCart =
  document.getElementById("close-cart");

const checkoutButton =
  document.getElementById("checkout-button");

const checkoutModal =
  document.getElementById("checkout-modal");

const closeCheckout =
  document.getElementById("close-checkout");

const checkoutForm =
  document.getElementById("checkout-form");

const successModal =
  document.getElementById("success-modal");

const whatsappButton =
  document.getElementById("whatsapp-button");

const closeSuccess =
  document.getElementById("close-success");

const adminDashboardButton =
  document.getElementById(
    "admin-dashboard-button"
  );


// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupAdminButton();

    setupEventListeners();

    loadActiveAdminWhatsApp();

    loadProducts();

    startAutoRefresh();

  }
);


// ======================================================
// ADMIN DASHBOARD BUTTON
// ======================================================

function setupAdminButton() {

  const adminToken =
    localStorage.getItem(
      "adminToken"
    );


  if (

    adminToken &&

    adminDashboardButton

  ) {

    adminDashboardButton.style.display =
      "inline-block";

  }

}


// ======================================================
// EVENT LISTENERS
// ======================================================

function setupEventListeners() {

  // ============================
  // CART
  // ============================

  if (cartButton) {

    cartButton.addEventListener(

      "click",

      () => {

        cartModal.style.display =
          "block";

        renderCart();

      }

    );

  }


  if (closeCart) {

    closeCart.addEventListener(

      "click",

      () => {

        cartModal.style.display =
          "none";

      }

    );

  }


  // ============================
  // CHECKOUT
  // ============================

  if (checkoutButton) {

    checkoutButton.addEventListener(

      "click",

      handleCheckoutButton

    );

  }


  if (closeCheckout) {

    closeCheckout.addEventListener(

      "click",

      () => {

        checkoutModal.style.display =
          "none";

      }

    );

  }


  // ============================
  // CHECKOUT FORM
  // ============================

  if (checkoutForm) {

    checkoutForm.addEventListener(

      "submit",

      handleCheckoutSubmit

    );

  }


  // ============================
  // SUCCESS MODAL
  // ============================

  if (whatsappButton) {

    whatsappButton.addEventListener(

      "click",

      openWhatsAppOrder

    );

  }


  if (closeSuccess) {

    closeSuccess.addEventListener(

      "click",

      () => {

        successModal.style.display =
          "none";

      }

    );

  }

}


// ======================================================
// CUSTOM NOTIFICATION
// ======================================================

function showNotification(

  message,

  type = "info"

) {

  let notificationContainer =
    document.getElementById(
      "notification-container"
    );


  if (!notificationContainer) {

    notificationContainer =
      document.createElement(
        "div"
      );


    notificationContainer.id =
      "notification-container";


    notificationContainer.style.position =
      "fixed";


    notificationContainer.style.top =
      "25px";


    notificationContainer.style.right =
      "25px";


    notificationContainer.style.zIndex =
      "99999";


    notificationContainer.style.display =
      "flex";


    notificationContainer.style.flexDirection =
      "column";


    notificationContainer.style.gap =
      "10px";


    notificationContainer.style.maxWidth =
      "360px";


    document.body.appendChild(
      notificationContainer
    );

  }


  const notification =
    document.createElement(
      "div"
    );


  const notificationColors = {

    success: {

      background: "#edf8ee",

      border: "#7abd7c",

      color: "#39743c",

      icon: "✓"

    },

    error: {

      background: "#fff0f0",

      border: "#df7777",

      color: "#a33d3d",

      icon: "!"

    },

    warning: {

      background: "#fff8e6",

      border: "#e8bd58",

      color: "#87630d",

      icon: "⚠"

    },

    info: {

      background: "#eef5ff",

      border: "#7ca7df",

      color: "#3c6090",

      icon: "i"

    }

  };


  const style =
    notificationColors[type] ||
    notificationColors.info;


  notification.style.display =
    "flex";


  notification.style.alignItems =
    "center";


  notification.style.gap =
    "12px";


  notification.style.padding =
    "14px 16px";


  notification.style.border =
    `1px solid ${style.border}`;


  notification.style.borderRadius =
    "12px";


  notification.style.background =
    style.background;


  notification.style.color =
    style.color;


  notification.style.fontSize =
    "14px";


  notification.style.fontWeight =
    "600";


  notification.style.boxShadow =
    "0 8px 25px rgba(0,0,0,0.12)";


  notification.style.opacity =
    "0";


  notification.style.transform =
    "translateX(30px)";


  notification.style.transition =
    "0.25s ease";


  notification.innerHTML = `

    <span style="

      width: 24px;

      height: 24px;

      display: flex;

      align-items: center;

      justify-content: center;

      border-radius: 50%;

      background: ${style.border};

      color: white;

      font-weight: bold;

      flex-shrink: 0;

    ">

      ${style.icon}

    </span>


    <span>

      ${message}

    </span>

  `;


  notificationContainer.appendChild(
    notification
  );


  setTimeout(

    () => {

      notification.style.opacity =
        "1";

      notification.style.transform =
        "translateX(0)";

    },

    10

  );


  setTimeout(

    () => {

      notification.style.opacity =
        "0";

      notification.style.transform =
        "translateX(30px)";


      setTimeout(

        () => {

          notification.remove();

        },

        300

      );

    },

    3000

  );

}


// ======================================================
// LOAD ACTIVE ADMIN WHATSAPP
// ======================================================

async function loadActiveAdminWhatsApp() {

  try {

    const response =
      await fetch(
        ADMIN_API_URL
      );


    if (!response.ok) {

      throw new Error(
        "Admin aktif tidak ditemukan"
      );

    }


    const admin =
      await response.json();


    adminWhatsApp =
      admin.whatsapp || "";

  }


  catch (error) {

    console.error(

      "Gagal mengambil WhatsApp admin:",

      error

    );

  }

}


// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadProducts() {

  try {

    const response =
      await fetch(
        API_URL
      );


    if (!response.ok) {

      throw new Error(
        "Gagal mengambil data produk"
      );

    }


    products =
      await response.json();


    synchronizeCartWithProducts();


    updateCartCount();


    renderProducts();


    if (

      cartModal &&

      cartModal.style.display === "block"

    ) {

      renderCart();

    }

  }


  catch (error) {

    console.error(

      "Gagal mengambil produk:",

      error

    );

  }

}


// ======================================================
// SYNC CART WITH LATEST PRODUCTS
// ======================================================

function synchronizeCartWithProducts() {

  cart = cart

    .map(item => {


      const latestProduct =
        products.find(

          product =>
            product.id === item.id

        );


      if (!latestProduct) {

        return null;

      }


      const latestStock =
        Number(

          latestProduct.stock || 0

        );


      const currentQuantity =
        Math.min(

          item.quantity,

          latestStock

        );


      if (

        currentQuantity <= 0

      ) {

        return null;

      }


      return {

        ...latestProduct,

        quantity:
          currentQuantity

      };

    })


    .filter(Boolean);

}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts() {

  if (!productList) {

    return;

  }


  productList.innerHTML =
    "";


  products.forEach(

    product => {


      const productCard =
        document.createElement(
          "div"
        );


      productCard.className =
        "product-card";


      const stock =
        Number(

          product.stock || 0

        );


      const isOutOfStock =
        stock <= 0;


      productCard.innerHTML = `

        <div class="product-image">

          🥚

        </div>


        <h3>

          ${product.name}

        </h3>


        <p>

          ${

            product.desc ||

            "Telur segar berkualitas dari Armand Farm"

          }

        </p>


        <div class="price">

          ${formatRupiah(product.price)}

          /

          ${product.unit || ""}

        </div>


        <p>

          ${

            isOutOfStock

              ? "Stok habis"

              : `Stok tersedia: ${stock} ${product.unit || ""}`

          }

        </p>


        <button

          class="add-button"

          ${

            isOutOfStock

              ? "disabled"

              : ""

          }

        >

          ${

            isOutOfStock

              ? "Stok Habis"

              : "Tambah ke Keranjang"

          }

        </button>

      `;


      const addButton =
        productCard.querySelector(
          ".add-button"
        );


      if (!isOutOfStock) {

        addButton.addEventListener(

          "click",

          () => {

            addToCart(
              product.id
            );

          }

        );

      }


      productList.appendChild(
        productCard
      );

    }

  );

}


// ======================================================
// AUTO REFRESH PRODUCTS
// ======================================================

function startAutoRefresh() {

  setInterval(

    () => {

      loadProducts();

    },

    5000

  );

}


// ======================================================
// ADD TO CART
// ======================================================

function addToCart(productId) {

  const product =
    products.find(

      product =>
        product.id === productId

    );


  if (!product) {

    return;

  }


  const stock =
    Number(

      product.stock || 0

    );


  if (

    stock <= 0

  ) {

    showNotification(

      "Stok produk sudah habis.",

      "warning"

    );


    return;

  }


  const existingProduct =
    cart.find(

      item =>
        item.id === productId

    );


  if (existingProduct) {


    if (

      existingProduct.quantity >= stock

    ) {

      showNotification(

        `Jumlah maksimal yang dapat dibeli adalah ${stock} ${product.unit || ""}.`,

        "warning"

      );


      return;

    }


    existingProduct.quantity += 1;

  }


  else {

    cart.push({

      ...product,

      quantity: 1

    });

  }


  updateCartCount();


  showNotification(

    `${product.name} berhasil ditambahkan ke keranjang!`,

    "success"

  );

}


// ======================================================
// UPDATE CART COUNT
// ======================================================

function updateCartCount() {

  const cartCount =
    document.getElementById(
      "cart-count"
    );


  if (!cartCount) {

    return;

  }


  const totalItems =
    cart.reduce(

      (

        total,

        item

      ) =>

        total +

        item.quantity,

      0

    );


  cartCount.textContent =
    totalItems;

}


// ======================================================
// RENDER CART
// ======================================================

function renderCart() {

  const cartItems =
    document.getElementById(
      "cart-items"
    );


  const cartTotal =
    document.getElementById(
      "cart-total"
    );


  if (!cartItems || !cartTotal) {

    return;

  }


  if (

    cart.length === 0

  ) {

    cartItems.innerHTML =
      "<p>Keranjang masih kosong</p>";


    cartTotal.textContent =
      "Rp0";


    return;

  }


  cartItems.innerHTML =
    "";


  let total =
    0;


  cart.forEach(

    item => {


      const itemTotal =
        Number(

          item.price

        ) *

        item.quantity;


      total +=
        itemTotal;


      const itemElement =
        document.createElement(
          "div"
        );


      itemElement.className =
        "cart-item";


      itemElement.innerHTML = `

        <div class="cart-item-info">

          <h4>

            ${item.name}

          </h4>


          <p>

            ${formatRupiah(item.price)}

          </p>

        </div>


        <div class="quantity-control">

          <button

            type="button"

            class="decrease-button"

          >

            −

          </button>


          <span>

            ${item.quantity}

          </span>


          <button

            type="button"

            class="increase-button"

          >

            +

          </button>

        </div>

      `;


      itemElement

        .querySelector(
          ".decrease-button"
        )

        .addEventListener(

          "click",

          () => {

            decreaseQuantity(
              item.id
            );

          }

        );


      itemElement

        .querySelector(
          ".increase-button"
        )

        .addEventListener(

          "click",

          () => {

            increaseQuantity(
              item.id
            );

          }

        );


      cartItems.appendChild(
        itemElement
      );

    }

  );


  cartTotal.textContent =
    formatRupiah(
      total
    );

}


// ======================================================
// INCREASE QUANTITY
// ======================================================

function increaseQuantity(productId) {

  const item =
    cart.find(

      item =>
        item.id === productId

    );


  const product =
    products.find(

      product =>
        product.id === productId

    );


  if (

    !item ||

    !product

  ) {

    return;

  }


  const stock =
    Number(

      product.stock || 0

    );


  if (

    item.quantity >= stock

  ) {

    showNotification(

      `Jumlah maksimal adalah ${stock} ${product.unit || ""}.`,

      "warning"

    );


    return;

  }


  item.quantity += 1;


  updateCartCount();


  renderCart();

}


// ======================================================
// DECREASE QUANTITY
// ======================================================

function decreaseQuantity(productId) {

  const item =
    cart.find(

      item =>
        item.id === productId

    );


  if (!item) {

    return;

  }


  item.quantity -= 1;


  if (

    item.quantity <= 0

  ) {

    cart =
      cart.filter(

        item =>
          item.id !== productId

      );

  }


  updateCartCount();


  renderCart();

}


// ======================================================
// FORMAT RUPIAH
// ======================================================

function formatRupiah(number) {

  return new Intl.NumberFormat(

    "id-ID",

    {

      style: "currency",

      currency: "IDR",

      minimumFractionDigits: 0

    }

  ).format(

    Number(

      number || 0

    )

  );

}


// ======================================================
// CHECKOUT BUTTON
// ======================================================

function handleCheckoutButton() {

  if (

    cart.length === 0

  ) {

    showNotification(

      "Keranjang masih kosong!",

      "warning"

    );


    return;

  }


  cartModal.style.display =
    "none";


  checkoutModal.style.display =
    "block";


  renderCheckout();

}


// ======================================================
// RENDER CHECKOUT
// ======================================================

function renderCheckout() {

  const checkoutItems =
    document.getElementById(
      "checkout-items"
    );


  const checkoutTotal =
    document.getElementById(
      "checkout-total"
    );


  if (

    !checkoutItems ||

    !checkoutTotal

  ) {

    return;

  }


  checkoutItems.innerHTML =
    "";


  let total =
    0;


  cart.forEach(

    item => {


      const itemTotal =
        Number(

          item.price

        ) *

        item.quantity;


      total +=
        itemTotal;


      const itemElement =
        document.createElement(
          "div"
        );


      itemElement.className =
        "checkout-item";


      itemElement.innerHTML = `

        <span>

          ${item.name}

          ×

          ${item.quantity}

        </span>


        <strong>

          ${formatRupiah(itemTotal)}

        </strong>

      `;


      checkoutItems.appendChild(
        itemElement
      );

    }

  );


  checkoutTotal.textContent =
    formatRupiah(
      total
    );

}


// ======================================================
// SUBMIT CHECKOUT
// ======================================================

async function handleCheckoutSubmit(event) {

  event.preventDefault();


  const name =
    document.getElementById(
      "customer-name"
    ).value.trim();


  const phone =
    document.getElementById(
      "customer-phone"
    ).value.trim();


  const address =
    document.getElementById(
      "customer-address"
    ).value.trim();


  const note =
    document.getElementById(
      "customer-note"
    ).value.trim();


  if (

    !name ||

    !phone ||

    !address

  ) {

    showNotification(

      "Mohon lengkapi data pemesanan terlebih dahulu.",

      "warning"

    );


    return;

  }


  const orderItems =
    [...cart];


  const total =
    orderItems.reduce(

      (

        sum,

        item

      ) =>

        sum +

        Number(item.price) *

        Number(item.quantity),

      0

    );


  try {

    const response =
      await fetch(

        ORDER_API_URL,

        {

          method: "POST",


          headers: {

            "Content-Type":
              "application/json"

          },


          body:

            JSON.stringify({

              customer_name:
                name,

              customer_phone:
                phone,

              customer_address:
                address,

              note:
                note,

              items:
                orderItems

            })

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(

        data.error ||

        "Gagal membuat pesanan"

      );

    }


    lastOrder = {

      name,

      phone,

      address,

      note,

      items:
        orderItems,

      total

    };


    cart =
      [];


    updateCartCount();


    checkoutModal.style.display =
      "none";


    checkoutForm.reset();


    await loadProducts();


    const successTotal =
      document.getElementById(
        "success-total"
      );


    if (successTotal) {

      successTotal.textContent =
        formatRupiah(
          total
        );

    }


    successModal.style.display =
      "flex";


  }


  catch (error) {

    console.error(

      "Gagal membuat pesanan:",

      error

    );


    showNotification(

      error.message ||

      "Gagal membuat pesanan. Silakan coba lagi.",

      "error"

    );

  }

}


// ======================================================
// OPEN WHATSAPP ORDER
// ======================================================

async function openWhatsAppOrder() {

  if (!lastOrder) {

    return;

  }


  try {

    let phoneNumber =
      adminWhatsApp;


    if (!phoneNumber) {

      const response =
        await fetch(
          ADMIN_API_URL
        );


      const adminData =
        await response.json();


      if (!response.ok) {

        throw new Error(

          adminData.error ||

          "Admin WhatsApp belum tersedia"

        );

      }


      phoneNumber =
        adminData.whatsapp;

    }


    phoneNumber =
      phoneNumber.replace(
        /\D/g,
        ""
      );


    if (

      phoneNumber.startsWith("0")

    ) {

      phoneNumber =
        "62" +

        phoneNumber.substring(1);

    }


    else if (

      phoneNumber.startsWith("8")

    ) {

      phoneNumber =
        "62" +

        phoneNumber;

    }


    let message =

      `Halo Admin Armand Farm\n\n` +

      `Saya baru saja membuat pesanan.\n\n` +

      `Nama: ${lastOrder.name}\n` +

      `No. HP: ${lastOrder.phone}\n` +

      `Alamat: ${lastOrder.address}\n\n` +

      `Detail Pesanan:\n`;


    lastOrder.items.forEach(

      item => {

        message +=

          `• ${item.name} × ${item.quantity}\n`;

      }

    );


    message +=

      `\nTotal: ${formatRupiah(lastOrder.total)}\n`;


    if (

      lastOrder.note &&

      lastOrder.note.trim() !== ""

    ) {

      message +=

        `\nCatatan: ${lastOrder.note}\n`;

    }


    message +=

      `\nMohon dikonfirmasi ya Admin. Terima kasih!`;


    const whatsappURL =

      `https://wa.me/${phoneNumber}?text=` +

      encodeURIComponent(
        message
      );


    window.open(

      whatsappURL,

      "_blank"

    );

  }


  catch (error) {

    console.error(

      "Gagal membuka WhatsApp:",

      error

    );


    showNotification(

      error.message ||

      "Gagal membuka WhatsApp.",

      "error"

    );

  }

}