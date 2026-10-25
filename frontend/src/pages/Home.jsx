import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../components/Button.jsx';
import { SERVICES, PROJECT_TYPES } from '../data/services.js';

gsap.registerPlugin(ScrollTrigger);

function scrollToServices() {
  const el = document.getElementById('services');
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ */
/*  Camera shots (position + look-at target)                           */
/* ------------------------------------------------------------------ */
const SHOTS = {
  wide: { px: 2.7, py: 2.05, pz: 1.9, tx: -0.35, ty: 1.15, tz: -2.2 },
  diary: { px: 0.86, py: 1.55, pz: -1.45, tx: 0.78, ty: 0.78, tz: -1.92 },
  mid: { px: 1.6, py: 1.9, pz: 0.4, tx: 0.2, ty: 1.4, tz: -2.6 },
  wall: { px: 0.45, py: 1.85, pz: -1.55, tx: 0.45, ty: 1.85, tz: -3 },
};

// Muted, paper-like sticky note tones (less candy, more real)
const NOTE_COLORS = ['#e8d48f', '#e2b3a8', '#b9cbb0', '#a9bccb', '#e3bf96', '#c9bfb2'];

/* ------------------------------------------------------------------ */
/*  Canvas texture helpers                                             */
/* ------------------------------------------------------------------ */
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

function noise(g, w, h, amount, alpha) {
  for (let i = 0; i < amount; i++) {
    const v = Math.random() > 0.5 ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function woodTexture(base = '#5a3b26', repeat = [1, 1]) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * h;
      g.strokeStyle = `rgba(${Math.random() > 0.5 ? '30,18,10' : '140,100,70'},${0.08 + Math.random() * 0.18})`;
      g.lineWidth = 0.5 + Math.random() * 2.5;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 4);
      g.stroke();
    }
    noise(g, w, h, 4000, 0.05);
  }, repeat);
}

function floorTexture() {
  return canvasTex(1024, 1024, (g, w, h) => {
    const planks = 8;
    for (let i = 0; i < planks; i++) {
      const tone = 48 + Math.random() * 18;
      g.fillStyle = `rgb(${tone + 22},${tone + 6},${tone - 10})`;
      g.fillRect(0, (i * h) / planks, w, h / planks);
      for (let k = 0; k < 14; k++) {
        const y = (i * h) / planks + Math.random() * (h / planks);
        g.strokeStyle = `rgba(20,12,6,${0.08 + Math.random() * 0.12})`;
        g.lineWidth = 1 + Math.random() * 2;
        g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y); g.stroke();
      }
      g.fillStyle = 'rgba(10,6,3,0.6)'; g.fillRect(0, (i * h) / planks, w, 3);
      const seam = Math.random() * w;
      g.fillRect(seam, (i * h) / planks, 3, h / planks);
    }
    noise(g, w, h, 12000, 0.05);
  }, [3, 3]);
}

function plasterTexture(base) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const r = g.createRadialGradient(Math.random() * w, Math.random() * h, 0, Math.random() * w, Math.random() * h, 120);
      r.addColorStop(0, 'rgba(0,0,0,0.05)'); r.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    }
    noise(g, w, h, 18000, 0.06);
  }, [4, 2]);
}

function fabricTexture(base) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 2) { g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(x, 0, 1, h); }
    noise(g, w, h, 3000, 0.08);
  }, [3, 3]);
}

function rugTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#5b3a33'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8a6a4a'; g.lineWidth = 10;
    [220, 170, 120].forEach((r) => { g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.stroke(); });
    g.strokeStyle = '#2e2420'; g.lineWidth = 4;
    [240, 195, 145].forEach((r) => { g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.stroke(); });
    noise(g, w, h, 20000, 0.12);
  });
}

function skyTexture() {
  return canvasTex(1024, 1024, (g) => {
    // overcast, rainy dusk city
    const grad = g.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#1a2230');
    grad.addColorStop(0.5, '#34404f');
    grad.addColorStop(0.85, '#7a6a62');
    grad.addColorStop(1, '#a5806a');
    g.fillStyle = grad; g.fillRect(0, 0, 1024, 1024);
    // soft clouds
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 1024, y = Math.random() * 500, r = 80 + Math.random() * 160;
      const c = g.createRadialGradient(x, y, 0, x, y, r);
      c.addColorStop(0, 'rgba(200,205,215,0.08)'); c.addColorStop(1, 'rgba(200,205,215,0)');
      g.fillStyle = c; g.fillRect(0, 0, 1024, 1024);
    }
    // far skyline (hazy)
    const layer = (col, minH, maxH, winA) => {
      let x = 0;
      while (x < 1024) {
        const w = 40 + Math.random() * 90, h = minH + Math.random() * (maxH - minH);
        g.fillStyle = col; g.fillRect(x, 1024 - h, w, h);
        for (let wy = 1024 - h + 14; wy < 1010; wy += 22)
          for (let wx = x + 8; wx < x + w - 8; wx += 16)
            if (Math.random() > 0.65) {
              g.fillStyle = `rgba(255,${190 + Math.random() * 40},${120 + Math.random() * 60},${winA})`;
              g.fillRect(wx, wy, 6, 9); g.fillStyle = col;
            }
        x += w + 2;
      }
    };
    layer('#3b4250', 200, 420, 0.35);
    layer('#1e232c', 120, 300, 0.75);
    // atmospheric haze
    const haze = g.createLinearGradient(0, 600, 0, 1024);
    haze.addColorStop(0, 'rgba(160,140,130,0)'); haze.addColorStop(1, 'rgba(160,140,130,0.25)');
    g.fillStyle = haze; g.fillRect(0, 600, 1024, 424);
  });
}

function scribbleTexture(color) {
  return canvasTex(256, 256, (g) => {
    g.fillStyle = color; g.fillRect(0, 0, 256, 256);
    g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, 0, 256, 28);
    noise(g, 256, 256, 2500, 0.06);
    g.strokeStyle = 'rgba(35,35,45,0.7)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let y = 72; y < 232; y += 34) {
      g.beginPath(); g.moveTo(28, y);
      for (let x = 28; x < 190 + Math.random() * 30; x += 8) g.lineTo(x, y + Math.sin(x * 0.3) * 3);
      g.stroke();
    }
  });
}

function posterTexture() {
  return canvasTex(512, 720, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2b3a44'); grad.addColorStop(1, '#c48a63');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(240,220,190,0.85)'; g.beginPath(); g.arc(w / 2, h * 0.42, 90, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1c242b';
    g.beginPath(); g.moveTo(0, h * 0.7); g.lineTo(w * 0.3, h * 0.55); g.lineTo(w * 0.55, h * 0.68); g.lineTo(w * 0.8, h * 0.5); g.lineTo(w, h * 0.62); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = 'rgba(240,225,200,0.8)'; g.font = '28px serif'; g.textAlign = 'center';
    g.fillText('slow mornings', w / 2, h - 40);
    noise(g, w, h, 8000, 0.08);
  });
}

function softDot() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ------------------------------------------------------------------ */
/*  Build the lofi room                                                */
/* ------------------------------------------------------------------ */
function buildRoom(scene) {
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
  const box = (w, h, d, m, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh); return mesh;
  };
  const add = (geo, m, x, y, z) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh); return mesh;
  };
  const anim = {};

  // Room shell — warm plaster walls, real wood floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.7 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallM = new THREE.MeshStandardMaterial({ map: plasterTexture('#8f8172'), roughness: 0.95 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallM);
  back.position.set(0, 3, -3); back.receiveShadow = true; scene.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), new THREE.MeshStandardMaterial({ map: plasterTexture('#7d7064'), roughness: 0.95 }));
  left.rotation.y = Math.PI / 2; left.position.set(-3.6, 3, 0); left.receiveShadow = true; scene.add(left);
  // baseboard
  box(14, 0.12, 0.03, mat('#3a2c22'), 0, 0.06, -2.985);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 1 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.005, -1.2); rug.receiveShadow = true; scene.add(rug);

  // Window (beside desk)
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.5), new THREE.MeshBasicMaterial({ map: skyTexture() }));
  sky.position.set(-2.1, 1.85, -2.985); scene.add(sky);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.5), new THREE.MeshPhysicalMaterial({ color: '#9fb0c0', transparent: true, opacity: 0.12, roughness: 0.1, metalness: 0 }));
  glass.position.set(-2.1, 1.85, -2.975); scene.add(glass);
  const frameM = new THREE.MeshStandardMaterial({ map: woodTexture('#c9b9a2'), roughness: 0.7 });
  box(1.75, 0.07, 0.08, frameM, -2.1, 2.63, -2.96);
  box(1.75, 0.07, 0.08, frameM, -2.1, 1.07, -2.96);
  box(0.07, 1.6, 0.08, frameM, -2.95, 1.85, -2.96);
  box(0.07, 1.6, 0.08, frameM, -1.25, 1.85, -2.96);
  box(0.04, 1.5, 0.05, frameM, -2.1, 1.85, -2.95);
  box(1.6, 0.04, 0.05, frameM, -2.1, 1.85, -2.95);
  box(1.9, 0.06, 0.25, frameM, -2.1, 1.03, -2.88); // sill
  // terracotta pot + leafy plant
  add(new THREE.CylinderGeometry(0.1, 0.075, 0.18, 24), mat('#9c5a3c', { roughness: 0.95 }), -1.6, 1.15, -2.88);
  add(new THREE.CylinderGeometry(0.09, 0.09, 0.01, 24), mat('#2b1d14'), -1.6, 1.235, -2.88);
  const leafM = mat('#3f5e3a', { roughness: 0.6, side: THREE.DoubleSide });
  for (let i = 0; i < 14; i++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.22), leafM);
    const a = (i / 14) * Math.PI * 2;
    leaf.position.set(-1.6 + Math.cos(a) * 0.05, 1.33 + (i % 3) * 0.04, -2.88 + Math.sin(a) * 0.05);
    leaf.rotation.set(-0.4 + Math.random() * 0.3, a, Math.cos(a) * 0.5);
    leaf.castShadow = true; scene.add(leaf);
  }
  // rain on glass
  const rainCount = 220;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 6);
  for (let i = 0; i < rainCount; i++) {
    const x = -2.85 + Math.random() * 1.5, y = 1.12 + Math.random() * 1.45, z = -2.97;
    rainPos.set([x, y, z, x - 0.01, y - 0.06, z], i * 6);
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: '#c8d2dc', transparent: true, opacity: 0.3 }));
  scene.add(rain);
  anim.rain = rainGeo;

  // Desk — walnut top with grain
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture('#5a3b26', [2, 1]), roughness: 0.55 });
  box(2.6, 0.06, 1.05, wood, 0, 0.75, -2.15);
  [[-1.2, -1.75], [1.2, -1.75], [-1.2, -2.55], [1.2, -2.55]].forEach(([x, z]) => box(0.05, 0.75, 0.05, mat('#2a2420', { metalness: 0.6, roughness: 0.4 }), x, 0.375, z));

  // Laptop (screen faces the coder, toward +z)
  const shell = mat('#9fa3aa', { metalness: 0.8, roughness: 0.35 });
  box(0.72, 0.02, 0.48, shell, 0, 0.79, -2.15);
  box(0.6, 0.002, 0.22, mat('#1d1f22', { roughness: 0.6 }), 0, 0.801, -2.2); // keyboard
  const lid = new THREE.Group();
  lid.position.set(0, 0.81, -2.39); lid.rotation.x = -0.25; scene.add(lid);
  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.46, 0.015), shell);
  lidMesh.position.y = 0.23; lidMesh.castShadow = true; lid.add(lidMesh);
  const codeCanvas = document.createElement('canvas');
  codeCanvas.width = 512; codeCanvas.height = 320;
  const codeTex = new THREE.CanvasTexture(codeCanvas);
  codeTex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.42), new THREE.MeshBasicMaterial({ map: codeTex }));
  screen.position.set(0, 0.23, 0.009); lid.add(screen);
  const screenLight = new THREE.PointLight('#9cc4e8', 0.9, 2.2);
  screenLight.position.set(0, 1.05, -2.0); scene.add(screenLight);
  anim.code = { canvas: codeCanvas, tex: codeTex, lines: [], t: 0 };

  // Ceramic mug + steam
  const mugM = mat('#d8cfc0', { roughness: 0.35 });
  const mug = add(new THREE.CylinderGeometry(0.065, 0.058, 0.15, 32, 1, true), mugM, -0.75, 0.86, -1.95);
  mugM.side = THREE.DoubleSide;
  add(new THREE.CircleGeometry(0.058, 32), mugM, -0.75, 0.786, -1.95).rotation.x = -Math.PI / 2;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.062, 32), mat('#24140c', { roughness: 0.15 }));
  coffee.rotation.x = -Math.PI / 2; coffee.position.set(-0.75, 0.915, -1.95); scene.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 12, 24), mugM);
  handle.position.set(-0.82, 0.86, -1.95); scene.add(handle);
  void mug;
  const dot = softDot();
  anim.steam = Array.from({ length: 6 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, transparent: true, depthWrite: false }));
    s.position.set(-0.75, 0.95, -1.95); s.userData.offset = i / 6; scene.add(s); return s;
  });

  // Diary (open, leather) + pen
  box(0.5, 0.02, 0.34, mat('#4a2a22', { roughness: 0.7 }), 0.78, 0.795, -1.92);
  const paper = new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (g) => { g.fillStyle = '#e9dfc8'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(80,100,130,0.25)'; for (let y = 20; y < 256; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); } noise(g, 256, 256, 2000, 0.05); }), roughness: 0.95 });
  const lp = box(0.23, 0.015, 0.31, paper, 0.665, 0.81, -1.92); lp.rotation.z = 0.04;
  const rp = box(0.23, 0.015, 0.31, paper, 0.895, 0.81, -1.92); rp.rotation.z = -0.04;
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.15, 12), mat('#1a1a1f', { metalness: 0.5, roughness: 0.3 }));
  pen.rotation.set(Math.PI / 2, 0, 0.6); pen.position.set(1.1, 0.8, -1.9); pen.castShadow = true; scene.add(pen);
  // stack of books on desk
  ['#3d4a3f', '#6b4a35', '#2f3640'].forEach((c, i) => {
    const b = box(0.32, 0.05, 0.22, mat(c, { roughness: 0.8 }), -1.0, 0.805 + i * 0.05, -2.4);
    b.rotation.y = (i - 1) * 0.12;
  });

  // Desk lamp (brushed brass)
  const lampM = mat('#9a7a45', { metalness: 0.75, roughness: 0.35 });
  add(new THREE.CylinderGeometry(0.08, 0.09, 0.02, 32), lampM, 1.05, 0.79, -2.45);
  const arm = add(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 12), lampM, 1.05, 1.05, -2.45); arm.rotation.z = 0.25;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.16, 32, 1, true), mat('#2b2a28', { metalness: 0.4, roughness: 0.5, side: THREE.DoubleSide }));
  shade.position.set(0.95, 1.3, -2.4); shade.rotation.z = 0.7; shade.castShadow = true; scene.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), new THREE.MeshBasicMaterial({ color: '#ffd9a0' }));
  bulb.position.set(0.92, 1.25, -2.38); scene.add(bulb);
  const lamp = new THREE.PointLight('#ffb26b', 3.2, 4.5, 1.7);
  lamp.position.set(0.9, 1.22, -2.35); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.002;
  scene.add(lamp);

  // Chair — fabric seat, metal base
  const chairM = new THREE.MeshStandardMaterial({ map: fabricTexture('#3b3633'), roughness: 1 });
  const seat = add(new RoundedBox(0.6, 0.08, 0.55), chairM, 0, 0.5, -1.05);
  void seat;
  add(new RoundedBox(0.58, 0.72, 0.08), chairM, 0, 0.92, -0.74).rotation.x = -0.08;
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 16), mat('#1e1e1e', { metalness: 0.7, roughness: 0.3 }), 0, 0.25, -1.05);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = add(new THREE.BoxGeometry(0.3, 0.025, 0.04), mat('#1e1e1e', { metalness: 0.7, roughness: 0.3 }), Math.cos(a) * 0.14, 0.05, -1.05 + Math.sin(a) * 0.14);
    leg.rotation.y = -a;
  }

  // The coder — more human proportions, oversized knit hoodie, beanie, headphones
  const hoodie = new THREE.MeshStandardMaterial({ map: fabricTexture('#5d6b62'), roughness: 1 });
  const pants = new THREE.MeshStandardMaterial({ map: fabricTexture('#2c2f36'), roughness: 1 });
  const skin = mat('#b98a6c', { roughness: 0.6 });
  const hairM = mat('#1b1411', { roughness: 0.9 });
  const body = new THREE.Group(); body.position.set(0, 0.55, -1.05); scene.add(body);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.3, 8, 24), hoodie);
  torso.scale.set(1.25, 1, 0.8);
  torso.position.y = 0.36; torso.rotation.x = 0.14; torso.castShadow = true; body.add(torso);
  // hood bunched behind the neck
  const hood = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 12, 24), hoodie);
  hood.position.set(0, 0.62, 0.05); hood.rotation.x = Math.PI / 2.4; body.add(hood);
  // thighs + shins
  [-1, 1].forEach((side) => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.32, 6, 12), pants);
    thigh.rotation.x = Math.PI / 2; thigh.position.set(side * 0.1, 0.0, -0.2); thigh.castShadow = true; body.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.34, 6, 12), pants);
    shin.position.set(side * 0.1, -0.24, -0.42); shin.castShadow = true; body.add(shin);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.22), mat('#d9d4cc', { roughness: 0.7 }));
    shoe.position.set(side * 0.1, -0.5, -0.47); shoe.castShadow = true; body.add(shoe);
  });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 16), skin);
  neck.position.set(0, 0.66, -0.03); body.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.8, -0.05); body.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.105, 32, 32), skin);
  skull.scale.set(0.92, 1.1, 1); skull.castShadow = true; head.add(skull);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.112, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62), hairM);
  hair.scale.set(0.95, 1.1, 1.05); hair.rotation.x = 0.5; head.add(hair);
  const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.118, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.42), new THREE.MeshStandardMaterial({ map: fabricTexture('#7a3e33'), roughness: 1 }));
  beanie.scale.set(0.95, 1.15, 1.05); beanie.rotation.x = 0.3; beanie.position.y = 0.01; head.add(beanie);
  const phones = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.01, 12, 32, Math.PI), mat('#141414', { roughness: 0.4, metalness: 0.3 }));
  phones.rotation.y = Math.PI / 2; head.add(phones);
  [-0.11, 0.11].forEach((x) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 24), mat('#1c1c1c', { roughness: 0.5 }));
    cup.rotation.z = Math.PI / 2; cup.position.x = x; head.add(cup);
  });
  anim.arms = [-1, 1].map((side) => {
    const shoulder = new THREE.Group(); shoulder.position.set(side * 0.2, 0.55, -0.05); body.add(shoulder);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 6, 12), hoodie);
    upper.rotation.x = 1.1; upper.position.set(0, -0.08, -0.12); upper.castShadow = true; shoulder.add(upper);
    const elbow = new THREE.Group(); elbow.position.set(-side * 0.02, -0.16, -0.22); shoulder.add(elbow);
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 6, 12), hoodie);
    fore.rotation.x = Math.PI / 2; fore.position.z = -0.14; fore.castShadow = true; elbow.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 16), skin);
    hand.scale.set(1, 0.6, 1.3); hand.position.z = -0.29; elbow.add(hand);
    elbow.rotation.y = side * 0.25;
    return { elbow, side };
  });
  anim.head = head;

  // Sticky notes on the wall behind the laptop
  for (let i = 0; i < 12; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const note = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshStandardMaterial({ map: scribbleTexture(NOTE_COLORS[i % NOTE_COLORS.length]), roughness: 0.95 }));
    note.position.set(0.05 + col * 0.26 + (Math.random() - 0.5) * 0.04, 2.2 - row * 0.26, -2.99 + i * 0.0005);
    note.rotation.z = (Math.random() - 0.5) * 0.3; note.receiveShadow = true; scene.add(note);
  }
  // framed print & shelf
  box(0.6, 0.8, 0.03, mat('#2a211b', { roughness: 0.6 }), 1.9, 2.0, -2.98);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.72), new THREE.MeshStandardMaterial({ map: posterTexture(), roughness: 0.9 }));
  poster.position.set(1.9, 2.0, -2.96); scene.add(poster);
  box(1.0, 0.04, 0.22, wood, -0.6, 2.35, -2.89);
  ['#3d4a3f', '#8a6a4a', '#5a2f2a', '#2f3640'].forEach((c, i) => box(0.06, 0.24 - i * 0.02, 0.17, mat(c), -0.95 + i * 0.08, 2.49 - i * 0.01, -2.89));
  // small vinyl player on the shelf
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.008, 32), mat('#0e0e0e', { roughness: 0.25 }), -0.35, 2.38, -2.88);
  // fairy-light string along the top of the back wall
  const bulbM = new THREE.MeshBasicMaterial({ color: '#ffcf8a' });
  for (let i = 0; i < 22; i++) {
    const x = -3.2 + i * 0.3;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), bulbM);
    b.position.set(x, 2.85 - Math.sin((i % 6) / 6 * Math.PI) * 0.12, -2.95); scene.add(b);
  }

  // Lights — warm lamp vs cool rainy window, low ambient
  scene.add(new THREE.AmbientLight('#6f6a78', 0.35));
  const moon = new THREE.DirectionalLight('#8fa6c2', 0.55);
  moon.position.set(-3, 3, -1); moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); scene.add(moon);
  const hemi = new THREE.HemisphereLight('#e8c9a8', '#1c1714', 0.3); scene.add(hemi);
  const fill = new THREE.PointLight('#ffb070', 0.6, 6, 2); fill.position.set(-0.5, 2.6, -2.5); scene.add(fill);

  return anim;
}

// simple rounded box via BoxGeometry (keeps deps zero)
function RoundedBox(w, h, d) { return new THREE.BoxGeometry(w, h, d, 2, 2, 2); }

function drawCode(code, dt) {
  code.t += dt;
  if (code.t < 0.18) return;
  code.t = 0;
  const palette = ['#d98c7a', '#d9b77a', '#8fb3c9', '#9fbf9a', '#b8a9c9'];
  const last = code.lines[code.lines.length - 1];
  if (!last || last.w >= last.max) {
    code.lines.push({ indent: Math.floor(Math.random() * 3) * 22, w: 0, max: 60 + Math.random() * 260, color: palette[Math.floor(Math.random() * palette.length)] });
    if (code.lines.length > 15) code.lines.shift();
  } else last.w += 20 + Math.random() * 30;
  const g = code.canvas.getContext('2d');
  g.fillStyle = '#16181c'; g.fillRect(0, 0, 512, 320);
  g.fillStyle = '#22252b'; g.fillRect(0, 0, 512, 22);
  ['#c46a5e', '#c9a35a', '#6f9c74'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(14 + i * 16, 11, 5, 0, 7); g.fill(); });
  code.lines.forEach((l, i) => {
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(10, 34 + i * 19, 14, 9);
    g.fillStyle = l.color; g.fillRect(36 + l.indent, 34 + i * 19, Math.min(l.w, l.max), 9);
  });
  code.tex.needsUpdate = true;
}

/* ------------------------------------------------------------------ */
/*  Styles (scoped to .lofi-home)                                      */
/* ------------------------------------------------------------------ */
const CSS = `
.lofi-home{--lofi-ink:#2a2622;--lofi-paper:#ece2cc;--lofi-night:#14120f;--lofi-glow:#e9a866;--lofi-rose:#c98a73}
/* Hide the site navbar once the user starts scrolling */
body.lofi-nav-hidden header,body.lofi-nav-hidden nav,body.lofi-nav-hidden .navbar,body.lofi-nav-hidden .site-header,body.lofi-nav-hidden .header{transform:translateY(-110%)!important;opacity:0!important;pointer-events:none!important;transition:transform .45s ease,opacity .35s ease}
header,nav,.navbar,.site-header,.header{transition:transform .45s ease,opacity .35s ease}
.lofi-scroll{position:relative;height:1000vh;background:var(--lofi-night)}
.lofi-marker{position:absolute;left:0;width:1px;height:1px;outline:none}
.lofi-stage{position:sticky;top:0;height:100vh;width:100%;overflow:hidden}
.lofi-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;filter:saturate(.85) contrast(1.05) sepia(.08)}
.lofi-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 40%,rgba(8,6,4,.7));}
.lofi-grain{position:absolute;inset:-50%;pointer-events:none;opacity:.08;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");animation:lofiGrain 1s steps(4) infinite}
@keyframes lofiGrain{0%{transform:translate(0,0)}50%{transform:translate(-5%,3%)}100%{transform:translate(3%,-4%)}}
.lofi-dim{position:absolute;inset:0;background:rgba(10,8,6,.45);opacity:0;pointer-events:none}
.lofi-hero{position:absolute;left:clamp(1.25rem,6vw,6rem);bottom:clamp(2rem,12vh,8rem);max-width:min(560px,88vw);color:#f2e8d8;z-index:3}
.lofi-hero h1{font-size:clamp(2rem,4.6vw,3.8rem);line-height:1.05;margin:0 0 1rem;color:#f2e8d8;text-shadow:0 4px 30px rgba(0,0,0,.6)}
.lofi-hero p{font-size:clamp(1rem,1.4vw,1.15rem);color:#d9cbb8;margin:0 0 1.5rem;max-width:46ch}
.lofi-tag{display:inline-flex;gap:.5rem;align-items:center;font-family:'Caveat',cursive;font-size:1.4rem;color:var(--lofi-glow);margin-bottom:.5rem}
.lofi-tag i{width:8px;height:8px;border-radius:50%;background:var(--lofi-glow);box-shadow:0 0 12px var(--lofi-glow);animation:lofiPulse 1.6s infinite}
@keyframes lofiPulse{50%{opacity:.3}}
.lofi-hint{position:absolute;left:50%;bottom:1.25rem;transform:translateX(-50%);font-family:'Caveat',cursive;font-size:1.3rem;color:#d9cbb8;opacity:.85;z-index:3}
.lofi-hint span{display:block;text-align:center;animation:lofiBob 1.8s infinite}
@keyframes lofiBob{50%{transform:translateY(6px)}}
.lofi-layer{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:4;opacity:0}
.lofi-book{position:relative;width:min(920px,94vw);aspect-ratio:1.55;perspective:2400px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.6))}
.lofi-book::before{content:'';position:absolute;inset:-14px;background:#4a2a22;border-radius:14px;}
.lofi-page{position:absolute;top:0;width:50%;height:100%;background:var(--lofi-paper);background-image:repeating-linear-gradient(transparent 0 31px,rgba(80,100,130,.2) 31px 32px);padding:clamp(1rem,3.4vw,2.6rem);color:var(--lofi-ink);font-family:'Caveat',cursive;overflow:hidden;box-sizing:border-box}
.lofi-page--left{left:0;border-radius:8px 0 0 8px;box-shadow:inset -18px 0 30px -18px rgba(0,0,0,.35)}
.lofi-page--right{left:50%;border-radius:0 8px 8px 0;box-shadow:inset 18px 0 30px -18px rgba(0,0,0,.35)}
.lofi-leaf{position:absolute;top:0;left:50%;width:50%;height:100%;transform-origin:left center;transform-style:preserve-3d}
.lofi-leaf .lofi-face{position:absolute;inset:0;width:100%;left:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.lofi-leaf .lofi-face--back{transform:rotateY(180deg);border-radius:8px 0 0 8px;box-shadow:inset -18px 0 30px -18px rgba(0,0,0,.35)}
.lofi-page h2{font-size:clamp(1.8rem,3.6vw,3rem);line-height:1;margin:0 0 .6rem;color:var(--lofi-ink)}
.lofi-page h3{font-size:clamp(1.5rem,2.8vw,2.3rem);line-height:1.05;margin:.4rem 0 .5rem;color:#6b3a2e}
.lofi-page p,.lofi-page li{font-size:clamp(1.05rem,1.8vw,1.45rem);line-height:1.3;margin:0 0 .5rem}
.lofi-page ul{padding-left:1.1rem;margin:.4rem 0}
.lofi-page .lofi-num{font-size:clamp(1rem,1.5vw,1.2rem);color:#8f8170}
.lofi-page .lofi-icon{display:inline-grid;place-items:center;width:2.6rem;height:2.6rem;border:2px dashed #6b3a2e;border-radius:50%;color:#6b3a2e}
.lofi-doodle{position:absolute;right:1.2rem;bottom:1rem;font-size:clamp(1rem,1.6vw,1.3rem);color:#9c5a45;transform:rotate(-6deg)}
.lofi-page .lofi-cta{pointer-events:auto}
.lofi-board{width:min(1000px,94vw);display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(.6rem,1.6vw,1.2rem);padding:1rem}
.lofi-note{width:clamp(120px,15vw,170px);aspect-ratio:1;padding:1rem .8rem .8rem;box-sizing:border-box;font-family:'Caveat',cursive;color:var(--lofi-ink);font-size:clamp(1.15rem,1.8vw,1.55rem);line-height:1.1;display:flex;flex-direction:column;gap:.4rem;box-shadow:0 12px 18px rgba(0,0,0,.45);position:relative}
.lofi-note::before{content:'';position:absolute;top:-8px;left:50%;width:46px;height:16px;transform:translateX(-50%) rotate(-3deg);background:rgba(255,250,240,.4)}
.lofi-note--title{width:clamp(220px,32vw,360px);aspect-ratio:auto;font-size:clamp(1.6rem,3vw,2.5rem);padding:1.2rem}
.lofi-note--title small{font-size:clamp(1rem,1.4vw,1.25rem);opacity:.8}
.lofi-outro{color:#f2e8d8;text-align:center;font-family:'Caveat',cursive;font-size:clamp(2rem,4vw,3.4rem);text-shadow:0 4px 30px rgba(0,0,0,.6)}
.lofi-outro .lofi-cta{pointer-events:auto;margin-top:1rem;font-family:inherit}
@media (prefers-reduced-motion: reduce){.lofi-grain,.lofi-hint span,.lofi-tag i{animation:none}}
`;

/* ------------------------------------------------------------------ */
/*  Diary page content                                                 */
/* ------------------------------------------------------------------ */
function ServicePage({ service, index }) {
  if (!service) return null;
  const Icon = service.icon;
  const text = service.description || service.text;
  const points = service.features || service.points || service.items;
  return (
    <>
      <span className="lofi-num">#{String(index + 1).padStart(2, '0')}</span>
      {Icon && <div className="lofi-icon"><Icon size={20} aria-hidden="true" /></div>}
      <h3>{service.title}</h3>
      {text && <p>{text}</p>}
      {Array.isArray(points) && <ul>{points.slice(0, 4).map((p) => <li key={p}>{p}</li>)}</ul>}
    </>
  );
}

export default function Home() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  // Handwriting font
  useEffect(() => {
    if (document.getElementById('lofi-font')) return;
    const link = document.createElement('link');
    link.id = 'lofi-font'; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap';
    document.head.appendChild(link);
  }, []);

  // Hide navbar while scrolling the story
  useEffect(() => {
    const onScroll = () => document.body.classList.toggle('lofi-nav-hidden', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('lofi-nav-hidden');
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#14120f');
    scene.fog = new THREE.Fog('#14120f', 6, 14);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 50);
    const anim = buildRoom(scene);

    const cam = { ...SHOTS.wide };
    const look = new THREE.Vector3();
    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('pointermove', onMouse);

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 62 : 45;
      camera.updateProjectionMatrix();
      ScrollTrigger.refresh();
    };
    resize();
    window.addEventListener('resize', resize);

    // Render loop
    const clock = new THREE.Clock();
    let raf;
    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      drawCode(anim.code, dt);
      anim.arms.forEach(({ elbow, side }) => { elbow.rotation.x = Math.max(0, Math.sin(t * 14 + side * 1.7)) * 0.08; });
      anim.head.rotation.z = Math.sin(t * 2.2) * 0.05; // vibing to the beat
      anim.head.position.y = 0.8 + Math.abs(Math.sin(t * 2.2)) * 0.01;
      const rp = anim.rain.attributes.position;
      for (let i = 0; i < rp.count; i += 2) {
        let y = rp.getY(i) - dt * 0.9;
        if (y < 1.12) y = 2.57;
        rp.setY(i, y); rp.setY(i + 1, y - 0.06);
      }
      rp.needsUpdate = true;
      anim.steam.forEach((s) => {
        const p = (t * 0.25 + s.userData.offset) % 1;
        s.position.set(-0.75 + Math.sin(p * 6 + s.userData.offset * 10) * 0.03, 0.95 + p * 0.35, -1.95);
        s.scale.setScalar(0.06 + p * 0.12);
        s.material.opacity = Math.sin(p * Math.PI) * 0.4;
      });
      const par = cam === null ? 0 : 0.08;
      camera.position.set(cam.px + mouse.x * par, cam.py - mouse.y * par * 0.6, cam.pz);
      look.set(cam.tx, cam.ty, cam.tz);
      camera.lookAt(look);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    // Scroll choreography
    const ctx = gsap.context(() => {
      const leaves = gsap.utils.toArray('.lofi-leaf');
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: 1 },
      });
      const shot = (s, at, d = 1.2) => tl.to(cam, { ...s, duration: d }, at);

      tl.to('.lofi-hero, .lofi-hint', { autoAlpha: 0, y: -40, duration: 0.8 }, 0);
      shot(SHOTS.diary, 0.6, 1.4);
      tl.to('.lofi-dim', { opacity: 1, duration: 0.6 }, 1.6);
      tl.fromTo('.lofi-layer--diary', { autoAlpha: 0, scale: 0.85, y: 60 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7 }, 1.7);

      leaves.forEach((leaf, i) => {
        const at = 2.9 + i * 1.4;
        tl.to(leaf, { rotateY: -180, duration: 1, ease: 'power1.inOut' }, at);
        tl.set(leaf, { zIndex: 10 + i }, at + 0.5);
      });

      const afterDiary = 2.9 + leaves.length * 1.4 + 0.4;
      tl.to('.lofi-layer--diary', { autoAlpha: 0, scale: 0.9, duration: 0.6 }, afterDiary);
      tl.to('.lofi-dim', { opacity: 0, duration: 0.5 }, afterDiary + 0.2);
      shot(SHOTS.mid, afterDiary + 0.3, 1.1);
      shot(SHOTS.wall, afterDiary + 1.4, 1.2);
      tl.to('.lofi-dim', { opacity: 1, duration: 0.5 }, afterDiary + 2.3);
      tl.set('.lofi-layer--notes', { autoAlpha: 1 }, afterDiary + 2.4);
      tl.fromTo('.lofi-note', { autoAlpha: 0, scale: 0.4, rotate: () => gsap.utils.random(-30, 30) },
        { autoAlpha: 1, scale: 1, rotate: (i) => [-4, 3, -2, 5, -3, 2][i % 6], stagger: 0.08, duration: 0.5, ease: 'back.out(1.7)' }, afterDiary + 2.4);

      const afterNotes = afterDiary + 4.6;
      tl.to('.lofi-layer--notes', { autoAlpha: 0, y: -40, duration: 0.6 }, afterNotes);
      tl.to('.lofi-dim', { opacity: 0, duration: 0.5 }, afterNotes + 0.1);
      shot(SHOTS.wide, afterNotes + 0.3, 1.5);
      tl.fromTo('.lofi-layer--outro', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, afterNotes + 1.5);
      tl.to({}, { duration: 0.6 });
    }, wrap);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMouse);
      ctx.revert();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
      });
      renderer.dispose();
    };
  }, []);

  // Diary leaves: each leaf = front (right page) + back (next left page)
  const leafCount = Math.ceil(SERVICES.length / 2);
  const leaves = Array.from({ length: leafCount }, (_, i) => ({ front: 2 * i, back: 2 * i + 1 }));

  return (
    <div className="lofi-home">
      <style>{CSS}</style>

      {/* Lofi scroll story: hero → diary (services) → sticky notes (project types) */}
      <div className="lofi-scroll" ref={wrapRef}>
        <span
          className="lofi-marker"
          id="services"
          tabIndex={-1}
          aria-label="What we can build for you"
          style={{ top: '210vh' }}
        />

        <div className="lofi-stage">
          <canvas className="lofi-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="lofi-vignette" />
          <div className="lofi-grain" />
          <div className="lofi-dim" />

          {/* Hero */}
          <section className="lofi-hero" aria-labelledby="hero-title">
            <div className="lofi-tag"><i /> now coding · lofi beats to build to</div>
            <h1 id="hero-title">We Turn Ideas Into Powerful Digital Experiences.</h1>
            <p>
              Entropy Soft builds modern websites, web applications, and custom software solutions that help
              businesses turn their ideas into reality.
            </p>
            <div className="hero__actions">
              <Button to="/contact" size="lg">Start a Project</Button>
              <Button variant="secondary" size="lg" onClick={scrollToServices}>Explore Our Services</Button>
            </div>
          </section>
          <div className="lofi-hint" aria-hidden="true">scroll to peek at the diary<span>↓</span></div>

          {/* Diary — What we can build for you */}
          <section className="lofi-layer lofi-layer--diary" aria-labelledby="services-title">
            <div className="lofi-book">
              <div className="lofi-page lofi-page--left">
                <h2 id="services-title">What we can build for you</h2>
                <p>Six areas of software development we offer to clients, from a first landing page to a custom internal tool.</p>
                <p className="lofi-doodle">turn the page →</p>
              </div>
              <div className="lofi-page lofi-page--right">
                <h3>Your idea goes here.</h3>
                <p>Don't see exactly what you need? Tell us about it — we love a fresh problem.</p>
                <div className="lofi-cta"><Button to="/contact">Start a Project</Button></div>
                <p className="lofi-doodle">☕ + 💻 = ✨</p>
              </div>
              {leaves.map((leaf, i) => (
                <div className="lofi-leaf" key={i} style={{ zIndex: leafCount - i }}>
                  <div className="lofi-page lofi-page--right lofi-face lofi-face--front">
                    <ServicePage service={SERVICES[leaf.front]} index={leaf.front} />
                  </div>
                  <div className="lofi-page lofi-face lofi-face--back">
                    <ServicePage service={SERVICES[leaf.back]} index={leaf.back} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sticky notes — Projects we're ready to take on */}
          <section className="lofi-layer lofi-layer--notes" aria-labelledby="types-title">
            <ul className="lofi-board" style={{ listStyle: 'none', margin: 0 }}>
              <li className="lofi-note lofi-note--title" style={{ background: '#efe6d4' }}>
                <span id="types-title">Projects we're ready to take on</span>
                <small>Examples of what we can build. Don't see yours? Tell us about it.</small>
              </li>
              {PROJECT_TYPES.map(({ icon: Icon, title }, i) => (
                <li className="lofi-note" key={title} style={{ background: NOTE_COLORS[i % NOTE_COLORS.length] }}>
                  {Icon && <Icon size={22} aria-hidden="true" />}
                  <span>{title}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="lofi-layer lofi-layer--outro">
            <div className="lofi-outro">
              <p>pull up a chair — let's build something together.</p>
              <div className="lofi-cta"><Button to="/contact" size="lg">Start a Project</Button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}