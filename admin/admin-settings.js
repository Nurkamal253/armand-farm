// ======================================
// API
// ======================================

const ADMIN_API_URL =
  "http://localhost:5000/api/admin";


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


  if (!token) {

    window.location.href =
      "login.html";

    return;

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


    showNotification(

      "Sesi login sudah berakhir. Silakan login kembali.",

      "error"

    );


    setTimeout(

      () => {

        window.location.href =
          "login.html";

      },

      1800

    );


    return;

  }


  return response;

}


// ======================================
// CUSTOM POPUP
// ======================================

function createPopupContainer() {

  let container =

    document.getElementById(

      "custom-popup-container"

    );


  if (!container) {

    container =
      document.createElement(

        "div"

      );


    container.id =
      "custom-popup-container";


    document.body.appendChild(

      container

    );

  }


  return container;

}


// ======================================
// NOTIFICATION POPUP
// ======================================

function showNotification(

  message,

  type = "success"

) {

  const container =
    createPopupContainer();


  const popup =
    document.createElement(

      "div"

    );


  popup.className =
    `custom-notification ${type}`;


  let icon =
    "✓";


  if (

    type === "error"

  ) {

    icon =
      "✕";

  }


  if (

    type === "warning"

  ) {

    icon =
      "!";

  }


  popup.innerHTML = `

    <div class="notification-icon">

      ${icon}

    </div>


    <div class="notification-message">

      ${message}

    </div>


    <button

      class="notification-close"

      onclick="this.parentElement.remove()"

    >

      ✕

    </button>

  `;


  container.appendChild(

    popup

  );


  setTimeout(

    () => {

      popup.classList.add(

        "show"

      );

    },

    10

  );


  setTimeout(

    () => {

      popup.classList.remove(

        "show"

      );


      setTimeout(

        () => {

          popup.remove();

        },

        300

      );

    },

    3500

  );

}


// ======================================
// KONFIRMASI CUSTOM
// ======================================

function showConfirmPopup(

  message,

  title = "Konfirmasi"

) {

  return new Promise(

    resolve => {


      const container =
        createPopupContainer();


      const overlay =
        document.createElement(

          "div"

        );


      overlay.className =
        "custom-confirm-overlay";


      overlay.innerHTML = `

        <div class="custom-confirm-box">

          <div class="confirm-icon">

            ?

          </div>


          <h3>

            ${title}

          </h3>


          <p>

            ${message}

          </p>


          <div class="confirm-actions">

            <button

              class="confirm-cancel-button"

            >

              Batal

            </button>


            <button

              class="confirm-ok-button"

            >

              Ya, Lanjutkan

            </button>

          </div>

        </div>

      `;


      container.appendChild(

        overlay

      );


      const cancelButton =
        overlay.querySelector(

          ".confirm-cancel-button"

        );


      const okButton =
        overlay.querySelector(

          ".confirm-ok-button"

        );


      function closePopup(

        result

      ) {

        overlay.classList.add(

          "closing"

        );


        setTimeout(

          () => {

            overlay.remove();


            resolve(

              result

            );

          },

          250

        );

      }


      cancelButton.addEventListener(

        "click",

        () => {

          closePopup(

            false

          );

        }

      );


      okButton.addEventListener(

        "click",

        () => {

          closePopup(

            true

          );

        }

      );


      overlay.addEventListener(

        "click",

        event => {


          if (

            event.target === overlay

          ) {

            closePopup(

              false

            );

          }

        }

      );


    }

  );

}


// ======================================
// LOAD ADMIN
// ======================================

async function loadAdmins() {

  try {


    const response =
      await adminFetch(

        ADMIN_API_URL

      );


    if (!response) {

      return;

    }


    if (!response.ok) {

      throw new Error(

        "Gagal mengambil data admin"

      );

    }


    const admins =
      await response.json();


    renderActiveAdmin(

      admins

    );


    renderAdminList(

      admins

    );


  } catch (error) {


    console.error(

      "ERROR LOAD ADMIN:",

      error

    );


    document.getElementById(

      "admin-list"

    ).innerHTML = `

      <div class="loading">

        ❌ Gagal memuat data admin

      </div>

    `;

  }

}


// ======================================
// ADMIN WHATSAPP AKTIF
// ======================================

function renderActiveAdmin(

  admins

) {


  const container =
    document.getElementById(

      "active-admin-container"

    );


  const activeAdmin =
    admins.find(

      admin =>

        admin.is_active === true

    );


  if (!activeAdmin) {


    container.innerHTML = `

      <div class="loading">

        Belum ada admin WhatsApp aktif.

      </div>

    `;


    return;

  }


  container.innerHTML = `

    <div class="active-admin">

      <div class="active-admin-info">

        <div class="admin-avatar-large">

          👤

        </div>


        <div>

          <h3>

            ${activeAdmin.name}

          </h3>


          <p>

            📱 ${activeAdmin.whatsapp}

          </p>


          <p>

            ✉️ ${activeAdmin.email}

          </p>

        </div>

      </div>


      <span class="active-badge">

        ✓ WhatsApp Aktif

      </span>

    </div>

  `;

}


// ======================================
// DAFTAR ADMIN
// ======================================

function renderAdminList(

  admins

) {


  const container =
    document.getElementById(

      "admin-list"

    );


  if (

    !admins ||

    admins.length === 0

  ) {


    container.innerHTML = `

      <div class="loading">

        Belum ada admin terdaftar.

      </div>

    `;


    return;

  }


  container.innerHTML =
    "";


  admins.forEach(

    admin => {


      const item =
        document.createElement(

          "div"

        );


      item.className =
        "admin-item";


      item.innerHTML = `

        <div class="admin-info">

          <div class="admin-avatar">

            👤

          </div>


          <div class="admin-details">

            <h3>

              ${admin.name}

            </h3>


            <p>

              ✉️ ${admin.email}

            </p>


            <small>

              📱 ${admin.whatsapp}

            </small>

          </div>

        </div>


        <div class="admin-actions">

          <button

            class="admin-action-button edit-button"

            onclick="editAdmin('${admin.id}')"

          >

            ✏️ Edit

          </button>


          ${

            admin.is_active

              ? `

                <button

                  class="admin-action-button"

                  disabled

                >

                  ✓ Aktif

                </button>

              `

              : `

                <button

                  class="admin-action-button activate-button"

                  onclick="activateAdmin('${admin.id}')"

                >

                  📱 Jadikan Aktif

                </button>

              `

          }


          <button

            class="admin-action-button delete-button"

            onclick="deleteAdmin('${admin.id}')"

          >

            🗑️

          </button>

        </div>

      `;


      container.appendChild(

        item

      );

    }

  );

}


// ======================================
// MODAL TAMBAH ADMIN
// ======================================

function openAddAdminModal() {


  document.getElementById(

    "modal-title"

  ).textContent =

    "Tambah Admin";


  document.getElementById(

    "admin-form"

  ).reset();


  document.getElementById(

    "admin-id"

  ).value =

    "";


  document.getElementById(

    "admin-password"

  ).required =

    true;


  document.getElementById(

    "password-info"

  ).textContent =

    "Wajib diisi saat membuat admin baru";


  document.getElementById(

    "admin-modal"

  ).style.display =

    "flex";

}


// ======================================
// TUTUP MODAL
// ======================================

function closeAdminModal() {


  document.getElementById(

    "admin-modal"

  ).style.display =

    "none";

}


// ======================================
// EDIT ADMIN
// ======================================

async function editAdmin(

  id

) {


  try {


    const response =
      await adminFetch(

        `${ADMIN_API_URL}/${id}`

      );


    if (!response) {

      return;

    }


    if (!response.ok) {

      throw new Error(

        "Gagal mengambil data admin"

      );

    }


    const admin =
      await response.json();


    document.getElementById(

      "modal-title"

    ).textContent =

      "Edit Admin";


    document.getElementById(

      "admin-id"

    ).value =

      admin.id;


    document.getElementById(

      "admin-name"

    ).value =

      admin.name;


    document.getElementById(

      "admin-email"

    ).value =

      admin.email;


    document.getElementById(

      "admin-whatsapp"

    ).value =

      admin.whatsapp;


    document.getElementById(

      "admin-password"

    ).value =

      "";


    document.getElementById(

      "admin-password"

    ).required =

      false;


    document.getElementById(

      "password-info"

    ).textContent =

      "Kosongkan jika password tidak ingin diubah";


    document.getElementById(

      "admin-modal"

    ).style.display =

      "flex";


  } catch (error) {


    console.error(

      "ERROR GET ADMIN:",

      error

    );


    showNotification(

      error.message ||

      "Gagal mengambil data admin",

      "error"

    );

  }

}


// ======================================
// SIMPAN ADMIN
// ======================================

document

  .getElementById(

    "admin-form"

  )

  .addEventListener(

    "submit",

    async function(

      event

    ) {


      event.preventDefault();


      const id =
        document.getElementById(

          "admin-id"

        ).value;


      const data = {


        name:

          document.getElementById(

            "admin-name"

          ).value.trim(),


        email:

          document.getElementById(

            "admin-email"

          ).value.trim(),


        whatsapp:

          document.getElementById(

            "admin-whatsapp"

          ).value.trim()

      };


      const password =

        document.getElementById(

          "admin-password"

        ).value;


      if (

        password

      ) {

        data.password =
          password;

      }


      try {


        const response =

          await adminFetch(


            id

              ? `${ADMIN_API_URL}/${id}`

              : ADMIN_API_URL,


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

                  data

                )

            }

          );


        if (!response) {

          return;

        }


        const result =

          await response.json();


        if (!response.ok) {

          throw new Error(

            result.error ||

            "Gagal menyimpan admin"

          );

        }


        showNotification(

          id

            ? "Admin berhasil diperbarui"

            : "Admin berhasil ditambahkan",

          "success"

        );


        closeAdminModal();


        loadAdmins();


      } catch (error) {


        console.error(

          "ERROR SAVE ADMIN:",

          error

        );


        showNotification(

          error.message ||

          "Gagal menyimpan admin",

          "error"

        );

      }

    }

  );


// ======================================
// AKTIFKAN ADMIN WHATSAPP
// ======================================

async function activateAdmin(

  id

) {


  const confirmation =

    await showConfirmPopup(

      "Jadikan admin ini sebagai penerima WhatsApp pesanan?",

      "Aktifkan Admin WhatsApp"

    );


  if (!confirmation) {

    return;

  }


  try {


    const response =

      await adminFetch(

        `${ADMIN_API_URL}/${id}/activate`,

        {

          method:

            "PATCH"

        }

      );


    if (!response) {

      return;

    }


    const result =

      await response.json();


    if (!response.ok) {

      throw new Error(

        result.error ||

        "Gagal mengaktifkan admin"

      );

    }


    showNotification(

      "Admin WhatsApp aktif berhasil diubah",

      "success"

    );


    loadAdmins();


  } catch (error) {


    console.error(

      "ERROR ACTIVATE ADMIN:",

      error

    );


    showNotification(

      error.message ||

      "Gagal mengaktifkan admin",

      "error"

    );

  }

}


// ======================================
// HAPUS ADMIN
// ======================================

async function deleteAdmin(

  id

) {


  const confirmation =

    await showConfirmPopup(

      "Apakah kamu yakin ingin menghapus admin ini?",

      "Hapus Admin"

    );


  if (!confirmation) {

    return;

  }


  try {


    const response =

      await adminFetch(

        `${ADMIN_API_URL}/${id}`,

        {

          method:

            "DELETE"

        }

      );


    if (!response) {

      return;

    }


    const result =

      await response.json();


    if (!response.ok) {

      throw new Error(

        result.error ||

        "Gagal menghapus admin"

      );

    }


    showNotification(

      "Admin berhasil dihapus",

      "success"

    );


    loadAdmins();


  } catch (error) {


    console.error(

      "ERROR DELETE ADMIN:",

      error

    );


    showNotification(

      error.message ||

      "Gagal menghapus admin",

      "error"

    );

  }

}


// ======================================
// NAVIGASI KE TOKO
// ======================================

function goToStore() {


  window.location.href =

    "../frontend/index.html";

}


// ======================================
// LOGOUT
// ======================================

function logoutAdmin() {


  localStorage.removeItem(

    "adminToken"

  );


  localStorage.removeItem(

    "adminData"

  );


  window.location.href =

    "login.html";

}


// ======================================
// TUTUP MODAL KLIK LUAR
// ======================================

window.addEventListener(

  "click",

  function(

    event

  ) {


    const modal =

      document.getElementById(

        "admin-modal"

      );


    if (

      event.target === modal

    ) {

      closeAdminModal();

    }

  }

);


// ======================================
// LOAD AWAL
// ======================================

loadAdmins();