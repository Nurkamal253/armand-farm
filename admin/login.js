const LOGIN_API_URL =
  "http://localhost:5000/api/admin/login";


// ======================================
// AMBIL ELEMENT HTML
// ======================================

const loginForm =
  document.getElementById(
    "login-form"
  );


const emailInput =
  document.getElementById(
    "email"
  );


const passwordInput =
  document.getElementById(
    "password"
  );


const errorMessage =
  document.getElementById(
    "error-message"
  );


const loginButton =
  document.getElementById(
    "login-button"
  );


// ======================================
// CEK JIKA SUDAH LOGIN
// ======================================

const existingToken =
  localStorage.getItem(
    "adminToken"
  );


if (

  existingToken

) {

  window.location.href =
    "index.html";

}


// ======================================
// LOGIN ADMIN
// ======================================

loginForm.addEventListener(

  "submit",

  async event => {


    event.preventDefault();


    const email =
      emailInput.value.trim();


    const password =
      passwordInput.value;


    // Sembunyikan pesan error sebelumnya

    errorMessage.style.display =
      "none";


    // Nonaktifkan tombol saat proses login

    loginButton.disabled =
      true;


    loginButton.textContent =
      "⏳ Memproses...";


    try {


      const response =
        await fetch(

          LOGIN_API_URL,

          {

            method:
              "POST",


            headers: {

              "Content-Type":
                "application/json"

            },


            body:

              JSON.stringify({

                email,

                password

              })

          }

        );


      const data =
        await response.json();


      // ======================================
      // CEK HASIL LOGIN
      // ======================================

      if (

        !response.ok

      ) {

        throw new Error(

          data.error ||

          "Login gagal"

        );

      }


      // ======================================
      // SIMPAN TOKEN LOGIN
      // ======================================

      localStorage.setItem(

        "adminToken",

        data.token

      );


      // ======================================
      // SIMPAN DATA ADMIN
      // ======================================

      localStorage.setItem(

        "adminData",

        JSON.stringify(

          data.admin

        )

      );


      // ======================================
      // MASUK KE DASHBOARD
      // ======================================

      window.location.href =
        "index.html";


    } catch (error) {


      console.error(

        "ERROR LOGIN:",

        error

      );


      errorMessage.textContent =

        error.message ||

        "Gagal melakukan login";


      errorMessage.style.display =
        "block";


      // Aktifkan kembali tombol login

      loginButton.disabled =
        false;


      loginButton.textContent =
        "🔐 Login";

    }

  }

);