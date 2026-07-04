# MERRKY LONDON — Premium Fashion E-Commerce Application

This is a full-stack fashion/clothing e-commerce platform built with a high-end, responsive design (similar to Myntra/Amazon).

## Tech Stack
*   **Frontend**: React.js (Vite, React Router DOM, Axios, Tailwind CSS v4, Lucide Icons, Recharts Analytics)
*   **Backend**: Core PHP 8.x (MVC-style router, Prepared Statements / PDO)
*   **Database**: MySQL / MariaDB
*   **Authentication**: Role-based JSON Web Tokens (Customer and Admin roles)
*   **Payment**: Razorpay Integrated Gateway

---

## File Structure
```
MERRKY LONDON/
├── backend/
│   ├── config/
│   │   ├── database.php        # PDO Database connection helper
│   │   └── jwt.php             # JWT token utilities (HS256)
│   ├── controllers/
│   │   ├── AuthController.php  # Signups, logins, and admin gates
│   │   ├── ProductController.php # Products queries, filters, CRUD, image uploads
│   │   ├── CategoryController.php # Category/subcategory hierarchy CRUD
│   │   ├── OrderController.php  # Razorpay integration, checkouts, and signature validation
│   │   └── DashboardController.php # Admin dashboard analytic compilers
│   ├── public/
│   │   ├── uploads/            # Server-stored product images
│   │   └── index.php           # Entry-point router & CORS configuration
│   ├── .env                    # Secret environment variables
│   ├── composer.json           # Dependencies mapping
│   └── schema.sql              # MySQL initialization query script
├── frontend/
│   ├── src/
│   │   ├── admin/              # Admin dashboard pages (Recharts, Products/Orders CRUD)
│   │   ├── components/         # Reusable blocks (Navbar, Footers, ProductCards)
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── pages/              # Shop storefront pages (Home, Listings, Details, Cart, Checkout)
│   │   ├── services/           # Axios client configuration with JWT middleware interceptors
│   │   ├── App.jsx             # React routing table
│   │   └── main.jsx            # Application provider wraps
│   ├── index.html              # HTML core shell (pre-loads Outfit/Inter fonts & Razorpay checkout script)
│   └── vite.config.js          # Vite config with Tailwind CSS plugin
└── README.md                   # Setup guide documentation
```

---

## Local Setup & Installation

### Prerequisite Checklist
1.  Install **PHP 8.0+**
2.  Install **Composer**
3.  Install **Node.js** (v18+) & **npm**
4.  Install **MySQL / MariaDB** (standard XAMPP server works out of the box)

---

### Step 1: Database Setup
1.  Start your MySQL database server (e.g. Apache/MySQL in XAMPP control panel).
2.  Open your command line client and log in:
    ```bash
    mysql -u root -p
    ```
3.  Import the schema script to establish the database and seed initial categories and catalog clothing lines:
    ```bash
    mysql -u root < backend/schema.sql
    ```
    *   **Seed Admin Accounts**:
        *   **Customer User**: `john@example.com` / Password: `admin123`
        *   **Administrator**: `admin@merrky.com` / Password: `admin123`

---

### Step 2: Configure & Run Backend REST API
1.  Navigate to the `backend/` folder:
    ```bash
    cd backend
    ```
2.  Install composer dependencies:
    ```bash
    composer install
    ```
3.  Create your `.env` configuration file:
    *   Copy `.env.example` as `.env` and adjust database ports, JWT secrets, and Razorpay test credentials.
4.  Start the PHP local development server (binds on port 8000 by default):
    ```bash
    php -S localhost:8000 -t public
    ```
    *   Your backend REST endpoints will now be accessible at `http://localhost:8000/api/...`.

---

### Step 3: Configure & Run Frontend Web Interface
1.  Navigate to the `frontend/` folder:
    ```bash
    cd ../frontend
    ```
2.  Install npm library files:
    ```bash
    npm install
    ```
3.  Launch the Vite hot-reloading dev server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser. You can now register users, select items, manage wishlist elements, check dashboard graphs, and execute checkout payments (using simulated bypass checks).

---

## Deployment on Linux VPS

To deploy this application to a production VPS (e.g., Ubuntu with Nginx, MySQL, and PHP-FPM):

### 1. Nginx Web Server Setup
Create an Nginx configuration file (e.g., `/etc/nginx/sites-available/merrky_london`) to reverse proxy PHP requests and serve Vite React static HTML build output:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/merrky_london/frontend/dist;
    index index.html;

    # Serve React Frontend Static assets
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy REST Requests to PHP-FPM API
    location /api {
        root /var/www/merrky_london/backend/public;
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Serve Server Image Uploads
    location /uploads {
        root /var/www/merrky_london/backend/public;
        try_files $uri =404;
    }

    # Pass index.php to PHP-FPM socket
    location ~ \.php$ {
        root /var/www/merrky_london/backend/public;
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock; # Check local php-fpm socket version
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```
Link and enable the site config, verify nginx syntax and restart:
```bash
sudo ln -s /etc/nginx/sites-available/merrky_london /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Frontend Production Bundling
Build a highly optimized bundle from the frontend directory:
```bash
npm run build
```
Upload the compiled `dist` directory to the location configured under Nginx (`/var/www/merrky_london/frontend/dist`).

### 3. Permissions Tuning
Ensure the upload directories have write access:
```bash
sudo chown -R www-data:www-data /var/www/merrky_london/backend/public/uploads
sudo chmod -R 755 /var/www/merrky_london/backend/public/uploads
```
Secure the `.env` settings to prevent configuration parsing issues:
```bash
sudo chmod 600 /var/www/merrky_london/backend/.env
```
