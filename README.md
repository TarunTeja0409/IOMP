# Smart Skill Gap Analyzer

![Demo Presentation](https://via.placeholder.com/1200x500?text=Smart+Skill+Gap+Analyzer)

## 📌 Introduction

**Smart Skill Gap Analyzer** is a comprehensive, full-stack SaaS platform designed to bridge the gap between job seekers' current skills and market requirements. By leveraging AI and advanced visualizations, the application provides personalized insights, parses resumes automatically, and offers actionable job recommendations to advance users' careers.

---

## 🚀 Live Application

> **[Insert Live App Link Here]**

*(Note: Replace the placeholder link above with the actual deployed URL of your application)*

---

## ✨ Key Features

- **Resume Parsing & Skill Extraction:** Automatically parse and extract skills from uploaded PDF and Word document resumes using advanced parsing libraries.
- **AI-Powered Skill Gap Analysis:** Compares user profiles against real-world job requirements, highlighting missing skills and providing actionable feedback via Google's Generative AI.
- **Job Recommendation Engine:** Suggests relevant job opportunities based on a user's matched skills and market trends.
- **Interactive 3D Visualizations:** Immersive data representation and interactive UI elements using Three.js and Framer Motion.
- **User Authentication & Profile Management:** Secure login and registration system with persistent user profiles managed via MongoDB.
- **Modern Glassmorphic UI:** A visually stunning, highly responsive interface thoughtfully designed with Tailwind CSS.

---

## 🛠️ Technology Stack

### **Frontend**
- **React.js** (v19) - Built with Vite for ultra-fast development
- **Tailwind CSS** (v4) - For modern, utility-first styling and glassmorphism
- **Three.js & React Three Fiber/Drei** - For 3D graphics and interactions
- **Framer Motion** - For fluid page transitions and micro-animations
- **Zustand** - Lightweight state management
- **Recharts** - Data visualization components
- **React Router** - Dynamic client-side routing

### **Backend**
- **Node.js & Express.js** - Robust RESTful API server
- **MongoDB & Mongoose** - NoSQL database for flexible data modeling
- **Google GenAI** - Integration for smart text analysis and recommendation logic
- **JWT & bcryptjs** - Secure authentication flows
- **pdf-parse & mammoth** - Robust document text extraction for uploaded resumes

---

## ⚙️ Local Development

Follow these instructions to run the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/smart-skill-gap-analyzer.git
cd "Mini Project"
```

### 2. Setup the Server

Navigate to the server directory, install dependencies, and configure your environment variables.

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_genai_api_key
```

Start the backend development server:
```bash
npm run dev
```

### 3. Setup the Client

Open a new terminal window, navigate to the client directory, and install the dependencies.

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory if needed for any client-side environment variables.

Start the frontend Vite server:
```bash
npm run dev
```

The application should now be running locally. Typically:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.
