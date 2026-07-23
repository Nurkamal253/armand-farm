// ======================================
// CEK LOGIN ADMIN
// ======================================

let adminToken =
  localStorage.getItem("adminToken");


if (!adminToken) {

  window.location.href =
    "login.html";

}


// ======================================
// FETCH API DENGAN TOKEN ADMIN
// ======================================

async function adminFetch(

  url,

  options = {}

) {

  const token =
    localStorage.getItem(
      "adminToken"
    );


  // ======================================
  // TOKEN TIDAK ADA
  // ======================================

  if (!token) {

    localStorage.removeItem(
      "adminData"
    );


    window.location.href =
      "login.html";


    throw new Error(
      "Token admin tidak ditemukan"
    );

  }


  const headers = {

    ...(options.headers || {}),

    Authorization:
      `Bearer ${token}`

  };


  const response =
    await fetch(

      url,

      {

        ...options,

        headers

      }

    );


  // ======================================
  // TOKEN TIDAK VALID / EXPIRED
  // ======================================

  if (

    response.status === 401

  ) {

    localStorage.removeItem(
      "adminToken"
    );


    localStorage.removeItem(
      "adminData"
    );


    alert(

      "Sesi login sudah berakhir. Silakan login kembali."

    );


    window.location.href =
      "login.html";


    throw new Error(
      "Token tidak valid"
    );

  }


  return response;

}

// ======================================
// API
// ======================================

const API_URL =
  "http://localhost:5000/api/products";


const ORDER_API_URL =
  "http://localhost:5000/api/orders";


// ======================================
// DATA
// ======================================

let products = [];

let orders = [];

let currentOrderFilter = "all";


// ======================================
// ELEMENT
// ======================================

const productsContainer =
  document.getElementById(
    "products-container"
  );


const ordersContainer =
  document.getElementById(
    "orders-container"
  );


const productModal =
  document.getElementById(
    "product-modal"
  );


const productForm =
  document.getElementById(
    "product-form"
  );


// ======================================
// FORMAT RUPIAH
// ======================================

function formatRupiah(

  number

) {

  return new Intl.NumberFormat(

    "id-ID",

    {

      style:
        "currency",

      currency:
        "IDR",

      minimumFractionDigits:
        0

    }

  ).format(

    Number(
      number || 0
    )

  );

}


// ======================================
// NAVIGASI KE TOKO
// ======================================

function goToStore() {

  window.location.href =
    "../frontend/index.html";

}


// ======================================
// LOGOUT ADMIN
// ======================================

const logoutButton =
  document.getElementById(
    "logout-button"
  );


if (logoutButton) {

  logoutButton.addEventListener(

    "click",

    function () {


      const confirmation =
        confirm(

          "Apakah kamu yakin ingin keluar dari dashboard admin?"

        );


      if (!confirmation) {

        return;

      }


      // HAPUS TOKEN

      localStorage.removeItem(

        "adminToken"

      );


      // HAPUS DATA ADMIN

      localStorage.removeItem(

        "adminData"

      );


      // KEMBALI KE LOGIN

      window.location.href =
        "login.html";

    }

  );

}

// ======================================
// LOAD PRODUK
// ======================================

async function loadProducts() {

  try {

    const response =
      await adminFetch(

        API_URL

      );


    if (!response.ok) {

      throw new Error(

        "Gagal mengambil produk"

      );

    }


    products =
      await response.json();


    renderProducts();


  } catch (error) {

    console.error(

      "ERROR LOAD PRODUCTS:",

      error

    );


    productsContainer.innerHTML = `

      <p>

        Gagal memuat produk.

      </p>

    `;

  }

}


// ======================================
// RENDER PRODUK
// ======================================

function renderProducts() {

  if (

    products.length === 0

  ) {

    productsContainer.innerHTML = `

      <p>

        Belum ada produk.

      </p>

    `;

    return;

  }


  productsContainer.innerHTML =
    "";


  products.forEach(

    product => {


      const productCard =
        document.createElement(
          "div"
        );


      productCard.className =
        "product-item";


      productCard.innerHTML = `

  <div class="product-card-header">

    <div class="product-card-icon">
      🥚
    </div>


    <div class="product-card-info">

      <h3>
        ${product.name}
      </h3>


      <p>
        ${product.desc || "Telur segar Armand Farm"}
      </p>

    </div>

  </div>


  <div class="product-info-grid">

    <div class="product-info-box">

      <span>
        💰 Harga
      </span>


      <strong>
        ${formatRupiah(product.price)}
      </strong>

    </div>


    <div class="product-info-box">

      <span>
        📦 Stok
      </span>


      <strong>
        ${product.stock}
        ${product.unit}
      </strong>

    </div>

  </div>


  <div class="product-actions">

    <button

      class="edit-product-button"

      onclick="editProduct('${product.id}')"

    >

      ✏️ Edit

    </button>


    <button

      class="delete-product-button"

      onclick="deleteProduct('${product.id}')"

    >

      🗑️ Hapus

    </button>

  </div>

`;


      productsContainer.appendChild(
        productCard
      );

    }

  );

}


// ======================================
// BUKA MODAL TAMBAH PRODUK
// ======================================

function openAddProductModal() {


  document.getElementById(
    "product-modal-title"
  ).textContent =
    "Tambah Produk";


  document.getElementById(
    "product-form"
  ).reset();


  document.getElementById(
    "product-id"
  ).value =
    "";


  productModal.style.display =
    "flex";

}


// ======================================
// TUTUP MODAL PRODUK
// ======================================

function closeProductModal() {

  productModal.style.display =
    "none";

}


// ======================================
// EDIT PRODUK
// ======================================

function editProduct(

  id

) {


  const product =
    products.find(

      item =>
        item.id === id

    );


  if (!product) {

    return;

  }


  document.getElementById(
    "product-modal-title"
  ).textContent =
    "Edit Produk";


  document.getElementById(
    "product-id"
  ).value =
    product.id;


  document.getElementById(
    "product-name"
  ).value =
    product.name;


  document.getElementById(
    "product-desc"
  ).value =
    product.desc || "";


  document.getElementById(
    "product-price"
  ).value =
    product.price;


  document.getElementById(
    "product-stock"
  ).value =
    product.stock;


  document.getElementById(
    "product-unit"
  ).value =
    product.unit || "";


  productModal.style.display =
    "flex";

}


// ======================================
// SIMPAN PRODUK
// ======================================

productForm.addEventListener(

  "submit",

  async function(event) {


    event.preventDefault();


    const id =
      document.getElementById(
        "product-id"
      ).value;


    const name =
      document.getElementById(
        "product-name"
      ).value.trim();


    const desc =
      document.getElementById(
        "product-desc"
      ).value.trim();


    const price =
      document.getElementById(
        "product-price"
      ).value;


    const stock =
      document.getElementById(
        "product-stock"
      ).value;


    const unit =
      document.getElementById(
        "product-unit"
      ).value.trim();


    const productData = {

      name,

      desc,

      price:
        Number(
          price
        ),

      stock:
        Number(
          stock
        ),

      unit

    };


    try {


      const response =
        await adminFetch(

          id

            ? `${API_URL}/${id}`

            : API_URL,

          {

            method:

              id

                ? "PUT"

                : "POST",


            headers: {

              "Content-Type":
                "application/json"

            },


            body:

              JSON.stringify(
                productData
              )

          }

        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(

          data.error ||

          "Gagal menyimpan produk"

        );

      }


      alert(

        id

          ? "Produk berhasil diperbarui"

          : "Produk berhasil ditambahkan"

      );


      closeProductModal();


      loadProducts();


    } catch (error) {

      console.error(
        "ERROR SAVE PRODUCT:",
        error
      );


      alert(

        error.message ||

        "Gagal menyimpan produk"

      );

    }

  }

);


// ======================================
// HAPUS PRODUK
// ======================================

async function deleteProduct(

  id

) {


  const confirmation =
    confirm(

      "Apakah kamu yakin ingin menghapus produk ini?"

    );


  if (!confirmation) {

    return;

  }


  try {


    const response =
      await adminFetch(

        `${API_URL}/${id}`,

        {

          method:
            "DELETE"

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(

        data.error ||

        "Gagal menghapus produk"

      );

    }


    alert(
      "Produk berhasil dihapus"
    );


    loadProducts();


  } catch (error) {

    console.error(
      "ERROR DELETE PRODUCT:",
      error
    );


    alert(

      error.message ||

      "Gagal menghapus produk"

    );

  }

}


// ======================================
// LOAD PESANAN
// ======================================

async function loadOrders() {

  try {

    const response =
  await adminFetch(

    ORDER_API_URL

  );

    if (!response.ok) {

      throw new Error(

        "Gagal mengambil pesanan"

      );

    }


    orders =
      await response.json();


    renderOrders();


    updateStatistics();


  } catch (error) {

    console.error(

      "ERROR LOAD ORDERS:",

      error

    );


    ordersContainer.innerHTML = `

      <p>

        Gagal memuat pesanan.

      </p>

    `;

  }

}


// ======================================
// RENDER PESANAN
// ======================================

function renderOrders() {


  let filteredOrders =
    orders;


  if (

    currentOrderFilter ===
    "paid"

  ) {

    filteredOrders =
      orders.filter(

        order =>
          order.payment_status ===
          "paid"

      );

  }


  if (

    currentOrderFilter ===
    "unpaid"

  ) {

    filteredOrders =
      orders.filter(

        order =>
          order.payment_status !==
          "paid"

      );

  }


  if (

    filteredOrders.length === 0

  ) {

    ordersContainer.innerHTML = `

      <p>

        Tidak ada pesanan pada kategori ini.

      </p>

    `;

    return;

  }


  ordersContainer.innerHTML =
    "";


  filteredOrders.forEach(

    order => {


      const orderCard =
        document.createElement(
          "div"
        );


      orderCard.className =
        "order-card";


      const isPaid =
        order.payment_status === "paid";

      const paymentStatus =
            isPaid
          ? "SUDAH DIBAYAR"
          : "BELUM DIBAYAR";

      const paymentClass =
            isPaid
          ? "paid"
          : "unpaid";


      let itemsHTML =
        "";


      if (

        order.items &&

        order.items.length > 0

      ) {


        itemsHTML =

          order.items.map(

            item => `

              <div class="order-item-detail">

                <span>

                  ${item.product_name}

                  ×

                  ${item.quantity}

                </span>


                <strong>

                  ${formatRupiah(

                    item.subtotal

                  )}

                </strong>

              </div>

            `

          ).join(

            ""

          );

      }


      orderCard.innerHTML = `

        <div class="order-card-header">

          <div>

            <h3>

              🧾 Pesanan

            </h3>


            <small>

              ${formatDate(

                order.created_at

              )}

            </small>

          </div>


          <div class="payment-status-box ${paymentClass}">

  <div class="payment-status-icon">

    ${isPaid ? "✓" : "!"}

  </div>

  <div class="payment-status-text">

    <strong>
      ${paymentStatus}
    </strong>

    <small>

      ${
        isPaid
          ? "Pembayaran telah diterima"
          : "Menunggu pembayaran dari customer"
      }

    </small>

  </div>

</div>


        </div>


        <div class="order-customer">

          <p>

            👤

            <strong>

              ${order.customer_name}

            </strong>

          </p>


          <p>

            📱

            ${order.customer_phone}

          </p>


          <p>

            📍

            ${order.customer_address}

          </p>

        </div>


        <div class="order-items">

          <h4>

            Detail Pesanan

          </h4>


          ${itemsHTML}

        </div>


        ${

          order.note

            ? `

              <div class="order-note">

                📝

                <strong>

                  Catatan:

                </strong>


                ${order.note}

              </div>

            `

            : ""

        }


        <div class="order-card-footer">

          <div>

            <span>

              Total Pesanan

            </span>


            <strong>

              ${formatRupiah(

                order.total_amount

              )}

            </strong>

          </div>


          <button


  class="payment-button ${isPaid ? "paid-action" : "unpaid-action"}"

  onclick="togglePaymentStatus(

    '${order.id}',

    '${order.payment_status}'

  )"

>

  ${

    isPaid

      ? "↩️ Ubah ke Belum Dibayar"

      : "✓ Tandai Sudah Dibayar"

  }

</button>

        </div>

      `;


      ordersContainer.appendChild(
        orderCard
      );

    }

  );

}


// ======================================
// FILTER PESANAN
// ======================================

function filterOrders(

  filter,

  button

) {


  currentOrderFilter =
    filter;


  document
    .querySelectorAll(
      ".filter-button"
    )
    .forEach(

      item => {

        item.classList.remove(
          "active"
        );

      }

    );


  if (button) {

    button.classList.add(
      "active"
    );

  }


  renderOrders();

}


// ======================================
// UBAH STATUS PEMBAYARAN
// ======================================

async function togglePaymentStatus(

  orderId,

  currentStatus

) {


  const newStatus =

    currentStatus ===
    "paid"

      ? "unpaid"

      : "paid";


  try {


    const response =
      await adminFetch(

        `${ORDER_API_URL}/${orderId}/payment`,

        {

          method:
            "PATCH",


          headers: {

            "Content-Type":
              "application/json"

          },


          body:

            JSON.stringify({

              payment_status:

                newStatus

            })

          }

        );



    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(

        data.error ||

        "Gagal mengubah status pembayaran"

      );

    }


    await loadOrders();


  } catch (error) {

    console.error(

      "ERROR PAYMENT STATUS:",

      error

    );


    alert(

      error.message ||

      "Gagal mengubah status pembayaran"

    );

  }

}


// ======================================
// UPDATE STATISTIK
// ======================================

function updateStatistics() {


  const totalOrders =
    document.getElementById(
      "total-orders"
    );


  const totalSales =
    document.getElementById(
      "total-sales"
    );


  const pendingOrders =
    document.getElementById(
      "pending-orders"
    );


  const completedOrders =
    document.getElementById(
      "completed-orders"
    );


  const paidOrders =
    orders.filter(

      order =>
        order.payment_status ===
        "paid"

    );


  const unpaidOrders =
    orders.filter(

      order =>
        order.payment_status !==
        "paid"

    );


  const totalSalesValue =
    paidOrders.reduce(

      (

        total,

        order

      ) =>

        total +

        Number(

          order.total_amount ||

          0

        ),

      0

    );


  if (totalOrders) {

    totalOrders.textContent =
      orders.length;

  }


  if (totalSales) {

    totalSales.textContent =
      formatRupiah(

        totalSalesValue

      );

  }


  if (pendingOrders) {

    pendingOrders.textContent =
      unpaidOrders.length;

  }


  if (completedOrders) {

    completedOrders.textContent =
      paidOrders.length;

  }

}


// ======================================
// FORMAT TANGGAL
// ======================================

function formatDate(

  date

) {


  if (!date) {

    return "-";

  }


  return new Date(

    date

  ).toLocaleString(

    "id-ID",

    {

      dateStyle:
        "medium",

      timeStyle:
        "short"

    }

  );

}


// ======================================
// LOAD DATA PERTAMA KALI
// ======================================

loadProducts();

loadOrders();


// ======================================
// AUTO REFRESH
// ======================================

setInterval(

  () => {


    // Cek apakah token masih ada

    const token =
      localStorage.getItem(
        "adminToken"
      );


    if (!token) {

      window.location.href =
        "login.html";

      return;

    }


   adminFetch()


  },

  5000

);