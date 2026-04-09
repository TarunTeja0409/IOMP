# Smart Skill Gap Analyzer - Detailed Project Documentation

## 1. Project Overview
The **Smart Skill Gap Analyzer** is a comprehensive, full-stack web application designed to help job seekers understand how their current skill set aligns with current market demands. The platform automatically assesses a user's skills via resume parsing, compares them to real-time or simulated job requirements using AI, and presents actionable recommendations. 

This project aims to solve the problem of candidate rejection due to missing modern technical skills by providing a detailed "Skill Gap analysis" and a personalized learning path.

---

## 2. Technology Stack Overview
The application utilizes a modern **MERN** stack (MongoDB, Express, React, Node.js) combined with modern styling and visualization tools to provide an immersive, high-performance User Experience.

### 2.1 Frontend Development
The frontend is built for speed, aesthetics, and interactivity.
* **React.js (v19) & Vite:** The core framework used to build reusable UI components. Vite is used as the build tool for faster hot module replacement (HMR) and optimized build outputs.
* **Tailwind CSS (v4) & clsx / tailwind-merge:** A utility-first CSS framework used for implementing "Glassmorphic" designs, responsive layouts, and consistent theming. `clsx` and `tailwind-merge` handle dynamic class generation without style conflicts.
* **Zustand:** A small, fast, and scalable state management solution for React used to manage global user state, themes, and application data without the boilerplate of Redux.
* **React Router DOM:** Controls client-side routing, enabling a Single Page Application (SPA) feel with protected route handling.
* **Axios:** Handles asynchronous HTTP requests to the backend API, featuring interceptors for managing authentication tokens.

### 2.2 Visualizations and Animations
A key distinguishing factor of this application is its rich visual feedback mechanisms.
* **Three.js & React Three Fiber / Drei:** Used to render interactive 3D graphics in the browser. It creates immersive visual representations of the "Skill Gap" (e.g., dynamically rendered skill graphs or charts that users can interact with).
* **Framer Motion:** A production-ready animation library for React. Used for fluid page transitions, mounting animations, and micro-interactions on buttons and cards.
* **Recharts:** Used for plotting accurate, accessible 2D data visualizations, such as radar charts comparing user skills to job requirements.
* **Lucide React:** A clean, modern icon library.

### 2.3 Backend API & Server
The backend is a robust RESTful API built to handle data processing, AI interactions, and file management.
* **Node.js & Express.js:** Node serves as the JavaScript runtime, while Express provides the framework for building routing, middleware, and request/response handling.
* **MongoDB & Mongoose:** A NoSQL document database. Mongoose is the Object Data Modeling (ODM) library used to enforce schemas for Users, Jobs, and Applications.
* **Multer:** Middleware for handling `multipart/form-data`, primarily used for receiving PDF or Word document uploads from users (resumes).
* **Bcryptjs & JsonWebToken (JWT):** `bcrypt` is used to salt and hash user passwords before saving them to the database. `JWT` manages stateless user authentication across API requests.
* **dotenv & cors:** Manages environment variables and Cross-Origin Resource Sharing.

### 2.4 Document Parsing & AI Analysis
This is the core business logic component of the platform.
* **PDF-Parse & Mammoth:** Two distinct document parsing libraries. `pdf-parse` extracts raw text from `.pdf` resumes, and `mammoth` handles `.docx` files. This text extraction is the first step before analysis.
* **Google Generative AI (`@google/genai`):** The extracted text from user resumes and job descriptions is passed to Google's Gemini models. The AI evaluates the semantics of the text, intelligently identifies specific skills, compares the user's proficiency against the job requirement, and returns structured JSON responses outlining the "Gaps" and recommended learning resources.

---

## 3. System Architecture & Workflows

### 3.1 Authentication Flow
1. **Registration:** Users create an account; the backend hashes the password using bcrypt and stores the user document in MongoDB.
2. **Login:** User authenticates with credentials. The backend verifies the hash and generates an HttpOnly JWT or sends the token to the client.
3. **Session:** The frontend stores the token and attaches it via Axios Interceptors to the Authorization header of all subsequent protected API requests.

### 3.2 Skill Gap Analysis Workflow
1. **Upload:** The user navigates to their profile and uploads a resume (PDF/DOCX).
2. **File Processing:** The frontend sends the file via FormData to the `/api/users/resume` or equivalent endpoint.
3. **Parsing:** Express intercepts the file using Multer (saving locally or in memory buffer), and passes it to `pdf-parse` or `mammoth`.
4. **AI Skill Extraction:** The raw text is formulated into a prompt and sent to Google GenAI. The AI extracts a clean array of skills, years of experience, and job roles.
5. **Job Comparison:** The user selects a target job. The backend retrieves the job's required skills from MongoDB.
6. **Gap Generation:** The Google GenAI model evaluates the Extracted User Skills vs. Required Job Skills. It outputs a calculated "Match Percentage", a list of missing skills, and actionable learning advice.
7. **Visualization:** The JSON result is sent to the Frontend. Recharts and Three.js map this array visually, showing the user exactly where they fall short.

### 3.3 Database Schema Overview
* **User Schema:** Stores personal info, hashed password, uploaded resume reference, extracted skills array, and saved jobs.
* **Job Schema:** Stores job title, company, description, required skills array, experience level, and salary range.
* **Application/Analysis Schema:** Links a User to a Job, storing the historical result of a Skill Gap analysis, the match score, and specific feedback given by the AI.

---

## 4. Key Takeaways & Project Highlights
* **AI-Driven Logic:** Instead of relying on rigid keyword matching (which fails with synonyms), the project uses Large Language Models to understand the intent and context of skills.
* **High-End UI:** Implementation of 3D objects, complex data charts, and glassmorphism provides a highly polished, SaaS-level user presentation.
* **Scalability:** Built on the MERN stack with modular routing (e.g., separate files for `aiRoutes`, `analysisRoutes`, `jobRoutes`), allowing easy expansion of features in the future.
