// ======================================
// CEK LOGIN ADMIN
// ======================================

const adminToken =
  localStorage.getItem("adminToken");


if (!adminToken) {

  window.location.href =
    "login.html";

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

let currentOrderFilter =
  "all";

let currentSearchKeyword =
  "";


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


const logoutButton =
  document.getElementById(
    "logout-button"
  );


const orderSearchInput =
  document.getElementById(
    "order-search-input"
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
// NAVIGASI KE TOKO
// ======================================

function goToStore() {

  window.location.href =
    "../frontend/index.html";

}


// ======================================
// CUSTOM ALERT MODAL
// ======================================

function showAlertModal(

  message,

  title = "Informasi",

  type = "success"

) {

  return new Promise(

    resolve => {


      const modal =
        document.getElementById(
          "alert-modal"
        );


      const titleElement =
        document.getElementById(
          "alert-title"
        );


      const messageElement =
        document.getElementById(
          "alert-message"
        );


      const iconElement =
        document.getElementById(
          "alert-icon"
        );


      const okButton =
        document.getElementById(
          "alert-ok-button"
        );


      if (

        !modal ||

        !titleElement ||

        !messageElement ||

        !iconElement ||

        !okButton

      ) {

        console.error(

          "Custom alert modal tidak ditemukan."

        );


        resolve();


        return;

      }


      titleElement.textContent =
        title;


      messageElement.textContent =
        message;


      iconElement.className =
        "alert-modal-icon";


      if (

        type === "success"

      ) {

        iconElement.textContent =
          "✓";


        iconElement.classList.add(
          "success"
        );

      }


      else if (

        type === "error"

      ) {

        iconElement.textContent =
          "✕";


        iconElement.classList.add(
          "error"
        );

      }


      else if (

        type === "warning"

      ) {

        iconElement.textContent =
          "!";


        iconElement.classList.add(
          "warning"
        );

      }


      else {

        iconElement.textContent =
          "i";

      }


      modal.style.display =
        "flex";


      function closeAlert() {

        modal.style.display =
          "none";


        okButton.removeEventListener(

          "click",

          handleOK

        );


        modal.removeEventListener(

          "click",

          handleOutsideClick

        );


        resolve();

      }


      function handleOK() {

        closeAlert();

      }


      function handleOutsideClick(

        event

      ) {

        if (

          event.target === modal

        ) {

          closeAlert();

        }

      }


      okButton.addEventListener(

        "click",

        handleOK

      );


      modal.addEventListener(

        "click",

        handleOutsideClick

      );

    }

  );

}


// ======================================
// CUSTOM CONFIRM MODAL
// ======================================

function showConfirmModal(

  message,

  title = "Konfirmasi",

  buttonText = "Ya, Lanjutkan",

  isDanger = false

) {

  return new Promise(

    resolve => {


      const modal =
        document.getElementById(
          "confirm-modal"
        );


      const titleElement =
        document.getElementById(
          "confirm-title"
        );


      const messageElement =
        document.getElementById(
          "confirm-message"
        );


      const cancelButton =
        document.getElementById(
          "confirm-cancel-button"
        );


      const okButton =
        document.getElementById(
          "confirm-ok-button"
        );


      if (

        !modal ||

        !titleElement ||

        !messageElement ||

        !cancelButton ||

        !okButton

      ) {

        console.error(

          "Custom confirm modal tidak ditemukan."

        );


        resolve(false);


        return;

      }


      titleElement.textContent =
        title;


      messageElement.textContent =
        message;


      okButton.textContent =
        buttonText;


      okButton.classList.toggle(

        "danger",

        isDanger

      );


      modal.style.display =
        "flex";


      function closeModal(

        result

      ) {

        modal.style.display =
          "none";


        okButton.removeEventListener(

          "click",

          handleConfirm

        );


        cancelButton.removeEventListener(

          "click",

          handleCancel

        );


        modal.removeEventListener(

          "click",

          handleOutsideClick

        );


        resolve(

          result

        );

      }


      function handleConfirm() {

        closeModal(

          true

        );

      }


      function handleCancel() {

        closeModal(

          false

        );

      }


      function handleOutsideClick(

        event

      ) {

        if (

          event.target === modal

        ) {

          closeModal(

            false

          );

        }

      }


      okButton.addEventListener(

        "click",

        handleConfirm

      );


      cancelButton.addEventListener(

        "click",

        handleCancel

      );


      modal.addEventListener(

        "click",

        handleOutsideClick

      );

    }

  );

}


// ======================================
// FETCH API DENGAN TOKEN ADMIN
// ======================================

async function adminFetch(

  url,

  options = {}

) {


  if (!url) {

    throw new Error(

      "URL API tidak ditemukan."

    );

  }


  const token =
    localStorage.getItem(
      "adminToken"
    );


  if (!token) {

    localStorage.removeItem(
      "adminData"
    );


    window.location.href =
      "login.html";


    throw new Error(

      "Token admin tidak ditemukan."

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


  if (

    response.status === 401

  ) {


    localStorage.removeItem(
      "adminToken"
    );


    localStorage.removeItem(
      "adminData"
    );


    await showAlertModal(

      "Sesi login sudah berakhir. Silakan login kembali.",

      "Sesi Berakhir",

      "warning"

    );


    window.location.href =
      "login.html";


    throw new Error(

      "Token tidak valid."

    );

  }


  return response;

}


// ======================================
// LOGOUT ADMIN
// ======================================

if (logoutButton) {

  logoutButton.addEventListener(

    "click",

    async function () {


      const confirmation =
        await showConfirmModal(

          "Apakah kamu yakin ingin keluar dari dashboard admin?",

          "Keluar dari Dashboard?",

          "Ya, Keluar",

          true

        );


      if (!confirmation) {

        return;

      }


      localStorage.removeItem(

        "adminToken"

      );


      localStorage.removeItem(

        "adminData"

      );


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

        "Gagal mengambil produk."

      );

    }


    products =
      await response.json();


    renderProducts();


  }


  catch (error) {


    console.error(

      "ERROR LOAD PRODUCTS:",

      error

    );


    if (productsContainer) {

      productsContainer.innerHTML = `

        <p>

          Gagal memuat produk.

        </p>

      `;

    }

  }

}


// ======================================
// RENDER PRODUK
// ======================================

function renderProducts() {


  if (!productsContainer) {

    return;

  }


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
        "product-card";


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

              ${
                product.desc ||

                "Telur segar Armand Farm"

              }

            </p>

          </div>

        </div>


        <div class="product-info-grid">

          <div class="product-info-box">

            <span>

              💰 Harga

            </span>


            <strong>

              ${formatRupiah(

                product.price

              )}

            </strong>

          </div>


          <div class="product-info-box">

            <span>

              📦 Stok

            </span>


            <strong>

              ${product.stock}

              ${product.unit || ""}

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


  productForm.reset();


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

        String(item.id) ===

        String(id)

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

if (productForm) {

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

          Number(price),


        stock:

          Number(stock),


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

            "Gagal menyimpan produk."

          );

        }


        await showAlertModal(

          id

            ? "Produk berhasil diperbarui."

            : "Produk berhasil ditambahkan.",

          "Berhasil",

          "success"

        );


        closeProductModal();


        await loadProducts();


      }


      catch (error) {


        console.error(

          "ERROR SAVE PRODUCT:",

          error

        );


        await showAlertModal(

          error.message ||

          "Gagal menyimpan produk.",

          "Gagal",

          "error"

        );

      }

    }

  );

}


// ======================================
// HAPUS PRODUK
// ======================================

async function deleteProduct(

  id

) {


  const confirmation =

    await showConfirmModal(

      "Apakah kamu yakin ingin menghapus produk ini?",

      "Hapus Produk?",

      "Ya, Hapus",

      true

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

        "Gagal menghapus produk."

      );

    }


    await showAlertModal(

      "Produk berhasil dihapus.",

      "Berhasil",

      "success"

    );


    await loadProducts();


  }


  catch (error) {


    console.error(

      "ERROR DELETE PRODUCT:",

      error

    );


    await showAlertModal(

      error.message ||

      "Gagal menghapus produk.",

      "Gagal",

      "error"

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

        "Gagal mengambil pesanan."

      );

    }


    orders =

      await response.json();


    renderOrders();


    updateStatistics();


  }


  catch (error) {


    console.error(

      "ERROR LOAD ORDERS:",

      error

    );


    if (ordersContainer) {

      ordersContainer.innerHTML = `

        <p>

          Gagal memuat pesanan.

        </p>

      `;

    }

  }

}


// ======================================
// RENDER PESANAN
// ======================================

function renderOrders() {


  if (!ordersContainer) {

    return;

  }


  let filteredOrders =

    orders;


  // FILTER STATUS

  if (

    currentOrderFilter ===

    "paid"

  ) {


    filteredOrders =

      filteredOrders.filter(

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

      filteredOrders.filter(

        order =>

          order.payment_status !==

          "paid"

      );

  }


  // SEARCH CUSTOMER

  if (

    currentSearchKeyword

  ) {


    filteredOrders =

      filteredOrders.filter(

        order => {


          const customerName =

            (

              order.customer_name ||

              ""

            ).toLowerCase();


          const customerPhone =

            (

              order.customer_phone ||

              ""

            ).toLowerCase();


          const keyword =

            currentSearchKeyword.toLowerCase();


          return (

            customerName.includes(

              keyword

            ) ||

            customerPhone.includes(

              keyword

            )

          );

        }

      );

  }


  if (

    filteredOrders.length ===

    0

  ) {


    ordersContainer.innerHTML = `

      <p>

        Tidak ada pesanan yang ditemukan.

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

        order.payment_status ===

        "paid";


      const paymentStatus =

        isPaid

          ? "SUDAH DIBAYAR"

          : "BELUM DIBAYAR";


      const paymentClass =

        isPaid

          ? "paid"

          : "unpaid";

// ======================================
// STATUS PENGIRIMAN
// ======================================

let shippingStatus = "";
let shippingClass = "";

switch (order.order_status) {

  case "packaging":

    shippingStatus = "📦 Dikemas";
    shippingClass = "packaging";
    break;

  case "shipping":

    shippingStatus = "🚚 Dalam Pengiriman";
    shippingClass = "shipping";
    break;

  case "delivered":

    shippingStatus = "✅ Sudah Dikirim";
    shippingClass = "delivered";
    break;

  default:

    shippingStatus = "📦 Dikemas";
    shippingClass = "packaging";

}          

      let itemsHTML =

        "";


      if (

        order.items &&

        order.items.length > 0

      ) {


        itemsHTML =

          order.items.map(

            item => `

              <div

                class="order-item-detail"

              >

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

          ).join("");

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


          <div

            class="payment-status-box ${paymentClass}"

          >

            <div

              class="payment-status-icon"

            >

              ${

                isPaid

                  ? "✓"

                  : "!"

              }

            </div>


            <div

              class="payment-status-text"

            >

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

              <div

                class="order-note"

              >

                📝

                <strong>

                  Catatan:

                </strong>


                ${order.note}

              </div>

            `

            : ""

        }


        <div

         <div class="order-card-footer">

    <div>

        <span>Total Pesanan</span>

        <strong>
            ${formatRupiah(order.total_amount)}
        </strong>

        ${
            isPaid
            ?
            `
            <div class="shipping-status ${shippingClass}">
                ${shippingStatus}
            </div>
            `
            :
            ""
        }

    </div>

    <div class="order-actions">

        <button
            class="payment-button ${
                isPaid ? "paid-action" : "unpaid-action"
            }"
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

        ${
            isPaid
            ?
            `
            <select
                onchange="updateOrderStatus('${order.id}', this.value)"
            >

                <option value="packaging"
                ${order.order_status==="packaging"?"selected":""}>
                Dikemas
                </option>

                <option value="shipping"
                ${order.order_status==="shipping"?"selected":""}>
                Dalam Pengiriman
                </option>

                <option value="delivered"
                ${order.order_status==="delivered"?"selected":""}>
                Sudah Dikirim
                </option>

            </select>
            `
            :
            ""
        }

    </div>

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
// SEARCH PESANAN
// ======================================

if (orderSearchInput) {


  orderSearchInput.addEventListener(

    "input",

    function() {


      currentSearchKeyword =

        this.value.trim();


      renderOrders();

    }

  );

}


// ======================================
// UBAH STATUS PEMBAYARAN
// ======================================

async function togglePaymentStatus(

  orderId,

  currentStatus

) {


  const isCurrentlyPaid =

    currentStatus ===

    "paid";


  const newStatus =

    isCurrentlyPaid

      ? "unpaid"

      : "paid";


  const confirmation =

    await showConfirmModal(

      isCurrentlyPaid

        ? "Ubah status pesanan ini menjadi belum dibayar?"

        : "Tandai pesanan ini sebagai sudah dibayar?",

      isCurrentlyPaid

        ? "Ubah Status Pembayaran?"

        : "Konfirmasi Pembayaran",

      isCurrentlyPaid

        ? "Ya, Ubah"

        : "Ya, Tandai Dibayar",

      isCurrentlyPaid

        ? true

        : false

    );


  if (!confirmation) {

    return;

  }


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

            JSON.stringify(

              {

                payment_status:

                  newStatus

              }

            )

        }

      );


    const data =

      await response.json();


    if (!response.ok) {

      throw new Error(

        data.error ||

        "Gagal mengubah status pembayaran."

      );

    }


    await loadOrders();


  }


  catch (error) {


    console.error(

      "ERROR PAYMENT STATUS:",

      error

    );


    await showAlertModal(

      error.message ||

      "Gagal mengubah status pembayaran.",

      "Gagal",

      "error"

    );

  }

}

async function updateOrderStatus(orderId,status){

    try{

        const response=await adminFetch(

            `${ORDER_API_URL}/${orderId}/status`,

            {

                method:"PATCH",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    order_status:status

                })

            }

        );

        const data=await response.json();

        if(!response.ok){

            throw new Error(data.error);

        }

        await loadOrders();

    }

    catch(error){

        console.error(error);

        await showAlertModal(

            error.message,

            "Gagal",

            "error"

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
// LOAD DATA PERTAMA KALI
// ======================================

loadProducts();

loadOrders();


// ======================================
// AUTO REFRESH
// ======================================

setInterval(

  async function() {


    const token =

      localStorage.getItem(

        "adminToken"

      );


    if (!token) {


      window.location.href =

        "login.html";


      return;

    }


    // Jangan panggil adminFetch()
    // tanpa URL API.


    await loadProducts();

    await loadOrders();


  },

  30000

);


// ======================================
// GLOBAL FUNCTION
// ======================================

window.goToStore =
  goToStore;


window.openAddProductModal =
  openAddProductModal;


window.closeProductModal =
  closeProductModal;


window.editProduct =
  editProduct;


window.deleteProduct =
  deleteProduct;


window.filterOrders =
  filterOrders;


window.togglePaymentStatus =
  togglePaymentStatus;

window.updateOrderStatus =
    updateOrderStatus;