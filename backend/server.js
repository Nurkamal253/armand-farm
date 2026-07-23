require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  PrismaClient
} = require("./generated/prisma");

const {
  PrismaPg
} = require("@prisma/adapter-pg");


const app =
  express();


const PORT =
  process.env.PORT || 5000;


const JWT_SECRET =
  process.env.JWT_SECRET;


if (!JWT_SECRET) {

  console.error(
    "ERROR: JWT_SECRET belum diatur di file .env"
  );

  process.exit(1);

}


// ======================================
// MIDDLEWARE GLOBAL
// ======================================

app.use(

  cors()

);


app.use(

  express.json()

);


// ======================================
// DATABASE
// ======================================

const adapter =
  new PrismaPg({

    connectionString:
      process.env.DATABASE_URL

  });


const prisma =
  new PrismaClient({

    adapter

  });


// ======================================
// HELPER
// ======================================


// ======================================
// AMBIL TOKEN DARI HEADER
// ======================================

function getTokenFromRequest(

  req

) {

  const authHeader =
    req.headers.authorization;


  if (

    !authHeader ||

    !authHeader.startsWith(
      "Bearer "
    )

  ) {

    return null;

  }


  return authHeader.split(
    " "
  )[1];

}


// ======================================
// AUTHENTICATE ADMIN
// ======================================

async function authenticateAdmin(

  req,

  res,

  next

) {

  try {


    const token =
      getTokenFromRequest(

        req

      );


    if (!token) {

      return res.status(401).json({

        error:
          "Akses ditolak. Token admin tidak ditemukan."

      });

    }


    // ======================================
    // VERIFIKASI JWT
    // ======================================

    const decoded =
      jwt.verify(

        token,

        JWT_SECRET

      );


    if (

      !decoded.id ||

      decoded.tokenVersion === undefined

    ) {

      return res.status(401).json({

        error:
          "Token tidak valid."

      });

    }


    // ======================================
    // CARI ADMIN DI DATABASE
    // ======================================

    const admin =
      await prisma.admin.findUnique({

        where: {

          id:
            decoded.id

        }

      });


    if (!admin) {

      return res.status(401).json({

        error:
          "Admin tidak ditemukan."

      });

    }


    // ======================================
    // CEK TOKEN VERSION
    // ======================================

    if (

      admin.token_version !==
      decoded.tokenVersion

    ) {

      return res.status(401).json({

        error:
          "Sesi login sudah tidak berlaku. Silakan login kembali."

      });

    }


    // ======================================
    // SIMPAN DATA ADMIN KE REQUEST
    // ======================================

    req.admin =
      admin;


    next();


  } catch (error) {


    if (

      error.name ===
      "TokenExpiredError"

    ) {

      return res.status(401).json({

        error:
          "Token sudah kedaluwarsa. Silakan login kembali."

      });

    }


    if (

      error.name ===
      "JsonWebTokenError"

    ) {

      return res.status(401).json({

        error:
          "Token tidak valid."

      });

    }


    console.error(

      "ERROR AUTHENTICATE ADMIN:",

      error

    );


    return res.status(500).json({

      error:
        "Gagal memverifikasi token admin."

    });

  }

}


// ======================================
// CEK SUPERADMIN
// ======================================

function requireSuperAdmin(

  req,

  res,

  next

) {

  if (

    req.admin.role !==
    "superadmin"

  ) {

    return res.status(403).json({

      error:
        "Akses hanya untuk Superadmin."

    });

  }


  next();

}


// ======================================
// HOME
// ======================================

app.get(

  "/",

  (req, res) => {

    res.send(

      "Armand Farm Backend berjalan!"

    );

  }

);


// ==================================================
// PRODUK
// ==================================================


// ======================================
// GET SEMUA PRODUK
// ======================================
//
// PUBLIC
// Dibutuhkan oleh halaman toko/customer
//

app.get(

  "/api/products",

  async (req, res) => {

    try {


      const products =
        await prisma.product.findMany({

          orderBy: {

            createdAt:
              "desc"

          }

        });


      res.json(

        products

      );


    } catch (error) {


      console.error(

        "ERROR GET PRODUCTS:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengambil data produk."

      });

    }

  }

);


// ======================================
// TAMBAH PRODUK
// ======================================
//
// ADMIN WAJIB LOGIN
//

app.post(

  "/api/products",

  authenticateAdmin,

  async (req, res) => {

    try {


      const {

        name,

        desc,

        price,

        stock,

        unit

      } = req.body;


      if (

        !name ||

        price === undefined ||

        stock === undefined ||

        !unit

      ) {

        return res.status(400).json({

          error:
            "Nama, harga, stok, dan unit wajib diisi."

        });

      }


      const numericPrice =
        Number(price);


      const numericStock =
        Number(stock);


      if (

        isNaN(numericPrice) ||

        numericPrice < 0

      ) {

        return res.status(400).json({

          error:
            "Harga tidak valid."

        });

      }


      if (

        isNaN(numericStock) ||

        numericStock < 0

      ) {

        return res.status(400).json({

          error:
            "Stok tidak valid."

        });

      }


      const product =
        await prisma.product.create({

          data: {

            name:
              name.trim(),

            desc:
              desc
                ? desc.trim()
                : "",

            price:
              numericPrice,

            stock:
              numericStock,

            unit:
              unit.trim()

          }

        });


      res.status(201).json(

        product

      );


    } catch (error) {


      console.error(

        "ERROR CREATE PRODUCT:",

        error

      );


      res.status(500).json({

        error:
          "Gagal menambahkan produk."

      });

    }

  }

);


// ======================================
// EDIT PRODUK
// ======================================

app.put(

  "/api/products/:id",

  authenticateAdmin,

  async (req, res) => {

    try {


      const {

        id

      } = req.params;


      const {

        name,

        desc,

        price,

        stock,

        unit

      } = req.body;


      if (

        !name ||

        price === undefined ||

        stock === undefined ||

        !unit

      ) {

        return res.status(400).json({

          error:
            "Nama, harga, stok, dan unit wajib diisi."

        });

      }


      const numericPrice =
        Number(price);


      const numericStock =
        Number(stock);


      if (

        isNaN(numericPrice) ||

        numericPrice < 0

      ) {

        return res.status(400).json({

          error:
            "Harga tidak valid."

        });

      }


      if (

        isNaN(numericStock) ||

        numericStock < 0

      ) {

        return res.status(400).json({

          error:
            "Stok tidak valid."

        });

      }


      const product =
        await prisma.product.update({

          where: {

            id

          },

          data: {

            name:
              name.trim(),

            desc:
              desc
                ? desc.trim()
                : "",

            price:
              numericPrice,

            stock:
              numericStock,

            unit:
              unit.trim()

          }

        });


      res.json(

        product

      );


    } catch (error) {


      console.error(

        "ERROR UPDATE PRODUCT:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengubah produk."

      });

    }

  }

);


// ======================================
// HAPUS PRODUK
// ======================================

app.delete(

  "/api/products/:id",

  authenticateAdmin,

  async (req, res) => {

    try {


      const {

        id

      } = req.params;


      await prisma.product.delete({

        where: {

          id

        }

      });


      res.json({

        message:
          "Produk berhasil dihapus."

      });


    } catch (error) {


      console.error(

        "ERROR DELETE PRODUCT:",

        error

      );


      res.status(500).json({

        error:
          "Gagal menghapus produk."

      });

    }

  }

);


// ==================================================
// PESANAN
// ==================================================


// ======================================
// BUAT PESANAN
// ======================================
//
// PUBLIC
// Customer dapat membuat pesanan
//

app.post(

  "/api/orders",

  async (req, res) => {

    try {


      const {

        customer_name,

        customer_phone,

        customer_address,

        note,

        items

      } = req.body;


      if (

        !customer_name ||

        !customer_phone ||

        !customer_address

      ) {

        return res.status(400).json({

          error:
            "Data customer wajib diisi."

        });

      }


      if (

        !Array.isArray(items) ||

        items.length === 0

      ) {

        return res.status(400).json({

          error:
            "Keranjang kosong."

        });

      }


      const order =

        await prisma.$transaction(

          async (tx) => {


            const products = [];


            // ======================================
            // VALIDASI SEMUA PRODUK
            // ======================================

            for (

              const item of items

            ) {


              const product =
                await tx.product.findUnique({

                  where: {

                    id:
                      item.id

                  }

                });


              if (!product) {

                throw new Error(

                  `Produk ${item.name || ""} tidak ditemukan.`

                );

              }


              const quantity =
                Number(

                  item.quantity

                );


              if (

                !Number.isInteger(

                  quantity

                ) ||

                quantity <= 0

              ) {

                throw new Error(

                  `Jumlah produk ${product.name} tidak valid.`

                );

              }


              const currentStock =
                Number(

                  product.stock || 0

                );


              if (

                currentStock < quantity

              ) {

                throw new Error(

                  `Stok ${product.name} tidak mencukupi. ` +

                  `Stok tersedia: ` +

                  `${currentStock} ${product.unit || ""}.`

                );

              }


              products.push({

                product,

                quantity

              });

            }


            // ======================================
            // HITUNG TOTAL
            // ======================================

            let total_amount =
              0;


            products.forEach(

              ({

                product,

                quantity

              }) => {


                total_amount +=

                  Number(

                    product.price

                  ) *

                  quantity;

              }

            );


            // ======================================
            // BUAT PESANAN
            // ======================================

            const newOrder =
              await tx.order.create({

                data: {

                  customer_name:
                    customer_name.trim(),

                  customer_phone:
                    customer_phone.trim(),

                  customer_address:
                    customer_address.trim(),

                  note:
                    note
                      ? note.trim()
                      : null,

                  total_amount,

                  created_at:
                    new Date()

                }

              });


            // ======================================
            // SIMPAN DETAIL PESANAN
            // ======================================

            await tx.orderItem.createMany({

              data:

                products.map(

                  ({

                    product,

                    quantity

                  }) => ({


                    order_id:
                      newOrder.id,


                    product_id:
                      product.id,


                    product_name:
                      product.name,


                    price:
                      product.price,


                    quantity,


                    subtotal:

                      Number(

                        product.price

                      ) *

                      quantity

                  })

                )

            });


            // ======================================
            // KURANGI STOK
            // ======================================

            for (

              const {

                product,

                quantity

              } of products

            ) {


              await tx.product.update({

                where: {

                  id:
                    product.id

                },

                data: {

                  stock: {

                    decrement:
                      quantity

                  }

                }

              });

            }


            return newOrder;

          }

        );


      res.status(201).json({

        message:
          "Pesanan berhasil dibuat.",

        order

      });


    } catch (error) {


      console.error(

        "ERROR CREATE ORDER:",

        error

      );


      res.status(400).json({

        error:

          error.message ||

          "Gagal membuat pesanan."

      });

    }

  }

);


// ======================================
// GET SEMUA PESANAN
// ======================================
//
// ADMIN WAJIB LOGIN
//

app.get(

  "/api/orders",

  authenticateAdmin,

  async (req, res) => {

    try {


      const orders =
        await prisma.order.findMany({

          include: {

            items:
              true

          },

          orderBy: {

            created_at:
              "desc"

          }

        });


      res.json(

        orders

      );


    } catch (error) {


      console.error(

        "ERROR GET ORDERS:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengambil data pesanan."

      });

    }

  }

);


// ======================================
// UPDATE STATUS PEMBAYARAN
// ======================================

app.patch(

  "/api/orders/:id/payment",

  authenticateAdmin,

  async (req, res) => {

    try {


      const {

        id

      } = req.params;


      const {

        payment_status

      } = req.body;


      if (

        payment_status !==
          "paid" &&

        payment_status !==
          "unpaid"

      ) {

        return res.status(400).json({

          error:
            "Status pembayaran tidak valid."

        });

      }


      const updatedOrder =
        await prisma.order.update({

          where: {

            id

          },

          data: {

            payment_status,

            paid_at:

              payment_status ===
              "paid"

                ? new Date()

                : null

          }

        });


      res.json({

        message:
          "Status pembayaran berhasil diubah.",

        order:
          updatedOrder

      });


    } catch (error) {


      console.error(

        "ERROR UPDATE PAYMENT:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengubah status pembayaran."

      });

    }

  }

);


// ==================================================
// ADMIN AUTHENTICATION
// ==================================================


// ======================================
// LOGIN ADMIN
// ======================================

app.post(

  "/api/admin/login",

  async (req, res) => {

    try {


      const {

        email,

        password

      } = req.body;


      if (

        !email ||

        !password

      ) {

        return res.status(400).json({

          error:
            "Email dan password wajib diisi."

        });

      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      const admin =
        await prisma.admin.findUnique({

          where: {

            email:
              normalizedEmail

          }

        });


      if (!admin) {

        return res.status(401).json({

          error:
            "Email atau password salah."

        });

      }


      const passwordMatch =
        await bcrypt.compare(

          password,

          admin.password

        );


      if (!passwordMatch) {

        return res.status(401).json({

          error:
            "Email atau password salah."

        });

      }


      // ======================================
      // NAIKKAN TOKEN VERSION
      // ======================================

      const updatedAdmin =
        await prisma.admin.update({

          where: {

            id:
              admin.id

          },

          data: {

            token_version: {

              increment:
                1

            }

          }

        });


      const token =
        jwt.sign(

          {

            id:
              updatedAdmin.id,

            tokenVersion:
              updatedAdmin.token_version

          },

          JWT_SECRET,

          {

            expiresIn:
              "1d"

          }

        );


      res.json({

        message:
          "Login berhasil.",

        token,

        admin: {

          id:
            updatedAdmin.id,

          name:
            updatedAdmin.name,

          email:
            updatedAdmin.email,

          role:
            updatedAdmin.role,

          whatsapp:
            updatedAdmin.whatsapp

        }

      });


    } catch (error) {


      console.error(

        "ERROR LOGIN ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal melakukan login."

      });

    }

  }

);


// ======================================
// LOGOUT ADMIN
// ======================================
//
// Token version dinaikkan.
// Token lama langsung tidak berlaku.
//

app.post(

  "/api/admin/logout",

  authenticateAdmin,

  async (req, res) => {

    try {


      await prisma.admin.update({

        where: {

          id:
            req.admin.id

        },

        data: {

          token_version: {

            increment:
              1

          }

        }

      });


      res.json({

        message:
          "Logout berhasil."

      });


    } catch (error) {


      console.error(

        "ERROR LOGOUT ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal melakukan logout."

      });

    }

  }

);


// ==================================================
// ADMIN MANAGEMENT
// ==================================================


// ======================================
// GET SEMUA ADMIN
// ======================================

app.get(

  "/api/admin",

  authenticateAdmin,

  requireSuperAdmin,

  async (req, res) => {

    try {


      const admins =
        await prisma.admin.findMany({

          orderBy: {

            created_at:
              "desc"

          },

          select: {

            id:
              true,

            name:
              true,

            email:
              true,

            whatsapp:
              true,

            role:
              true,

            is_active:
              true,

            created_at:
              true

          }

        });


      res.json(

        admins

      );


    } catch (error) {


      console.error(

        "ERROR GET ADMINS:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengambil data admin."

      });

    }

  }

);


// ======================================
// GET ADMIN BERDASARKAN ID
// ======================================

app.get(

  "/api/admin/:id",

  authenticateAdmin,

  requireSuperAdmin,

  async (req, res) => {

    try {


      const admin =
        await prisma.admin.findUnique({

          where: {

            id:
              req.params.id

          },

          select: {

            id:
              true,

            name:
              true,

            email:
              true,

            whatsapp:
              true,

            role:
              true,

            is_active:
              true,

            created_at:
              true

          }

        });


      if (!admin) {

        return res.status(404).json({

          error:
            "Admin tidak ditemukan."

        });

      }


      res.json(

        admin

      );


    } catch (error) {


      console.error(

        "ERROR GET ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengambil data admin."

        });

    }

  }

);


// ======================================
// TAMBAH ADMIN
// ======================================

app.post(

  "/api/admin",

  authenticateAdmin,

  requireSuperAdmin,

  async (req, res) => {

    try {


      const {

        name,

        email,

        password,

        whatsapp,

        role

      } = req.body;


      if (

        !name ||

        !email ||

        !password ||

        !whatsapp

      ) {

        return res.status(400).json({

          error:
            "Nama, email, password, dan WhatsApp wajib diisi."

        });

      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      const existingAdmin =
        await prisma.admin.findUnique({

          where: {

            email:
              normalizedEmail

          }

        });


      if (existingAdmin) {

        return res.status(400).json({

          error:
            "Email admin sudah digunakan."

        });

      }


      const hashedPassword =
        await bcrypt.hash(

          password,

          12

        );


      const admin =
        await prisma.admin.create({

          data: {

            name:
              name.trim(),

            email:
              normalizedEmail,

            password:
              hashedPassword,

            whatsapp:
              whatsapp.trim(),

            role:

              role ===
              "superadmin"

                ? "superadmin"

                : "admin",

            is_active:
              false,

            token_version:
              0

          },

          select: {

            id:
              true,

            name:
              true,

            email:
              true,

            whatsapp:
              true,

            role:
              true,

            is_active:
              true,

            created_at:
              true

          }

        });


      res.status(201).json(

        admin

      );


    } catch (error) {


      console.error(

        "ERROR CREATE ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal menambahkan admin."

      });

    }

  }

);


// ======================================
// UPDATE ADMIN
// ======================================

app.put(

  "/api/admin/:id",

  authenticateAdmin,

  requireSuperAdmin,

  async (req, res) => {

    try {


      const {

        id

      } = req.params;


      const {

        name,

        email,

        password,

        whatsapp,

        role

      } = req.body;


      const targetAdmin =
        await prisma.admin.findUnique({

          where: {

            id

          }

        });


      if (!targetAdmin) {

        return res.status(404).json({

          error:
            "Admin tidak ditemukan."

        });

      }


      const data = {};


      if (name) {

        data.name =
          name.trim();

      }


      if (email) {

        data.email =
          email
            .trim()
            .toLowerCase();

      }


      if (whatsapp) {

        data.whatsapp =
          whatsapp.trim();

      }


      if (role) {

        data.role =
          role ===
          "superadmin"

            ? "superadmin"

            : "admin";

      }


      if (

        password &&

        password.trim() !== ""

      ) {

        data.password =
          await bcrypt.hash(

            password,

            12

          );


        data.token_version = {

          increment:
            1

        };

      }


      const updatedAdmin =
        await prisma.admin.update({

          where: {

            id

          },

          data,

          select: {

            id:
              true,

            name:
              true,

            email:
              true,

            whatsapp:
              true,

            role:
              true,

            is_active:
              true,

            created_at:
              true

          }

        });


      res.json(

        updatedAdmin

      );


    } catch (error) {


      console.error(

        "ERROR UPDATE ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengubah admin."

      });

    }

  }

);


// ======================================
// AKTIFKAN ADMIN WHATSAPP
// ======================================

app.patch(

  "/api/admin/:id/activate",

  authenticateAdmin,

  requireSuperAdmin,

  async (req, res) => {

    try {


      const {

        id

      } = req.params;


      const targetAdmin =
        await prisma.admin.findUnique({

          where: {

            id

          }

        });


      if (!targetAdmin) {

        return res.status(404).json({

          error:
            "Admin tidak ditemukan."

        });

      }


      const admin =

        await prisma.$transaction(

          async (tx) => {


            await tx.admin.updateMany({

              data: {

                is_active:
                  false

              }

            });


            return tx.admin.update({

              where: {

                id

              },

              data: {

                is_active:
                  true

              }

            });

          }

        );


      res.json({

        message:
          "Admin WhatsApp berhasil diaktifkan.",

        admin

      });


    } catch (error) {


      console.error(

        "ERROR ACTIVATE ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengaktifkan admin."

      });

    }

  }

);


// ======================================
// HAPUS ADMIN
// ======================================

app.delete(

  "/api/admin/:id",

  authenticateAdmin,

  requireSuperAdmin,

  async (req, res) => {

    try {


      const {

        id

      } = req.params;


      // ======================================
      // CEGAH HAPUS DIRI SENDIRI
      // ======================================

      if (

        id ===
        req.admin.id

      ) {

        return res.status(400).json({

          error:
            "Kamu tidak dapat menghapus akunmu sendiri."

        });

      }


      const admin =
        await prisma.admin.findUnique({

          where: {

            id

          }

        });


      if (!admin) {

        return res.status(404).json({

          error:
            "Admin tidak ditemukan."

        });

      }


      if (

        admin.is_active

      ) {

        return res.status(400).json({

          error:
            "Admin WhatsApp aktif tidak dapat dihapus. Aktifkan admin lain terlebih dahulu."

        });

      }


      await prisma.admin.delete({

        where: {

          id

        }

      });


      res.json({

        message:
          "Admin berhasil dihapus."

      });


    } catch (error) {


      console.error(

        "ERROR DELETE ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal menghapus admin."

      });

    }

  }

);


// ==================================================
// ADMIN WHATSAPP AKTIF
// ==================================================


// ======================================
// GET ADMIN WHATSAPP AKTIF
// ======================================
//
// PUBLIC
// Dipakai halaman customer untuk tombol WhatsApp
//

app.get(

  "/api/admin/active",

  async (req, res) => {

    try {


      const admin =
        await prisma.admin.findFirst({

          where: {

            is_active:
              true

          },

          select: {

            id:
              true,

            name:
              true,

            whatsapp:
              true

          }

        });


      if (!admin) {

        return res.status(404).json({

          error:
            "Belum ada admin WhatsApp aktif."

        });

      }


      res.json(

        admin

      );


    } catch (error) {


      console.error(

        "ERROR GET ACTIVE ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengambil admin aktif."

      });

    }

  }

);


// ==================================================
// ERROR HANDLER
// ==================================================

app.use(

  (err, req, res, next) => {

    console.error(

      "UNHANDLED ERROR:",

      err

    );


    res.status(500).json({

      error:
        "Terjadi kesalahan pada server."

    });

  }

);


// ==================================================
// START SERVER
// ==================================================

app.listen(

  PORT,

  () => {

    console.log(

      `Server berjalan di http://localhost:${PORT}`

    );

  }

);