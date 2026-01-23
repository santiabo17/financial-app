# 💰 Financial Tracker Pro

A lightweight, high-performance financial management tool built with **Next.js 16**, **PostgreSQL**, and **Docker**. Track your expenses/incomes/debts, manage categories, and visualize your data—all in a self-hosted environment that keeps your data private.

## 🚀 The Objective
The goal of this project is to provide a "single-command" deployment for a secure, private financial dashboard. No cloud hosting required—your data stays on your machine.

- **Private by Design:** Runs entirely on your local Docker environment.
- **Fast & Optimized:** Uses Next.js standalone mode for a tiny footprint.
- **Persistent:** Your data survives container restarts and updates.

---

## 🛠 Prerequisites

Before you start, ensure you have the following installed:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Git](https://git-scm.com/)

---

## 📥 Installation & Setup

Follow these simple steps to get the app running on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/santiabo17/financial-app.git(https://github.com/santiabo17/financial-app.git)
cd financial-app
```

### 2. Create your secret environment file from the template
```bash
cp .env.example .env
```

### 3. Launch the App
```bash
docker compose up -d
```

Docker will automatically pull the image from Docker Hub, set up the PostgreSQL database, and run the initialization scripts.

### 4. Access the App
Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

## ⚙️ Configuration (.env)

The app uses the following environment variables. The `.env.example` comes pre-configured for the Docker Compose network:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| **DB_USER** | Database Administrative User | `root` |
| **DB_PASSWORD** | Database Password | `root_password` |
| **DB_NAME** | Initial Database Name | `finance_db` |
| **DATABASE_URL** | Connection string for Next.js | `postgresql://root:root_password@db:5432/finance_db` |

---

## 📊 Database Schema

Upon the first launch, the system automatically executes `schema.sql` to create the following structure:

### Tables & Relationships
* **Categories**: Stores `type` (Income/Expense), `name`, and `color` codes.
* **Transactions**: Core records linked to categories with `amount`, `description`, and `date`.
* **Debts**: Tracks money owed/owing with a link to transactions and a `status` (Paid/Unpaid).



### Initial Data
The app comes pre-seeded with essential categories:
* 🟢 **Income**: Salary, Investments, Freelance, Gift/Refund.
* 🔴 **Expense**: Rent, Groceries, Transportation, Utilities, Entertainment, Debt Payments.

---

## 🛠 Tech Stack
* **Frontend**: Next.js 16 (App Router)
* **Runtime**: Node.js 22 (LTS)
* **Database**: PostgreSQL 15 (Alpine Linux)
* **Containerization**: Docker & Docker Compose
* **Deployment**: Multi-stage Docker builds (Standalone mode)

---

## 💾 Data Persistence
Your data is stored in a Docker Volume named `pgdata`.

* **Restarting containers**: Your data is safe.
* **Stopping the app (`docker compose down`)**: Your data is safe.
* **Wiping everything**: Only running `docker compose down -v` will delete your financial records.