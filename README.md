# 🌐 InvestDaily Website

Welcome to **InvestDaily**, an investment platform. It allows users to register, invest in plans, manage profiles, and securely reset passwords via email.

---

## 🏗️ Project Structure

- **`client/`**: Frontend  
  Tech stack: **React**, **Vite**, **Tailwind CSS**, **React Toastify**
- **`server/`**: Backend  
  Tech stack: **Node.js**, **Express**, **MongoDB** (Mongoose), **Nodemailer**

---

## ✨ Features

- 🔐 User authentication (`/signup`, `/signin`)
- 📈 Investment plans (`/plans`, `/payment/:planId`)
- 👤 Profile management (`/profile`)
- 🛠️ Admin dashboard (`/admin`)
- 🔑 Forgot password support  
  Users receive a **10-minute email link** to securely reset their password  
  (`/forgot-password`, `/reset-password/:token`)
- ⏲️ Cron job for auto-updating plans & wallets

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Node.js**: Version 18.x or higher  
  [Download Node.js](https://nodejs.org)
- **MongoDB**: [MongoDB Atlas](https://www.mongodb.com)
- **Gmail Account** (with App Password if 2FA is enabled)  
  [Set up App Password](https://support.google.com/accounts/answer/185833?hl=en)

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd investdaily
```

---

### 2. Frontend Setup (`client/`)

```bash
cd client
npm install
npm run dev
```

> App will run on: [http://localhost:3000](http://localhost:3000) ✅

---

### 3. Backend Setup (`server/`)

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
MONGO_URI=mongo_url_here
JWT_SECRET=your_jwt_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

Start the server:

```bash
node server.js
```

> Server runs at: [http://localhost:5000](http://localhost:5000)

✅ Ensure MongoDB is running before starting the backend

---

## 📬 Forgot Password Feature

When users forget their password:

1. They visit `/forgot-password` and submit their email.
2. A **secure reset link** (valid for 10 minutes) is emailed to them.
3. Clicking the link takes them to `/reset-password/:token` where they can create a new password.

The email is styled and sent via **Gmail** using **Nodemailer**.

---

## 🧠 Developer Notes

- **Frontend** is powered by Vite for faster development.
- **Backend** follows REST principles and uses Express routers for modularity.
- **Email sending** is configured with Gmail App Passwords to reduce spam risk.

---

## Thanks!!
