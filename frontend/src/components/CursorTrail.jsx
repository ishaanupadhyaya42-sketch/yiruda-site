import { useEffect, useRef } from "react";

/**
 * Cursor effect:
 *  - DEFAULT (no mouse press): a subtle ink dot follows the cursor (small, soft).
 *  - WHILE PRESSING (mousedown held): a bleeding sumi-e brushstroke trails behind
 *    the cursor — same canvas-based bezier ink we had before.
 */
export default function CursorTrail() {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const rafRef = useRef(null);
  const dotRef = useRef({ x: -50, y: -50, tx: -50, ty: -50, visible: false });
  const pressingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    let lastX = 0, lastY = 0, lastTime = performance.now();

    const onMove = (e) => {
      const cx = e.clientX, cy = e.clientY;
      dotRef.current.tx = cx;
      dotRef.current.ty = cy;
      dotRef.current.visible = true;

      if (pressingRef.current) {
        const now = performance.now();
        const dt = Math.max(1, now - lastTime);
        const dx = cx - lastX;
        const dy = cy - lastY;
        const speed = Math.min(40, Math.hypot(dx, dy) / dt * 16);
        const width = Math.max(0.8, 5.5 - speed * 0.08);
        pointsRef.current.push({
          x: cx, y: cy, w: width, life: 1, born: now,
        });
        if (pointsRef.current.length > 200) pointsRef.current.shift();
        lastX = cx; lastY = cy; lastTime = now;
      } else {
        lastX = cx; lastY = cy; lastTime = performance.now();
      }
    };

    const onTouch = (e) => {
      if (e.touches && e.touches[0]) {
        onMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      }
    };

    const onDown = (e) => {
      pressingRef.current = true;
      lastX = e.clientX ?? lastX;
      lastY = e.clientY ?? lastY;
      lastTime = performance.now();
    };
    const onUp = () => { pressingRef.current = false; };
    const onLeave = () => { dotRef.current.visible = false; };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();

      // ---- BRUSH TRAIL (while pressing) ----
      const pts = pointsRef.current;
      for (let i = 0; i < pts.length; i++) {
        const age = (now - pts[i].born) / 1000;
        pts[i].life = Math.max(0, 1 - age / 1.6);
      }
      pointsRef.current = pts.filter((p) => p.life > 0.01);
      const arr = pointsRef.current;
      for (let i = 1; i < arr.length - 1; i++) {
        const p0 = arr[i - 1];
        const p1 = arr[i];
        const p2 = arr[i + 1];
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2;
        const alpha = p1.life * 0.6;
        ctx.strokeStyle = `rgba(15, 14, 14, ${alpha})`;
        ctx.lineWidth = p1.w * p1.life;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(p1.x, p1.y, cx, cy);
        ctx.stroke();
        if (i % 6 === 0) {
          ctx.fillStyle = `rgba(15, 14, 14, ${alpha * 0.18})`;
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, p1.w * 1.8 * p1.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- SUBTLE DOT (always — lerps toward cursor) ----
      const d = dotRef.current;
      if (d.visible) {
        // eased follow
        d.x += (d.tx - d.x) * 0.18;
        d.y += (d.ty - d.y) * 0.18;
        const pressing = pressingRef.current;
        const r = pressing ? 3 : 4.5;
        // soft outer halo
        ctx.beginPath();
        ctx.fillStyle = pressing
          ? "rgba(158, 27, 27, 0.10)"
          : "rgba(15, 14, 14, 0.07)";
        ctx.arc(d.x, d.y, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        // inner ink dot
        ctx.beginPath();
        ctx.fillStyle = pressing
          ? "rgba(158, 27, 27, 0.55)"
          : "rgba(15, 14, 14, 0.35)";
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchstart", (e) => { pressingRef.current = true; onTouch(e); }, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onUp);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas id="ink-cursor-canvas" ref={canvasRef} data-testid="ink-cursor-canvas" />;
}
