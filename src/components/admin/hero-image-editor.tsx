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
  Eye,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { saveHeroImageSettings } from "@/lib/admin/actions";
import { useAdminNotice } from "./notice";

export interface HeroImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imagePath?: string;
  initialMode?: "cutout" | "full";
  initialScale?: number;
  initialPositionX?: number;
  initialPositionY?: number;
  ownerName?: string;
  professionalTitle?: string;
  onSaved: (settings: {
    mode: "cutout" | "full";
    scale: number;
    positionX: number;
    positionY: number;
  }) => void;
}

export function HeroImageEditor({
  isOpen,
  onClose,
  imageUrl,
  imagePath,
  initialMode = "cutout",
  initialScale = 1.0,
  initialPositionX = 50.0,
  initialPositionY = 55.0,
  ownerName = "Ryan Bien Barilla",
  professionalTitle = "Software Engineer & Designer",
  onSaved,
}: HeroImageEditorProps) {
  const notify = useAdminNotice();
  const [mode, setMode] = useState<"cutout" | "full">(initialMode);
  const [scale, setScale] = useState<number>(initialScale || 1.0);
  const [positionX, setPositionX] = useState<number>(
    typeof initialPositionX === "number" ? initialPositionX : 50.0,
  );
  const [positionY, setPositionY] = useState<number>(
    typeof initialPositionY === "number"
      ? initialPositionY
      : initialMode === "full"
        ? 50.0
        : 55.0,
  );
  const [previewContext, setPreviewContext] = useState<"frame" | "hero">("frame");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPosX: 50, initialPosY: 55 });
  const previewFrameRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSaving) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

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

    // Bounds between -20% and 120% for smooth panning
    setPositionX(Math.max(-20, Math.min(120, newX)));
    setPositionY(Math.max(-20, Math.min(120, newY)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
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

  // Reset to default
  const handleReset = () => {
    setScale(1.0);
    setPositionX(50.0);
    setPositionY(mode === "full" ? 50.0 : 55.0);
  };

  // Nudge functions
  const nudge = (dx: number, dy: number) => {
    setPositionX((prev) => Math.max(-20, Math.min(120, Math.round((prev + dx) * 10) / 10)));
    setPositionY((prev) => Math.max(-20, Math.min(120, Math.round((prev + dy) * 10) / 10)));
  };

  // Asynchronous Save
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      const result = await saveHeroImageSettings({
        hero_image_mode: mode,
        hero_image_scale: scale,
        hero_image_position_x: positionX,
        hero_image_position_y: positionY,
        profile_image_path: imagePath !== undefined ? imagePath : undefined,
      });

      if (result.status === "success") {
        notify("Hero image updated successfully.");
        onSaved({
          mode,
          scale,
          positionX,
          positionY,
        });
        onClose();
      } else {
        setErrorMessage(result.message || "Failed to save hero image settings.");
      }
    } catch {
      setErrorMessage("Network error while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="hero-editor-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hero-editor-title"
    >
      <div className="hero-editor-modal">
        {/* Header */}
        <div className="hero-editor-header">
          <div>
            <div className="hero-editor-badge">
              <Sparkles size={13} aria-hidden="true" />
              <span>Hero Portrait System</span>
            </div>
            <h2 id="hero-editor-title">Hero Portrait Positioning & Framing</h2>
            <p>
              Drag the portrait to adjust its focal composition, zoom in or out,
              and select the optimal rendering mode.
            </p>
          </div>
          <button
            type="button"
            className="hero-editor-close"
            onClick={onClose}
            disabled={isSaving}
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
              <span className="hero-editor-label">Live Homepage Hero Frame</span>
              <div className="hero-editor-view-toggles">
                <button
                  type="button"
                  className={`hero-toggle-btn ${previewContext === "frame" ? "is-active" : ""}`}
                  onClick={() => setPreviewContext("frame")}
                  title="Focused Hero portrait panel"
                >
                  <Maximize2 size={13} />
                  <span>Portrait Frame</span>
                </button>
                <button
                  type="button"
                  className={`hero-toggle-btn ${previewContext === "hero" ? "is-active" : ""}`}
                  onClick={() => setPreviewContext("hero")}
                  title="Side-by-side Hero composition"
                >
                  <Eye size={13} />
                  <span>Desktop Hero View</span>
                </button>
                <button
                  type="button"
                  className={`hero-toggle-btn ${showGrid ? "is-active" : ""}`}
                  onClick={() => setShowGrid(!showGrid)}
                  title="Toggle composition grid"
                >
                  <span>Grid</span>
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div
              className={`hero-editor-canvas-container ${
                previewContext === "hero" ? "view-hero-context" : "view-frame-only"
              }`}
            >
              {/* Left Column Mockup (shown only in Desktop Hero View mode) */}
              {previewContext === "hero" && (
                <div className="hero-editor-mock-left" aria-hidden="true">
                  <span className="mock-eyebrow">Personal portfolio</span>
                  <div className="mock-h1">
                    <span>{ownerName.split(" ").slice(0, -1).join(" ") || ownerName}</span>
                    <span className="mock-lastname">{ownerName.split(" ").pop()}</span>
                  </div>
                  <p className="mock-title">{professionalTitle || "Creative Developer"}</p>
                  <p className="mock-intro">
                    Crafting intentional digital experiences through software architecture and editorial design.
                  </p>
                  <div className="mock-actions">
                    <span className="mock-btn-primary">View My Work →</span>
                    <span className="mock-btn-secondary">Download CV</span>
                  </div>
                </div>
              )}

              {/* Exact Right-Side Hero Visual Frame */}
              <div
                ref={previewFrameRef}
                className="hero-editor-frame profile-visual"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
              >
                {/* Layer 1: Cream Architectural Background */}
                <div className="portrait-scene" aria-hidden="true">
                  <div className="portrait-wall" />
                  <div className="window-light" />
                  <div className="botanical-shadow">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="portrait-ledge" />
                  <div className="portrait-vase" />
                </div>

                {/* Layer 2: Subject Portrait */}
                {mode === "cutout" ? (
                  <div className="hero-portrait-layer mode-cutout" aria-hidden="true">
                    <div
                      className="hero-cutout-anchor"
                      style={{
                        left: `${positionX}%`,
                        top: `${positionY}%`,
                        transform: `translate(-50%, -50%) scale(${scale})`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Hero preview"
                        className="hero-cutout-img"
                        draggable={false}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="hero-portrait-layer mode-full" aria-hidden="true">
                    <div className="hero-full-viewport">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Hero preview"
                        className="hero-full-img"
                        style={{
                          left: `${positionX}%`,
                          top: `${positionY}%`,
                          transform: `translate(-50%, -50%) scale(${scale})`,
                        }}
                        draggable={false}
                      />
                    </div>
                  </div>
                )}

                {/* Layer 3: Editorial Badges & Labels */}
                <div className="portrait-label" aria-hidden="true">
                  <span />
                  Portrait space
                </div>
                <div className="portrait-seal" aria-hidden="true">
                  <span>
                    Personal
                    <br />
                    portfolio
                  </span>
                  <i />
                </div>

                {/* Interactive Drag Overlay & Rule-of-Thirds Grid */}
                <div className={`hero-editor-drag-overlay ${showGrid ? "has-grid" : ""}`}>
                  <div className="hero-drag-hint">
                    <Move size={14} />
                    <span>Click & drag to position</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="hero-editor-canvas-footnote">
              Tip: Drag inside the frame to adjust horizontal & vertical position. Use the mouse scroll wheel or slider to zoom.
            </p>
          </div>

          {/* Controls Sidebar */}
          <div className="hero-editor-controls-column">
            {/* Display Mode Choice */}
            <div className="hero-ctrl-card">
              <label className="hero-ctrl-title">Hero Image Style</label>
              <div className="hero-mode-cards">
                <button
                  type="button"
                  className={`hero-mode-option ${mode === "cutout" ? "is-selected" : ""}`}
                  onClick={() => {
                    setMode("cutout");
                    if (positionY === 50) setPositionY(55);
                  }}
                >
                  <div className="hero-mode-option-header">
                    <span className="hero-mode-radio">
                      {mode === "cutout" && <span className="hero-mode-dot" />}
                    </span>
                    <strong>Portrait / Cutout</strong>
                    <span className="hero-recommended-pill">Recommended</span>
                  </div>
                  <p className="hero-mode-desc">
                    Best for transparent or background-removed profile images. Layers your portrait ON TOP of the cream architectural artwork.
                  </p>
                </button>

                <button
                  type="button"
                  className={`hero-mode-option ${mode === "full" ? "is-selected" : ""}`}
                  onClick={() => {
                    setMode("full");
                    if (positionY === 55) setPositionY(50);
                  }}
                >
                  <div className="hero-mode-option-header">
                    <span className="hero-mode-radio">
                      {mode === "full" && <span className="hero-mode-dot" />}
                    </span>
                    <strong>Full Photo</strong>
                  </div>
                  <p className="hero-mode-desc">
                    Best for normal photographs with their own background. Fills the Hero frame using your custom crop and focal point.
                  </p>
                </button>
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="hero-ctrl-card">
              <div className="hero-ctrl-header-row">
                <label htmlFor="hero-zoom-slider" className="hero-ctrl-title">
                  Zoom & Scale
                </label>
                <span className="hero-coord-badge">{Math.round(scale * 100)}%</span>
              </div>
              <div className="hero-zoom-row">
                <button
                  type="button"
                  className="hero-icon-step-btn"
                  onClick={() => setScale((s) => Math.max(0.5, Math.round((s - 0.05) * 100) / 100))}
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  id="hero-zoom-slider"
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
                  onClick={() => setScale((s) => Math.min(3.0, Math.round((s + 0.05) * 100) / 100))}
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* Position Fine-Tuning & Nudge */}
            <div className="hero-ctrl-card">
              <div className="hero-ctrl-header-row">
                <label className="hero-ctrl-title">Position Coordinates</label>
                <span className="hero-coord-badge">
                  X: {positionX}% · Y: {positionY}%
                </span>
              </div>
              <div className="hero-nudge-pad">
                <div className="hero-nudge-row">
                  <button
                    type="button"
                    className="hero-nudge-btn"
                    onClick={() => nudge(0, -2)}
                    title="Nudge Up"
                    aria-label="Nudge Up"
                  >
                    <ChevronUp size={16} />
                  </button>
                </div>
                <div className="hero-nudge-middle-row">
                  <button
                    type="button"
                    className="hero-nudge-btn"
                    onClick={() => nudge(-2, 0)}
                    title="Nudge Left"
                    aria-label="Nudge Left"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="hero-nudge-reset"
                    onClick={handleReset}
                    title="Reset to center"
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    className="hero-nudge-btn"
                    onClick={() => nudge(2, 0)}
                    title="Nudge Right"
                    aria-label="Nudge Right"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="hero-nudge-row">
                  <button
                    type="button"
                    className="hero-nudge-btn"
                    onClick={() => nudge(0, 2)}
                    title="Nudge Down"
                    aria-label="Nudge Down"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="hero-editor-error" role="alert">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="hero-editor-footer">
          <button
            type="button"
            className="hero-editor-cancel-btn"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="hero-editor-save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span>Saving position...</span>
            ) : (
              <>
                <Check size={16} />
                <span>Save Position</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
