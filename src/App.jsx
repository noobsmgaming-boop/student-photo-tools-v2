import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  BadgeCheck,
  Camera,
  Check,
  ChevronRight,
  Crop,
  Download,
  FileImage,
  ImageDown,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Upload,
  Wand2,
  Keyboard,
  X
} from "lucide-react";

const tools = [
  {
    id: "resize",
    title: "Image Resize",
    description: "Set exact pixel dimensions for forms and admit cards.",
    icon: Maximize2
  },
  {
    id: "compress",
    title: "Compress to KB",
    description: "Reduce file size to a specific KB target.",
    icon: Minimize2
  },
  {
    id: "crop",
    title: "Crop Image",
    description: "Crop square, portrait, or free-form areas.",
    icon: Crop
  },
  {
    id: "passport",
    title: "Passport Photo Maker",
    description: "Create a clean 35 x 45 mm style portrait.",
    icon: Camera
  },
  {
    id: "signature",
    title: "Signature Resize",
    description: "Resize scanned signatures for exam portals.",
    icon: Scissors
  },
  {
    id: "jpgpng",
    title: "JPG to PNG",
    description: "Convert JPG images into transparent-safe PNG files.",
    icon: ImageDown
  },
  {
    id: "pngjpg",
    title: "PNG to JPG",
    description: "Convert PNG files into compact JPG images.",
    icon: FileImage
  }
];

const faqs = [
  {
    question: "Are my photos uploaded to a server?",
    answer: "No. Processing runs in your browser with canvas, so selected photos stay on your device."
  },
  {
    question: "Can I make photos for government forms?",
    answer: "Yes. You can resize, crop, compress, and convert photos to match common form requirements."
  },
  {
    question: "Does it work on mobile phones?",
    answer: "The interface is mobile-first with large controls, clear previews, and touch-friendly upload actions."
  },
  {
    question: "Can I target a specific file size?",
    answer: "Use Compress to KB and enter the maximum size required by your application portal."
  }
];

const passportPresets = {
  "35x45mm": { label: "35 x 45 mm", width: 413, height: 531, aspect: 35 / 45 },
  "2x2in": { label: "2 x 2 inch", width: 600, height: 600, aspect: 1 },
  formSmall: { label: "Form small", width: 200, height: 230, aspect: 200 / 230 },
  formLarge: { label: "Form large", width: 600, height: 800, aspect: 3 / 4 }
};

const examPhotoPresets = [
  { id: "ssc-gd-photo", title: "SSC GD Photo", kind: "photo", width: 413, height: 531, minKb: 100, maxKb: 500 },
  { id: "ssc-gd-signature", title: "SSC GD Signature", kind: "signature", width: 300, height: 100, minKb: 20, maxKb: 100 },
  { id: "railway-rrb-photo", title: "Railway RRB Photo", kind: "photo", width: 413, height: 531, minKb: 20, maxKb: 50 },
  { id: "railway-rrb-signature", title: "Railway RRB Signature", kind: "signature", width: 140, height: 60, minKb: 10, maxKb: 40 },
  { id: "upsc-photo", title: "UPSC Photo", kind: "photo", width: 350, height: 350, minKb: 20, maxKb: 300 },
  { id: "upsc-signature", title: "UPSC Signature", kind: "signature", width: 350, height: 150, minKb: 20, maxKb: 300 },
  { id: "mp-police-photo", title: "MP Police Photo", kind: "photo", width: 200, height: 230, minKb: 30, maxKb: 100 },
  { id: "mp-police-signature", title: "MP Police Signature", kind: "signature", width: 300, height: 100, minKb: 20, maxKb: 50 },
  { id: "college-admission-photo", title: "College Admission Photo", kind: "photo", width: 413, height: 531, minKb: 50, maxKb: 200 },
  { id: "scholarship-photo", title: "Scholarship Photo", kind: "photo", width: 300, height: 400, minKb: 20, maxKb: 100 },
  { id: "passport-size-photo", title: "Passport Size Photo", kind: "passport", width: 413, height: 531, minKb: 50, maxKb: 200 },
  { id: "2x2-inch-photo", title: "2x2 Inch Photo", kind: "passport", width: 600, height: 600, minKb: 50, maxKb: 250 },
  { id: "35x45-mm-photo", title: "35x45 mm Photo", kind: "passport", width: 413, height: 531, minKb: 50, maxKb: 200 }
];

const kbShortcutPresets = {
  "1": 20,
  "2": 50,
  "3": 100,
  "4": 200,
  "5": 500
};

const shortcuts = [
  ["Ctrl + U", "Upload Image"],
  ["Ctrl + D", "Download Processed Image"],
  ["Ctrl + R", "Resize Tool"],
  ["Ctrl + C", "Crop Tool"],
  ["Ctrl + K", "Compress to KB"],
  ["Ctrl + P", "Passport Photo Mode"],
  ["Ctrl + S", "Signature Mode"],
  ["Ctrl + 1", "20 KB Preset"],
  ["Ctrl + 2", "50 KB Preset"],
  ["Ctrl + 3", "100 KB Preset"],
  ["Ctrl + 4", "200 KB Preset"],
  ["Ctrl + 5", "500 KB Preset"],
  ["?", "Open Shortcuts"]
];

const presets = {
  resize: { width: 600, height: 600, maintainAspect: true, format: "image/jpeg", quality: 0.9 },
  compress: { targetKb: 100, width: 0, height: 0, format: "image/jpeg", quality: 0.86 },
  crop: { ratio: "1:1", width: 800, height: 800, format: "image/jpeg", quality: 0.92 },
  passport: { passportPreset: "35x45mm", width: 413, height: 531, format: "image/jpeg", quality: 0.92 },
  signature: { width: 300, height: 100, whiteBackground: true, format: "image/jpeg", quality: 0.9 },
  jpgpng: { format: "image/png", quality: 1 },
  pngjpg: { format: "image/jpeg", quality: 0.92 }
};

function formatBytes(bytes = 0) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExt(type) {
  if (type === "image/png") return "png";
  return "jpg";
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function drawImageToCanvas(image, options) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: options.format === "image/png" });
  let width = Number(options.width) || image.naturalWidth;
  let height = Number(options.height) || image.naturalHeight;

  if (options.preserveAspect && Number(options.width) && !Number(options.height)) {
    height = Math.round((image.naturalHeight / image.naturalWidth) * width);
  }

  width = Math.max(1, Math.round(width));
  height = Math.max(1, Math.round(height));

  canvas.width = width;
  canvas.height = height;

  if (options.format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  if (options.whiteBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
}

function drawCroppedImageToCanvas(image, croppedAreaPixels, options) {
  const source = croppedAreaPixels || {
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight
  };
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: options.format === "image/png" });
  const width = Math.max(1, Math.round(Number(options.width) || source.width));
  const height = Math.max(1, Math.round(Number(options.height) || source.height));

  canvas.width = width;
  canvas.height = height;

  if (options.format === "image/jpeg" || options.whiteBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    0,
    0,
    width,
    height
  );

  return canvas;
}

function cloneCanvasAtScale(canvas, scale) {
  const next = document.createElement("canvas");
  next.width = Math.max(1, Math.round(canvas.width * scale));
  next.height = Math.max(1, Math.round(canvas.height * scale));
  const ctx = next.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, next.width, next.height);
  ctx.drawImage(canvas, 0, 0, next.width, next.height);
  return next;
}

async function compressToTarget(canvas, targetBytes) {
  const tolerance = Math.max(1024, targetBytes * 0.06);
  let workingCanvas = canvas;
  let best = null;

  for (let scalePass = 0; scalePass < 8; scalePass += 1) {
    let low = 0.08;
    let high = 0.95;

    for (let i = 0; i < 16; i += 1) {
      const quality = (low + high) / 2;
      const blob = await canvasToBlob(workingCanvas, "image/jpeg", quality);
      if (!blob) break;

      if (!best || Math.abs(blob.size - targetBytes) < Math.abs(best.blob.size - targetBytes)) {
        best = { blob, canvas: workingCanvas, quality };
      }

      if (Math.abs(blob.size - targetBytes) <= tolerance) {
        return { blob, canvas: workingCanvas, quality };
      }

      if (blob.size > targetBytes) {
        high = quality;
      } else {
        low = quality;
      }
    }

    if (best?.blob.size <= targetBytes + tolerance || workingCanvas.width < 80 || workingCanvas.height < 80) {
      break;
    }

    workingCanvas = cloneCanvasAtScale(workingCanvas, 0.88);
  }

  return best || { blob: await canvasToBlob(canvas, "image/jpeg", 0.82), canvas, quality: 0.82 };
}

function getAspectForTool(activeTool, settings) {
  if (activeTool === "passport") return passportPresets[settings.passportPreset]?.aspect || 35 / 45;
  if (activeTool !== "crop") return undefined;
  const ratioMap = { "1:1": 1, "4:5": 4 / 5, "16:9": 16 / 9 };
  return ratioMap[settings.ratio];
}

function isEditableTarget(target) {
  const tagName = target?.tagName?.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target?.isContentEditable;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTool, setActiveTool] = useState("resize");
  const [menuOpen, setMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState(presets.resize);
  const [imageMeta, setImageMeta] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedExamPreset, setSelectedExamPreset] = useState(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const inputRef = useRef(null);
  const imageUrlRef = useRef("");
  const resultUrlRef = useRef("");
  const resultBlobRef = useRef(null);

  const active = useMemo(() => tools.find((tool) => tool.id === activeTool), [activeTool]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setResult((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });
  }, [activeTool]);

  useEffect(() => {
    imageUrlRef.current = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    resultUrlRef.current = result?.url || "";
    resultBlobRef.current = result?.blob || null;
  }, [result]);

  useEffect(
    () => () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    },
    []
  );

  async function selectFile(nextFile) {
    if (!nextFile || !nextFile.type.startsWith("image/")) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    const nextUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setImageUrl(nextUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setResult(null);

    try {
      const image = await loadImage(nextUrl);
      setImageMeta({ width: image.naturalWidth, height: image.naturalHeight });
      setSettings((current) => {
        if (activeTool === "resize") {
          return { ...current, width: image.naturalWidth, height: image.naturalHeight };
        }
        return current;
      });
    } catch {
      setImageMeta(null);
    }
  }

  const downloadProcessedImage = useCallback(() => {
    const blob = resultBlobRef.current;
    const name = result?.name || "student-photo-tools-output.jpg";

    if (!blob) {
      inputRef.current?.click();
      return false;
    }

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = name;
    link.style.display = "none";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 30000);
    return true;
  }, [result?.name]);

  function applyExamPreset(preset) {
    setSelectedExamPreset(preset.id);
    const nextTool = preset.kind === "signature" ? "signature" : preset.kind === "passport" ? "passport" : "compress";
    setActiveTool(nextTool);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setSettings((current) => ({
      ...presets[nextTool],
      width: preset.width,
      height: preset.height,
      targetKb: preset.maxKb,
      format: "image/jpeg",
      whiteBackground: preset.kind === "signature" ? true : current.whiteBackground,
      passportPreset:
        preset.id === "2x2-inch-photo" ? "2x2in" : preset.id === "35x45-mm-photo" || preset.id === "passport-size-photo" ? "35x45mm" : current.passportPreset
    }));
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateSetting(key, value) {
    setSettings((current) => {
      const next = { ...current, [key]: value };

      if (activeTool === "resize" && current.maintainAspect && imageMeta && (key === "width" || key === "height")) {
        const ratio = imageMeta.width / imageMeta.height;
        if (key === "width" && Number(value) > 0) next.height = Math.round(Number(value) / ratio);
        if (key === "height" && Number(value) > 0) next.width = Math.round(Number(value) * ratio);
      }

      if (activeTool === "passport" && key === "passportPreset") {
        const preset = passportPresets[value];
        next.width = preset.width;
        next.height = preset.height;
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
      }

      return next;
    });
    setResult(null);
  }

  const processImage = useCallback(async ({ silent = false } = {}) => {
    if (!imageUrl || !file) {
      if (!silent) inputRef.current?.click();
      return;
    }

    if (!silent) setIsProcessing(true);
    try {
      const image = await loadImage(imageUrl);
      const nextSettings = { ...settings };

      if (activeTool === "jpgpng") nextSettings.format = "image/png";
      if (activeTool === "pngjpg" || activeTool === "compress") nextSettings.format = "image/jpeg";
      if (activeTool === "compress") nextSettings.preserveAspect = true;
      if (activeTool === "compress" && Number(nextSettings.width) > 0 && !Number(nextSettings.height)) {
        nextSettings.height = Math.round((image.naturalHeight / image.naturalWidth) * Number(nextSettings.width));
      }

      if (activeTool === "crop" && nextSettings.ratio === "free" && croppedAreaPixels) {
        nextSettings.width = Math.round(croppedAreaPixels.width);
        nextSettings.height = Math.round(croppedAreaPixels.height);
      }

      const needsCropCanvas = activeTool === "crop" || activeTool === "passport";
      const canvas = needsCropCanvas
        ? drawCroppedImageToCanvas(image, croppedAreaPixels, nextSettings)
        : drawImageToCanvas(image, nextSettings);
      const shouldCompressToTarget = Number(nextSettings.targetKb) > 0 && nextSettings.format === "image/jpeg";
      const compressionResult =
        shouldCompressToTarget ? await compressToTarget(canvas, Number(nextSettings.targetKb) * 1024) : null;
      const blob = compressionResult
        ? compressionResult.blob
        : await canvasToBlob(canvas, nextSettings.format, Number(nextSettings.quality || 0.92));
      const outputCanvas = compressionResult?.canvas || canvas;

      if (!blob) return;

      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      setResult({
        blob,
        file: new File([blob], `student-photo-tools-${activeTool}.${fileExt(nextSettings.format)}`, { type: blob.type || nextSettings.format }),
        url,
        size: blob.size,
        name: `student-photo-tools-${activeTool}.${fileExt(nextSettings.format)}`,
        width: outputCanvas.width,
        height: outputCanvas.height,
        type: nextSettings.format
      });
    } finally {
      if (!silent) setIsProcessing(false);
    }
  }, [activeTool, croppedAreaPixels, file, imageUrl, settings]);

  useEffect(() => {
    if (!file || !imageUrl) return;
    const timer = window.setTimeout(() => {
      processImage({ silent: true });
    }, activeTool === "compress" ? 650 : 300);

    return () => window.clearTimeout(timer);
  }, [activeTool, croppedAreaPixels, file, imageUrl, processImage, settings, zoom]);

  const onCropComplete = useCallback((_, nextCroppedAreaPixels) => {
    setCroppedAreaPixels(nextCroppedAreaPixels);
  }, []);

  function selectTool(toolId) {
    setSelectedExamPreset(null);
    setActiveTool(toolId);
    setSettings(presets[toolId]);
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (isEditableTarget(event.target)) return;

      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (!event.ctrlKey || event.altKey || event.metaKey) return;
      const key = event.key.toLowerCase();
      const toolShortcut = {
        r: "resize",
        c: "crop",
        k: "compress",
        p: "passport",
        s: "signature"
      };

      if (key === "u") {
        event.preventDefault();
        inputRef.current?.click();
        return;
      }

      if (key === "d") {
        event.preventDefault();
        downloadProcessedImage();
        return;
      }

      if (toolShortcut[key]) {
        event.preventDefault();
        selectTool(toolShortcut[key]);
        return;
      }

      if (kbShortcutPresets[event.key]) {
        event.preventDefault();
        selectTool("compress");
        setSettings((current) => ({ ...presets.compress, width: current.width || 0, height: current.height || 0, targetKb: kbShortcutPresets[event.key] }));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [downloadProcessedImage]);

  return (
    <div className="min-h-screen bg-white text-black transition-colors duration-500 dark:bg-black dark:text-white">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/82 backdrop-blur-2xl dark:border-white/10 dark:bg-black/78">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-black text-white shadow-lift dark:bg-white dark:text-black">
              <Sparkles className="size-5" />
            </span>
            <span className="text-base font-bold tracking-normal sm:text-lg">Student Photo Tools</span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {["Tools", "Exam", "FAQ"].map((item) => (
              <a
                key={item}
                href={item === "Exam" ? "#exam-photo-sizes" : `#${item.toLowerCase()}`}
                className="rounded-full px-4 py-2 text-sm font-medium text-black/68 transition hover:bg-black/5 hover:text-black dark:text-white/68 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Keyboard shortcuts (?)"
              onClick={() => setShortcutsOpen(true)}
              className="hidden size-10 place-items-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:scale-105 dark:border-white/10 dark:bg-white/10 dark:text-white sm:grid"
              aria-label="Open keyboard shortcuts"
            >
              <Keyboard className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              title="Toggle dark mode"
              className="grid size-10 place-items-center rounded-full border border-black/10 bg-white text-black shadow-sm transition hover:scale-105 dark:border-white/10 dark:bg-white/10 dark:text-white"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid size-10 place-items-center rounded-full border border-black/10 md:hidden dark:border-white/10"
              aria-label="Open menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="border-t border-black/10 px-4 py-3 md:hidden dark:border-white/10">
            <a href="#tools" className="block rounded-xl px-3 py-2 text-sm font-semibold" onClick={() => setMenuOpen(false)}>
              Tools
            </a>
            <a href="#exam-photo-sizes" className="block rounded-xl px-3 py-2 text-sm font-semibold" onClick={() => setMenuOpen(false)}>
              Exam
            </a>
            <a href="#faq" className="block rounded-xl px-3 py-2 text-sm font-semibold" onClick={() => setMenuOpen(false)}>
              FAQ
            </a>
          </div>
        )}
      </header>

      <main id="home">
        <section className="relative overflow-hidden border-b border-black/10 dark:border-white/10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/30 to-transparent dark:via-white/30" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-16">
            <div className="flex flex-col justify-center animate-floatIn">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-black/65 dark:border-white/10 dark:bg-white/10 dark:text-white/70">
                <ShieldCheck className="size-4" />
                Browser-based student utility
              </div>
              <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-normal sm:text-5xl lg:text-6xl">
                Resize, Crop & Compress Images for Government Forms
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-black/66 sm:text-lg dark:text-white/68">
                A polished image workspace for form photos, signatures, passport sizes, and JPG/PNG conversion with private on-device processing.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#workspace"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white shadow-premium transition hover:-translate-y-0.5 hover:shadow-lift dark:bg-white dark:text-black"
                >
                  Start editing <ChevronRight className="size-4" />
                </a>
                <a
                  href="#tools"
                  className="inline-flex items-center justify-center rounded-full border border-black/12 px-5 py-3 text-sm font-bold transition hover:bg-black/5 dark:border-white/14 dark:hover:bg-white/10"
                >
                  View all tools
                </a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center sm:max-w-lg">
                {["Private", "Fast", "Mobile"].map((label) => (
                  <div key={label} className="rounded-3xl border border-black/10 px-3 py-4 dark:border-white/10">
                    <Check className="mx-auto mb-2 size-4" />
                    <p className="text-sm font-semibold">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="workspace" className="animate-floatIn lg:pt-4" style={{ animationDelay: "90ms" }}>
              <Workspace
                active={active}
                activeTool={activeTool}
                crop={crop}
                file={file}
                imageUrl={imageUrl}
                inputRef={inputRef}
                isDragging={isDragging}
                isProcessing={isProcessing}
                result={result}
                selectFile={selectFile}
                setCrop={setCrop}
                setIsDragging={setIsDragging}
                setZoom={setZoom}
                settings={settings}
                zoom={zoom}
                onCropComplete={onCropComplete}
                updateSetting={updateSetting}
                processImage={processImage}
                downloadProcessedImage={downloadProcessedImage}
              />
            </div>
          </div>
        </section>

        <section id="tools" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">Tools</p>
              <h2 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">Everything forms ask for.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-black/58 dark:text-white/58">
              Choose a tool, upload once, tune exact dimensions or size, then download the processed file.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const selected = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    selectTool(tool.id);
                  }}
                  title={`${tool.title}${tool.id === "resize" ? " (Ctrl+R)" : tool.id === "crop" ? " (Ctrl+C)" : tool.id === "compress" ? " (Ctrl+K)" : tool.id === "passport" ? " (Ctrl+P)" : tool.id === "signature" ? " (Ctrl+S)" : ""}`}
                  className={`group min-h-40 rounded-[28px] border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
                    selected
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-black/10 bg-black/[0.025] hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:hover:bg-white/[0.09]"
                  }`}
                >
                  <span
                    className={`mb-5 grid size-11 place-items-center rounded-2xl ${
                      selected ? "bg-white/14 dark:bg-black/10" : "bg-white shadow-sm dark:bg-black"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="block text-base font-bold">{tool.title}</span>
                  <span className={`mt-2 block text-sm leading-6 ${selected ? "opacity-72" : "text-black/56 dark:text-white/58"}`}>
                    {tool.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <ExamPhotoSizes
          selectedExamPreset={selectedExamPreset}
          applyExamPreset={applyExamPreset}
        />

        <section id="faq" className="border-y border-black/10 bg-black/[0.025] px-4 py-12 dark:border-white/10 dark:bg-white/[0.045] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal">Built for exam and admission workflows.</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {faqs.map((item) => (
                <article key={item.question} className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black">
                  <h3 className="text-base font-bold">{item.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/62">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-black/58 dark:text-white/58 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-semibold text-black dark:text-white">Student Photo Tools</p>
        <p>Premium photo utilities for students, processed locally in your browser.</p>
      </footer>
      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
    </div>
  );
}

function ExamPhotoSizes({ selectedExamPreset, applyExamPreset }) {
  return (
    <section id="exam-photo-sizes" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">Exam Photo Sizes</p>
          <h2 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">One-click government presets.</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-black/58 dark:text-white/58">
          Pick a preset to fill dimensions and target file size, then upload or process your image.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {examPhotoPresets.map((preset) => {
          const selected = selectedExamPreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyExamPreset(preset)}
              title={`Apply ${preset.title}: ${preset.width} x ${preset.height}px, ${preset.minKb} KB to ${preset.maxKb} KB`}
              className={`group rounded-[28px] border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
                selected
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/10 bg-black/[0.025] hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:hover:bg-white/[0.09]"
              }`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className={`grid size-11 place-items-center rounded-2xl ${selected ? "bg-white/14 dark:bg-black/10" : "bg-white shadow-sm dark:bg-black"}`}>
                  {preset.kind === "signature" ? <Scissors className="size-5" /> : <Camera className="size-5" />}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${selected ? "bg-white/14 dark:bg-black/10" : "bg-black/[0.055] dark:bg-white/[0.08]"}`}>
                  JPG/JPEG
                </span>
              </div>
              <span className="block text-base font-bold">{preset.title}</span>
              <span className={`mt-3 block text-sm leading-6 ${selected ? "opacity-72" : "text-black/56 dark:text-white/58"}`}>
                {preset.width} x {preset.height}px
              </span>
              <span className={`mt-1 block text-sm font-bold ${selected ? "opacity-90" : "text-black/70 dark:text-white/72"}`}>
                {preset.minKb} KB to {preset.maxKb} KB
              </span>
              <span className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${selected ? "bg-white text-black dark:bg-black dark:text-white" : "bg-black text-white dark:bg-white dark:text-black"}`}>
                Auto preset
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ShortcutsModal({ onClose }) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-premium dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-black/10 p-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <Keyboard className="size-5" />
            </span>
            <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-black/10 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            aria-label="Close shortcuts"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="grid gap-2 p-5 sm:grid-cols-2">
          {shortcuts.map(([keys, label]) => (
            <div key={keys} className="flex items-center justify-between gap-4 rounded-2xl bg-black/[0.035] px-4 py-3 dark:bg-white/[0.07]">
              <span className="text-sm font-semibold text-black/68 dark:text-white/68">{label}</span>
              <kbd className="shrink-0 rounded-xl border border-black/10 bg-white px-3 py-1 text-xs font-bold dark:border-white/10 dark:bg-black">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Workspace({
  active,
  activeTool,
  crop,
  file,
  imageUrl,
  inputRef,
  isDragging,
  isProcessing,
  processImage,
  downloadProcessedImage,
  result,
  selectFile,
  setCrop,
  setIsDragging,
  setZoom,
  settings,
  zoom,
  onCropComplete,
  updateSetting
}) {
  const Icon = active.icon;
  const cropAspect = getAspectForTool(activeTool, settings);
  const showCropper = imageUrl && (activeTool === "crop" || activeTool === "passport");

  return (
    <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-premium dark:border-white/10 dark:bg-zinc-950">
      <div className="border-b border-black/10 p-4 dark:border-white/10 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{active.title}</p>
            <p className="truncate text-sm text-black/55 dark:text-white/55">{active.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[.95fr_1.05fr]">
        <div className="border-b border-black/10 p-4 dark:border-white/10 sm:p-5 lg:border-b-0 lg:border-r">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          <button
            type="button"
            title="Upload image (Ctrl+U)"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              selectFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex min-h-[280px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed p-5 text-center transition ${
              isDragging
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black/20 bg-black/[0.025] hover:bg-black/[0.045] dark:border-white/20 dark:bg-white/[0.055] dark:hover:bg-white/[0.08]"
            }`}
          >
            {imageUrl ? (
              <div className="w-full">
                <div className="checkerboard mx-auto flex aspect-[4/3] max-h-72 items-center justify-center overflow-hidden rounded-[24px] border border-black/10 bg-white dark:border-white/10 dark:bg-black">
                  {showCropper ? (
                    <div className="relative h-full min-h-[260px] w-full touch-none">
                      <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={cropAspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        showGrid={activeTool === "crop"}
                        objectFit="contain"
                      />
                    </div>
                  ) : (
                    <img src={imageUrl} alt="Selected preview" className="max-h-full max-w-full object-contain" />
                  )}
                </div>
                <p className="mt-4 truncate text-sm font-bold">{file.name}</p>
                <p className="mt-1 text-xs opacity-65">{formatBytes(file.size)}</p>
              </div>
            ) : (
              <>
                <span className="mb-5 grid size-16 place-items-center rounded-[24px] bg-white shadow-sm dark:bg-black">
                  <Upload className="size-7" />
                </span>
                <span className="text-xl font-bold">Drag & drop upload area</span>
                <span className="mt-2 max-w-xs text-sm leading-6 opacity-62">Tap to choose a JPG or PNG from your phone.</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <ToolControls
            activeTool={activeTool}
            settings={settings}
            updateSetting={updateSetting}
            zoom={zoom}
            setZoom={setZoom}
          />

          <button
            type="button"
            onClick={processImage}
            title={file ? "Process image" : "Upload image (Ctrl+U)"}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-bold text-white shadow-lift transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-black"
            disabled={isProcessing}
          >
            {isProcessing ? <Wand2 className="size-5 animate-spin" /> : <SlidersHorizontal className="size-5" />}
            {file ? "Process image" : "Upload image"}
          </button>

          <div className="mt-5 rounded-[28px] border border-black/10 p-4 dark:border-white/10">
            {result ? (
              <div>
                <div className="checkerboard flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] border border-black/10 bg-white dark:border-white/10 dark:bg-black">
                  <img src={result.url} alt="Processed preview" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Metric label="Size" value={formatBytes(result.size)} />
                  <Metric label="Width" value={`${result.width}px`} />
                  <Metric label="Height" value={`${result.height}px`} />
                </div>
                <button
                  type="button"
                  onClick={downloadProcessedImage}
                  title="Download processed image (Ctrl+D)"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-black/12 px-5 py-3 text-sm font-bold transition hover:bg-black/5 dark:border-white/14 dark:hover:bg-white/10"
                >
                  <Download className="size-5" />
                  Download
                </button>
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <BadgeCheck className="mb-4 size-9 text-black/42 dark:text-white/42" />
                <p className="text-sm font-bold">Processed preview appears here</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-black/55 dark:text-white/55">
                  Adjust the settings and process your selected image.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolControls({ activeTool, settings, updateSetting, zoom, setZoom }) {
  return (
    <div className="space-y-4">
      {(activeTool === "resize" || activeTool === "passport" || activeTool === "signature") && (
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Width" value={settings.width} onChange={(value) => updateSetting("width", value)} suffix="px" />
          <NumberField label="Height" value={settings.height} onChange={(value) => updateSetting("height", value)} suffix="px" />
        </div>
      )}

      {activeTool === "resize" && (
        <ToggleField
          label="Maintain aspect ratio"
          checked={settings.maintainAspect}
          onChange={(value) => updateSetting("maintainAspect", value)}
        />
      )}

      {activeTool === "compress" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Target size" value={settings.targetKb} onChange={(value) => updateSetting("targetKb", value)} suffix="KB" />
          <NumberField label="Max width" value={settings.width} onChange={(value) => updateSetting("width", value)} suffix="px" />
        </div>
      )}

      {activeTool !== "compress" && Number(settings.targetKb) > 0 && (
        <NumberField label="Target size" value={settings.targetKb} onChange={(value) => updateSetting("targetKb", value)} suffix="KB" />
      )}

      {activeTool === "crop" && (
        <>
          <SegmentedButtons
            label="Crop ratio"
            value={settings.ratio}
            options={[
              { value: "1:1", label: "1:1" },
              { value: "4:5", label: "4:5" },
              { value: "16:9", label: "16:9" },
              { value: "free", label: "Free" }
            ]}
            onChange={(value) => updateSetting("ratio", value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Output width" value={settings.width} onChange={(value) => updateSetting("width", value)} suffix="px" />
            <NumberField label="Output height" value={settings.height} onChange={(value) => updateSetting("height", value)} suffix="px" />
          </div>
        </>
      )}

      {activeTool === "passport" && (
        <SegmentedButtons
          label="Passport size"
          value={settings.passportPreset}
          options={Object.entries(passportPresets).map(([value, preset]) => ({ value, label: preset.label }))}
          onChange={(value) => updateSetting("passportPreset", value)}
        />
      )}

      {(activeTool === "crop" || activeTool === "passport") && (
        <RangeField label="Zoom" value={Math.round(zoom * 100)} min={100} max={400} onChange={(value) => setZoom(Number(value) / 100)} />
      )}

      {activeTool === "signature" && (
        <ToggleField
          label="White background"
          checked={settings.whiteBackground}
          onChange={(value) => updateSetting("whiteBackground", value)}
        />
      )}

      {(activeTool === "resize" || activeTool === "signature" || activeTool === "passport" || activeTool === "pngjpg") && (
        <RangeField
          label="JPG quality"
          value={Math.round((settings.quality || 0.9) * 100)}
          onChange={(value) => updateSetting("quality", Number(value) / 100)}
        />
      )}

      {(activeTool === "jpgpng" || activeTool === "pngjpg") && (
        <div className="rounded-[24px] border border-black/10 p-4 text-sm leading-6 text-black/60 dark:border-white/10 dark:text-white/62">
          {activeTool === "jpgpng" ? "Output will be saved as PNG." : "Transparent areas are filled with white for JPG output."}
        </div>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, suffix }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <span className="flex items-center rounded-2xl border border-black/10 bg-black/[0.025] px-3 py-2 dark:border-white/10 dark:bg-white/[0.06]">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent py-1 text-base font-semibold outline-none"
        />
        <span className="text-xs font-bold text-black/45 dark:text-white/45">{suffix}</span>
      </span>
    </label>
  );
}

function RangeField({ label, value, onChange, min = 35, max = 100 }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-bold">
        {label}
        <span>{value}%</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} className="w-full" />
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-[24px] border border-black/10 p-4 text-sm font-bold dark:border-white/10">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-black dark:accent-white"
      />
    </label>
  );
}

function SegmentedButtons({ label, value, options, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
              value === option.value
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/[0.035] px-2 py-3 dark:bg-white/[0.07]">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/45 dark:text-white/45">{label}</p>
      <p className="mt-1 break-words text-sm font-bold">{value}</p>
    </div>
  );
}

export default App;
