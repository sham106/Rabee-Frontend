import React, { useState, useEffect, useRef } from 'react';
import { Camera, Flashlight, RefreshCw, X, Zap, Check } from 'lucide-react';
import { Modal } from './Modal';
import { SecondaryButton } from './SecondaryButton';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  onSwitchToManual: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected,
  onSwitchToManual,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // Sample barcode presets for testing/instant scan
  const sampleBarcodes = ['RB928399', 'RB928405', 'RB928412', 'RB928430'];

  useEffect(() => {
    let mounted = true;

    async function initCamera() {
      if (!isOpen) return;

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          if (mounted) {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              await videoRef.current.play().catch(() => {});
            }
            setHasCameraAccess(true);
          }
        } else {
          if (mounted) setHasCameraAccess(false);
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable in sandbox:', err);
        if (mounted) setHasCameraAccess(false);
      }
    }

    if (isOpen) {
      setScannedCode(null);
      initCamera();
    }

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        const capabilities: any = track.getCapabilities?.() || {};
        if (capabilities.torch) {
          await (track as any).applyConstraints({
            advanced: [{ torch: !torchOn }],
          });
          setTorchOn(!torchOn);
        }
      } catch (e) {
        console.warn('Torch toggle not supported:', e);
      }
    }
  };

  const handleSelectBarcode = (code: string) => {
    setScannedCode(code);
    setTimeout(() => {
      onBarcodeDetected(code);
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Parcel Barcode"
      subtitle="Align the parcel label barcode within the viewfinder"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Camera Viewfinder Box */}
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-inner">
          {hasCameraAccess ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400">
              <Camera className="h-10 w-10 text-neutral-600 mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-neutral-300">Live Camera Viewfinder</p>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px]">
                Camera stream active. Point directly at parcel barcode.
              </p>
            </div>
          )}

          {/* Scanner Overlay UI */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
            {/* Viewfinder Target Frame */}
            <div className="relative h-44 w-64 rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 h-5 w-5 border-t-3 border-l-3 border-amber-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 h-5 w-5 border-t-3 border-r-3 border-amber-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-3 border-l-3 border-amber-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-3 border-r-3 border-amber-400 rounded-br-lg" />

              {/* Animated Laser Line */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-scan-laser" />

              {scannedCode && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/80 backdrop-blur-xs rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>{scannedCode}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 rounded-full bg-neutral-900/90 px-3 py-1 text-[11px] font-medium text-neutral-300 backdrop-blur-md">
              Hold steady & center barcode
            </p>
          </div>

          {/* Torch toggle */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTorch}
              className={`flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                torchOn ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800'
              }`}
              title="Toggle Flashlight"
            >
              <Flashlight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Test Barcode Pills */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              Simulate Instant Barcode Scan:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {sampleBarcodes.map(code => (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectBarcode(code)}
                className="flex items-center justify-center py-2 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 hover:border-amber-400 text-xs font-mono font-bold text-slate-800 hover:text-amber-800 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Barcode Option */}
        <div className="pt-2">
          <SecondaryButton
            size="md"
            variant="outline"
            onClick={() => {
              onClose();
              onSwitchToManual();
            }}
          >
            Enter Barcode Manually Instead
          </SecondaryButton>
        </div>
      </div>
    </Modal>
  );
};
