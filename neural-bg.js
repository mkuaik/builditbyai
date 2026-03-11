// ============================================
// Neural Network Animated Background
// Canvas-based, lightweight, mouse-interactive
// Disabled on mobile for battery preservation
// ============================================

(function () {
  'use strict';

  // Skip on mobile/tablets
  const isMobile = window.matchMedia('(max-width: 768px)').matches ||
    'ontouchstart' in window;
  if (isMobile) return;

  // --- Create Canvas ---
  const canvas = document.createElement('canvas');
  canvas.id = 'neuralBg';
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: -1; pointer-events: none;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;
  let mouse = { x: -9999, y: -9999 };
  let nodes = [];
  let pulses = [];
  let animId;

  // --- Config ---
  const CONFIG = {
    nodeCount: 60,
    connectionDist: 180,
    mouseRadius: 200,
    nodeSpeed: 0.3,
    pulseSpeed: 2.5,
    pulseInterval: 2000,  // ms between new pulses
    nodeRadius: 2.5,
  };

  // --- Resize ---
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // --- Initialize Nodes ---
  function initNodes() {
    nodes = [];
    for (let i = 0; i < CONFIG.nodeCount; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * CONFIG.nodeSpeed,
        vy: (Math.random() - 0.5) * CONFIG.nodeSpeed,
        baseRadius: CONFIG.nodeRadius + Math.random() * 1.5,
        radius: CONFIG.nodeRadius,
      });
    }
  }

  // --- Spawn Pulse ---
  function spawnPulse() {
    if (nodes.length < 2) return;
    const fromIdx = Math.floor(Math.random() * nodes.length);

    // Find a nearby connected node
    let closest = -1;
    let closestDist = Infinity;
    for (let j = 0; j < nodes.length; j++) {
      if (j === fromIdx) continue;
      const d = dist(nodes[fromIdx], nodes[j]);
      if (d < CONFIG.connectionDist && d < closestDist) {
        closestDist = d;
        closest = j;
      }
    }
    if (closest === -1) return;

    pulses.push({
      fromIdx,
      toIdx: closest,
      progress: 0, // 0 to 1
    });
  }

  // --- Distance ---
  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // --- Get Colors Based on Theme ---
  function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      node: isDark ? 'rgba(249, 115, 22, 0.35)' : 'rgba(249, 115, 22, 0.2)',
      line: isDark ? 'rgba(249, 115, 22, 0.08)' : 'rgba(200, 200, 210, 0.25)',
      pulse: isDark ? 'rgba(249, 115, 22, 0.9)' : 'rgba(249, 115, 22, 0.7)',
      glow: isDark ? 'rgba(249, 115, 22, 0.4)' : 'rgba(249, 115, 22, 0.3)',
    };
  }

  // --- Update ---
  function update() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // Bounce off edges
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      // Mouse interaction: gently push away
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < CONFIG.mouseRadius && d > 0) {
        const force = (CONFIG.mouseRadius - d) / CONFIG.mouseRadius * 0.015;
        n.vx += (dx / d) * force;
        n.vy += (dy / d) * force;
      }

      // Dampen velocity
      n.vx *= 0.999;
      n.vy *= 0.999;

      // Clamp
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));

      // Mouse proximity glow
      n.radius = d < CONFIG.mouseRadius
        ? n.baseRadius + (CONFIG.mouseRadius - d) / CONFIG.mouseRadius * 3
        : n.baseRadius;
    }

    // Update pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      pulses[i].progress += CONFIG.pulseSpeed / 100;
      if (pulses[i].progress >= 1) {
        pulses.splice(i, 1);
      }
    }
  }

  // --- Draw ---
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const colors = getColors();

    // Draw connections
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = dist(nodes[i], nodes[j]);
        if (d < CONFIG.connectionDist) {
          const alpha = 1 - d / CONFIG.connectionDist;
          ctx.strokeStyle = colors.line;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // Draw pulses (glowing dots traveling along connections)
    for (const pulse of pulses) {
      const from = nodes[pulse.fromIdx];
      const to = nodes[pulse.toIdx];
      if (!from || !to) continue;

      const px = from.x + (to.x - from.x) * pulse.progress;
      const py = from.y + (to.y - from.y) * pulse.progress;

      // Outer glow
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 12);
      grad.addColorStop(0, colors.glow);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright dot
      ctx.fillStyle = colors.pulse;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw nodes
    for (const n of nodes) {
      ctx.fillStyle = colors.node;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Animation Loop ---
  function animate() {
    update();
    draw();
    animId = requestAnimationFrame(animate);
  }

  // --- Mouse Tracking ---
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // --- Pulse Timer ---
  setInterval(spawnPulse, CONFIG.pulseInterval);

  // --- Visibility API: pause when tab hidden ---
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });

  // --- Init ---
  window.addEventListener('resize', () => {
    resize();
    // Re-distribute nodes that went out of bounds
    for (const n of nodes) {
      n.x = Math.min(n.x, W);
      n.y = Math.min(n.y, H);
    }
  });

  resize();
  initNodes();

  // Spawn a few initial pulses
  for (let i = 0; i < 5; i++) spawnPulse();

  animate();
})();
