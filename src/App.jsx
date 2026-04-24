import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
import { 
  Camera, FlipHorizontal, Timer, Image as ImageIcon, 
  RefreshCw, ChevronRight, Settings2, Play, ChevronDown, ChevronUp, Video
} from 'lucide-react';


import { guestApi, STORAGE_URL } from './services/guestApi';

// ==========================================================
// 1. DATA DUMMY
// ==========================================================
const FRAME_TEMPLATES = [
  { 
    id: 1, 
    name: 'Polaroid Selotip', 
    src: '/ft-2.png',
    slots: [ { top: '15%', left: '10%', width: '80%', height: '70%' } ]
  },
  { 
    id: 2, 
    name: 'Film Strip Acak', 
    src: '/f2.png',
    slots: [
      { top: '20%', left: '2%', width: '45%', height: '35%' },
      { top: '4%', left: '52%', width: '46%', height: '37%' },
      { top: '60%', left: '2%', width: '45%', height: '35%' },
      { top: '43%', left: '52%', width: '46%', height: '34%' }
    ]
  }
];

const FILTERS = [
  { id: 'normal', name: 'Normal', css: 'none' },
  { id: 'bnw', name: 'B & W', css: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', css: 'sepia(100%)' },
  { id: 'warm', name: 'Warm', css: 'sepia(50%) saturate(200%) hue-rotate(-15deg)' },
  { id: 'cool', name: 'Cool', css: 'saturate(150%) hue-rotate(180deg)' },
  { id: 'vibrant', name: 'Vibrant', css: 'saturate(250%) contrast(110%)' },
  { id: 'vintage', name: 'Vintage', css: 'contrast(80%) brightness(120%) sepia(30%)' },
  { id: 'dark', name: 'Dark', css: 'brightness(70%) contrast(120%)' },
];


// ==========================================================
// 2. TAHAP 2: PILIH FRAME TEMPLATE
// ==========================================================
function FrameSelectionView({ onBack, onNext }) {
  // 1. Ganti state ke data dinamis dari API
  const [framesData, setFramesData] = useState([]);
  const [activeFrame, setActiveFrame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fungsi untuk mengambil data dari backend Laravel saat halaman dibuka
  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const responseData = await guestApi.getActiveFrames();
        
        const formattedFrames = responseData.data
          .filter(item => item.is_active === 1 || item.is_active === true)
          .map(item => {
            let coords = [];
            if (typeof item.coordinates === 'string') {
              try { coords = JSON.parse(item.coordinates); } catch (e) {}
            } else if (Array.isArray(item.coordinates)) {
              coords = item.coordinates;
            }

            return {
              id: item.id,
              name: item.name,
              // KODE AJAIB PENGHILANG 'public/':
              src: STORAGE_URL + item.image_path.replace('public/', ''), 
              slots: coords.map(c => ({
                top: `${c.y}%`,
                left: `${c.x}%`,
                width: `${c.width}%`,
                height: `${c.height}%`
              }))
            };
          });

        setFramesData(formattedFrames);
        if (formattedFrames.length > 0) {
          setActiveFrame(formattedFrames[0]);
        }
      } catch (error) {
        console.error("Gagal mengambil data frame:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrames();
  }, []);

  // 3. Tampilan saat loading atau data kosong
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white">Memuat daftar frame...</div>;
  }

  if (framesData.length === 0) {
    return <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white">Belum ada frame yang aktif.</div>;
  }

  // 4. UI Utama
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      <div className="h-14 lg:h-16 flex-none border-b border-white/10 bg-white/5 flex items-center px-4 justify-between z-50">
        <button onClick={onBack} className="text-xs lg:text-sm text-white/50 hover:text-white">&larr; Kembali</button>
        <h2 className="text-xs lg:text-sm font-bold tracking-widest text-white/50 uppercase">
          Photo &rarr; <span className="text-white">Frame</span> &rarr; Atur Posisi
        </h2>
        <div className="w-16"></div> 
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="w-full lg:w-1/3 h-[30vh] lg:h-full border-b lg:border-b-0 lg:border-r border-white/10 bg-[#111] overflow-y-auto p-4 lg:p-6 shrink-0 custom-scrollbar">
          <h3 className="text-white/50 text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-4 text-center lg:text-left">Pilih Template</h3>
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-3 lg:gap-5">
            {/* Ubah map dari FRAME_TEMPLATES menjadi framesData */}
            {framesData.map((frame) => (
              <button 
                key={frame.id} onClick={() => setActiveFrame(frame)}
                className={`relative rounded-xl transition-all duration-300 flex flex-col items-center justify-center p-1.5 ${activeFrame?.id === frame.id ? 'ring-2 ring-green-500 bg-white/5 scale-[0.97]' : 'hover:scale-105 hover:bg-white/5 opacity-70 hover:opacity-100'}`}
              >
                <img src={frame.src} alt={frame.name} className="w-full h-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
              </button>
            ))}
          </div>
        </div>

        {activeFrame && (
          <div className="w-full lg:w-2/3 flex-1 lg:h-full bg-black flex flex-col items-center justify-center p-6 relative">
            <div className="relative w-full max-w-[280px] lg:max-w-sm aspect-[3/4] bg-[#1A1A1A] rounded-xl shadow-2xl overflow-hidden flex items-center justify-center border border-white/10">
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 z-0 bg-gradient-to-br from-[#222] to-[#111]">
                 <ImageIcon size={48} className="mb-4 opacity-50" />
                 <p className="text-xs font-medium uppercase tracking-widest opacity-50">Area Foto Transparan</p>
               </div>
               <img src={activeFrame.src} className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]" alt="Frame" />
            </div>
            <div className="absolute bottom-6 w-full max-w-md px-6 z-20">
              <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                <div>
                  <p className="text-[10px] lg:text-xs text-white/50 uppercase tracking-wider mb-1">Frame Terpilih</p>
                  <h3 className="font-bold text-base lg:text-lg text-white">{activeFrame.name}</h3>
                </div>
                <button 
                  onClick={() => onNext(activeFrame)}
                  className="px-4 py-2.5 lg:px-6 lg:py-3 bg-green-500 text-black text-sm lg:text-base font-bold rounded-xl hover:bg-green-400 flex items-center gap-2"
                >
                  Lanjutkan <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ==========================================================
// 3. TAHAP 3: DRAG & DROP, GESER, ZOOM FOTO
// ==========================================================
function ArrangePhotoView({ photos, selectedFrame, onBack, onNext }) {
  const slotCount = selectedFrame?.slots?.length || 1; 
  
  // Perbaikan state: Menggunakan fungsi agar tiap slot punya objek setting yang berbeda (tidak berbagi referensi)
  const [frameSlots, setFrameSlots] = useState(Array(slotCount).fill(null)); 
  const [activeSlot, setActiveSlot] = useState(0);
  const [slotSettings, setSlotSettings] = useState(() => 
    Array.from({ length: slotCount }, () => ({ x: 50, y: 50, zoom: 1 }))
  );

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const photoUrl = e.dataTransfer.getData('photoUrl');
    if (photoUrl) {
      setFrameSlots(prev => {
        const newSlots = [...prev];
        newSlots[slotIndex] = photoUrl;
        return newSlots;
      });
      setActiveSlot(slotIndex);
    }
  };

  const updateSetting = (key, value) => {
    setSlotSettings(prev => {
      const newSettings = [...prev];
      newSettings[activeSlot] = { ...newSettings[activeSlot], [key]: value };
      return newSettings;
    });
  };

  if (!selectedFrame) return <div className="text-white p-10">Memuat Data...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      {/* HEADER */}
      <div className="h-14 lg:h-16 flex-none border-b border-white/10 bg-white/5 flex items-center px-4 justify-between z-50">
        <button onClick={onBack} className="text-xs lg:text-sm text-white/50 hover:text-white">&larr; Kembali</button>
        <h2 className="text-xs lg:text-sm font-bold tracking-widest text-white/50 uppercase">
          Frame &rarr; <span className="text-white">Atur Posisi</span> &rarr; Filter
        </h2>
        <div className="w-16"></div> 
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* KOLOM KIRI: STOK FOTO */}
        <div className="w-full lg:w-1/4 h-[20vh] lg:h-full bg-[#1A1010] border-b lg:border-r border-white/10 overflow-y-auto p-4 shrink-0 custom-scrollbar">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4 text-center lg:text-left">Pilih Foto</h3>
          <div className="flex flex-row lg:flex-col gap-3">
            {photos.filter(p => p !== null).map((photo, i) => (
              <img 
                key={i} src={photo} alt={`Foto ${i+1}`} draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('photoUrl', photo)}
                onClick={() => {
                  setFrameSlots(prev => { const n = [...prev]; n[activeSlot] = photo; return n; });
                }} 
                className={`w-24 lg:w-full aspect-[4/3] object-cover rounded-lg cursor-grab hover:ring-2 hover:ring-green-500 bg-black transition-all ${frameSlots.includes(photo) ? 'opacity-30' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* KOLOM TENGAH: KANVAS UTAMA */}
        <div className="flex-1 bg-[#111] flex flex-col items-center justify-center p-6 relative overflow-hidden">
          
          <div className="relative inline-block shadow-2xl rounded-xl overflow-hidden mx-auto bg-black" 
               style={{ fontSize: 0, width: 'fit-content', maxHeight: '70vh' }}>
            
            {/* LAYER 1: SLOT FOTO (DI BELAKANG) */}
            <div className="absolute inset-0 w-full h-full z-10">
              {selectedFrame.slots.map((slot, index) => (
                <div
                  key={index}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => setActiveSlot(index)}
                  className={`absolute bg-[#1a1a1a] overflow-hidden cursor-pointer group transition-all ${
                    activeSlot === index ? 'ring-2 ring-green-500 z-30' : 'z-10'
                  }`}
                  style={{
                    top: slot.top,
                    left: slot.left,
                    width: slot.width,
                    height: slot.height,
                  }}
                >
                  {frameSlots[index] ? (
                    <img
                      src={frameSlots[index]}
                      className="w-full h-full object-cover pointer-events-none"
                      style={{
                        transform: `scale(${slotSettings[index].zoom})`,
                        objectPosition: `${slotSettings[index].x}% ${slotSettings[index].y}%`
                      }}
                      alt="Placed"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-white/5">
                      <span className="text-[10px] text-white/20 font-bold uppercase">Slot {index + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* LAYER 2: GAMBAR FRAME (DI DEPAN) */}
            <img 
              src={selectedFrame.src} 
              className="relative z-20 pointer-events-none block w-auto" 
              style={{ maxHeight: '70vh', maxWidth: '100%' }}
              alt="Frame" 
            />
          </div>

          <div className="mt-8 w-full max-w-[280px]">
            <button 
              onClick={() => onNext(frameSlots, slotSettings)} // FIX: Kirim data asli, jangan angka 4
              className="w-full py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-all flex items-center justify-center gap-2"
            >
              Lanjutkan Ke Filter <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: SLIDER KONTROL */}
        <div className="w-full lg:w-1/4 h-[30vh] lg:h-full bg-[#151A20] overflow-y-auto p-6 shrink-0 border-l border-white/10 flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
             <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider">Sesuaikan Posisi</h3>
             <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded">Slot {activeSlot + 1}</span>
          </div>
          
          {frameSlots[activeSlot] ? (
            <div className="flex flex-col gap-6">
              {/* SLIDER X */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-white/70">
                  <label>Kiri / Kanan</label>
                  <span>{slotSettings[activeSlot].x}%</span>
                </div>
                <input type="range" min="0" max="100" value={slotSettings[activeSlot].x} onChange={(e) => updateSetting('x', Number(e.target.value))} className="w-full accent-green-500" />
              </div>

              {/* SLIDER Y */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-white/70">
                  <label>Atas / Bawah</label>
                  <span>{slotSettings[activeSlot].y}%</span>
                </div>
                <input type="range" min="0" max="100" value={slotSettings[activeSlot].y} onChange={(e) => updateSetting('y', Number(e.target.value))} className="w-full accent-green-500" />
              </div>

              {/* SLIDER ZOOM */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-white/70">
                  <label>Zoom</label>
                  <span>{slotSettings[activeSlot].zoom.toFixed(1)}x</span>
                </div>
                <input type="range" min="1" max="3" step="0.1" value={slotSettings[activeSlot].zoom} onChange={(e) => updateSetting('zoom', Number(e.target.value))} className="w-full accent-green-500" />
              </div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-white/20">
               <ImageIcon size={32} className="mb-2 opacity-50" />
               <p className="text-xs text-center">Isi foto dulu</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ==========================================================
// 4. TAHAP 4: FILTER FOTO FINAL
// ==========================================================
function FilterFinalView({ arrangedData, selectedFrame, onBack, onNext }) {
  const slotCount = selectedFrame?.slots?.length || 1;
  const [slotFilters, setSlotFilters] = useState(Array(slotCount).fill('none'));
  const [activeSlot, setActiveSlot] = useState(0);

  if (!arrangedData || !selectedFrame) return <div className="text-white p-10">Memuat Data...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      {/* HEADER */}
      <div className="h-14 lg:h-16 flex-none border-b border-white/10 bg-white/5 flex items-center px-4 justify-between z-50">
        <button onClick={onBack} className="text-xs lg:text-sm text-white/50 hover:text-white">&larr; Kembali</button>
        <h2 className="text-xs lg:text-sm font-bold tracking-widest text-white/50 uppercase">Atur Posisi &rarr; <span className="text-white">Filter</span></h2>
        <div className="w-16"></div> 
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* KOLOM KIRI: KANVAS FINAL (AUTO-SCALE) */}
        <div className="w-full lg:w-2/3 flex-1 lg:h-full bg-[#111] flex flex-col items-center justify-center p-4 lg:p-6 relative overflow-hidden border-r border-white/10">
          
          {/* PEMBUNGKUS UTAMA: Mengunci ukuran agar tidak meluber dari layar (max-h-70vh) */}
          <div className="relative inline-block shadow-2xl rounded-xl overflow-hidden mx-auto bg-black" 
               style={{ 
                 fontSize: 0, 
                 width: 'fit-content', 
                 maxHeight: '70vh' // Membatasi tinggi agar fit di layar
               }}>
            
            {/* LAYER 1: SLOT FOTO (DI BELAKANG) */}
            <div className="absolute inset-0 w-full h-full z-10">
              {selectedFrame.slots.map((slotConfig, index) => {
                const setting = arrangedData.settings[index]; 
                const photoUrl = arrangedData.slots[index];
                return (
                  <div 
                    key={index} 
                    onClick={() => setActiveSlot(index)} 
                    style={{ 
                      position: 'absolute', 
                      top: slotConfig.top, 
                      left: slotConfig.left, 
                      width: slotConfig.width, 
                      height: slotConfig.height 
                    }} 
                    className={`bg-black overflow-hidden cursor-pointer transition-all ${activeSlot === index ? 'ring-2 ring-green-500 z-30 scale-[1.01]' : 'z-10'}`}
                  >
                    {photoUrl && (
                      <img 
                        src={photoUrl} 
                        className="w-full h-full block pointer-events-none" 
                        style={{ 
                          objectFit: 'cover', 
                          objectPosition: `${setting.x}% ${setting.y}%`, 
                          transform: `scale(${setting.zoom})`, 
                          filter: slotFilters[index] 
                        }} 
                        alt="Slot" 
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* LAYER 2: GAMBAR FRAME (DI DEPAN) */}
            <img 
              src={selectedFrame.src} 
              className="relative z-20 pointer-events-none block w-auto h-auto" 
              style={{ 
                maxHeight: '70vh', // Frame mengecil jika layar pendek
                maxWidth: '100%'    // Frame mengecil jika layar sempit
              }}
              alt="Frame" 
            />
          </div>

          <div className="mt-6 w-full max-w-[280px]">
            <button onClick={() => onNext({ ...arrangedData, filters: slotFilters })} className="w-full py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 flex justify-center gap-2 shadow-lg active:scale-95">
              Selesai & Cetak <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: PILIHAN FILTER */}
        {/* --- KOLOM KANAN: PILIHAN FILTER (GANTI KE 4 KOLOM) --- */}
<div className="w-full lg:w-1/3 h-[40vh] lg:h-full bg-gray-900/40 overflow-y-auto p-4 lg:p-6 shrink-0 custom-scrollbar flex flex-col gap-6">
  <div className="flex justify-between items-end border-b border-white/10 pb-4">
     <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Katalog Filter</h3>
     <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded">Slot {activeSlot + 1}</span>
  </div>

  {/* GANTI grid-cols-2 MENJADI grid-cols-4 DI BAWAH INI */}
  <div className="grid grid-cols-4 gap-2 lg:gap-3">
    {FILTERS.map((filter) => (
      <button 
        key={filter.id} 
        onClick={() => { 
          const newFilters = [...slotFilters]; 
          newFilters[activeSlot] = filter.css; 
          setSlotFilters(newFilters); 
        }} 
        className={`flex flex-col items-center p-1.5 rounded-lg border-2 transition-all ${slotFilters[activeSlot] === filter.css ? 'border-green-500 bg-green-500/10' : 'border-white/5 hover:bg-white/5'}`}
      >
         <div className="w-full aspect-square bg-gray-800 rounded-md mb-1.5 overflow-hidden">
            {arrangedData.slots[activeSlot] ? (
              <img 
                src={arrangedData.slots[activeSlot]} 
                style={{ 
                  filter: filter.css, 
                  objectFit: 'cover',
                  objectPosition: `${arrangedData.settings[activeSlot].x}% ${arrangedData.settings[activeSlot].y}%`, 
                  transform: `scale(${arrangedData.settings[activeSlot].zoom})`
                }} 
                className="w-full h-full" 
                alt={filter.name}
              />
            ) : ( 
              <div className="w-full h-full bg-gray-700"></div> 
            )}
         </div>
         <span className="text-[8px] lg:text-[10px] font-medium tracking-tight uppercase truncate w-full text-center">{filter.name}</span>
      </button>
    ))}
  </div>
</div>
      </div>
    </div>
  );
}


// ==========================================================
// 5. TAHAP 5: HALAMAN PEMBAYARAN (MIDTRANS UI)
// ==========================================================
function PaymentView({ finalData, onBack, onSuccess }) {
  // Simulasi status pembayaran
  const [isProcessing, setIsProcessing] = useState(false);

  // Fungsi simulasi panggil Midtrans Snap
  const handlePayMidtrans = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      {/* HEADER */}
      <div className="h-14 lg:h-16 flex-none border-b border-white/10 bg-white/5 flex items-center px-4 justify-between z-50">
        <button onClick={onBack} disabled={isProcessing} className="text-xs lg:text-sm text-white/50 hover:text-white disabled:opacity-30">&larr; Batal & Edit</button>
        <h2 className="text-xs lg:text-sm font-bold tracking-widest text-green-500 uppercase animate-pulse">
          Selesaikan Pembayaran
        </h2>
        <div className="w-16"></div> 
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-4 lg:p-8 gap-6 max-w-5xl mx-auto w-full items-center justify-center">
        
        {/* KOLOM KIRI: Ringkasan Pesanan (Order Summary) */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end justify-center gap-4">
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center max-w-sm w-full shadow-2xl">
            <h3 className="text-white/50 uppercase tracking-widest text-xs font-bold mb-4">Preview Cetak</h3>
            
            {/* Box Preview Abu-abu */}
            <div className="w-48 aspect-[3/4] bg-white/10 rounded-lg flex items-center justify-center border-2 border-dashed border-white/20 mb-6">
               <ImageIcon size={40} className="opacity-30" />
            </div>

            <div className="w-full flex justify-between items-center border-t border-white/10 pt-4 mb-2">
              <span className="text-white/70 text-sm">Photobooth Print (x1)</span>
              <span className="font-bold">Rp 25.000</span>
            </div>
            <div className="w-full flex justify-between items-center">
              <span className="text-white/70 text-sm">Biaya Admin</span>
              <span className="font-bold">Rp 1.000</span>
            </div>
            
            <div className="w-full flex justify-between items-center border-t border-white/20 mt-4 pt-4">
              <span className="text-white text-lg font-bold">Total Tagihan</span>
              <span className="text-green-500 text-2xl font-black">Rp 26.000</span>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Aksi Pembayaran */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center gap-6">
          
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-green-500/30 flex flex-col items-center text-center max-w-sm w-full shadow-[0_0_50px_rgba(34,197,94,0.1)]">
            <h2 className="text-xl font-bold mb-2">Pilih Metode Pembayaran</h2>
            <p className="text-xs text-white/50 mb-8">Scan QRIS menggunakan M-Banking atau E-Wallet pilihanmu.</p>

            {/* Ilustrasi Logo Pembayaran */}
            <div className="flex gap-3 mb-8 opacity-70">
               <div className="bg-white text-black px-2 py-1 rounded text-[10px] font-bold">QRIS</div>
               <div className="bg-blue-500 px-2 py-1 rounded text-[10px] font-bold">BCA</div>
               <div className="bg-green-600 px-2 py-1 rounded text-[10px] font-bold">GoPay</div>
               <div className="bg-orange-500 px-2 py-1 rounded text-[10px] font-bold">ShopeePay</div>
            </div>

            <button 
              onClick={handlePayMidtrans}
              disabled={isProcessing}
              className={`w-full py-4 text-black font-bold rounded-xl text-lg flex items-center justify-center gap-2 transition-all ${
                isProcessing ? 'bg-green-700 text-white/50 cursor-wait' : 'bg-green-500 hover:bg-green-400 hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <><RefreshCw size={20} className="animate-spin" /> Menunggu Pembayaran...</>
              ) : (
                <>Bayar Sekarang (Midtrans) <ChevronRight size={20} /></>
              )}
            </button>
            <p className="text-[10px] text-white/30 mt-4">Secured by Midtrans Payment Gateway</p>
          </div>

        </div>
      </div>
    </div>
  );
}


// ==========================================================
// 5. KOMPONEN UTAMA (TAMPILAN KAMERA & ROUTING)
// ==========================================================
export default function PhotoboothCapture() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFrameData, setSelectedFrameData] = useState(null);
  const [arrangedPhotos, setArrangedPhotos] = useState(null); 
  const [frameCount, setFrameCount] = useState(5);
  const [timerDelay, setTimerDelay] = useState(3);
  const [isMirrored, setIsMirrored] = useState(true);
  const [photos, setPhotos] = useState(Array(5).fill(null));
  const [isShooting, setIsShooting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [camRatio, setCamRatio] = useState(16 / 9);
  const [showControls, setShowControls] = useState(false); 
  const webcamRef = useRef(null);

  const handleCameraReady = (stream) => {
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    if (settings.width && settings.height) {
      setCamRatio(settings.width / settings.height);
    }
  };

  const handleDevices = useCallback((mediaDevices) => {
      const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) setSelectedDeviceId(videoDevices[0].deviceId);
    }, [selectedDeviceId]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  useEffect(() => {
    setPhotos(prev => {
      if (frameCount > prev.length) return [...prev, ...Array(frameCount - prev.length).fill(null)];
      return prev.slice(0, frameCount);
    });
  }, [frameCount]);

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      // Fix: Paksa HD secara aman saat jepret
      return webcamRef.current.getScreenshot({ width: 1920, height: 1080 });
    }
    return null;
  }, [webcamRef]);

  const startShooting = async () => {
    setIsShooting(true);
    setShowControls(false);

    let emptySlots = photos.map((p, i) => (p === null ? i : -1)).filter(i => i !== -1);
    for (let i = 0; i < emptySlots.length; i++) {
      const slotIndex = emptySlots[i];
      for (let t = timerDelay; t > 0; t--) {
        setCountdown(t);
        await new Promise(res => setTimeout(res, 1000));
      }
      setCountdown('Snapp!');
      await new Promise(res => setTimeout(res, 100)); 
      
      const imageBase64 = captureImage();
      if (imageBase64) {
        setPhotos(prev => {
          const newArr = [...prev];
          newArr[slotIndex] = imageBase64;
          return newArr;
        });
      }
      await new Promise(res => setTimeout(res, 800));
      setCountdown(null);
    }
    setIsShooting(false);
    setShowControls(true); 
  };

  const isAllPhotosTaken = photos.every(p => p !== null) && photos.length > 0;

  // --- ROUTING HALAMAN ---
  // TAHAP 6: PRINTING (SELESAI)
  if (currentStep === 6) {
    return (
      <div className="flex flex-col h-screen bg-green-500 text-black font-sans items-center justify-center">
        <h1 className="text-5xl font-black mb-4 animate-bounce">LUNAS! 🎉</h1>
        <p className="text-xl font-bold">Foto kamu sedang dicetak. Silakan ambil di bawah.</p>
        <button onClick={() => window.location.reload()} className="mt-10 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">Selesai (Kembali ke Awal)</button>
      </div>
    )
  }

  // TAHAP 5: PEMBAYARAN MIDTRANS
  if (currentStep === 5) {
    return (
      <PaymentView 
        finalData={arrangedPhotos} 
        onBack={() => setCurrentStep(4)} 
        onSuccess={() => {
          setCurrentStep(6);
        }} 
      />
    )
  }

  // TAHAP 4: FILTER
  if (currentStep === 4) {
    return (
      <FilterFinalView 
        arrangedData={arrangedPhotos} 
        selectedFrame={selectedFrameData} 
        onBack={() => setCurrentStep(3)} 
        onNext={(finalPrintData) => { 
          console.log("Data siap lempar ke Midtrans:", finalPrintData); 
          // Pindah ke Halaman Pembayaran
          setCurrentStep(5); 
        }} 
      />
    )
  }

  if (currentStep === 3) {
    return <ArrangePhotoView photos={photos} selectedFrame={selectedFrameData} onBack={() => setCurrentStep(2)} onNext={(finalSlots, finalSettings) => { setArrangedPhotos({ slots: finalSlots, settings: finalSettings }); setCurrentStep(4); }} />
  }

  if (currentStep === 2) {
    return <FrameSelectionView onBack={() => setCurrentStep(1)} onNext={(selectedFrame) => { setSelectedFrameData(selectedFrame); setCurrentStep(3); }} />
  }

  // TAMPILAN KAMERA (STEP 1)
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      <div className="h-14 lg:h-16 flex-none border-b border-white/10 bg-white/5 flex items-center justify-center px-4 z-50">
        <h2 className="text-xs lg:text-sm font-bold tracking-widest text-white/50 uppercase truncate"><span className="text-white">Photo</span> &rarr; Retake &rarr; Frame</h2>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        <div style={{ aspectRatio: camRatio }} className="w-full lg:w-2/3 h-[55vh] lg:h-full relative bg-black flex items-center justify-center border-b lg:border-r border-white/10 overflow-hidden shrink-0">
          
          <Webcam
            audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
            screenshotQuality={1} 
            mirrored={isMirrored}
            videoConstraints={{ deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined, width: { ideal: 1920 }, height: { ideal: 1080 } }}
            onUserMedia={handleCameraReady} 
            className="w-full h-full" style={{ objectFit: 'cover' }} 
          />

          {countdown && <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"><span className="text-[100px] lg:text-[150px] font-bold text-white drop-shadow-[0_0_40px_rgba(0,0,0,1)] animate-pulse">{countdown}</span></div>}

          <div className={`absolute bottom-0 left-0 w-full transition-transform duration-500 z-30 ${showControls ? 'translate-y-0' : 'translate-y-[85%] lg:translate-y-[85%]'}`}>
            <div className="flex justify-center -mb-px relative z-40">
              <button onClick={() => setShowControls(!showControls)} className="bg-[#1A1A1A] border-t border-l border-r border-white/10 px-4 py-2 lg:px-6 rounded-t-xl flex items-center gap-2 hover:bg-[#222] text-sm"><Settings2 size={16} /> <span className="hidden sm:inline">{showControls ? 'Sembunyikan' : 'Buka Kontrol'}</span> {showControls ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</button>
            </div>
            <div className="bg-[#1A1A1A] border-t border-white/10 p-4 lg:p-6 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[40vh] lg:h-auto overflow-y-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1"><label className="text-[10px] text-white/50 uppercase font-bold flex gap-1"><Video size={12}/> Kamera</label><select value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs w-full">{devices.map((device, key) => (<option key={device.deviceId} value={device.deviceId}>{device.label || `Kamera ${key + 1}`}</option>))}</select></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] text-white/50 uppercase font-bold">Frame ({frameCount})</label><input type="range" min="2" max="15" value={frameCount} onChange={(e) => setFrameCount(Number(e.target.value))} disabled={isShooting} className="w-full accent-white mt-1"/></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] text-white/50 uppercase font-bold flex gap-1"><Timer size={12}/> Timer ({timerDelay}s)</label><input type="range" min="1" max="15" value={timerDelay} onChange={(e) => setTimerDelay(Number(e.target.value))} disabled={isShooting} className="w-full accent-white mt-1"/></div>
                <div className="flex items-center pt-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isMirrored} onChange={() => setIsMirrored(!isMirrored)} disabled={isShooting} className="w-4 h-4 accent-white rounded"/><span className="text-xs flex gap-1"><FlipHorizontal size={14}/> Mirror</span></label></div>
              </div>
              <button onClick={startShooting} disabled={isShooting || isAllPhotosTaken} className={`w-full py-3 rounded-xl font-bold flex justify-center gap-2 text-sm ${isAllPhotosTaken ? 'bg-white/10 text-white/30' : 'bg-white text-black hover:bg-gray-200'}`}>
                {isShooting ? "Memotret..." : isAllPhotosTaken ? "Penuh" : <><Play fill="currentColor" size={16} /> MULAI SESI</>}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex-1 bg-[#0A0A0A] overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 pb-20">
          <div className="flex justify-between items-end mb-1"><h3 className="font-bold text-base">Hasil Foto</h3><span className="text-xs bg-white/10 px-2 py-1 rounded-full">{photos.filter(p => p !== null).length} / {frameCount}</span></div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {photos.map((photoUrl, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col gap-2">
                <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-white/20"><ImageIcon size={24} /><span className="text-[10px] mt-1">Slot {index + 1}</span></div>}
                </div>
                <button onClick={() => { setPhotos(p => { const n = [...p]; n[index] = null; return n; }) }} disabled={!photoUrl || isShooting} className={`w-full py-1.5 rounded-lg text-[10px] font-bold flex justify-center gap-1 ${photoUrl && !isShooting ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/20'}`}><RefreshCw size={12} /> Retake</button>
              </div>
            ))}
          </div>
          {isAllPhotosTaken && !isShooting && (
            <button onClick={() => setCurrentStep(2)} className="mt-2 w-full py-3 bg-green-500 text-black font-bold rounded-xl flex justify-center gap-2 animate-bounce">Lanjut Pilih Frame <ChevronRight size={16} /></button>
          )}
        </div>
      </div>
    </div>
  );
}