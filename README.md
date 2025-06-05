# Recipe Organizer

A modern web application for organizing and sharing recipes, built with React, Vite, Tailwind CSS, and Supabase.

## Features

- User authentication (sign up, sign in, sign out)
- Create, read, update, and delete recipes
- View all recipes or filter by user
- Responsive design for all devices
- Modern and intuitive user interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd recipe-organizer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
recipe-organizer/
├── public/
│   └── index.html
├── src/
│   ├── assets/                  # Images, icons, fonts, etc.
│   ├── components/              # Reusable UI components
│   ├── pages/                   # Page components
│   ├── routes/                  # Route definitions
│   ├── services/               # API and utility functions
│   ├── context/                # Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── styles/                 # Global styles
│   ├── App.jsx
│   └── main.jsx
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Database Schema

The Supabase database should have the following table:

### recipes
- id: uuid (primary key)
- user_id: uuid (foreign key to auth.users)
- title: text
- description: text
- ingredients: text[]
- instructions: text[]
- cooking_time: integer
- image_url: text
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technologies Used

- React
- Vite
- Tailwind CSS
- Supabase
- React Router
- PostCSS
- Autoprefixer

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

# 🍽️ Recipe Organizer

A full-stack CRUD web application to manage your favorite recipes, built with **React** and **Supabase**.

## 📌 Features

- ✅ View all saved recipes
- ➕ Create a new recipe
- ✏️ Edit existing recipes
- ❌ Delete a recipe
- 🔍 Optional: Search and filter by tags or ingredients

## 🧰 Tech Stack

| Layer       | Technology                        |
|-------------|------------------------------------|
| Frontend    | React, HTML, CSS, React Router     |
| Backend API | Supabase (RESTful & Realtime APIs) |
| Database    | Supabase PostgreSQL                |
| Hosting     | Supabase (DB), Vercel/Netlify (React frontend) |

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/recipe-organizer.git
cd recipe-organizer
