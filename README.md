# UniMart

UniMart is a full-stack campus marketplace platform for African university students. It enables students to buy, sell, and trade items and services safely within their university community.

---

## Features

- **Modern Marketplace:** Browse, search, and filter listings by category (Electronics, Books, Furniture, Clothing, Food, Sports, Services, Other)
- **User Authentication:** Secure signup and login with university email verification
- **Create & Manage Listings:** Add, edit, and remove items or services for sale
- **Messaging:** In-app chat between buyers and sellers
- **Responsive UI:** Mobile-friendly, clean design using React, TypeScript, and Tailwind CSS
- **Real-time Updates:** Socket.io for instant messaging and notifications

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Query
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB database (local or cloud)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd UniMart
```

### 2. Setup Backend
```bash
cd unimart-backend
cp .env.example .env # Create your .env file and set MONGODB_URI, FRONTEND_URL, etc.
npm install
npm run dev # or: npm start
```

### 3. Setup Frontend
```bash
cd ../unimart-frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

---

## Project Structure

```
UniMart/
  unimart-backend/    # Node.js/Express backend API
  unimart-frontend/   # React/TypeScript frontend
```

---

## Main Marketplace Categories
- Electronics
- Books
- Furniture
- Clothing
- Food
- Sports
- Services
- Other

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE) 