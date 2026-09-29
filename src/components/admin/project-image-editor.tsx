"use client";

import { useEffect, useRef, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Maximize,
} from "lucide-react";

export interface ProjectImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialDisplayType?: "desktop" | "tablet" | "mobile" | "auto";
  initialFit?: "cover" | "contain";
  initialScale?: number;
  initialPositionX?: number;
  initialPositionY?: number;
  projectTitle?: string;
  onSaved: (settings: {
    displayType: "desktop" | "tablet" | "mobile" | "auto";
    fit: "cover" | "contain";
    scale: number;
    positionX: number;
    positionY: number;
  }) => void;
}

export function ProjectImageEditor({
  isOpen,
  onClose,
  imageUrl,
  initialDisplayType = "desktop",
  initialFit = "contain",
  initialScale = 1.0,
  initialPositionX = 50.0,
  initialPositionY = 50.0,
  projectTitle = "Project Preview",
  onSaved,
}: ProjectImageEditorProps) {
  const [displayType, setDisplayType] = useState<"desktop" | "tablet" | "mobile" | "auto">(initialDisplayType);
  const [fit, setFit] = useState<"cover" | "contain">(initialFit);
  const [scale, setScale] = useState<number>(initialScale || 1.0);
  const [positionX, setPositionX] = useState<number>(
    typeof initialPositionX === "number" ? initialPositionX : 50.0,
  );
  const [positionY, setPositionY] = useState<number>(
    typeof initialPositionY === "number" ? initialPositionY : 50.0,
  );
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPosX: 50, initialPosY: 50 });
  const previewFrameRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Pointer drag logic
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: positionX,
      initialPosY: positionY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !previewFrameRef.current) return;
    const rect = previewFrameRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const deltaXPixels = e.clientX - dragStartRef.current.x;
    const deltaYPixels = e.clientY - dragStartRef.current.y;

    const deltaXPercent = (deltaXPixels / rect.width) * 100;
    const deltaYPercent = (deltaYPixels / rect.height) * 100;

    const newX = Math.round((dragStartRef.current.initialPosX + deltaXPercent) * 10) / 10;
    const newY = Math.round((dragStartRef.current.initialPosY + deltaYPercent) * 10) / 10;

    // Bounds between -20% and 120%
    setPositionX(Math.max(-20, Math.min(120, newX)));
    setPositionY(Math.max(-20, Math.min(120, newY)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.05 : -0.05;
    setScale((prev) => {
      const next = Math.round((prev + zoomFactor) * 100) / 100;
      return Math.max(0.5, Math.min(3.0, next));
    });
  };

  const handleReset = () => {
    setScale(1.0);
    setPositionX(50.0);
    setPositionY(50.0);
  };

  const nudge = (dx: number, dy: number) => {
    setPositionX((prev) => Math.max(-20, Math.min(120, Math.round((prev + dx) * 10) / 10)));
    setPositionY((prev) => Math.max(-20, Math.min(120, Math.round((prev + dy) * 10) / 10)));
  };

  const handleApply = () => {
    onSaved({
      displayType,
      fit,
      scale,
      positionX,
      positionY,
    });
    onClose();
  };

  // Frame aspect ratio and preview dimension based on displayType
  const getFrameAspectStyle = () => {
    switch (displayType) {
      case "mobile":
        return { aspectRatio: "9 / 16", maxWidth: "260px" };
      case "tablet":
        return { aspectRatio: "4 / 3", maxWidth: "440px" };
      case "auto":
        return { aspectRatio: "auto", minHeight: "280px", maxWidth: "520px" };
      case "desktop":
      default:
        return { aspectRatio: "16 / 10", maxWidth: "540px" };
    }
  };

  const frameStyle = getFrameAspectStyle();

  return (
    <div
      className="hero-editor-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-editor-title"
    >
      <div className="hero-editor-modal project-image-editor-modal">
        {/* Header */}
        <div className="hero-editor-header">
          <div>
            <div className="hero-editor-badge">
              <Sparkles size={13} aria-hidden="true" />
              <span>Project Presentation Studio</span>
            </div>
            <h2 id="project-editor-title">Position &amp; Frame Project Screenshot</h2>
            <p>
              Drag to position the screenshot, zoom in or out, and choose the device aspect ratio to create a real portfolio case-study preview.
            </p>
          </div>
          <button
            type="button"
            className="hero-editor-close"
            onClick={onClose}
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Grid */}
        <div className="hero-editor-body">
          {/* Main Visual Preview Canvas */}
          <div className="hero-editor-canvas-column">
            <div className="hero-editor-canvas-toolbar">
              <span className="hero-editor-label">Public Card Live Preview</span>
              <div className="hero-editor-view-toggles">
                <button
                  type="button"
                  className={`hero-toggle-btn ${showGrid ? "is-active" : ""}`}
                  onClick={() => setShowGrid(!showGrid)}
                  title="Toggle composition grid"
                >
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  className="hero-toggle-btn"
                  onClick={handleReset}
                  title="Reset position and zoom"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="project-editor-canvas-container">
              <div className="project-preview-mockup-wrapper">
                {/* Device Frame Window Header */}
                {displayType === "mobile" ? (
                  <div className="project-phone-speaker-bar" aria-hidden="true">
                    <span className="phone-notch-dot" />
                    <span className="phone-speaker-slot" />
                  </div>
                ) : displayType === "tablet" ? (
                  <div className="project-tablet-bar" aria-hidden="true">
                    <span className="tablet-camera-dot" />
                  </div>
                ) : (
                  <div className="project-mockup-header">
                    <div className="project-mockup-dots">
                      <span className="mockup-dot red" />
                      <span className="mockup-dot yellow" />
                      <span className="mockup-dot green" />
                    </div>
                    <div className="project-mockup-url-bar">
                      {projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.preview
                    </div>
                  </div>
                )}

                {/* Viewport Frame */}
                <div
                  ref={previewFrameRef}
                  className="project-editor-viewport"
                  style={{
                    aspectRatio: frameStyle.aspectRatio,
                    maxWidth: frameStyle.maxWidth,
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onWheel={handleWheel}
                >
                  {/* Grid overlay */}
                  <div className={`hero-editor-drag-overlay ${showGrid ? "has-grid" : ""}`}>
                    <div className="hero-drag-hint">
                      <Move size={12} />
                      <span>Drag to reposition • Scroll to zoom</span>
                    </div>
                  </div>

                  {/* Image with transform */}
                  {imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imageUrl}
                      alt="Project preview"
                      className="project-editor-img"
                      style={{
                        objectFit: fit,
                        transform: `translate(${positionX - 50}%, ${positionY - 50}%) scale(${scale})`,
                        transformOrigin: "center center",
                      }}
                      draggable={false}
                    />
                  ) : (
                    <div className="project-editor-empty">No image loaded</div>
                  )}
                </div>
              </div>
            </div>

            <p className="hero-editor-canvas-footnote">
              Device: <strong>{displayType.toUpperCase()}</strong> • Fit: <strong>{fit.toUpperCase()}</strong> • Zoom: <strong>{Math.round(scale * 100)}%</strong> • Offset: <strong>({positionX}%, {positionY}%)</strong>
            </p>
          </div>

          {/* Right Controls Column */}
          <div className="hero-editor-controls-column">
            {/* Display / Device Mode Selector */}
            <div className="hero-ctrl-card">
              <div className="hero-ctrl-header-row">
                <span className="hero-ctrl-title">Device Preview Mode</span>
                <span className="hero-coord-badge">{displayType}</span>
              </div>
              <div className="project-mode-grid">
                <button
                  type="button"
                  className={`project-mode-btn ${displayType === "desktop" ? "is-selected" : ""}`}
                  onClick={() => setDisplayType("desktop")}
                >
                  <Monitor size={18} />
                  <div>
                    <div className="project-mode-name">Desktop</div>
                    <div className="project-mode-sub">16:10 Landscape</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`project-mode-btn ${displayType === "tablet" ? "is-selected" : ""}`}
                  onClick={() => setDisplayType("tablet")}
                >
                  <Tablet size={18} />
                  <div>
                    <div className="project-mode-name">Tablet</div>
                    <div className="project-mode-sub">4:3 Ratio</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`project-mode-btn ${displayType === "mobile" ? "is-selected" : ""}`}
                  onClick={() => setDisplayType("mobile")}
                >
                  <Smartphone size={18} />
                  <div>
                    <div className="project-mode-name">Mobile / App</div>
                    <div className="project-mode-sub">9:16 Portrait</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`project-mode-btn ${displayType === "auto" ? "is-selected" : ""}`}
                  onClick={() => setDisplayType("auto")}
                >
                  <Maximize size={18} />
                  <div>
                    <div className="project-mode-name">Auto</div>
                    <div className="project-mode-sub">Natural Aspect</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Fit Mode */}
            <div className="hero-ctrl-card">
              <div className="hero-ctrl-header-row">
                <span className="hero-ctrl-title">Image Fit</span>
                <span className="hero-coord-badge">{fit}</span>
              </div>
              <div className="project-fit-toggle-row">
                <button
                  type="button"
                  className={`project-fit-pill ${fit === "cover" ? "is-active" : ""}`}
                  onClick={() => setFit("cover")}
                >
                  Cover (Fill Container)
                </button>
                <button
                  type="button"
                  className={`project-fit-pill ${fit === "contain" ? "is-active" : ""}`}
                  onClick={() => setFit("contain")}
                >
                  Contain (Show All)
                </button>
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="hero-ctrl-card">
              <div className="hero-ctrl-header-row">
                <span className="hero-ctrl-title">Zoom / Scale</span>
                <span className="hero-coord-badge">{Math.round(scale * 100)}%</span>
              </div>
              <div className="hero-zoom-row">
                <button
                  type="button"
                  className="hero-icon-step-btn"
                  onClick={() => setScale((s) => Math.max(0.5, Math.round((s - 0.1) * 10) / 10))}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="hero-range-slider"
                />
                <button
                  type="button"
                  className="hero-icon-step-btn"
                  onClick={() => setScale((s) => Math.min(3.0, Math.round((s + 0.1) * 10) / 10))}
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* Position Nudge Pad */}
            <div className="hero-ctrl-card">
              <div className="hero-ctrl-header-row">
                <span className="hero-ctrl-title">Fine-tune Position</span>
                <span className="hero-coord-badge">X: {positionX}% • Y: {positionY}%</span>
              </div>
              <div className="hero-nudge-pad">
                <div className="hero-nudge-row">
                  <button
                    type="button"
                    className="hero-icon-step-btn"
                    onClick={() => nudge(0, -2)}
                    title="Nudge Up"
                  >
                    <ChevronUp size={16} />
                  </button>
                </div>
                <div className="hero-nudge-row" style={{ gap: "28px" }}>
                  <button
                    type="button"
                    className="hero-icon-step-btn"
                    onClick={() => nudge(-2, 0)}
                    title="Nudge Left"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="hero-icon-step-btn"
                    onClick={() => nudge(2, 0)}
                    title="Nudge Right"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="hero-nudge-row">
                  <button
                    type="button"
                    className="hero-icon-step-btn"
                    onClick={() => nudge(0, 2)}
                    title="Nudge Down"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="hero-editor-footer">
          <button
            type="button"
            className="hero-editor-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="hero-editor-save-btn"
            onClick={handleApply}
          >
            <Check size={16} />
            <span>Apply Framing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
