// Hero 3D accent (Three.js). Fully optional: if anything here fails or is
// switched off, the page keeps its original CSS orbit design.
(function () {
  const holder = document.querySelector(".hero-visual");
  if (!holder || typeof THREE === "undefined") return;
  if (window.matchMedia("(max-width: 860px)").matches) return; // phones/tablets keep the light design
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-3d";
  canvas.setAttribute("aria-hidden", "true");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) { return; }
  holder.insertBefore(canvas, holder.firstChild);
  holder.classList.add("has-3d");
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.z = 9;
  const group = new THREE.Group();
  scene.add(group);

  const lines = (geometry, color, opacity) =>
    new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));

  // Large cube frames the profile photo; two smaller shapes float around it.
  const cube = lines(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.4, 3.4, 3.4)), 0xa68bff, 0.75);
  const ico = lines(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.62, 1)), 0x5caaff, 0.8);
  const oct = lines(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.45)), 0xd4baff, 0.85);
  ico.position.set(2.3, 1.55, 0.6);
  oct.position.set(-2.4, -1.6, 0.6);

  const count = 40, positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xb49bff, size: 0.05, transparent: true, opacity: 0.8 }));
  group.add(cube, ico, oct, dust);

  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  };
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(holder);
  else window.addEventListener("resize", resize);
  resize();
  if (reduceMotion) return; // one still frame, no animation

  let mx = 0, my = 0, visible = true;
  window.addEventListener("pointermove", e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(holder);
  }

  (function tick() {
    requestAnimationFrame(tick);
    if (!visible || document.hidden || window.innerWidth <= 860) return;
    const t = performance.now() / 1000;
    cube.rotation.x += 0.0035; cube.rotation.y += 0.0045;
    ico.rotation.x -= 0.006;   ico.rotation.y += 0.008;
    oct.rotation.y += 0.01;    oct.rotation.z -= 0.006;
    ico.position.y = 1.55 + Math.sin(t) * 0.15;
    oct.position.y = -1.6 + Math.cos(t * 0.8) * 0.12;
    dust.rotation.y += 0.0006;
    group.rotation.y += (mx * 0.35 - group.rotation.y) * 0.04;
    group.rotation.x += (my * 0.25 - group.rotation.x) * 0.04;
    render();
  })();
})();