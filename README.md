# Enterprise Business Intelligence Dashboard 📊

![Screenshot of BI Dashboard](https://github.com/GiDerAce6969/Business-Intelligence-Dashboard/blob/main/BI%20Dashboard.png)



![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

An enterprise-grade, full-stack Business Intelligence and Data Analytics web application. This project provides a custom, self-hosted alternative to SaaS BI tools (like Tableau or Power BI), allowing for complete ownership of the data modeling, semantic layer, and presentation tiers.

** This is just an example of a business intelligence dashboard **



## ✨ Key Features

* **Immersive Executive UI:** A modern, dark-mode dashboard featuring neon accents, built with Next.js and Tailwind CSS.
* **Interactive Analytics:** Dynamic cross-filtering by geographic region without requiring secondary database trips.
* **Advanced Data Visualization:** Powered by Recharts, featuring Historical Trend Lines, Revenue vs. Margin Bar Charts, and Revenue Share Donut Charts.
* **High-Performance API:** Asynchronous Python backend utilizing FastAPI and Uvicorn.
* **Dimensional Data Modeling:** Robust PostgreSQL Star Schema design (`fact_sales`, `dim_time`, `dim_organization`) optimized for fast analytical aggregations.
* **Centralized Semantic Layer:** Business logic (Margin %, Average Transaction Value) calculated securely on the server and frontend layers.

## 🏗️ Technology Stack

**Frontend (Presentation Tier)**
* Next.js (React) with App Router
* TypeScript
* Tailwind CSS (Styling)
* Recharts (Data Visualization)
* Axios (Data Fetching)
* Lucide React (Iconography)

**Backend (Application & Semantic Tier)**
* Python 3.13
* FastAPI (REST API framework)
* Uvicorn (ASGI web server)
* SQLAlchemy 2.0 (ORM)
* Pydantic (Data validation & serialization)

**Database (Data Tier)**
* PostgreSQL
* Psycopg 3 (Database adapter)

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+ (Tested on 3.13)
* Node.js 18+ & npm
* PostgreSQL database (configured via DBeaver or pgAdmin), or other databases will do so

### 1. Database Setup
Execute the SQL scripts located in the `/sql` directory (or from the project documentation) to build the data warehouse schema:
1.  Create the `bi_analytics` schema.
2.  Create `dim_time`, `dim_organization`, and `fact_sales` tables.
3.  Run the generation scripts to populate the tables with synthetic corporate data.

### 2. Backend Installation
Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate
# Activate virtual environment (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
