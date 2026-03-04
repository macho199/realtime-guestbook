'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';

type ToolMode = 'pen' | 'eraser';

interface DrawingCanvasProps {
  disabled?: boolean;
  onSave: (file: File) => void;
  onClear: () => void;
}

interface Point {
  x: number;
  y: number;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;

export function DrawingCanvas({ disabled, onSave, onClear }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);

  const [tool, setTool] = useState<ToolMode>('pen');
  const [color, setColor] = useState('#1d3557');
  const [size, setSize] = useState(6);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [saveState, setSaveState] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.fillStyle = '#fffdfa';
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, []);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const startStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(event);
    setSaveState(null);
  };

  const continueStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || disabled) {
      return;
    }

    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const currentPoint = getPoint(event);
    const previousPoint = lastPointRef.current ?? currentPoint;

    context.beginPath();
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = size;

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = color;
    }

    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(currentPoint.x, currentPoint.y);
    context.stroke();

    lastPointRef.current = currentPoint;
    setHasStrokes(true);
  };

  const endStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) {
      return;
    }

    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#fffdfa';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    setSaveState('초기화 완료');
    onClear();
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), 'image/png'),
    );

    if (!blob) {
      setSaveState('드로잉 저장에 실패했습니다.');
      return;
    }

    const file = new File([blob], `drawing-${Date.now()}.png`, { type: 'image/png' });
    onSave(file);
    setSaveState('드로잉이 저장되었습니다.');
  };

  return (
    <section className="drawing-panel">
      <div className="drawing-controls">
        <label>
          도구
          <select value={tool} onChange={(event) => setTool(event.target.value as ToolMode)} disabled={disabled}>
            <option value="pen">펜</option>
            <option value="eraser">지우개</option>
          </select>
        </label>
        <label>
          색상
          <input
            type="color"
            value={color}
            disabled={disabled || tool === 'eraser'}
            onChange={(event) => setColor(event.target.value)}
          />
        </label>
        <label>
          두께
          <input
            type="range"
            min={2}
            max={24}
            step={1}
            value={size}
            disabled={disabled}
            onChange={(event) => setSize(Number(event.target.value))}
          />
        </label>
        <div className="drawing-action-row">
          <button type="button" onClick={clearCanvas} disabled={disabled}>
            초기화
          </button>
          <button type="button" onClick={saveDrawing} disabled={disabled || !hasStrokes}>
            저장
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={startStroke}
        onPointerMove={continueStroke}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        onPointerCancel={endStroke}
      />

      {saveState ? <p className="helper-text">{saveState}</p> : null}
    </section>
  );
}
