import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Palette, Eraser, Download, Trash2, Sparkles, Send } from "lucide-react";

interface CreativeHubProps {
  childId: string;
}

const colors = [
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
  { name: "Black", value: "#1F2937" },
];

const CreativeHub = ({ childId }: CreativeHubProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState(colors[0].value);
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Resize canvas to match displayed size, preserving existing drawing
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const cssWidth = Math.max(300, Math.floor(rect.width));
    const cssHeight = Math.floor(cssWidth * 0.6);

    // Save existing
    const prev = document.createElement("canvas");
    prev.width = canvas.width;
    prev.height = canvas.height;
    const prevCtx = prev.getContext("2d");
    if (prevCtx && canvas.width > 0 && canvas.height > 0) {
      prevCtx.drawImage(canvas, 0, 0);
    }

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, cssWidth, cssHeight);
      if (prev.width > 0) {
        ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, cssWidth, cssHeight);
      }
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    const handler = () => resizeCanvas();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [resizeCanvas]);

  const getPos = (e: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const { x, y } = getPos(e);
    lastPointRef.current = { x, y };

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = isEraser ? "#FFFFFF" : currentColor;
      ctx.fillStyle = isEraser ? "#FFFFFF" : currentColor;
      ctx.lineWidth = isEraser ? brushSize * 2 : brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Draw a dot for taps
      ctx.beginPath();
      ctx.arc(x, y, (isEraser ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPos(e);
    const last = lastPointRef.current ?? { x, y };

    ctx.strokeStyle = isEraser ? "#FFFFFF" : currentColor;
    ctx.lineWidth = isEraser ? brushSize * 2 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture?.(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const saveArtwork = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL();

      await supabase.from("creative_works").insert({
        child_id: childId,
        work_type: "drawing",
        work_data: { image_data: dataUrl },
      });

      await supabase.from("progress_entries").insert({
        child_id: childId,
        activity_type: "creative_work",
      });

      toast({
        title: "Artwork saved! 🎨",
        description: "Your beautiful creation is saved in your gallery!",
      });
    } catch (error) {
      console.error("Error saving artwork:", error);
      toast({
        title: "Oops!",
        description: "Couldn't save your artwork. Try again!",
        variant: "destructive",
      });
    }
  };

  const downloadArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `griffin-artwork-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Downloaded! 📥",
      description: "Your artwork is saved to your device!",
    });
  };

  const sendToParent = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSending(true);
    try {
      const imageData = canvas.toDataURL();

      // Get AI analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-drawing',
        { body: { imageData, child_id: childId } }
      );

      if (analysisError) throw analysisError;

      // Save to shared_drawings
      await supabase.from('shared_drawings').insert({
        child_id: childId,
        image_data: imageData,
        ai_analysis: analysisData.analysis,
      });

      toast({
        title: "Sent to Parent! 💙",
        description: "Your parent can now see your beautiful drawing!",
      });
    } catch (error) {
      console.error('Error sending drawing:', error);
      toast({
        title: "Oops!",
        description: "Couldn't send to parent. Try again!",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-accent mb-2 flex items-center gap-2">
          <Palette className="w-8 h-8" />
          Creative Expression Hub
        </h2>
        <p className="text-muted-foreground text-lg">
          Draw your feelings, paint your world! 🎨
        </p>
      </div>

      {/* Drawing Canvas */}
      <div ref={containerRef} className="mb-6 bg-white rounded-2xl p-4 shadow-inner">
        <canvas
          ref={canvasRef}
          className="border-2 border-dashed border-gray-300 rounded-xl cursor-crosshair block touch-none"
          style={{ touchAction: "none" }}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>

      {/* Color Palette */}
      <div className="mb-6">
        <p className="text-lg font-semibold mb-3">Choose your color:</p>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                setCurrentColor(color.value);
                setIsEraser(false);
              }}
              className={`w-12 h-12 rounded-full transition-all duration-300 ${
                currentColor === color.value && !isEraser
                  ? "scale-125 ring-4 ring-primary"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Brush Size */}
      <div className="mb-6">
        <p className="text-lg font-semibold mb-3">Brush size: {brushSize}px</p>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Tools */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Button
          onClick={() => setIsEraser(!isEraser)}
          variant={isEraser ? "default" : "outline"}
          className="rounded-xl h-12"
        >
          <Eraser className="w-5 h-5 mr-2" />
          Eraser
        </Button>

        <Button onClick={clearCanvas} variant="outline" className="rounded-xl h-12">
          <Trash2 className="w-5 h-5 mr-2" />
          Clear
        </Button>

        <Button onClick={saveArtwork} className="rounded-xl h-12 bg-primary">
          <Sparkles className="w-5 h-5 mr-2" />
          Save
        </Button>

        <Button onClick={downloadArtwork} variant="outline" className="rounded-xl h-12">
          <Download className="w-5 h-5 mr-2" />
          Download
        </Button>

        <Button 
          onClick={sendToParent} 
          disabled={isSending}
          className="rounded-xl h-12 bg-secondary hover:bg-secondary/90"
        >
          <Send className="w-5 h-5 mr-2" />
          {isSending ? "Sending..." : "Send to Parent"}
        </Button>
      </div>
    </Card>
  );
};

export default CreativeHub;
