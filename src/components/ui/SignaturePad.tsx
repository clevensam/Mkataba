import { useRef, useEffect, useState } from "react";
import SignaturePad from "signature_pad";
import { Eraser, Check, Type, PenTool } from "lucide-react";

interface Props {
  onConfirm: (dataUrl: string) => void;
  onClear: () => void;
}

export default function SignaturePadComponent({ onConfirm, onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    if (canvasRef.current && mode === "draw") {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });
      
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
          signaturePadRef.current?.clear();
        }
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
      return () => window.removeEventListener("resize", resizeCanvas);
    }
  }, [mode]);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setTypedName("");
    onClear();
  };

  const handleConfirm = () => {
    if (mode === "draw") {
      if (signaturePadRef.current?.isEmpty()) return;
      onConfirm(signaturePadRef.current?.toDataURL() || "");
    } else {
      if (!typedName.trim()) return;
      // For typed signature, we'd ideally render to canvas, but for now we'll just use a styled text representation or a pre-rendered font
      // A better way is to render the text to a hidden canvas and get dataURL
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "italic 40px 'Playfair Display', serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
        onConfirm(canvas.toDataURL());
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setMode("draw")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
            mode === "draw" ? "bg-brand-50 text-brand-600 border-b-2 border-brand-600" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <PenTool className="w-4 h-4" /> Draw Signature
        </button>
        <button
          onClick={() => setMode("type")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
            mode === "type" ? "bg-brand-50 text-brand-600 border-b-2 border-brand-600" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Type className="w-4 h-4" /> Type Signature
        </button>
      </div>

      <div className="p-6">
        {mode === "draw" ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-48 border border-slate-200 rounded-lg touch-none bg-slate-50 cursor-crosshair"
            />
            <p className="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-widest">Sign inside the box</p>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Type your full name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="input-field text-2xl font-serif italic text-center py-8"
            />
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest">Handwriting style applied</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClear}
            className="btn-secondary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm"
          >
            <Eraser className="w-4 h-4" /> Clear
          </button>
          <button
            onClick={handleConfirm}
            className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 text-sm"
          >
            <Check className="w-4 h-4" /> Confirm Signature
          </button>
        </div>
      </div>
    </div>
  );
}
