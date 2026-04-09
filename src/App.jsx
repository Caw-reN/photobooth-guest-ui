import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
import { 
  Camera, FlipHorizontal, Timer, Image as ImageIcon, 
  RefreshCw, ChevronRight, Settings2, Play, ChevronDown, ChevronUp, Video
} from 'lucide-react';

// --- DATA DUMMY FRAME TEMPLATE ---
const FRAME_TEMPLATES = [
  { id: 1, name: 'Classic White', src: '/ft-2.png' },
  { id: 2, name: 'Dark Elegant', border: 'border-[#222]', bg: 'bg-[#222]' },
  { id: 3, name: 'Retro Film', border: 'border-amber-700', bg: 'bg-amber-700' },
  { id: 4, name: 'Neon Cyber', border: 'border-fuchsia-500', bg: 'bg-fuchsia-500' },
  { id: 5, name: 'Wedding Gold', border: 'border-yellow-500', bg: 'bg-yellow-500' },
];

// --- KOMPONEN STEP 2: FRAME SELECTION ---
function FrameSelectionView({ onBack, onNext, photos }) {
  const [activeFrame, setActiveFrame] = useState(FRAME_TEMPLATES[0]);

  // Kita ambil foto pertama dari array photos untuk preview
  const previewPhoto = photos && photos[0] ? photos[0] : null;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      {/* HEADER (Sama seperti sebelumnya) */}
      <div className="h-14 lg:h-16 flex-none border-b border-white/10 bg-white/5 flex items-center px-4 justify-between z-50">
        <button onClick={onBack} className="text-xs lg:text-sm text-white/50 hover:text-white transition-colors">&larr; Kembali</button>
        <h2 className="text-xs lg:text-sm font-bold tracking-widest text-white/50 uppercase">
          Photo <span className="mx-1 lg:mx-2">&rarr;</span> <span className="text-white">Frame</span> <span className="mx-1 lg:mx-2">&rarr;</span> Filter
        </h2>
        <div className="w-16"></div> 
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* KIRI: Daftar Frame PNG */}
        <div className="w-full lg:w-1/3 h-[25vh] lg:h-full border-b lg:border-b-0 lg:border-r border-white/10 bg-[#111] overflow-y-hidden lg:overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 flex flex-row lg:flex-col gap-4 shrink-0">
          {FRAME_TEMPLATES.map((frame) => (
            <button 
              key={frame.id}
              onClick={() => setActiveFrame(frame)}
              className={`relative flex-shrink-0 w-28 lg:w-full aspect-[3/4] lg:aspect-auto lg:h-40 rounded-xl overflow-hidden transition-all bg-[#1A1A1A] flex flex-col items-center justify-center border-2 ${
                activeFrame.id === frame.id 
                ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'border-white/10 hover:border-white/30'
              }`}
            >
              {/* Gambar Frame Pilihan di Kiri */}
              <img src={frame.src} alt={frame.name} className="h-full w-full object-contain p-2" />
              
              <div className={`absolute bottom-0 left-0 w-full bg-black/80 py-1`}>
                <span className="text-[10px] lg:text-xs font-bold text-center block">{frame.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* KANAN: Preview Asli Foto + Frame */}
        <div className="w-full lg:w-2/3 flex-1 lg:h-full bg-black flex flex-col items-center justify-center p-6 relative">
          
          {/* PEMBUNGKUS UTAMA PREVIEW (Stacking dengan Absolute) */}
          <div className="relative w-full max-w-[280px] lg:max-w-sm aspect-[3/4] bg-[#1A1A1A] rounded-xl shadow-2xl overflow-hidden">
             
             {/* LAYER 1: FOTO WEBCAM (Posisi Paling Bawah) */}
             {previewPhoto ? (
               <img src={previewPhoto} className="absolute inset-0 w-full h-full object-cover z-0" alt="Preview Mentah" />
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 z-0">
                 <ImageIcon size={48} className="mb-4" />
                 <p className="text-xs">Foto belum diambil</p>
               </div>
             )}

             {/* LAYER 2: FRAME PNG (Posisi di atas foto) */}
             <img 
               src={activeFrame.src} 
               className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none drop-shadow-lg" 
               alt="Frame Overlay" 
             />
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
      </div>
    </div>
  );
}

export default function PhotoboothCapture() {
  // State untuk ngatur mau nampilin halaman apa (1 = Kamera, 2 = Frame)
  const [currentStep, setCurrentStep] = useState(1);
  const [frameCount, setFrameCount] = useState(5);
  const [timerDelay, setTimerDelay] = useState(3);
  const [isMirrored, setIsMirrored] = useState(true);
  const [photos, setPhotos] = useState(Array(5).fill(null));
  const [isShooting, setIsShooting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  
  // Kontrol di HP otomatis tersembunyi biar kamera kelihatan penuh
  const [showControls, setShowControls] = useState(false); 
  const webcamRef = useRef(null);

  useEffect(() => {
    setPhotos(prev => {
      if (frameCount > prev.length) {
        return [...prev, ...Array(frameCount - prev.length).fill(null)];
      } else {
        return prev.slice(0, frameCount);
      }
    });
  }, [frameCount]);

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
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

  const retakePhoto = (index) => {
    setPhotos(prev => {
      const newArr = [...prev];
      newArr[index] = null; 
      return newArr;
    });
  };

  const isAllPhotosTaken = photos.every(p => p !== null) && photos.length > 0;

if (currentStep === 2) {
    return (
      <FrameSelectionView 
        photos={photos}
        onBack={() => setCurrentStep(1)}
        onNext={(selectedFrame) => {
          console.log("Data Frame:", selectedFrame);
          alert(`Berhasil memilih frame: ${selectedFrame.name}! Lanjut ke step Filter nanti...`);
          // Nanti di sini kita ganti jadi setCurrentStep(3)
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="h-14 lg:h-16 flex-none border-b border-white/10 bg-white/5 flex items-center justify-center px-4 z-50">
        <h2 className="text-xs lg:text-sm font-bold tracking-widest text-white/50 uppercase truncate">
          <span className="text-white">Photo</span> <span className="mx-1 lg:mx-2">&rarr;</span> Retake <span className="mx-1 lg:mx-2">&rarr;</span> Frame
        </h2>
      </div>

      {/* MAIN CONTENT: Responsif Flex Col (HP) atau Flex Row (PC) */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        
        {/* AREA KAMERA (Atas di HP, Kiri di PC) */}
        <div className="w-full lg:w-2/3 h-[55vh] lg:h-full relative bg-black flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden shrink-0">
          
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            mirrored={isMirrored}
            videoConstraints={{ facingMode: "user" }}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>

          {countdown && (
             <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
               <span className="text-[100px] lg:text-[150px] font-bold text-white drop-shadow-[0_0_40px_rgba(0,0,0,1)] animate-pulse">
                 {countdown}
               </span>
             </div>
          )}

          {/* Panel Kontrol Kamera */}
          <div className={`absolute bottom-0 left-0 w-full transition-transform duration-500 z-30 ${showControls ? 'translate-y-0' : 'translate-y-[85%] lg:translate-y-[85%]'}`}>
            
            <div className="flex justify-center -mb-px relative z-40">
              <button 
                onClick={() => setShowControls(!showControls)}
                className="bg-[#1A1A1A] border-t border-l border-r border-white/10 px-4 py-2 lg:px-6 rounded-t-xl flex items-center gap-2 hover:bg-[#222] text-sm lg:text-base"
              >
                <Settings2 size={16} /> 
                <span className="hidden sm:inline">{showControls ? 'Sembunyikan Kontrol' : 'Buka Kontrol'}</span>
                {showControls ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            {/* Isi Panel Grid diubah jadi 2 kolom di HP, 4 kolom di PC */}
            <div className="bg-[#1A1A1A] border-t border-white/10 p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[40vh] lg:h-auto overflow-y-auto">
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="flex flex-col gap-1 lg:gap-2">
                  <label className="text-[10px] lg:text-xs text-white/50 uppercase tracking-wider font-bold flex items-center gap-1"><Video size={12}/> Kamera</label>
                  <select className="bg-black/50 border border-white/10 rounded-lg p-2 lg:p-3 text-xs lg:text-sm outline-none">
                    <option>Kamera Depan</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 lg:gap-2">
                  <label className="text-[10px] lg:text-xs text-white/50 uppercase tracking-wider font-bold">Frame ({frameCount})</label>
                  <input 
                    type="range" min="2" max="15" 
                    value={frameCount} onChange={(e) => setFrameCount(Number(e.target.value))}
                    disabled={isShooting} className="w-full accent-white mt-1"
                  />
                </div>

                <div className="flex flex-col gap-1 lg:gap-2">
                  <label className="text-[10px] lg:text-xs text-white/50 uppercase tracking-wider font-bold flex items-center gap-1"><Timer size={12}/> Timer ({timerDelay}s)</label>
                  <input 
                    type="range" min="1" max="15" 
                    value={timerDelay} onChange={(e) => setTimerDelay(Number(e.target.value))}
                    disabled={isShooting} className="w-full accent-white mt-1"
                  />
                </div>

                <div className="flex flex-col gap-1 lg:gap-2 justify-center items-start pt-4 lg:pt-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" checked={isMirrored} 
                      onChange={() => setIsMirrored(!isMirrored)}
                      disabled={isShooting} className="w-4 h-4 accent-white rounded"
                    />
                    <span className="text-xs lg:text-sm flex items-center gap-1"><FlipHorizontal size={14}/> Mirror</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={startShooting}
                disabled={isShooting || isAllPhotosTaken}
                className={`w-full py-3 lg:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm lg:text-base ${
                  isAllPhotosTaken 
                  ? 'bg-white/10 text-white/30' 
                  : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {isShooting ? "Memotret..." : isAllPhotosTaken ? "Penuh" : <><Play fill="currentColor" size={16} /> MULAI SESI</>}
              </button>

            </div>
          </div>
        </div>

        {/* AREA HASIL FOTO (Bawah di HP, Kanan di PC) */}
        <div className="w-full lg:w-1/3 flex-1 lg:h-full bg-[#0A0A0A] overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 pb-20 lg:pb-32">
          
          <div className="flex justify-between items-end mb-1 lg:mb-2">
            <h3 className="font-bold text-base lg:text-lg">Hasil Foto</h3>
            <span className="text-xs lg:text-sm bg-white/10 px-2 py-1 rounded-full">
              {photos.filter(p => p !== null).length} / {frameCount}
            </span>
          </div>

          {/* Grid 2 kolom di HP, 1 kolom memanjang ke bawah di PC */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
            {photos.map((photoUrl, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-2 lg:p-3 flex flex-col gap-2 lg:gap-3 hover:border-white/30">
                <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-white/20">
                      <ImageIcon size={24} lg:size={32} />
                      <span className="text-[10px] lg:text-xs mt-1 font-medium">Slot {index + 1}</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => retakePhoto(index)}
                  disabled={!photoUrl || isShooting}
                  className={`w-full py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-sm font-bold flex items-center justify-center gap-1 lg:gap-2 ${
                    photoUrl && !isShooting ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/20'
                  }`}
                >
                  <RefreshCw size={12} /> Retake
                </button>
              </div>
            ))}
          </div>

          {isAllPhotosTaken && !isShooting && (
            <button 
              onClick={() => setCurrentStep(2)} // <--- TAMBAHKAN BARIS INI
              className="mt-2 lg:mt-4 w-full py-3 lg:py-4 bg-green-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 animate-bounce text-sm lg:text-base"
            >
              Lanjut Pilih Frame <ChevronRight size={16} />
            </button>
          )}

        </div>
      </div>
    </div>
  );
}