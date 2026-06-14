import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pencil,
  Square,
  ArrowRight,
  Type,
  Undo2,
  Trash2,
  Save,
  X,
  Circle,
  Highlighter,
  Download,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnnotationTool = 'pen' | 'rectangle' | 'arrow' | 'text' | 'circle' | 'highlight';

export interface Annotation {
  id: string;
  type: AnnotationTool;
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  text?: string;
  x?: number;
  y?: number;
}

export interface ScreenshotAnnotatorProps {
  image: string;
  visible: boolean;
  onClose: () => void;
  onSave?: (annotatedImage: string, annotations: Annotation[]) => void;
  defaultColor?: string;
  defaultStrokeWidth?: number;
}

const tools: { id: AnnotationTool; icon: React.ElementType; label: string }[] = [
  { id: 'pen', icon: Pencil, label: '画笔' },
  { id: 'rectangle', icon: Square, label: '矩形' },
  { id: 'circle', icon: Circle, label: '圆形' },
  { id: 'arrow', icon: ArrowRight, label: '箭头' },
  { id: 'highlight', icon: Highlighter, label: '高亮' },
  { id: 'text', icon: Type, label: '文字' },
];

const colors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ffffff',
];

const strokeWidths = [2, 4, 6, 8];

export const ScreenshotAnnotator: React.FC<ScreenshotAnnotatorProps> = ({
  image,
  visible,
  onClose,
  onSave,
  defaultColor = '#ef4444',
  defaultStrokeWidth = 3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState(defaultColor);
  const [strokeWidth, setStrokeWidth] = useState(defaultStrokeWidth);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const drawAnnotation = useCallback(
    (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
      ctx.save();
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = annotation.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (annotation.type) {
        case 'pen':
          if (annotation.points && annotation.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            for (let i = 1; i < annotation.points.length; i++) {
              ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
            }
            ctx.stroke();
          }
          break;

        case 'highlight':
          if (annotation.points && annotation.points.length > 1) {
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = annotation.strokeWidth * 4;
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            for (let i = 1; i < annotation.points.length; i++) {
              ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
            }
            ctx.stroke();
          }
          break;

        case 'rectangle':
          if (
            annotation.startX !== undefined &&
            annotation.startY !== undefined &&
            annotation.endX !== undefined &&
            annotation.endY !== undefined
          ) {
            ctx.strokeRect(
              annotation.startX,
              annotation.startY,
              annotation.endX - annotation.startX,
              annotation.endY - annotation.startY,
            );
          }
          break;

        case 'circle':
          if (
            annotation.startX !== undefined &&
            annotation.startY !== undefined &&
            annotation.endX !== undefined &&
            annotation.endY !== undefined
          ) {
            const radiusX = Math.abs(annotation.endX - annotation.startX) / 2;
            const radiusY = Math.abs(annotation.endY - annotation.startY) / 2;
            const centerX = annotation.startX + (annotation.endX - annotation.startX) / 2;
            const centerY = annotation.startY + (annotation.endY - annotation.startY) / 2;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;

        case 'arrow':
          if (
            annotation.startX !== undefined &&
            annotation.startY !== undefined &&
            annotation.endX !== undefined &&
            annotation.endY !== undefined
          ) {
            ctx.beginPath();
            ctx.moveTo(annotation.startX, annotation.startY);
            ctx.lineTo(annotation.endX, annotation.endY);
            ctx.stroke();

            const angle = Math.atan2(
              annotation.endY - annotation.startY,
              annotation.endX - annotation.startX,
            );
            const headLength = 15;
            ctx.beginPath();
            ctx.moveTo(annotation.endX, annotation.endY);
            ctx.lineTo(
              annotation.endX - headLength * Math.cos(angle - Math.PI / 6),
              annotation.endY - headLength * Math.sin(angle - Math.PI / 6),
            );
            ctx.lineTo(
              annotation.endX - headLength * Math.cos(angle + Math.PI / 6),
              annotation.endY - headLength * Math.sin(angle + Math.PI / 6),
            );
            ctx.closePath();
            ctx.fill();
          }
          break;

        case 'text':
          if (annotation.text && annotation.x !== undefined && annotation.y !== undefined) {
            ctx.font = `bold ${annotation.strokeWidth * 6}px "PingFang SC", "Microsoft YaHei", sans-serif`;
            ctx.fillText(annotation.text, annotation.x, annotation.y);
          }
          break;
      }

      ctx.restore();
    },
    [],
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((ann) => drawAnnotation(ctx, ann));
    if (currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }
  }, [annotations, currentAnnotation, drawAnnotation]);

  useEffect(() => {
    if (!visible) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      const maxWidth = container.clientWidth - 48;
      const maxHeight = container.clientHeight - 180;

      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const width = img.width * scale;
      const height = img.height * scale;

      setCanvasSize({ width, height });

      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          redrawCanvas();
        }
      }, 0);
    };
    img.src = image;
  }, [visible, image, redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);

    if (tool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      setIsDrawing(false);
      return;
    }

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: tool,
      color,
      strokeWidth,
    };

    if (tool === 'pen' || tool === 'highlight') {
      newAnnotation.points = [{ x, y }];
    } else {
      newAnnotation.startX = x;
      newAnnotation.startY = y;
      newAnnotation.endX = x;
      newAnnotation.endY = y;
    }

    setCurrentAnnotation(newAnnotation);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;

    const { x, y } = getCanvasCoords(e);

    if (tool === 'pen' || tool === 'highlight') {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...(currentAnnotation.points || []), { x, y }],
      });
    } else {
      setCurrentAnnotation({
        ...currentAnnotation,
        endX: x,
        endY: y,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) {
      setIsDrawing(false);
      return;
    }

    setAnnotations([...annotations, currentAnnotation]);
    setCurrentAnnotation(null);
    setIsDrawing(false);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setShowTextInput(false);
      return;
    }

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: 'text',
      color,
      strokeWidth,
      text: textInput,
      x: textPosition.x,
      y: textPosition.y,
    };

    setAnnotations([...annotations, newAnnotation]);
    setTextInput('');
    setShowTextInput(false);
  };

  const handleUndo = () => {
    setAnnotations(annotations.slice(0, -1));
  };

  const handleClear = () => {
    setAnnotations([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave?.(dataUrl, annotations);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `screenshot-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => b && resolve(b), 'image/png'),
      );
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="relative flex flex-col w-full h-full max-w-[1400px] max-h-[90vh] rounded-xl overflow-hidden bg-space-900 border border-tech-500/30 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-tech-400/60 rounded-tl pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-tech-400/60 rounded-tr pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-tech-400/60 rounded-bl pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-tech-400/60 rounded-br pointer-events-none z-10" />

        <div className="flex items-center justify-between px-5 py-3 border-b border-tech-500/20 bg-space-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tech-500/20 to-tech-600/20 flex items-center justify-center border border-tech-400/30">
              <Pencil className="w-4 h-4 text-tech-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">截图标注</h2>
              <p className="text-xs text-text-tertiary">选择工具进行标注，完成后保存或下载</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-16 flex-shrink-0 border-r border-tech-500/20 bg-space-800/50 p-2 space-y-2">
            <div className="space-y-1">
              {tools.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={cn(
                      'w-full flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-lg transition-all',
                      tool === t.id
                        ? 'bg-tech-500/20 text-tech-300 border border-tech-400/30 shadow-glow-blue-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-tech-500/10 border border-transparent',
                    )}
                    title={t.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px]">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-tech-500/15 space-y-1">
              <button
                onClick={handleUndo}
                disabled={annotations.length === 0}
                className="w-full flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-tech-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="撤销"
              >
                <Undo2 className="w-4 h-4" />
                <span className="text-[10px]">撤销</span>
              </button>
              <button
                onClick={handleClear}
                disabled={annotations.length === 0}
                className="w-full flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="清除"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px]">清除</span>
              </button>
            </div>
          </div>

          <div className="w-56 flex-shrink-0 border-r border-tech-500/20 bg-space-800/30 p-4 space-y-5">
            <div>
              <h3 className="text-xs font-medium text-text-tertiary mb-2.5 uppercase tracking-wider">颜色</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-full aspect-square rounded-lg transition-all relative',
                      color === c
                        ? 'ring-2 ring-tech-400 ring-offset-2 ring-offset-space-800 scale-110'
                        : 'hover:scale-105',
                    )}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-space-900" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-text-tertiary mb-2.5 uppercase tracking-wider">线宽</h3>
              <div className="space-y-2">
                {strokeWidths.map((w) => (
                  <button
                    key={w}
                    onClick={() => setStrokeWidth(w)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg transition-all',
                      strokeWidth === w
                        ? 'bg-tech-500/15 border border-tech-400/30'
                        : 'hover:bg-space-700/50 border border-transparent',
                    )}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <div
                        className="rounded-full"
                        style={{
                          width: w * 4,
                          height: w * 4,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary font-mono w-6 text-right">{w}px</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-text-tertiary mb-2.5 uppercase tracking-wider">信息</h3>
              <div className="rounded-lg bg-space-700/40 border border-tech-500/10 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">尺寸</span>
                  <span className="text-text-primary font-mono">
                    {Math.round(canvasSize.width)} × {Math.round(canvasSize.height)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">标注数</span>
                  <span className="text-tech-300 font-mono">{annotations.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 bg-space-900/60 overflow-auto relative">
            <div
              className="relative rounded-lg overflow-hidden shadow-2xl"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #1a2348 25%, transparent 25%), linear-gradient(-45deg, #1a2348 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a2348 75%), linear-gradient(-45deg, transparent 75%, #1a2348 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                padding: 0,
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{
                  width: canvasSize.width,
                  height: canvasSize.height,
                  display: 'block',
                  cursor: tool === 'text' ? 'text' : 'crosshair',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              {showTextInput && (
                <div
                  className="absolute z-20 flex items-center gap-2 p-1.5 rounded-lg bg-space-900/95 border border-tech-400/40 shadow-xl"
                  style={{
                    left: Math.min(textPosition.x, canvasSize.width - 200),
                    top: Math.min(textPosition.y, canvasSize.height - 44),
                  }}
                >
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTextSubmit();
                      if (e.key === 'Escape') {
                        setShowTextInput(false);
                        setTextInput('');
                      }
                    }}
                    placeholder="输入文字..."
                    autoFocus
                    className="w-40 h-8 px-2 rounded bg-space-800 border border-tech-500/30 text-sm text-text-primary focus:outline-none focus:border-tech-400/60"
                  />
                  <button
                    onClick={handleTextSubmit}
                    className="h-8 px-3 rounded bg-tech-500/20 text-tech-300 text-xs font-medium hover:bg-tech-500/30 transition-all border border-tech-400/30"
                  >
                    确定
                  </button>
                  <button
                    onClick={() => {
                      setShowTextInput(false);
                      setTextInput('');
                    }}
                    className="h-8 px-2 rounded bg-space-700/60 text-text-secondary text-xs hover:bg-space-600/60 transition-all border border-tech-500/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-tech-500/20 bg-space-800/60 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-xs text-text-tertiary">
            <span>工具：<span className="text-text-primary">{tools.find((t) => t.id === tool)?.label}</span></span>
            <span>颜色：<span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />{color}</span></span>
            <span>线宽：<span className="text-text-primary font-mono">{strokeWidth}px</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-space-700/60 border border-tech-500/20 text-text-secondary text-sm hover:text-text-primary hover:border-tech-400/40 transition-all"
            >
              <Copy className="w-4 h-4" />
              复制
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-space-700/60 border border-tech-500/20 text-text-secondary text-sm hover:text-text-primary hover:border-tech-400/40 transition-all"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-tech-500 to-tech-600 text-white text-sm font-medium hover:from-tech-400 hover:to-tech-500 transition-all shadow-glow-blue-sm border border-transparent"
            >
              <Save className="w-4 h-4" />
              保存标注
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotAnnotator;
