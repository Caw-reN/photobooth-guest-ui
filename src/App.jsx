import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
import { 
  Camera, FlipHorizontal, Timer, Image as ImageIcon, 
  RefreshCw, ChevronRight, Settings2, Play, ChevronDown, ChevronUp, Video
} from 'lucide-react';

export default function PhotoboothCapture() {
  // === STATE MANAGEMENT ===
  const [frameCount, setFrameCount] = useState(5);
  const [timerDelay, setTimerDelay] = useState(3);
  const [isMirrored, setIsMirrored] = useState(true);
  
  // Array untuk menyimpan hasil foto (Base64 string)
  const [photos, setPhotos] = useState(Array(5).fill(null));
  
  // State untuk animasi dan simulasi
  const [isShooting, setIsShooting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showControls, setShowControls] = useState(true);

  // === REFERENSI WEBCAM ===
  const webcamRef = useRef(null);

  // Update jumlah slot array jika slider frame diubah user
  useEffect(() => {
    setPhotos(prev => {
      if (frameCount > prev.length) {
        return [...prev, ...Array(frameCount - prev.length).fill(null)];
      } else {
        return prev.slice(0, frameCount);
      }
    });
  }, [frameCount]);

  // Fungsi penangkap gambar dari Webcam
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      // Mengambil screenshot dalam format base64
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, [webcamRef]);

  // === LOGIKA SHOOTING ASLI ===
  const startShooting = async () => {
    setIsShooting(true);
    setShowControls(false); // Sembunyikan kontrol saat mulai jepret

    let emptySlots = photos.map((p, i) => (p === null ? i : -1)).filter(i => i !== -1);

    for (let i = 0; i < emptySlots.length; i++) {
      const slotIndex = emptySlots[i];
      
      // Timer Hitung Mundur
      for (let t = timerDelay; t > 0; t--) {
        setCountdown(t);
        await new Promise(res => setTimeout(res, 1000));
      }
      
      setCountdown('SNAP!');
      
      // Jeda super singkat biar layar seolah-olah "nge-freeze" pas difoto
      await new Promise(res => setTimeout(res, 100)); 
      
      // Eksekusi Jepret Asli!
      const imageBase64 = captureImage();
      
      if (imageBase64) {
        setPhotos(prev => {
          const newArr = [...prev];
          newArr[slotIndex] = imageBase64;
          return newArr;
        });
      }

      await new Promise(res => setTimeout(res, 800)); // Jeda sebelum foto berikutnya
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

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      
      {/* HEADER: Flow Progress */}
      <div className="h-16 flex-none border-b border-white/10 bg-white/5 flex items-center justify-center px-6 z-50">
        <h2 className="text-sm font-bold tracking-widest text-white/50 uppercase">
          <span className="text-white">Photo</span> <span className="mx-2">&rarr;</span> Retake <span className="mx-2">&rarr;</span> Frame
        </h2>
      </div>

      {/* MAIN CONTENT: Split Screen */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* KIRI: Canvas Camera */}
        <div className="w-2/3 h-full relative bg-black flex items-center justify-center border-r border-white/10 overflow-hidden">
          
          {/* WEBCAM ASLI */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            mirrored={isMirrored} // Menyambung ke toggle Mirror
            videoConstraints={{
              facingMode: "user" // Default pakai kamera depan
            }}
            className="w-full h-full object-cover"
          />

          {/* Efek Gradasi (Opsional biar UI lebih nyatu) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>

          {/* Indikator Hitung Mundur Besar */}
          {countdown && (
             <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
               <span className="text-[150px] font-bold text-white drop-shadow-[0_0_40px_rgba(0,0,0,1)] animate-pulse">
                 {countdown}
               </span>
             </div>
          )}

          {/* Panel Kontrol Kamera */}
          <div className={`absolute bottom-0 left-0 w-full transition-transform duration-500 z-30 ${showControls ? 'translate-y-0' : 'translate-y-[85%]'}`}>
            
            <div className="flex justify-center -mb-px relative z-40">
              <button 
                onClick={() => setShowControls(!showControls)}
                className="bg-[#1A1A1A] border-t border-l border-r border-white/10 px-6 py-2 rounded-t-xl flex items-center gap-2 hover:bg-[#222]"
              >
                <Settings2 size={16} /> 
                {showControls ? 'Sembunyikan Kontrol' : 'Buka Kontrol'}
                {showControls ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            <div className="bg-[#1A1A1A] border-t border-white/10 p-6 flex flex-col gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              
              <div className="grid grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider font-bold flex items-center gap-2"><Video size={14}/> Sumber Kamera</label>
                  <select className="bg-black/50 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-white/50">
                    <option>Default Camera</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider font-bold">Jumlah Frame ({frameCount})</label>
                  <input 
                    type="range" min="2" max="15" 
                    value={frameCount} onChange={(e) => setFrameCount(Number(e.target.value))}
                    disabled={isShooting}
                    className="w-full accent-white mt-2 cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider font-bold flex items-center gap-2"><Timer size={14}/> Atur Timer ({timerDelay}s)</label>
                  <input 
                    type="range" min="1" max="15" 
                    value={timerDelay} onChange={(e) => setTimerDelay(Number(e.target.value))}
                    disabled={isShooting}
                    className="w-full accent-white mt-2 cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2 justify-center items-start">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" checked={isMirrored} 
                      onChange={() => setIsMirrored(!isMirrored)}
                      disabled={isShooting}
                      className="w-5 h-5 accent-white rounded"
                    />
                    <span className="text-sm flex items-center gap-2"><FlipHorizontal size={16}/> Balik (Mirror)</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={startShooting}
                disabled={isShooting || isAllPhotosTaken}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isAllPhotosTaken 
                  ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                }`}
              >
                {isShooting ? (
                  <span className="animate-pulse">Sedang Memotret...</span>
                ) : isAllPhotosTaken ? (
                  <span>Semua Frame Penuh</span>
                ) : (
                  <><Play fill="currentColor" size={20} /> MULAI SESI</>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* KANAN: Hasil Foto */}
        <div className="w-1/3 h-full bg-[#0A0A0A] overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar pb-32">
          
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-lg">Hasil Foto</h3>
            <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
              {photos.filter(p => p !== null).length} / {frameCount}
            </span>
          </div>

          {photos.map((photoUrl, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-3 transition-all hover:border-white/30">
              <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-white/20">
                    <ImageIcon size={32} />
                    <span className="text-xs mt-2 font-medium">Slot {index + 1} Kosong</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => retakePhoto(index)}
                disabled={!photoUrl || isShooting}
                className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${
                  photoUrl && !isShooting
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                <RefreshCw size={14} /> Retake Foto
              </button>
            </div>
          ))}

          {isAllPhotosTaken && !isShooting && (
            <button className="mt-4 w-full py-4 bg-green-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-bounce">
              Lanjut Pilih Frame <ChevronRight size={20} />
            </button>
          )}

        </div>
      </div>
    </div>
  );
}