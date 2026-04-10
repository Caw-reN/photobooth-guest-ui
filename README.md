# 📸 foto seeni - Photobooth Guest UI 

[![React](https://img.shields.io/badge/React-18.x-blue.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-purple.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

Ini adalah antarmuka frontend (Guest UI) untuk aplikasi **SaaS Photobooth Web-Based**. Dibangun menggunakan React dan Tailwind CSS, aplikasi ini dirancang khusus untuk memberikan pengalaman berfoto yang interaktif, elegan, dan *seamless* bagi tamu acara.

UI ini mengadopsi gaya desain **Dark Mode & Glassmorphism**, memberikan kesan premium sekaligus *fun* yang sangat cocok untuk *event* seperti *wedding*, pensi sekolah, maupun acara korporat.

## ✨ Fitur Utama (Saat Ini)

- **🎥 Live Webcam Integration**: Terintegrasi langsung dengan kamera keras pengguna menggunakan `react-webcam`.
- **🎛️ Dynamic Camera Controls**: 
  - Pemilihan sumber kamera (Kamera Depan/Belakang/Virtual).
  - Toggle *Mirror* kamera (*Flip Horizontal*).
  - Pengaturan *Timer* hitung mundur (1s - 15s).
  - Pengaturan jumlah *Frame* foto yang ingin diambil (2 - 15 frame).
- **🎞️ Side-by-Side Canvas Flow**: Area kamera (kiri) yang statis dan area hasil foto (kanan) yang dapat di-*scroll*, memastikan tampilan utama (*viewfinder*) selalu terlihat.
- **🔄 Individual Retake System**: Tamu dapat mengulang jepretan pada *slot* foto tertentu secara spesifik.
- **💅 Glassmorphism UI**: Elemen kontrol melayang yang transparan dan elegan.

## 🚀 Alur Aplikasi (Roadmap)

Aplikasi ini dirancang mengikuti alur linear 7 langkah. Saat ini, fokus pengembangan masih berada di Tahap 1.

- [x] **1. Photo**: Konfigurasi kamera & pengambilan gambar beruntun.
- [x] **2. Retake**: Konfirmasi hasil foto & opsi ulang.
- [x] **3. Frame**: Pemilihan bingkai/overlay dekoratif.
- [x] **4. Filter**: Penerapan filter warna (*Grayscale*, *Sepia*, dll).
- [ ] **5. Sticker**: Penambahan elemen stiker *drag-and-drop*.
- [ ] **6. Video Frame**: Opsi konversi menjadi GIF/MP4 Boomerang.
- [ ] **7. Timelapse**: Finalisasi, *render*, dan *generate* QR Code.

## 🛠️ Tech Stack

- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS v4 (Sistem baru tanpa file config tambahan)
- **Icons**: Lucide React
- **Camera API**: React-Webcam

## 💻 Cara Instalasi & Menjalankan Lokal

Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di komputer Anda.

**1. Clone repository ini**
```bash
git clone [https://github.com/Caw-reN/photobooth-guest-ui.git](https://github.com/Caw-reN/photobooth-guest-ui.git)
cd photobooth-guest-ui

**2. Install dependensi**
```bash
npm install

**3. Install dependensi**
```bash
npm run dev

**4. Install dependensi**
Buka browser dan akses http://localhost:5173.

⚠️ Catatan Penting: Pastikan Anda memberikan izin (allow access) pada kamera di browser saat pertama kali aplikasi dijalankan agar fitur live preview dapat bekerja.
