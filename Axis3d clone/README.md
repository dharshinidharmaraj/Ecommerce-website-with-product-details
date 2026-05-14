# Axis 3D Clone - E-commerce Dashboard

A 3D printer e-commerce platform with secure company admin dashboard for product analytics.

## Features

### Frontend

- Responsive product catalog with 3D printer products
- Real-time product tracking (clicks and add-to-cart events)
- Professional UI with consistent styling

### Backend

- Express.js server with RESTful API
- JWT-based authentication for company admin
- Product analytics dashboard with real-time data
- Excel report generation
- CORS enabled for cross-origin requests

### Admin Dashboard

- Secure login system (JWT tokens)
- Detailed product rankings by add-to-cart count
- Table view showing:
  - Product rank
  - Product name
  - Add-to-cart count
  - Percentage of total
  - Total clicks
  - Conversion rate
- Manual refresh button
- Session management with logout

## Project Structure

```
Axis-clone/
├── Frontend/
│   ├── index.html          # Main product page
│   ├── dashboard.html      # Admin dashboard page
│   ├── scripts.js          # Product tracking logic
│   ├── dashboard.js        # Dashboard authentication & data fetching
│   └── style.css           # Styling for all pages
└── backend/
    ├── server.js           # Express server with API endpoints
    ├── package.json        # Dependencies
    └── node_modules/       # Installed packages
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Backend Setup:**

```bash
cd Axis-clone/backend
npm install
npm start
```

Server runs on `http://localhost:5000`

2. **Frontend Access:**
   Open `Axis-clone/Frontend/index.html` in your browser

### Default Admin Credentials

- **Email:** `admin@axis3d.com`
- **Password:** `admin123`

## API Endpoints

### Authentication

- **POST** `/api/auth/login` - Company admin login
  ```json
  {
    "email": "admin@axis3d.com",
    "password": "admin123"
  }
  ```

### Tracking

- **POST** `/track` - Track product events
  ```json
  {
    "event": "add_to_cart",
    "product": "Product Name",
    "time": "2026-05-14T10:30:00Z"
  }
  ```

### Dashboard (Protected)

- **GET** `/api/dashboard` - Get product analytics
  - Requires: `Authorization: Bearer <token>`
  - Returns: Product rankings with add-to-cart counts

### Reports

- **GET** `/download-report` - Download analytics as Excel
- **GET** `/tracking-data` - View raw tracking events (debugging)

## Usage

### For Users

1. Browse products on the main page
2. Click "Add to Cart" to add products
3. Tracking happens automatically

### For Admin

1. Click "Dashboard" link in navbar
2. Login with provided credentials
3. View real-time product analytics
4. Click "Refresh Data" to update numbers
5. Logout when done

## Security Notes

- JWT tokens expire after 24 hours
- Tokens stored in browser localStorage
- Dashboard only accessible with valid token
- In production:
  - Use HTTPS
  - Store credentials in .env file with proper hashing
  - Use environment variables for JWT secret
  - Implement database persistence

## Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Authentication:** JWT (jsonwebtoken)
- **Reports:** ExcelJS
- **API:** RESTful with CORS support

## License

ISC
