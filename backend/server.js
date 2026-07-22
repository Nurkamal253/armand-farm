require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("./generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const app = express();

app.use(cors());
app.use(express.json());

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter
});

const PORT = 5000;


// ======================================
// HOME
// ======================================

app.get("/", (req, res) => {
  res.send("Armand Farm Backend berjalan!");
});

// ======================================
// GET SEMUA ADMIN
// ======================================

app.get("/api/admins", async (req, res) => {

  try {

    const admins =
      await prisma.admin.findMany({

        orderBy: {

          created_at: "desc"

        }

      });


    res.json(admins);


  } catch (error) {

    console.error(error);


    res.status(500).json({

      error:
        "Gagal mengambil data admin"

    });

  }

});

app.get("/api/admin/active", async (req, res) => {

  try {

    const activeAdmin =
      await prisma.admin.findFirst({

        where: {

          is_active: true

        }

      });


    if (!activeAdmin) {

      return res.status(404).json({

        error:
          "Belum ada admin aktif"

      });

    }


    res.json({

      id:
        activeAdmin.id,

      name:
        activeAdmin.name,

      whatsapp:
        activeAdmin.whatsapp

    });


  } catch (error) {

    console.error(

      "GAGAL MENGAMBIL ADMIN AKTIF:",

      error

    );


    res.status(500).json({

      error:
        "Gagal mengambil admin aktif"

    });

  }

});

// ======================================
// AKTIFKAN ADMIN SEBAGAI ADMIN WHATSAPP
// ======================================

app.patch(

  "/api/admins/:id/activate",

  async (req, res) => {

    try {

      const { id } =
        req.params;


      const activeAdmin =
        await prisma.$transaction(

          async tx => {


            // NONAKTIFKAN SEMUA ADMIN

            await tx.admin.updateMany({

              data: {

                is_active: false

              }

            });


            // AKTIFKAN ADMIN TERPILIH

            const selectedAdmin =
              await tx.admin.update({

                where: {

                  id: id

                },

                data: {

                  is_active: true

                }

              });


            return selectedAdmin;

          }

        );


      res.json({

        message:
          "Admin WhatsApp berhasil diubah",

        admin:
          activeAdmin

      });


    } catch (error) {

      console.error(error);


      res.status(500).json({

        error:
          "Gagal mengaktifkan admin"

      });

    }

  }

);

// ======================================
// GET SEMUA PRODUK
// ======================================

app.get("/api/products", async (req, res) => {

  try {

    const products =
      await prisma.product.findMany({

        orderBy: {
          createdAt: "desc"
        }

      });

    res.json(products);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        "Gagal mengambil data produk"

    });

  }

});


// ======================================
// TAMBAH PRODUK
// ======================================

app.post("/api/products", async (req, res) => {

  try {

    const {
      name,
      desc,
      price,
      stock,
      unit
    } = req.body;


    const product =
      await prisma.product.create({

        data: {

          name,

          desc,

          price:
            Number(price),

          stock:
            Number(stock),

          unit

        }

      });


    res.status(201).json(product);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        "Gagal menambahkan produk"

    });

  }

});


// ======================================
// EDIT PRODUK
// ======================================

app.put("/api/products/:id", async (req, res) => {

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


    const product =
      await prisma.product.update({

        where: {

          id

        },

        data: {

          name,

          desc,

          price:
            Number(price),

          stock:
            Number(stock),

          unit

        }

      });


    res.json(product);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        "Gagal mengubah produk"

    });

  }

});


// ======================================
// HAPUS PRODUK
// ======================================

app.delete("/api/products/:id", async (req, res) => {

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
        "Produk berhasil dihapus"

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        "Gagal menghapus produk"

    });

  }

});


// ======================================
// BUAT PESANAN
// ======================================

app.post("/api/orders", async (req, res) => {

  try {

    const {

      customer_name,
      customer_phone,
      customer_address,
      note,
      items

    } = req.body;


    // ======================================
    // VALIDASI KERANJANG
    // ======================================

    if (

      !items ||

      !Array.isArray(items) ||

      items.length === 0

    ) {

      return res.status(400).json({

        error:
          "Keranjang kosong"

      });

    }


    const order =
      await prisma.$transaction(

        async (tx) => {


          // ======================================
          // 1. AMBIL PRODUK DARI DATABASE
          // ======================================

          const products = [];


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

                `Produk ${item.name} tidak ditemukan`

              );

            }


            const quantity =
              Number(item.quantity);


            // ======================================
            // VALIDASI JUMLAH
            // ======================================

            if (

              !Number.isInteger(quantity) ||

              quantity <= 0

            ) {

              throw new Error(

                `Jumlah ${product.name} tidak valid`

              );

            }


            // ======================================
            // VALIDASI STOK
            // ======================================

            const currentStock =
              Number(product.stock || 0);


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
          // 2. HITUNG TOTAL DARI DATABASE
          // ======================================

          let total_amount = 0;


          products.forEach(

            ({

              product,

              quantity

            }) => {


              total_amount +=

                Number(product.price) *

                quantity;

            }

          );


          // ======================================
          // 3. BUAT PESANAN
          // ======================================

          const newOrder =
            await tx.order.create({

              data: {

                customer_name,

                customer_phone,

                customer_address,

                note,

                total_amount,

                created_at:
                  new Date()

              }

            });


          // ======================================
          // 4. SIMPAN DETAIL PESANAN
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

                    Number(product.price) *

                    quantity

                })

              )

          });


          // ======================================
          // 5. KURANGI STOK
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
        "Pesanan berhasil dibuat",

      order

    });


  } catch (error) {

    console.error(error);


    res.status(400).json({

      error:

        error.message ||

        "Gagal membuat pesanan"

    });

  }

});


// ======================================
// GET SEMUA PESANAN
// ======================================

app.get("/api/orders", async (req, res) => {

  try {

    const orders =
      await prisma.order.findMany({

        include: {

          items: true

        },

        orderBy: {

          created_at:
            "desc"

        }

      });


    res.json(orders);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        "Gagal mengambil data pesanan"

    });

  }

});


// ======================================
// UPDATE STATUS PEMBAYARAN
// ======================================

app.patch(

  "/api/orders/:id/payment",

  async (req, res) => {


    try {


      const {
        id
      } = req.params;


      const {

        payment_status:
          paymentStatus

      } = req.body;


      if (

        paymentStatus !== "paid" &&

        paymentStatus !== "unpaid"

      ) {

        return res.status(400).json({

          error:
            "Status pembayaran tidak valid"

        });

      }


      const updatedOrder =

        await prisma.order.update({

          where: {

            id

          },

          data: {

            payment_status:

              paymentStatus,


            paid_at:

              paymentStatus === "paid"

                ? new Date()

                : null

          }

        });


      res.json({

        message:

          "Status pembayaran berhasil diubah",

        order:

          updatedOrder

      });


    } catch (error) {


      console.error(error);


      res.status(500).json({

        error:

          "Gagal mengubah status pembayaran"

      });

    }

  }

);

// ======================================
// LOGIN ADMIN
// ======================================

app.post("/api/admin/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    if (!email || !password) {

      return res.status(400).json({

        error:
          "Email dan password wajib diisi"

      });

    }


    const admin =
      await prisma.admin.findUnique({

        where: {
          email: email
        }

      });


    if (!admin) {

      return res.status(401).json({

        error:
          "Email atau password salah"

      });

    }


    if (!admin.is_active) {

      return res.status(403).json({

        error:
          "Akun admin tidak aktif"

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
          "Email atau password salah"

      });

    }


    const token =
      jwt.sign(

        {

          id:
            admin.id,

          email:
            admin.email,

          role:
            admin.role

        },

        process.env.JWT_SECRET,

        {

          expiresIn:
            "1d"

        }

      );


    res.json({

      message:
        "Login berhasil",

      token,

      admin: {

        id:
          admin.id,

        name:
          admin.name,

        email:
          admin.email,

        role:
          admin.role,

        whatsapp:
          admin.whatsapp

      }

    });


    } catch (error) {

    console.error("ERROR LOGIN ADMIN:", error);

    res.status(500).json({

      error:
        error.message ||
        "Gagal melakukan login"

    });

  }

});

// ======================================
// GET SEMUA ADMIN
// ======================================

app.get(
  "/api/admin",
  async (req, res) => {

    try {

      const admins =

        await prisma.admin.findMany({

          orderBy: {

            created_at:
              "desc"

          }

        });


      res.json(
        admins
      );


    } catch (error) {

      console.error(error);


      res.status(500).json({

        error:
          "Gagal mengambil data admin"

      });

    }

  }

);


// ======================================
// GET ADMIN BERDASARKAN ID
// ======================================

app.get(

  "/api/admin/:id",

  async (req, res) => {

    try {

      const admin =

        await prisma.admin.findUnique({

          where: {

            id:
              req.params.id

          }

        });


      if (!admin) {

        return res.status(404).json({

          error:
            "Admin tidak ditemukan"

        });

      }


      res.json(
        admin
      );


    } catch (error) {

      console.error(error);


      res.status(500).json({

        error:
          "Gagal mengambil data admin"

      });

    }

  }

);


// ======================================
// TAMBAH ADMIN
// ======================================

app.post(

  "/api/admin",

  async (req, res) => {

    try {

      const {

        name,

        email,

        password,

        whatsapp

      } = req.body;


      if (

        !name ||

        !email ||

        !password ||

        !whatsapp

      ) {

        return res.status(400).json({

          error:
            "Semua data wajib diisi"

        });

      }


      const existingAdmin =

        await prisma.admin.findUnique({

          where: {

            email

          }

        });


      if (existingAdmin) {

        return res.status(400).json({

          error:
            "Email admin sudah digunakan"

        });

      }


      const admin =

        await prisma.admin.create({

          data: {

            name,

            email,

            password,

            whatsapp,

            role:
              "admin",

            is_active:
              false

          }

        });


      res.status(201).json(

        admin

      );


    } catch (error) {

      console.error(error);


      res.status(500).json({

        error:
          "Gagal menambahkan admin"

      });

    }

  }

);


// ======================================
// UPDATE ADMIN
// ======================================

app.put(

  "/api/admin/:id",

  async (req, res) => {

    try {

      const {

        name,

        email,

        password,

        whatsapp

      } = req.body;


      const data = {

        name,

        email,

        whatsapp

      };


      if (

        password &&

        password.trim() !== ""

      ) {

        data.password =
          password;

      }


      const admin =

        await prisma.admin.update({

          where: {

            id:
              req.params.id

          },

          data

        });


      res.json(
        admin
      );


    } catch (error) {

      console.error(error);


      res.status(500).json({

        error:
          "Gagal mengubah admin"

      });

    }

  }

);


// ======================================
// AKTIFKAN ADMIN WHATSAPP
// ======================================

app.patch(

  "/api/admin/:id/activate",

  async (req, res) => {

    try {


      await prisma.admin.updateMany({

        data: {

          is_active:
            false

        }

      });


      const admin =

        await prisma.admin.update({

          where: {

            id:
              req.params.id

          },

          data: {

            is_active:
              true

          }

        });


      res.json({

        message:
          "Admin WhatsApp berhasil diaktifkan",

        admin

      });


    } catch (error) {

      console.error(error);


      res.status(500).json({

        error:
          "Gagal mengaktifkan admin"

      });

    }

  }

);


// ======================================
// HAPUS ADMIN
// ======================================

app.delete(

  "/api/admin/:id",

  async (req, res) => {

    try {


      const admin =

        await prisma.admin.findUnique({

          where: {

            id:
              req.params.id

          }

        });


      if (

        admin &&

        admin.is_active

      ) {

        return res.status(400).json({

          error:
            "Admin WhatsApp aktif tidak dapat dihapus"

        });

      }


      await prisma.admin.delete({

        where: {

          id:
            req.params.id

        }

      });


      res.json({

        message:
          "Admin berhasil dihapus"

      });


    } catch (error) {

      console.error(error);


      res.status(500).json({

        error:
          "Gagal menghapus admin"

      });

    }

  }

);

// ======================================
// GET ADMIN WHATSAPP AKTIF
// ======================================

app.get(

  "/api/admin/active",

  async (req, res) => {

    try {

      const admin =

        await prisma.admin.findFirst({

          where: {

            is_active:
              true

          }

        });


      if (!admin) {

        return res.status(404).json({

          error:
            "Belum ada admin WhatsApp aktif"

        });

      }


      res.json({

        name:
          admin.name,

        whatsapp:
          admin.whatsapp

      });


    } catch (error) {

      console.error(error);


      res.status(500).json({

        error:
          "Gagal mengambil admin aktif"

      });

    }

  }

);

// ======================================
// GET SEMUA ADMIN
// ======================================

app.get("/api/admin", async (req, res) => {
  try {

    const admins = await prisma.admin.findMany({
      orderBy: {
        created_at: "asc"
      }
    });

    res.json(admins);

  } catch (error) {

    console.error("ERROR GET ADMIN:", error);

    res.status(500).json({
      error: "Gagal mengambil data admin"
    });

  }
});


// ======================================
// GET ADMIN BERDASARKAN ID
// ======================================

app.get("/api/admin/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const admin = await prisma.admin.findUnique({
      where: {
        id: id
      }
    });

    if (!admin) {

      return res.status(404).json({
        error: "Admin tidak ditemukan"
      });

    }

    res.json(admin);

  } catch (error) {

    console.error("ERROR GET ADMIN BY ID:", error);

    res.status(500).json({
      error: "Gagal mengambil data admin"
    });

  }

});


// ======================================
// TAMBAH ADMIN
// ======================================

app.post("/api/admin", async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      whatsapp
    } = req.body;


    if (
      !name ||
      !email ||
      !password ||
      !whatsapp
    ) {

      return res.status(400).json({

        error:
          "Nama, email, password, dan WhatsApp wajib diisi"

      });

    }


    const existingAdmin =
      await prisma.admin.findUnique({

        where: {
          email: email
        }

      });


    if (existingAdmin) {

      return res.status(400).json({

        error:
          "Email admin sudah digunakan"

      });

    }


    const admin =
      await prisma.admin.create({

        data: {

          name,

          email,

          password,

          whatsapp,

          is_active: false

        }

      });


    res.status(201).json(admin);


  } catch (error) {

    console.error("ERROR CREATE ADMIN:", error);


    res.status(500).json({

      error:
        "Gagal menambahkan admin"

    });

  }

});


// ======================================
// EDIT ADMIN
// ======================================

app.put("/api/admin/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const {
      name,
      email,
      password,
      whatsapp
    } = req.body;


    const data = {

      name,

      email,

      whatsapp

    };


    if (password) {

      data.password =
        password;

    }


    const admin =
      await prisma.admin.update({

        where: {

          id: id

        },

        data

      });


    res.json(admin);


  } catch (error) {

    console.error("ERROR UPDATE ADMIN:", error);


    res.status(500).json({

      error:
        "Gagal mengubah admin"

    });

  }

});


// ======================================
// AKTIFKAN ADMIN WHATSAPP
// ======================================

app.patch(
  "/api/admin/:id/activate",

  async (req, res) => {

    try {

      const { id } =
        req.params;


      // Matikan semua admin terlebih dahulu

      await prisma.admin.updateMany({

        data: {

          is_active: false

        }

      });


      // Aktifkan admin yang dipilih

      const admin =
        await prisma.admin.update({

          where: {

            id: id

          },

          data: {

            is_active: true

          }

        });


      res.json({

        message:
          "Admin WhatsApp aktif berhasil diubah",

        admin

      });


    } catch (error) {

      console.error(

        "ERROR ACTIVATE ADMIN:",

        error

      );


      res.status(500).json({

        error:
          "Gagal mengaktifkan admin"

      });

    }

  }

);


// ======================================
// HAPUS ADMIN
// ======================================

app.delete("/api/admin/:id", async (req, res) => {

  try {

    const { id } = req.params;


    const admin =
      await prisma.admin.findUnique({

        where: {

          id: id

        }

      });


    if (!admin) {

      return res.status(404).json({

        error:
          "Admin tidak ditemukan"

      });

    }


    if (admin.is_active) {

      return res.status(400).json({

        error:
          "Admin WhatsApp aktif tidak boleh dihapus. Aktifkan admin lain terlebih dahulu."

      });

    }


    await prisma.admin.delete({

      where: {

        id: id

      }

    });


    res.json({

      message:
        "Admin berhasil dihapus"

    });


  } catch (error) {

    console.error(

      "ERROR DELETE ADMIN:",

      error

    );


    res.status(500).json({

      error:
        "Gagal menghapus admin"

    });

  }

});

// ======================================
// START SERVER
// ======================================

app.listen(

  PORT,

  () => {

    console.log(

      `Server berjalan di http://localhost:${PORT}`

    );

  }

);