(() => {
  'use strict';

  // ============================================================
  // CO D L Y   I N D I A  —  Cinematic Scroll Hero Engine
  // High-performance Canvas sequence with progressive preloading
  // ============================================================

  const TOTAL_FRAMES = 190;
  const NATIVE_WIDTH = 1920;
  const NATIVE_HEIGHT = 1080;
  const FRAME_BASE_PATH = 'assets/animations/hero/frame_';

  const formatFrameSrc = (index) => {
    return `${FRAME_BASE_PATH}${String(index).padStart(6, '0')}.png`;
  };

  // Elements
  const heroEl = document.querySelector('.cinematic-hero');
  const canvas = document.getElementById('hero-canvas');
  if (!heroEl || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const scene1 = document.querySelector('.cinematic-hero__scene.scene-1');
  const scene2 = document.querySelector('.cinematic-hero__scene.scene-2');
  const scrollIndicator = document.querySelector('.cinematic-hero__scroll-indicator');
  const bottomBlend = document.querySelector('.cinematic-hero__bottom-blend');
  const siteHeader = document.querySelector('.site-header');

  // Motion preference check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Frame Cache
  const frames = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let lastRenderedIndex = -1;
  let currentProgress = 0;
  let isTicking = false;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = 1;

  // Preload single image with promise
  const loadFrame = (index) => {
    if (frames[index]) return Promise.resolve(frames[index]);
    return new Promise((resolve) => {
      const img = new Image();
      img.src = formatFrameSrc(index);
      img.onload = () => {
        frames[index] = img;
        loadedCount++;
        // If this is frame 0, render immediately so there's zero initial delay
        if (index === 0 && lastRenderedIndex === -1) {
          renderFrame(0);
        }
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
    });
  };

  // Find nearest loaded frame to prevent any blank frames or flickering
  const getSafeFrame = (targetIndex) => {
    if (frames[targetIndex] && frames[targetIndex].complete && frames[targetIndex].naturalWidth > 0) {
      return frames[targetIndex];
    }
    // Search backward first
    for (let i = targetIndex - 1; i >= 0; i--) {
      if (frames[i] && frames[i].complete && frames[i].naturalWidth > 0) {
        return frames[i];
      }
    }
    // Search forward if not found backward
    for (let i = targetIndex + 1; i < TOTAL_FRAMES; i++) {
      if (frames[i] && frames[i].complete && frames[i].naturalWidth > 0) {
        return frames[i];
      }
    }
    return null;
  };

  // Responsive Canvas Sizing (preserving Retina crispness)
  const resizeCanvas = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;

    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);

    if (lastRenderedIndex >= 0) {
      renderFrame(lastRenderedIndex, true);
    }
  };

  // Render Frame with exact "object-fit: cover" centered geometry
  const renderFrame = (index, forceRedraw = false) => {
    if (!ctx || canvasWidth === 0 || canvasHeight === 0) return;
    if (index === lastRenderedIndex && !forceRedraw) return;

    const img = getSafeFrame(index);
    if (!img) return;

    const imgRatio = NATIVE_WIDTH / NATIVE_HEIGHT;
    const canvasRatio = canvasWidth / canvasHeight;

    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = canvasWidth;
      renderH = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - renderH) / 2;
    } else {
      renderH = canvasHeight;
      renderW = canvasHeight * imgRatio;
      offsetX = (canvasWidth - renderW) / 2;
      offsetY = 0;
    }

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    ctx.restore();

    lastRenderedIndex = index;
  };

  // Update Headline animations & Header state based on scroll progress
  const updateHeadlinesAndUI = (progress, heroRect) => {
    // Scene 1:
    // 0.00 -> 0.22 : visible at opacity 1
    // 0.22 -> 0.38 : smoothly fades out & floats up
    // > 0.38       : hidden
    if (scene1) {
      if (progress <= 0.22) {
        scene1.style.opacity = '1';
        scene1.style.transform = 'translateY(0)';
      } else if (progress < 0.38) {
        const factor = (progress - 0.22) / (0.38 - 0.22);
        scene1.style.opacity = String(Math.max(0, 1 - factor));
        scene1.style.transform = `translateY(${-factor * 32}px)`;
      } else {
        scene1.style.opacity = '0';
        scene1.style.transform = 'translateY(-32px)';
      }
    }

    // Scene 2:
    // < 0.40       : hidden
    // 0.40 -> 0.54 : smoothly fades in & rises from below
    // 0.54 -> 0.82 : peak visibility (opacity 1)
    // 0.82 -> 0.98 : gently fades out as section transitions
    // >= 0.98      : hidden
    if (scene2) {
      if (progress < 0.40) {
        scene2.style.opacity = '0';
        scene2.style.transform = 'translateY(32px)';
      } else if (progress < 0.54) {
        const factor = (progress - 0.40) / (0.54 - 0.40);
        scene2.style.opacity = String(factor);
        scene2.style.transform = `translateY(${32 - factor * 32}px)`;
      } else if (progress <= 0.82) {
        scene2.style.opacity = '1';
        scene2.style.transform = 'translateY(0)';
      } else if (progress < 0.98) {
        const factor = (progress - 0.82) / (0.98 - 0.82);
        scene2.style.opacity = String(Math.max(0, 1 - factor));
        scene2.style.transform = `translateY(${-factor * 28}px)`;
      } else {
        scene2.style.opacity = '0';
        scene2.style.transform = 'translateY(-28px)';
      }
    }

    // Scroll Indicator: fades out as soon as user begins scrolling
    if (scrollIndicator) {
      scrollIndicator.classList.toggle('is-hidden', progress > 0.04);
    }

    // Bottom Blend: softens transition into the next light section
    if (bottomBlend) {
      if (progress > 0.85) {
        const blendFactor = (progress - 0.85) / 0.15;
        bottomBlend.style.opacity = String(Math.min(1, blendFactor));
      } else {
        bottomBlend.style.opacity = '0';
      }
    }

    // Dynamic Site Header Styling: frosted dark glass when over the hero
    if (siteHeader) {
      const isOver = heroRect.top <= 0 && heroRect.bottom > 90;
      siteHeader.classList.toggle('is-over-hero', isOver);
    }
  };

  // Scroll Tick calculation
  const onScroll = () => {
    if (prefersReducedMotion) return;

    const heroRect = heroEl.getBoundingClientRect();
    const scrollDistance = heroEl.offsetHeight - window.innerHeight;

    if (scrollDistance <= 0) return;

    let progress = -heroRect.top / scrollDistance;
    progress = Math.min(1, Math.max(0, progress));
    currentProgress = progress;

    const targetFrameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
    );

    renderFrame(targetFrameIndex);
    updateHeadlinesAndUI(progress, heroRect);
  };

  const requestTick = () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        onScroll();
        isTicking = false;
      });
      isTicking = true;
    }
  };

  // Progressive Preloading Strategy:
  // 1. Immediately load frame 0
  // 2. Preload frames 1-20 in high priority
  // 3. Preload remainder in background batches
  const initPreloading = async () => {
    // 1. First frame
    await loadFrame(0);

    if (prefersReducedMotion) {
      renderFrame(0);
      return;
    }

    // 2. Initial batch (nearby frames for instant smooth responsiveness)
    const initialBatch = [];
    for (let i = 1; i <= Math.min(24, TOTAL_FRAMES - 1); i++) {
      initialBatch.push(loadFrame(i));
    }
    await Promise.all(initialBatch);

    // 3. Background progressive loading in batches of 6
    const batchSize = 6;
    let nextIndex = 25;

    const loadNextBatch = () => {
      if (nextIndex >= TOTAL_FRAMES) return;
      const batch = [];
      const end = Math.min(nextIndex + batchSize, TOTAL_FRAMES);
      for (let i = nextIndex; i < end; i++) {
        batch.push(loadFrame(i));
      }
      nextIndex = end;
      Promise.all(batch).then(() => {
        // Yield to browser main thread
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadNextBatch, { timeout: 300 });
        } else {
          setTimeout(loadNextBatch, 50);
        }
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadNextBatch, { timeout: 300 });
    } else {
      setTimeout(loadNextBatch, 80);
    }
  };

  // Initialization
  window.addEventListener('resize', () => {
    resizeCanvas();
    requestTick();
  }, { passive: true });

  window.addEventListener('scroll', requestTick, { passive: true });

  // Boot sequence
  resizeCanvas();
  initPreloading();
  requestTick();
})();
