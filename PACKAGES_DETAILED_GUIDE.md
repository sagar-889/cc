# 📦 Complete Packages, Modules & Functions Guide

> Comprehensive documentation of all packages, their purposes, key functions, and implementation in CampusCompanion

---

## TABLE OF CONTENTS
1. [Backend Packages](#backend-packages)
2. [Frontend Packages](#frontend-packages)
3. [Agentic AI Implementation](#agentic-ai-implementation)
4. [Database Models & Functions](#database-models)
5. [API Routes & Endpoints](#api-routes)
6. [Utility Functions](#utility-functions)

---

# BACKEND PACKAGES

## Core Server Packages

### 1. **express** (v4.18.2)
**Purpose**: Web application framework for Node.js - handles HTTP requests, routing, and middleware

**Key Functions Used**:
```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());              // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/api/users', handler);       // GET request
app.post('/api/auth/login', handler); // POST request
app.put('/api/courses/:id', handler); // PUT request
app.delete('/api/materials/:id', handler); // DELETE request

// Start server
app.listen(5000, () => console.log('Server running'));
```

**Used In**: All API endpoints (auth, courses, materials, chatbot, agentic AI, etc.)

---

### 2. **mongoose** (v7.5.0)
**Purpose**: MongoDB object modeling tool - provides schema-based solution to model application data

**Key Functions Used**:
```javascript
const mongoose = require('mongoose');

// Connect to database
await mongoose.connect(process.env.MONGODB_URI);

// Define Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Create Model
const User = mongoose.model('User', userSchema);

// CRUD Operations
const user = await User.create({ name: 'John' });     // Create
const users = await User.find({ department: 'CS' });  // Read
await User.findByIdAndUpdate(id, { name: 'Jane' });   // Update
await User.findByIdAndDelete(id);                     // Delete

// Advanced Queries
const results = await User.find()
  .populate('courses')           // Join with courses
  .select('name email')          // Select specific fields
  .sort({ createdAt: -1 })       // Sort
  .limit(10);                    // Limit results
```

**Used In**: All data models (User, Course, Material, Assignment, AgenticPlan, etc.)

---

### 3. **jsonwebtoken** (v9.0.2)
**Purpose**: Create and verify JSON Web Tokens for secure authentication

**Key Functions Used**:
```javascript
const jwt = require('jsonwebtoken');

// Generate Token (Login)
const token = jwt.sign(
  { userId: user._id, role: user.role },  // Payload
  process.env.JWT_SECRET,                 // Secret key
  { expiresIn: '7d' }                     // Options
);

// Verify Token (Middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded.userId); // Extract user ID

// Decode without verification (inspect only)
const payload = jwt.decode(token);
```

**Used In**: 
- `routes/auth.js` - Login/Register
- `middleware/auth.js` - Protected routes
- All API endpoints requiring authentication

---

### 4. **bcryptjs** (v2.4.3)
**Purpose**: Hash and compare passwords securely using bcrypt algorithm

**Key Functions Used**:
```javascript
const bcrypt = require('bcryptjs');

// Hash Password (Registration)
const salt = await bcrypt.genSalt(10);              // Generate salt
const hashedPassword = await bcrypt.hash(password, salt); // Hash

// Compare Password (Login)
const isMatch = await bcrypt.compare(
  plainTextPassword,  // User input
  hashedPassword      // Database hash
);

if (isMatch) {
  // Password correct - login
}
```

**Used In**: 
- `routes/auth.js` - User registration and login
- Password security throughout the app

---

### 5. **multer** (v1.4.5)
**Purpose**: Middleware for handling multipart/form-data (file uploads)

**Key Functions Used**:
```javascript
const multer = require('multer');
const path = require('path');

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/materials/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx/;
  const extname = allowedTypes.test(path.extname(file.originalname));
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Create Upload Instance
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter 
});

// Use in Route
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  console.log(req.file);  // File info
  console.log(req.body);  // Other form fields
});
```

**Used In**: 
- `routes/materials.js` - Study material uploads
- `routes/admin.js` - Admin file uploads

---

### 6. **dotenv** (v16.3.1)
**Purpose**: Load environment variables from .env file into process.env

**Key Functions Used**:
```javascript
require('dotenv').config();

// Access variables
const port = process.env.PORT;
const dbUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const apiKey = process.env.GEMINI_API_KEY;
```

**Used In**: 
- `server.js` - Main entry point
- Configuration files
- All modules needing environment variables

---

### 7. **cors** (v2.8.5)
**Purpose**: Enable Cross-Origin Resource Sharing - allows frontend to access backend

**Key Functions Used**:
```javascript
const cors = require('cors');

// Simple CORS
app.use(cors());

// Configured CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Used In**: 
- `server.js` - Global middleware
- Enables frontend-backend communication

---

### 8. **helmet** (v7.0.0)
**Purpose**: Secure Express apps by setting various HTTP headers

**Key Functions Used**:
```javascript
const helmet = require('helmet');

// Use all default protections
app.use(helmet());

// Or configure specific protections
app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
```

**Used In**: 
- `server.js` - Security middleware
- Protects against common web vulnerabilities

---

### 9. **morgan** (v1.10.0)
**Purpose**: HTTP request logger middleware

**Key Functions Used**:
```javascript
const morgan = require('morgan');

// Development logging
app.use(morgan('dev'));
// Output: GET /api/users 200 45ms

// Production logging
app.use(morgan('combined'));
// Output: Detailed Apache-style logs

// Custom format
app.use(morgan(':method :url :status :response-time ms'));
```

**Used In**: 
- `server.js` - Request logging
- Debugging and monitoring

---

### 10. **express-rate-limit** (v7.0.1)
**Purpose**: Rate limiting middleware to prevent abuse

**Key Functions Used**:
```javascript
const rateLimit = require('express-rate-limit');

// Create limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Max 100 requests per window
  message: 'Too many requests, please try again later'
});

// Apply to all routes
app.use(limiter);

// Or specific routes
app.use('/api/auth', limiter);
```

**Used In**: 
- `server.js` - API protection
- Prevents DDoS and brute force attacks

---

### 11. **express-validator** (v7.0.1)
**Purpose**: Validate and sanitize user input

**Key Functions Used**:
```javascript
const { body, validationResult } = require('express-validator');

// Define validation rules
router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

**Used In**: 
- `routes/auth.js` - Input validation
- All routes accepting user input

---

## AI & Machine Learning Packages

### 12. **@google/generative-ai** (v0.1.3)
**Purpose**: Google's Gemini Pro API for text generation and AI chat

**Key Functions Used**:
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.8,        // Creativity (0-1)
    topK: 40,                // Top K sampling
    topP: 0.95,              // Top P sampling
    maxOutputTokens: 4096    // Max response length
  }
});

// Generate Content
const result = await model.generateContent(prompt);
const response = result.response.text();

// Stream Content
const streamResult = await model.generateContentStream(prompt);
for await (const chunk of streamResult.stream) {
  console.log(chunk.text());
}

// Chat Session
const chat = model.startChat({
  history: [
    { role: "user", parts: "Hello" },
    { role: "model", parts: "Hi there!" }
  ]
});
const reply = await chat.sendMessage("How are you?");
```

**Used In**: 
- `utils/trueAgenticAI.js` - Goal analysis, plan generation
- `utils/intelligentChatbot.js` - AI chatbot responses
- `utils/advancedAI.js` - AI-powered features
- `routes/agenticAI.js` - AI-driven study plans

---

### 13. **openai** (v4.11.1)
**Purpose**: OpenAI API for GPT models and text-to-speech

**Key Functions Used**:
```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chat Completion (GPT)
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Hello!" }
  ],
  temperature: 0.7,
  max_tokens: 500
});

console.log(completion.choices[0].message.content);

// Text-to-Speech
const speech = await openai.audio.speech.create({
  model: "tts-1",
  voice: "alloy",
  input: "Hello, this is text to speech"
});

const buffer = Buffer.from(await speech.arrayBuffer());
```

**Used In**: 
- `routes/voiceChat.js` - Text-to-speech conversion
- Alternative AI provider (optional)

---

### 14. **langchain** (v0.0.150)
**Purpose**: Framework for developing applications powered by language models

**Key Functions Used**:
```javascript
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { PromptTemplate } = require("langchain/prompts");
const { LLMChain } = require("langchain/chains");

// Create Chain
const template = "You are an expert in {subject}. Answer: {question}";
const prompt = new PromptTemplate({
  template: template,
  inputVariables: ["subject", "question"],
});

const model = new ChatOpenAI({ 
  temperature: 0.7,
  modelName: "gpt-3.5-turbo" 
});

const chain = new LLMChain({ llm: model, prompt: prompt });

// Execute
const result = await chain.call({
  subject: "Computer Science",
  question: "What is recursion?"
});
```

**Used In**: 
- `utils/agenticAI.js` - Multi-agent orchestration
- Advanced AI workflows

---

### 15. **@langchain/openai** (v0.0.10)
**Purpose**: LangChain integration for OpenAI models

**Used In**: Works alongside langchain for OpenAI-specific functionality

---

## Utility Packages

### 16. **axios** (v1.5.0)
**Purpose**: Promise-based HTTP client for Node.js and browsers

**Key Functions Used**:
```javascript
const axios = require('axios');

// GET Request
const response = await axios.get('https://api.example.com/data');
console.log(response.data);

// POST Request
const postResponse = await axios.post('https://api.example.com/users', {
  name: 'John',
  email: 'john@example.com'
}, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// With Error Handling
try {
  const data = await axios.get('/api/data');
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.log(error.response.status);
    console.log(error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.log('No response');
  }
}

// Multiple Requests
const [users, posts] = await Promise.all([
  axios.get('/api/users'),
  axios.get('/api/posts')
]);
```

**Used In**: 
- External API calls (OpenAI TTS)
- HTTP requests in backend
- Frontend API communication

---

### 17. **pdf-parse** (v1.1.1)
**Purpose**: Extract text from PDF files

**Key Functions Used**:
```javascript
const fs = require('fs');
const pdf = require('pdf-parse');

// Read and Parse PDF
const dataBuffer = fs.readFileSync('document.pdf');
const data = await pdf(dataBuffer);

console.log(data.text);      // Extracted text
console.log(data.numpages);  // Number of pages
console.log(data.info);      // PDF metadata
```

**Used In**: 
- PDF material processing
- Text extraction from uploaded documents

---

## Development Packages

### 18. **nodemon** (v3.0.1) [Dev Dependency]
**Purpose**: Auto-restart Node.js server when files change

**Configuration** (`package.json`):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Usage**:
```bash
npm run dev
```

**Used In**: Development workflow for faster iteration

---

# FRONTEND PACKAGES

## Core React Packages

### 19. **react** (v18.2.0)
**Purpose**: JavaScript library for building user interfaces

**Key Functions Used**:
```javascript
import React, { useState, useEffect, useCallback } from 'react';

// Component
function MyComponent() {
  // State Hook
  const [count, setCount] = useState(0);
  
  // Effect Hook (runs on mount/update)
  useEffect(() => {
    document.title = `Count: ${count}`;
    
    // Cleanup
    return () => {
      // Cleanup code
    };
  }, [count]); // Dependency array
  
  // Callback Hook (memoized function)
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div onClick={increment}>
      Count: {count}
    </div>
  );
}
```

**Used In**: All frontend components

---

### 20. **react-dom** (v18.2.0)
**Purpose**: React package for working with the DOM

**Key Functions Used**:
```javascript
import React Appfrom ReactDOM from 'react-dom/client';
import App from './App';

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Used In**: `index.js` - App rendering

---

### 21. **react-router-dom** (v6.16.0)
**Purpose**: Routing library for React applications

**Key Functions Used**:
```javascript
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

function CourseDetail() {
  const { id } = useParams();  // Get URL params
  const navigate = useNavigate(); // Programmatic navigation
  
  const goBack = () => navigate('/courses');
  
  return <div>Course {id}</div>;
}

// Navigation Link
<Link to="/dashboard">Go to Dashboard</Link>
```

**Used In**: All page navigation and routing

---

### 22. **axios** (v1.5.0)
**Purpose**: HTTP client for frontend API calls

**Key Functions Used**:
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// GET Request
const fetchCourses = async () => {
  const response = await axios.get(`${API_URL}/courses`);
  return response.data;
};

// POST with Authentication
const createGoal = async (goal) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/agenticAI/understand-goals`,
    { goal },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// File Upload
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(
    `${API_URL}/materials/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return response.data;
};
```

**Used In**: All API communication from frontend

---

### 23. **zustand** (v4.4.1)
**Purpose**: Lightweight state management library

**Key Functions Used**:
```javascript
import create from 'zustand';
import { persist } from 'zustand/middleware';

// Create Store
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      // Actions
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      updateUser: (user) => set({ user }),
      
      // Getters
      isAuthenticated: () => get().token !== null
    }),
    {
      name: 'auth-storage', // LocalStorage key
      getStorage: () => localStorage
    }
  )
);

// Use in Component
function Dashboard() {
  const { user, logout, isAuthenticated } = useAuthStore();
  
  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Used In**: Global state management (auth, user data)

---

### 24. **react-hot-toast** (v2.4.1)
**Purpose**: Beautiful notifications/toasts for React

**Key Functions Used**:
```javascript
import toast, { Toaster } from 'react-hot-toast';

// In App.js
<Toaster position="top-right" />

// In Components
toast.success('Goal created successfully!');
toast.error('Failed to upload file');
toast.loading('Processing...');

// With Promise
toast.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Saved successfully!',
    error: 'Failed to save'
  }
);

// Custom Toast
toast.custom((t) => (
  <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}`}>
    Custom notification
  </div>
));
```

**Used In**: User notifications throughout the app

---

## UI & Styling Packages

### 25. **tailwindcss** (v3.3.3)
**Purpose**: Utility-first CSS framework

**Key Classes Used**:
```jsx
// Layout
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Content */}
  </div>
</div>

// Typography
<h1 className="text-3xl font-bold text-gray-900">Title</h1>
<p className="text-sm text-gray-600">Description</p>

// Colors & Backgrounds
<div className="bg-blue-500 text-white hover:bg-blue-600">
  Button
</div>

// Spacing
<div className="p-4 m-2 mt-4 mb-2">Content</div>

// Flexbox
<div className="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

// Responsive Design
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>

// States
<button className="hover:shadow-lg active:scale-95 disabled:opacity-50">
  Interactive Button
</button>
```

**Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6'
      }
    }
  }
}
```

**Used In**: All component styling

---

### 26. **lucide-react** (v0.284.0)
**Purpose**: Beautiful open-source icon library

**Key Icons Used**:
```javascript
import {
  Home, User, BookOpen, Calendar, MessageCircle,
  Upload, Download, Edit, Trash, Check, X,
  ChevronRight, Menu, Bell, Settings, LogOut,
  Brain, Target, Zap, TrendingUp, AlertCircle
} from 'lucide-react';

// Usage
<Home size={20} className="text-blue-500" />
<User strokeWidth={2} />
<BookOpen color="red" />
<Calendar className="mr-2" />

// With Animation
<Bell className="animate-pulse" />
```

**Used In**: Icons throughout the application

---

## Data Visualization

### 27. **recharts** (v2.8.0)
**Purpose**: Composable charting library for React

**Key Components Used**:
```javascript
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

// Line Chart
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="score" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>

// Bar Chart
<BarChart data={assignmentData}>
  <Bar dataKey="completed" fill="#82ca9d" />
  <Bar dataKey="pending" fill="#ffc658" />
</BarChart>

// Pie Chart
<PieChart>
  <Pie
    data={data}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    label
  />
</PieChart>
```

**Used In**: Dashboard analytics and progress visualization

---

### 28. **jspdf** (v3.0.3)
**Purpose**: Generate PDF documents in JavaScript

**Key Functions Used**:
```javascript
import jsPDF from 'jspdf';

// Create PDF
const doc = new jsPDF();

// Add Text
doc.text('My Timetable', 10, 10);
doc.setFontSize(12);
doc.text('Course Schedule', 10, 20);

// Add Lines/Shapes
doc.line(10, 25, 200, 25);
doc.rect(10, 30, 180, 100);

// Multiple Pages
doc.addPage();
doc.text('Page 2', 10, 10);

// Save
doc.save('timetable.pdf');

// Advanced: Add Table
timetable.forEach((entry, index) => {
  const y = 30 + (index * 10);
  doc.text(`${entry.day}: ${entry.course}`, 10, y);
});
```

**Used In**: Timetable PDF export, reports

---

## Maps & Location

### 29. **leaflet** (v1.9.4)
**Purpose**: Interactive maps library

**Used In**: Base library for react-leaflet

---

### 30. **react-leaflet** (v4.2.1)
**Purpose**: React components for Leaflet maps

**Key Components Used**:
```javascript
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

<MapContainer 
  center={[17.385, 78.486]} 
  zoom={15} 
  style={{ height: '400px', width: '100%' }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
  
  <Marker position={[17.385, 78.486]}>
    <Popup>
      <div>
        <h3>Main Building</h3>
        <p>Computer Science Department</p>
      </div>
    </Popup>
  </Marker>
  
  <Circle
    center={[17.385, 78.486]}
    radius={200}
    color="blue"
    fillColor="lightblue"
  />
</MapContainer>
```

**Used In**: Campus navigation feature

---

## Utility Packages

### 31. **date-fns** (v2.30.0)
**Purpose**: Modern JavaScript date utility library

**Key Functions Used**:
```javascript
import { format, formatDistance, formatRelative, isAfter, isBefore, addDays, subDays } from 'date-fns';

// Format Dates
format(new Date(), 'MMM dd, yyyy');           // Jan 15, 2024
format(new Date(), 'HH:mm:ss');               // 14:30:45
format(new Date(), 'EEEE, MMMM do, yyyy');   // Monday, January 15th, 2024

// Relative Time
formatDistance(new Date(), addDays(new Date(), 3));  // "in 3 days"
formatRelative(subDays(new Date(), 3), new Date());  // "last Friday at 2:30 PM"

// Date Comparison
isAfter(date1, date2);   // true/false
isBefore(date1, date2);  // true/false

// Date Math
const nextWeek = addDays(new Date(), 7);
const lastWeek = subDays(new Date(), 7);
```

**Used In**: Date formatting, deadline calculations

---

### 32. **react-syntax-highlighter** (v15.6.6)
**Purpose**: Syntax highlighting for code blocks

**Key Functions Used**:
```javascript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

<SyntaxHighlighter 
  language="javascript" 
  style={vscDarkPlus}
  showLineNumbers={true}
>
  {`function hello() {
  console.log('Hello World');
}`}
</SyntaxHighlighter>

// Supported Languages: javascript, python, java, c, cpp, html, css, etc.
```

**Used In**: Code display in chatbot responses

---

# AGENTIC AI IMPLEMENTATION

## Architecture Overview

The Agentic AI system is built with three main components:

### 1. **Core AI Engine** (`utils/trueAgenticAI.js`)

**Class**: `TrueAgenticAI`

**Key Methods**:

#### `initializeAI()`
**Purpose**: Initialize AI with fallback support
```javascript
initializeAI() {
  this.useLocalMode = true; // Force local mode for development
  
  if (process.env.GEMINI_API_KEY && process.env.NODE_ENV === 'production') {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.useLocalMode = false;
  }
}
```

**Packages Used**: `@google/generative-ai`

---

#### `analyzeUserContext(userId)`
**Purpose**: Gather all user data for personalized plans

```javascript
async analyzeUserContext(userId) {
  // Fetch user data in parallel
  const [user, courses, materials, assignments, events, timetable] = 
    await Promise.all([
      User.findById(userId),
      Course.find({ enrolledStudents: userId }),
      Material.find({ course: { $in: userCourseIds } }),
      Assignment.find({ userId }),
      Event.find({ registeredUsers: userId }),
      this.getUserTimetable(userId)
    ]);
  
  return {
    user: { name, department, year, semester },
    academics: { enrolledCourses, availableMaterials },
    workload: { pendingAssignments, upcomingDeadlines },
    engagement: { registeredEvents },
    schedule: timetable
  };
}
```

**Packages Used**: `mongoose` (for database queries), `Promise.all` (parallel execution)

**Returns**: Complete user context object

---

#### `generateStudyPlan(userId, goal, duration)`
**Purpose**: Main orchestrator - generates complete study plan

**Flow**:
1. Create plan document
2. Analyze user context
3. Generate AI analysis (or use fallback)
4. Create detailed plan structure
5. Execute automated actions
6. Save to database

```javascript
async generateStudyPlan(userId, goal, duration = '2 weeks') {
  const plan = new AgenticPlan({ userId, goal, status: 'analyzing' });
  await plan.save();
  
  // Step 1: Analyze Context
  const context = await this.analyzeUserContext(userId);
  
  // Step 2: AI Analysis (with fallback)
  const aiAnalysis = this.model && !this.useLocalMode
    ? await this.callGeminiAPI(goal, context)
    : this.getFallbackAnalysis(goal, context);
  
  plan.analysis = aiAnalysis;
  
  // Step 3: Create Plan
  plan.plan = await this.createDetailedPlan(goal, duration, context, aiAnalysis);
  
  // Step 4: Execute Actions
  await this.executeAgentActions(plan, context);
  
  plan.status = 'monitoring';
  await plan.save();
  
  return { success: true, planId: plan._id, plan };
}
```

**Packages Used**: 
- `mongoose` - Database operations
- `@google/generative-ai` - Optional AI analysis

---

#### `getFallbackAnalysis(goal, context)`
**Purpose**: Intelligent local analysis WITHOUT external AI

**Algorithm**:
```javascript
getFallbackAnalysis(goal, context = {}) {
  const goalLower = goal.toLowerCase();
  
  // 1. Difficulty Assessment (keyword-based)
  let difficulty = 'intermediate';
  if (goalLower.includes('basic') || goalLower.includes('beginner')) {
    difficulty = 'beginner';
  } else if (goalLower.includes('advanced') || goalLower.includes('master')) {
    difficulty = 'advanced';
  }
  
  // 2. Time Estimation (workload-aware)
  let estimatedHours = 20;
  if (context.workload.pendingAssignments > 5) {
    estimatedHours = 15; // Busy schedule
  } else if (context.workload.pendingAssignments < 2) {
    estimatedHours = 30; // Free time
  }
  
  // 3. Gap Identification (context-based)
  const identifiedGaps = [
    `Deep understanding of ${goal} fundamentals`,
    'Practical hands-on experience',
    context.workload.overdueAssignments > 0 
      ? 'Time management skills' 
      : 'Advanced problem-solving techniques'
  ];
  
  // 4. Strengths (user-specific)
  const strengths = [
    'Motivated to learn and improve',
    context.academics.enrolledCourses > 3 
      ? 'Managing multiple courses effectively' 
      : 'Strong focus and dedication'
  ];
  
  // 5. Recommendations (personalized)
  const recommendations = [
    'Set aside dedicated study time daily',
    'Practice with real-world examples',
    context.workload.upcomingDeadlines > 2 
      ? 'Prioritize urgent tasks first' 
      : 'Explore advanced topics'
  ];
  
  return { identifiedGaps, strengths, recommendations, estimatedHours, difficulty };
}
```

**Packages Used**: None (pure JavaScript logic)

**Intelligence**: Uses keyword analysis, workload assessment, and context awareness

---

#### `createDetailedPlan(goal, duration, context, analysis)`
**Purpose**: Generate phase-based plan with tasks

```javascript
async createDetailedPlan(goal, duration, context, analysis) {
  const weeks = parseInt(duration) || 2;
  const phases = [];
  
  // Create phases
  for (let i = 0; i < weeks; i++) {
    const tasks = [];
    
    // Daily study tasks
    for (let day = 0; day < 7; day++) {
      tasks.push({
        title: `Day ${day + 1}: Study Session`,
        description: `Focus on ${goal}`,
        type: 'study',
        estimatedHours: 2,
        deadline: new Date(Date.now() + (i * 7 + day) * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: day < 3 ? 'high' : 'medium'
      });
    }
    
    // Weekly assessment
    tasks.push({
      title: `Week ${i + 1} Assessment`,
      type: 'test',
      estimatedHours: 1,
      status: 'pending',
      priority: 'high'
    });
    
    phases.push({ name: `Phase ${i + 1}`, tasks });
  }
  
  // Find relevant materials
  const materials = await Material.find({
    $or: [
      { title: { $regex: goal, $options: 'i' } },
      { description: { $regex: goal, $options: 'i' } }
    ]
  }).limit(10);
  
  const resources = materials.map(m => ({
    type: 'material',
    title: m.title,
    link: `/api/materials/${m._id}`,
    materialId: m._id
  }));
  
  return { phases, resources };
}
```

**Packages Used**: 
- `mongoose` - Material search
- Native JavaScript - Task generation

---

#### `executeAgentActions(plan, context)`
**Purpose**: Perform automated actions

**Actions Performed**:
1. Find and organize materials
2. Schedule reminders for each task
3. Generate practice tests
4. Auto-register for relevant events

```javascript
async executeAgentActions(plan, context) {
  // Action 1: Log materials found
  plan.logAction('found_materials', `Found ${plan.plan.resources.length} materials`);
  
  // Action 2: Create reminders
  for (const phase of plan.plan.phases) {
    for (const task of phase.tasks) {
      const reminderDate = new Date(task.deadline.getTime() - 24 * 60 * 60 * 1000);
      
      // Schedule reminder
      plan.scheduleReminder('task', `Reminder: ${task.title}`, reminderDate);
      
      // Create notification
      await new AgenticNotification({
        userId: plan.userId,
        planId: plan._id,
        type: 'reminder',
        title: `Reminder: ${task.title}`,
        scheduledFor: reminderDate
      }).save();
    }
  }
  
  // Action 3: Generate tests
  for (const phase of plan.plan.phases) {
    const testTask = phase.tasks.find(t => t.type === 'test');
    if (testTask) {
      const test = await this.generatePracticeTest(plan.userId, plan._id, plan.goal);
      plan.execution.testsGenerated.push({ testId: test._id });
    }
  }
  
  // Action 4: Auto-register events
  const events = await Event.find({
    title: { $regex: plan.goal, $options: 'i' },
    startDate: { $gte: new Date() }
  }).limit(5);
  
  for (const event of events) {
    if (!event.registeredUsers.includes(plan.userId)) {
      event.registeredUsers.push(plan.userId);
      await event.save();
    }
  }
  
  await plan.save();
}
```

**Packages Used**: `mongoose` - Database operations

---

### 2. **Database Models**

#### **AgenticPlan Model** (`models/AgenticPlan.js`)

**Schema Fields**:
- `userId` - Plan owner
- `goal` - User's learning goal
- `status` - Current state (analyzing, planning, executing, etc.)
- `analysis` - AI analysis results
- `plan` - Generated plan structure
- `execution` - Execution tracking

**Key Methods**:
```javascript
// Update progress
AgenticPlanSchema.methods.updateProgress = function() {
  const completed = this.plan.phases.reduce((sum, phase) => 
    sum + phase.tasks.filter(t => t.status === 'completed').length, 0
  );
  const total = this.plan.phases.reduce((sum, phase) => 
    sum + phase.tasks.length, 0
  );
  this.execution.progress = Math.round((completed / total) * 100);
};

// Log action
AgenticPlanSchema.methods.logAction = function(action, description, success = true) {
  this.execution.actionsPerformed.push({
    action,
    description,
    timestamp: new Date(),
    success
  });
};

// Schedule reminder
AgenticPlanSchema.methods.scheduleReminder = function(type, title, scheduledFor) {
  this.execution.reminders.push({ type, title, scheduledFor });
};
```

**Packages Used**: `mongoose`

---

#### **AgenticTest Model** (`models/AgenticTest.js`)

**Purpose**: Store practice tests

**Key Methods**:
```javascript
// Calculate results
AgenticTestSchema.methods.calculateResults = function() {
  let correct = 0;
  this.questions.forEach(q => {
    if (q.isCorrect) correct++;
  });
  
  const score = Math.round((correct / this.questions.length) * 100);
  this.results = { score, correctAnswers: correct };
  this.status = 'completed';
};

// Generate feedback
AgenticTestSchema.methods.generateAIFeedback = async function() {
  const accuracy = this.results.score;
  
  if (accuracy >= 80) {
    this.results.aiFeedback.strengths.push('Excellent performance');
  } else if (accuracy < 50) {
    this.results.aiFeedback.weaknesses.push('Needs more practice');
  }
};
```

**Packages Used**: `mongoose`

---

### 3. **API Routes** (`routes/agenticAI.js`)

#### POST `/api/agenticAI/understand-goals`
**Purpose**: Create new goal and generate plan

```javascript
router.post('/understand-goals', auth, async (req, res) => {
  const { goal } = req.body;
  
  const result = await trueAgenticAI.generateStudyPlan(
    req.userId,
    goal,
    '2 weeks'
  );
  
  res.json({
    success: true,
    planId: result.planId,
    analysis: result.plan.analysis
  });
});
```

**Packages Used**: `express`, `jsonwebtoken` (auth middleware)

---

#### GET `/api/agenticAI/my-plan`
**Purpose**: Fetch user's active plan

```javascript
router.get('/my-plan', auth, async (req, res) => {
  const plan = await AgenticPlan.findOne({
    userId: req.userId,
    isArchived: false
  }).sort({ createdAt: -1 });
  
  res.json({ success: true, plan });
});
```

---

#### POST `/api/agenticAI/complete-task`
**Purpose**: Mark task as complete

```javascript
router.post('/complete-task', auth, async (req, res) => {
  const { planId, phaseIndex, taskIndex } = req.body;
  
  const plan = await AgenticPlan.findById(planId);
  plan.plan.phases[phaseIndex].tasks[taskIndex].status = 'completed';
  plan.updateProgress();
  await plan.save();
  
  res.json({ success: true, plan });
});
```

---

## Complete Package Flow Example

**User Creates Goal: "Learn React in 2 weeks"**

```
1. USER ACTION (Frontend)
   ↓
   React Component (react, axios)
   ↓
   POST /api/agenticAI/understand-goals

2. BACKEND ROUTING (express)
   ↓
   Auth Middleware (jsonwebtoken)
   ↓
   Route Handler (routes/agenticAI.js)

3. AI ENGINE (utils/trueAgenticAI.js)
   ↓
   a. analyzeUserContext()
      - mongoose: Query User, Course, Material, Assignment, Event
      - Promise.all: Parallel execution
   ↓
   b. getFallbackAnalysis()
      - JavaScript: Keyword analysis, workload assessment
      - NO external packages needed
   ↓
   c. createDetailedPlan()
      - mongoose: Search materials
      - JavaScript: Generate tasks and phases
   ↓
   d. executeAgentActions()
      - mongoose: Create notifications, tests, update events

4. DATABASE (mongoose)
   ↓
   Save AgenticPlan, AgenticNotification, AgenticTest

5. RESPONSE
   ↓
   Send plan back to frontend (axios)
   ↓
   Update UI (react, zustand)
   ↓
   Show toast (react-hot-toast)
```

---

## Key Takeaways

### Backend Packages:
1. **express** - Web server
2. **mongoose** - Database ORM
3. **jsonwebtoken** - Auth
4. **bcryptjs** - Password security
5. **multer** - File uploads
6. **@google/generative-ai** - Optional AI (has fallback)

### Frontend Packages:
1. **react** - UI framework
2. **axios** - API calls
3. **zustand** - State management
4. **tailwindcss** - Styling
5. **lucide-react** - Icons
6. **recharts** - Charts

### Agentic AI Core:
- **NO external AI required** (works with fallbacks)
- Uses **mongoose** for data queries
- Pure **JavaScript** for intelligent analysis
- **Context-aware** algorithms
- **Fully automated** action execution

---

**Every package serves a specific purpose and works together to create a complete, intelligent system!** 🚀

---

# PACKAGE INSTALLATION COMMANDS

## Backend Installation
```bash
cd backend
npm install express mongoose jsonwebtoken bcryptjs multer dotenv cors helmet morgan express-rate-limit express-validator @google/generative-ai openai langchain @langchain/openai axios pdf-parse
npm install --save-dev nodemon
```

## Frontend Installation
```bash
cd frontend
npm install react react-dom react-router-dom axios zustand react-hot-toast recharts jspdf leaflet react-leaflet lucide-react date-fns react-syntax-highlighter
npm install --save-dev tailwindcss postcss autoprefixer
```

---

# ENVIRONMENT VARIABLES

## Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/campuscompanion
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

## Frontend `.env`
```env
PORT=3000
REACT_APP_API_URL=http://localhost:5000/api
```

---

# SUMMARY TABLE

| Category | Package | Version | Purpose | Used In |
|----------|---------|---------|---------|---------|
| **Backend Core** | express | 4.18.2 | Web server | All API routes |
| | mongoose | 7.5.0 | MongoDB ORM | All models |
| | jsonwebtoken | 9.0.2 | Authentication | Auth system |
| | bcryptjs | 2.4.3 | Password hashing | Auth routes |
| **File Handling** | multer | 1.4.5 | File uploads | Material uploads |
| **Security** | helmet | 7.0.0 | Security headers | Server security |
| | cors | 2.8.5 | CORS handling | API access |
| | express-rate-limit | 7.0.1 | Rate limiting | API protection |
| **AI/ML** | @google/generative-ai | 0.1.3 | Gemini AI | Agentic AI |
| | openai | 4.11.1 | GPT/TTS | Voice features |
| | langchain | 0.0.150 | AI orchestration | Multi-agent |
| **Utilities** | axios | 1.5.0 | HTTP client | API calls |
| | dotenv | 16.3.1 | Env variables | Configuration |
| **Frontend Core** | react | 18.2.0 | UI library | All components |
| | react-router-dom | 6.16.0 | Routing | Navigation |
| | axios | 1.5.0 | API calls | Backend comm |
| | zustand | 4.4.1 | State mgmt | Global state |
| **UI/Styling** | tailwindcss | 3.3.3 | CSS framework | All styling |
| | lucide-react | 0.284.0 | Icons | UI icons |
| | react-hot-toast | 2.4.1 | Notifications | User feedback |
| **Visualization** | recharts | 2.8.0 | Charts | Analytics |
| | jspdf | 3.0.3 | PDF generation | Reports |
| **Maps** | leaflet | 1.9.4 | Maps library | Base maps |
| | react-leaflet | 4.2.1 | React maps | Navigation |
| **Utilities** | date-fns | 2.30.0 | Date handling | Dates/times |

---

# QUICK REFERENCE

## Most Important Functions by Feature

### Authentication
```javascript
// bcryptjs
bcrypt.hash(password, salt)
bcrypt.compare(password, hash)

// jsonwebtoken
jwt.sign(payload, secret, options)
jwt.verify(token, secret)
```

### Database Operations
```javascript
// mongoose
Model.create(data)
Model.find(query)
Model.findById(id)
Model.findByIdAndUpdate(id, update)
Model.findByIdAndDelete(id)
```

### API Requests
```javascript
// axios (Frontend)
axios.get(url, config)
axios.post(url, data, config)

// express (Backend)
app.get(path, handler)
app.post(path, handler)
```

### AI Features
```javascript
// @google/generative-ai
genAI.getGenerativeModel({ model: 'gemini-pro' })
model.generateContent(prompt)

// trueAgenticAI
trueAgenticAI.generateStudyPlan(userId, goal, duration)
trueAgenticAI.analyzeUserContext(userId)
```

### State Management
```javascript
// zustand
const useStore = create((set) => ({
  data: null,
  setData: (data) => set({ data })
}))
```

### UI Components
```javascript
// react
useState(initialState)
useEffect(() => {}, [deps])
useCallback(() => {}, [deps])

// react-hot-toast
toast.success('Message')
toast.error('Error')
```

---

**📚 This guide covers all 32 packages used in CampusCompanion with detailed explanations, code examples, and real-world usage!**
