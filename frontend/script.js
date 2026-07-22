const API_URL =
  "http://localhost:5000/api/products";


const ORDER_API_URL =
  "http://localhost:5000/api/orders";


let products = [];

let cart = [];

let lastOrder = null;

loadActiveAdminWhatsApp();

// ======================================
// LOAD ADMIN WHATSAPP AKTIF
// ======================================

async function loadActiveAdminWhatsApp() {

  try {

    const response =
      await fetch(

        "http://localhost:5000/api/admin/active"

      );


    if (!response.ok) {

      throw new Error(

        "Admin aktif tidak ditemukan"

      );

    }


    const admin =
      await response.json();


    adminWhatsApp =
      admin.whatsapp;


  } catch (error) {

    console.error(

      "Gagal mengambil WhatsApp admin:",

      error

    );

  }

}

// ======================================
// CEK LOGIN ADMIN
// ======================================

const adminDashboardButton =
  document.getElementById(
    "admin-dashboard-button"
  );


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

// ======================================
// LOAD PRODUCTS
// ======================================

async function loadProducts() {

  try {

    const response =
      await fetch(API_URL);


    if (!response.ok) {

      throw new Error(
        "Gagal mengambil data produk"
      );

    }


    products =
      await response.json();


    // ======================================
    // SINKRONKAN KERANJANG DENGAN DATA TERBARU
    // ======================================

    cart =

      cart

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


    updateCartCount();


    const productList =

      document.getElementById(

        "product-list"

      );


    if (!productList) {

      return;

    }


    productList.innerHTML = "";


    products.forEach(product => {


      const productCard =

        document.createElement(

          "div"

        );


      productCard.className =

        "product-card";


      const price =

        formatRupiah(

          product.price

        );


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

          ${price}

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

              : `onclick="addToCart('${product.id}')"`

          }

        >

          ${

            isOutOfStock

              ? "Stok Habis"

              : "Tambah ke Keranjang"

          }

        </button>

      `;


      productList.appendChild(

        productCard

      );

    });


    if (

      cartModal &&

      cartModal.style.display === "block"

    ) {

      renderCart();

    }


  } catch (error) {

    console.error(

      "Gagal mengambil produk:",

      error

    );

  }

}


// ======================================
// LOAD PRODUK PERTAMA KALI
// ======================================

loadProducts();


// ======================================
// AUTO REFRESH PRODUK
// ======================================

setInterval(

  () => {

    loadProducts();

  },

  5000

);


// ======================================
// TAMBAH PRODUK KE KERANJANG
// ======================================

function addToCart(

  productId

) {


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

    alert(

      "Stok produk sudah habis."

    );


    return;

  }


  const existingProduct =

    cart.find(

      item =>

        item.id === productId

    );


  if (

    existingProduct

  ) {


    if (

      existingProduct.quantity >= stock

    ) {


      alert(

        `Jumlah maksimal yang dapat dibeli adalah ${stock} ${product.unit || ""}.`

      );


      return;

    }


    existingProduct.quantity += 1;


  } else {


    cart.push({

      ...product,

      quantity: 1

    });

  }


  updateCartCount();


  alert(

    `${product.name} berhasil ditambahkan ke keranjang!`

  );

}


// ======================================
// UPDATE JUMLAH ITEM KERANJANG
// ======================================

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


// ======================================
// MODAL KERANJANG
// ======================================

const cartButton =

  document.getElementById(

    "cart-button"

  );


const cartModal =

  document.getElementById(

    "cart-modal"

  );


const closeCart =

  document.getElementById(

    "close-cart"

  );


cartButton.addEventListener(

  "click",

  () => {


    cartModal.style.display =

      "block";


    renderCart();

  }

);


closeCart.addEventListener(

  "click",

  () => {


    cartModal.style.display =

      "none";

  }

);


// ======================================
// TAMPILKAN KERANJANG
// ======================================

function renderCart() {


  const cartItems =

    document.getElementById(

      "cart-items"

    );


  const cartTotal =

    document.getElementById(

      "cart-total"

    );


  if (

    cart.length === 0

  ) {


    cartItems.innerHTML =

      "<p>Keranjang masih kosong</p>";


    cartTotal.textContent =

      "Rp0";


    return;

  }


  cartItems.innerHTML = "";


  let total = 0;


  cart.forEach(item => {


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

          ${formatRupiah(

            item.price

          )}

        </p>

      </div>


      <div class="quantity-control">


        <button

          onclick="decreaseQuantity('${item.id}')"

        >

          −

        </button>


        <span>

          ${item.quantity}

        </span>


        <button

          onclick="increaseQuantity('${item.id}')"

        >

          +

        </button>


      </div>

    `;


    cartItems.appendChild(

      itemElement

    );

  });


  cartTotal.textContent =

    formatRupiah(

      total

    );

}


// ======================================
// TAMBAH QUANTITY
// ======================================

function increaseQuantity(

  productId

) {


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


    alert(

      `Jumlah maksimal adalah ${stock} ${product.unit || ""}.`

    );


    return;

  }


  item.quantity++;


  updateCartCount();


  renderCart();

}


// ======================================
// KURANGI QUANTITY
// ======================================

function decreaseQuantity(

  productId

) {


  const item =

    cart.find(

      item =>

        item.id === productId

    );


  if (!item) {

    return;

  }


  item.quantity--;


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


// ======================================
// FORMAT RUPIAH
// ======================================

function formatRupiah(

  number

) {


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


// ======================================
// MODAL CHECKOUT
// ======================================

const checkoutButton =

  document.getElementById(

    "checkout-button"

  );


const checkoutModal =

  document.getElementById(

    "checkout-modal"

  );


const closeCheckout =

  document.getElementById(

    "close-checkout"

  );


checkoutButton.addEventListener(

  "click",

  () => {


    if (

      cart.length === 0

    ) {


      alert(

        "Keranjang masih kosong!"

      );


      return;

    }


    cartModal.style.display =

      "none";


    checkoutModal.style.display =

      "block";


    renderCheckout();

  }

);


// ======================================
// TAMPILKAN CHECKOUT
// ======================================

function renderCheckout() {


  const checkoutItems =

    document.getElementById(

      "checkout-items"

    );


  const checkoutTotal =

    document.getElementById(

      "checkout-total"

    );


  checkoutItems.innerHTML = "";


  let total = 0;


  cart.forEach(item => {


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

        ${formatRupiah(

          itemTotal

        )}

      </strong>

    `;


    checkoutItems.appendChild(

      itemElement

    );

  });


  checkoutTotal.textContent =

    formatRupiah(

      total

    );

}


closeCheckout.addEventListener(

  "click",

  () => {


    checkoutModal.style.display =

      "none";

  }

);


// ======================================
// WHATSAPP
// ======================================

// ======================================
// WHATSAPP KONFIRMASI PESANAN
// ======================================

async function openWhatsAppOrder() {

  if (!lastOrder) {

    return;

  }


  try {

    // Ambil admin WhatsApp aktif dari database

    const adminResponse =

      await fetch(
        "http://localhost:5000/api/admin/active"
      );


    const adminData =

      await adminResponse.json();


    if (!adminResponse.ok) {

      throw new Error(

        adminData.error ||

        "Admin WhatsApp belum tersedia"

      );

    }


    let adminWhatsApp =

  adminData.whatsapp

    .replace(/\D/g, "");


if (

  adminWhatsApp.startsWith("0")

) {

  adminWhatsApp =

    "62" +

    adminWhatsApp.substring(1);

}


if (

  adminWhatsApp.startsWith("8")

) {

  adminWhatsApp =

    "62" +

    adminWhatsApp;

}

    let message =

      `Halo Admin Armand Farm \n\n` +

      `Saya baru saja membuat pesanan.\n\n` +

      `Nama: ${lastOrder.name}\n` +

      `No. HP: ${lastOrder.phone}\n` +

      `Alamat: ${lastOrder.address}\n\n` +

      `Detail Pesanan:\n`;


    lastOrder.items.forEach(item => {

      message +=

        `• ${item.name} × ${item.quantity}\n`;

    });


    message +=

      `\nTotal: ${formatRupiah(

        lastOrder.total

      )}\n`;


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

      `https://wa.me/${adminWhatsApp}?text=` +

      encodeURIComponent(

        message

      );


    window.open(

      whatsappURL,

      "_blank"

    );


  } catch (error) {

    console.error(error);


    alert(

      error.message ||

      "Gagal membuka WhatsApp"

    );

  }

}

// ======================================
// MODAL PESANAN BERHASIL
// ======================================

const successModal =

  document.getElementById(

    "success-modal"

  );


const whatsappButton =

  document.getElementById(

    "whatsapp-button"

  );


const closeSuccess =

  document.getElementById(

    "close-success"

  );


whatsappButton.addEventListener(

  "click",

  () => {


    openWhatsAppOrder();

  }

);


closeSuccess.addEventListener(

  "click",

  () => {


    successModal.style.display =

      "none";

  }

);


// ======================================
// CHECKOUT
// ======================================

const checkoutForm =

  document.getElementById(

    "checkout-form"

  );


checkoutForm.addEventListener(

  "submit",

  async event => {


    event.preventDefault();


    const name =

      document.getElementById(

        "customer-name"

      ).value;


    const phone =

      document.getElementById(

        "customer-phone"

      ).value;


    const address =

      document.getElementById(

        "customer-address"

      ).value;
    
    const note =
      
      document.getElementById(
        
        "customer-note"
      
      ).value;

    // Simpan data keranjang

    const orderItems =

      [...cart];


    // Hitung total

    const total =

      orderItems.reduce(

        (

          sum,

          item

        ) =>

          sum +

          Number(

            item.price

          ) *

          Number(

            item.quantity

          ),

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


            body: JSON.stringify({

              customer_name:

                name,


              customer_phone:

                phone,


              customer_address:

                address,

              note:
                
                note,

              items:

                cart

            })

          }

        );


      const data =

        await response.json();


      if (

        !response.ok

      ) {

        throw new Error(

          data.error

        );

      }


      // Simpan data untuk WhatsApp

      lastOrder = {

  name:
    name,

  phone:
    phone,

  address:
    address,

  note:
    note,

  items:
    orderItems,

  total:
    total

};


      // Kosongkan keranjang

      cart = [];


      updateCartCount();


      // Tutup checkout

      checkoutModal.style.display =

        "none";


      // Reset form

      checkoutForm.reset();


      // Update stok

      await loadProducts();


      // Tampilkan modal sukses

      document.getElementById(

        "success-total"

      ).textContent =

        formatRupiah(

          total

        );


      successModal.style.display =

        "flex";


    } catch (error) {


      console.error(

        error

      );


      alert(

        error.message ||

        "Gagal membuat pesanan. Silakan coba lagi."

      );

    }

  }

);
