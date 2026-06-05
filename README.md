# 🛒 e-Shop: Full-Stack Online Shopping Application

A beginner-friendly, full-stack e-commerce web application built using **Next.js**, **Node.js/Express**, and **PostgreSQL**. This project focuses on clean, modular code and implementing core online shopping functionalities like authentication, product management, cart operations, and order placement.

---

## 🌟 Features

### User Features
* **Authentication:** Secure Sign Up, Sign In, and Logout using JWT.
* **Browse & Search:** View all products, search by keywords, and filter by categories.
* **Product Details:** Dedicated pages for detailed product descriptions and pricing.
* **Shopping Cart:** Add items to the cart, update quantities, and remove items.
* **Checkout Flow:** Simple checkout process (simulated "Order Placed Successfully" flow without real payment gateways).
* **Order History:** Users can view their past orders.

### Admin Features (Protected)
* **Dashboard:** Overview of store metrics.
* **Product Management:** Add, edit, and delete products.
* **Category Management:** Organize products into categories.
* **User Management:** View registered users.
* **Order Management:** View and update user orders.

### Technical Features
* RESTful API architecture.
* Protected routes (Frontend & Backend).
* Relational database management with PostgreSQL.
* Responsive, clean, and minimal UI using Tailwind CSS (or Bootstrap).

---

## 🛠️ Tech Stack

**Frontend:**
* Next.js (React Framework)
* Tailwind CSS / Bootstrap (Styling)
* Axios (API Requests)

**Backend:**
* Node.js runtime
* Express.js framework
* PostgreSQL (Relational Database)
* `pg` (node-postgres client) or Prisma/Sequelize (ORM)
* JSON Web Tokens (JWT) for Authentication
* Bcrypt.js (Password Hashing)

---

## 📂 Folder Structure

```text
e-shop-project/
│
├── frontend/                 # Next.js Application
│   ├── components/           # Reusable UI components (Navbar, ProductCard, etc.)
│   ├── pages/                # Next.js pages (Home, Cart, Checkout, Admin, etc.)
│   ├── styles/               # Global styles and Tailwind configuration
│   └── utils/                # Helper functions (API calls, Auth helpers)
│
└── backend/                  # Node.js/Express Application
    ├── config/               # Database connection and environment config
    ├── controllers/          # Request handlers (authController, productController)
    ├── middleware/           # Custom middleware (authMiddleware, adminCheck)
    ├── models/               # Database schemas/queries
    ├── routes/               # API route definitions
    └── server.js             # Entry point for the Express server
