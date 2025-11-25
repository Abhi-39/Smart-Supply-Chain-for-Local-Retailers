# Smart Supply-Chain for Local Retailers
A complete **inventory, product, and supply-chain management system** optimized for small/local retailers.  
This repository contains both the **Spring Boot backend** and the **Vite-powered frontend**, with optional WebSocket/STOMP real-time updates.

---

## 🚀 Features

### 🛒 Retail Dashboard
- Product management (CRUD)
- Live inventory tracking
- Supplier & order management

### ⚡ Real-Time Updates (WebSockets/STOMP)
- Inventory update notifications
- Live order tracking
- Broadcast messages via `/topic/*`

### 🔧 Backend (Spring Boot)
- REST API under `/api/*`
- WebSocket endpoint `/ws`
- Simple broker enabled for real-time
- Can serve frontend directly from `static/`

### 🎨 Frontend (Vite)
- Fast, modern build system
- Supports standalone hosting (Vercel) or backend-embedded build

### ☁️ Deployments
- Railway → Backend
- Vercel → Frontend

---

# 📁 Project Structure
```
Smart-Supply-Chain-for-Local-Retailers/
│
├── retailchain-backend/              # Spring Boot API + WebSocket server
│   ├── src/main/java/...             # Controllers, Services, Config
│   ├── src/main/resources/static/    # Bundled frontend (optional)
│   ├── pom.xml
│   └── application.properties
│
└── retailchain-frontend/
    └── frontend/                     # Vite app source
        ├── src/
        ├── public/
        ├── index.html
        ├── package.json
        └── vite.config.js
```

---

# 🛠 Backend Setup (Spring Boot)

## Prerequisites
- Java 17+
- Maven (or Gradle)
- PostgreSQL (if using database)
- Environment variables set correctly

## Development
```bash
cd retailchain-backend
./mvnw spring-boot:run
```
Runs on: `http://localhost:8080`

## Key Endpoints
| Endpoint | Description |
|---------|-------------|
| `/` | Health/index page |
| `/health` | server heartbeat |
| `/api/products` | product list API |
| `/ws` | WebSocket endpoint |

## Build
```bash
./mvnw clean package
java -jar target/*.jar
```

---

# 🔌 WebSocket / STOMP

### Server Configuration Example
```java
registry.addEndpoint("/ws")
        .setAllowedOrigins("*")
        .withSockJS();

registry.enableSimpleBroker("/topic", "/queue");
registry.setApplicationDestinationPrefixes("/app");
```

### Client Connection Example
```js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const sock = new SockJS("https://your-backend-url/ws");
const client = new Client({ webSocketFactory: () => sock });
client.activate();
```

---

# 🎨 Frontend Setup (Vite)

## Development
```bash
cd retailchain-frontend/frontend
npm install
npm run dev
```
Runs on: `http://localhost:5173`

## Build
```bash
npm run build
```
Build output: `dist/`

### Embedding Frontend into Backend
Copy `dist/` into:
```
retailchain-backend/src/main/resources/static/
```

---

# ☁️ Deployment Guide

## 🚀 Railway Backend Deployment
1. Connect GitHub → Railway
2. Set env vars:
```
PORT=8080
DATABASE_URL=postgres://...
```
3. Deploy
4. Test:
```
https://your-railway-app/health
```

---

## 🎯 Vercel Frontend Deployment
### Standalone
- Set project root to: `retailchain-frontend/frontend`
- Build command: `npm run build`
- Output folder: `dist`

### Backend-Hosted Alternative
Place built files inside backend `/static`.

---

# 📘 API Documentation

## GET /api/products
Returns:
```json
[
  {
    "id": 1,
    "name": "Product A",
    "price": 100,
    "quantity": 25
  }
]
```

### Other endpoints (extend as needed)
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/orders`

---

# 🗄 Database Structure (Overview)

## products
| column | type | description |
|--------|------|-------------|
| id | int | primary key |
| name | text | product name |
| price | decimal | item price |
| quantity | int | available stock |

## orders
| column | type |
|--------|------|
| id | int |
| product_id | int |
| quantity | int |

---

# 🧰 Troubleshooting

### ❗ 500 on `/`
- Missing `index.html` in backend static folder.

### ❗ 403 on `/api/*`
- SecurityFilter blocked it → check CORS & SecurityConfig.

### ❗ WebSocket handshake failed
- Use `wss://` when frontend is deployed on HTTPS.
- Ensure server endpoint matches (`/ws`).

### ❗ CORS error
Add:
```java
registry.addMapping("/api/**")
   .allowedOrigins("https://your-frontend.vercel.app")
   .allowedMethods("*");
```

---

# 🤝 Contributing
1. Fork repo
2. Create branch: `git checkout -b feature-name`
3. Commit changes
4. Submit PR

---

# 📄 License
This project is licensed under the **MIT License**. See `LICENSE` file.

---

# ⭐ Support
If you found this project helpful, please consider starring the repository!

