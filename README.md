# WeCareU - Mental Health Platform 🧠

Platform konseling kesehatan mental berbasis web untuk mahasiswa Telkom University.

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda sudah menginstall:
- **Node.js** (v18 atau lebih baru) - [Download disini](https://nodejs.org/)
- **PostgreSQL** atau akun **Supabase** - [Supabase](https://supabase.com/)
- **Git** - [Download disini](https://git-scm.com/)

## 🚀 Quick Start (Untuk Clone Pertama Kali)

### 1. Clone Repository
```bash
git clone https://github.com/ezaarp/WeCareU.git -b WeCareU-PIS
cd WeCareU
```

### 2. Jalankan Setup Otomatis
Cukup double-click file `setup.bat` atau jalankan:
```bash
setup.bat
```

Script ini akan otomatis:
- ✅ Install semua dependencies (backend & frontend)
- ✅ Membuat file `.env` dari template
- ✅ Generate Prisma Client
- ✅ Menjalankan database migrations
- ✅ Seeding database (opsional)

### 3. Konfigurasi Database
Edit file `backend/.env` dan isi dengan credentials database Anda:
```env
DATABASE_URL="postgresql://user:password@host:5432/database_name"
JWT_SECRET="your_secret_key_here"
```

### 4. Jalankan Aplikasi
Double-click `start_app.bat` atau jalankan:
```bash
start_app.bat
```

Aplikasi akan berjalan di:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

## 📁 Struktur Proyek

```
WeCareU/
├── backend/              # Express.js + Prisma + PostgreSQL
│   ├── src/
│   │   ├── controllers/  # 5 CRUD Controllers (Article, Session, StressTest, Notification, AnonChat)
│   │   ├── routes/       # API Routes
│   │   └── middleware/   # Authentication & Authorization
│   ├── prisma/           # Database Schema & Migrations
│   └── .env              # Environment Configuration
├── frontend/             # React + Vite + TailwindCSS
│   └── src/
│       ├── components/   # Reusable Components
│       └── pages/        # Page Components
├── setup.bat             # 🆕 First-time setup script
└── start_app.bat         # Start application script
```

## 🛠️ Manual Setup (Alternatif)

Jika ingin setup manual tanpa menggunakan `setup.bat`:

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan database credentials Anda
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📦 Fitur CRUD Lengkap (5 Modul)

1. **Article Management** - Kelola artikel kesehatan mental
2. **Session Management** - Penjadwalan konseling dengan counselor
3. **Stress Test** - Tes tingkat stress mahasiswa
4. **Notification System** - Sistem notifikasi real-time
5. **Anonymous Chat** - Chat anonim dengan counselor

## 👥 Tim Pengembang

Proyek ini dikembangkan oleh 5 anggota tim, masing-masing menghandle 1 CRUD module.

## 🔐 Default Login Credentials

Setelah seeding database, gunakan credentials berikut:

**Admin:**
- Email: `admin@wecareu.com`
- Password: `admin123`

**Counselor:**
- Email: `counselor@wecareu.com`
- Password: `counselor123`

**Student:**
- NIM: `1234567890`
- Password: `student123`

## 📝 Available Scripts

- `setup.bat` - Setup awal untuk clone pertama kali
- `start_app.bat` - Menjalankan backend dan frontend sekaligus
- `npm run dev` - Development mode
- `npm run build` - Production build
- `npx prisma studio` - Database GUI

## 🐛 Troubleshooting

### Port 3000 sudah digunakan
Script `start_app.bat` otomatis akan membersihkan port 3000 sebelum start.

### Database connection error
Pastikan `DATABASE_URL` di `backend/.env` sudah benar dan database accessible.

### Prisma migration error
Jalankan manual:
```bash
cd backend
npx prisma migrate deploy
```

## 📄 License

This project is developed for educational purposes at Telkom University.
