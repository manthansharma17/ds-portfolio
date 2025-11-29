/* app.js */
/* Main JS: feather, mobile menu, EmailJS contact handler, Three.js scenes, GSAP animations */

document.addEventListener('DOMContentLoaded', () => {
  // icons
  feather.replace();

  // year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Mobile menu toggle
  (function(){
    const btn = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    let open = false;
    btn.addEventListener('click', () => {
      open = !open;
      menu.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', String(open));
      btn.innerHTML = open ? feather.icons.x.toSvg() : feather.icons.menu.toSvg();
    });
  })();

  /* ---------------------------
     EmailJS contact submission
     Service ID: service_7k2e679
     Template ID: template_17t0xms
     Public Key: yj4QI4a925VyUpe1t (initialized in index.html)
     Notification email (template param): aarushshrma0@gmail.com
  ----------------------------*/
  (function setupEmailJSForm(){
    const form = document.getElementById('contact-form');
    if (!form || typeof emailjs === 'undefined') {
      // fallback: keep old client-only behavior if emailjs isn't loaded
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const b = form.querySelector('button[type="submit"]');
          if (!b) return;
          b.disabled = true;
          const old = b.textContent;
          b.textContent = 'Sending...';
          setTimeout(()=>{
            b.textContent = 'Sent ✓';
            b.disabled = false;
            setTimeout(()=> { b.textContent = old; }, 1400);
            form.reset();
          }, 800);
        });
      }
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        var originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
      }

      // gather fields (make sure name attributes match your EmailJS template)
      const name = (form.querySelector('#name') && form.querySelector('#name').value) || '';
      const email = (form.querySelector('#email') && form.querySelector('#email').value) || '';
      const phone = (form.querySelector('#phone') && form.querySelector('#phone').value) || '';
      const subject = (form.querySelector('#subject') && form.querySelector('#subject').value) || 'New message from portfolio';
      const message = (form.querySelector('#message') && form.querySelector('#message').value) || '';

      // template parameters — adjust keys to match your EmailJS template variable names
      const templateParams = {
        from_name: name,
        from_email: email,
        phone: phone,
        subject: subject,
        message: message,
        notify_to: 'aarushshrma0@gmail.com' // set the notification recipient for template logic
      };

      // Send through EmailJS (client-side)
      emailjs.send('service_7k2e679', 'template_17t0xms', templateParams)
        .then(function(response) {
          // success UI
          if (submitBtn) submitBtn.textContent = 'Sent ✓';
          // optional: small success toast
          setTimeout(() => {
            if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
          }, 1800);
          form.reset();
        }, function(error) {
          console.error('EmailJS error:', error);
          if (submitBtn) {
            submitBtn.textContent = 'Try again';
            submitBtn.disabled = false;
          }
          alert('Sorry — message failed to send. Please try again later or email directly to aarushshrma0@gmail.com.');
        });
    });
  })();


  /* ---------------------------
     THREE.JS — background & overlay
     (unchanged from previous setup)
  ----------------------------*/
  (function(){
    const bgCanvas = document.getElementById('bg-canvas');
    const ovCanvas = document.getElementById('overlay-canvas');
    if (!bgCanvas || !ovCanvas || typeof THREE === 'undefined') return;

    const bgRenderer = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });
    const ovRenderer = new THREE.WebGLRenderer({ canvas: ovCanvas, alpha: true, antialias: true });
    bgRenderer.setPixelRatio(window.devicePixelRatio);
    ovRenderer.setPixelRatio(window.devicePixelRatio);

    const bgScene = new THREE.Scene();
    const ovScene = new THREE.Scene();

    const bgCam = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
    bgCam.position.set(0,0,80);
    const ovCam = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 0.1, 500);
    ovCam.position.set(0,0,60);

    function onResize(){
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
      ovRenderer.setSize(window.innerWidth, window.innerHeight);
      bgCam.aspect = innerWidth/innerHeight; bgCam.updateProjectionMatrix();
      ovCam.aspect = innerWidth/innerHeight; ovCam.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);
    onResize();

    // Starfield
    (function(){
      const starsGeo = new THREE.BufferGeometry();
      const count = 1200;
      const arr = new Float32Array(count * 3);
      for (let i=0;i<count;i++){
        arr[i*3] = (Math.random()-0.5)*2000;
        arr[i*3+1] = (Math.random()-0.5)*1200;
        arr[i*3+2] = (Math.random()-0.5)*1600;
      }
      starsGeo.setAttribute('position', new THREE.BufferAttribute(arr,3));
      const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, transparent:true, opacity:0.85 });
      const points = new THREE.Points(starsGeo, starsMat);
      bgScene.add(points);
    })();

    // Soft galaxy sphere
    (function(){
      const gGeo = new THREE.SphereGeometry(300, 32, 32);
      const gMat = new THREE.MeshBasicMaterial({ color: 0x08203a, transparent:true, opacity:0.25, side: THREE.BackSide });
      const sphere = new THREE.Mesh(gGeo, gMat);
      sphere.position.set(0, -40, -200);
      bgScene.add(sphere);
    })();

    // Background icosahedrons group
    const bgGroup = new THREE.Group();
    bgScene.add(bgGroup);
    const icoGeo = new THREE.IcosahedronGeometry(6, 0);
    function makeIco(col){
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.15,
        metalness: 0.5,
        roughness: 0.25,
        transparent: true,
        opacity: 0.9
      });
      return new THREE.Mesh(icoGeo, mat);
    }
    for (let i=0;i<14;i++){
      const c = new THREE.Color().setHSL(0.58 + (Math.random()-0.5)*0.06, 0.7, 0.45 + Math.random()*0.08);
      const m = makeIco(c);
      m.position.set((Math.random()-0.5)*220, (Math.random()-0.5)*120, (Math.random()-0.5)*600);
      m.scale.setScalar(0.6 + Math.random()*1.6);
      bgGroup.add(m);
    }

    bgScene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.6));
    const dlight = new THREE.DirectionalLight(0xffffff, 0.5);
    dlight.position.set(1,1,1);
    bgScene.add(dlight);

    // Overlay group
    const ovGroup = new THREE.Group();
    ovScene.add(ovGroup);
    for (let i=0;i<8;i++){
      const mat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1e3a8a,
        emissiveIntensity: 0.25,
        metalness: 0.4,
        roughness: 0.35,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(4 + Math.random()*4, 0), mat);
      mesh.position.set((Math.random()-0.5)*140, (Math.random()-0.5)*60, (Math.random()-0.5)*200);
      mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      mesh.scale.setScalar(0.6 + Math.random()*1.4);
      ovGroup.add(mesh);
    }
    ovScene.add(new THREE.AmbientLight(0xffffff, 0.4));
    ovScene.add(new THREE.DirectionalLight(0xffffff, 0.6));

    // Mouse parallax
    const mouse = { x:0, y:0 };
    window.addEventListener('pointermove', (e)=>{
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = -((e.clientY / innerHeight) * 2 - 1);
      mouse.x = nx;
      mouse.y = ny;
    });

    // animate loop
    let last = performance.now();
    function render(t){
      const dt = (t - last) * 0.001;
      last = t;

      bgGroup.children.forEach((m, i) => {
        m.rotation.x += 0.02*dt*(1+i*0.05);
        m.rotation.y += 0.015*dt*(1+i*0.05);
      });
      ovGroup.children.forEach((m, i) => {
        m.rotation.x += 0.04*dt*(1+i*0.08);
        m.rotation.y += 0.03*dt*(1+i*0.08);
      });

      const pts = bgScene.children.find(c=>c.type==='Points');
      if (pts) {
        const pos = pts.geometry.attributes.position.array;
        for (let i=0;i<pos.length;i+=3){
          pos[i+1] -= 0.05 * dt * 40;
          if (pos[i+1] < -800) pos[i+1] = 800;
        }
        pts.geometry.attributes.position.needsUpdate = true;
      }

      bgCam.position.x += (mouse.x * 30 - bgCam.position.x) * 0.06;
      bgCam.position.y += (mouse.y * 18 - bgCam.position.y) * 0.06;
      bgCam.lookAt(0,0,0);

      ovCam.position.x += (mouse.x * 20 - ovCam.position.x) * 0.08;
      ovCam.position.y += (mouse.y * 14 - ovCam.position.y) * 0.08;
      ovCam.lookAt(0,0,0);

      bgRenderer.render(bgScene, bgCam);
      ovRenderer.render(ovScene, ovCam);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  })();


  // GSAP Animations (ScrollTrigger)
  (function(){
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('section').forEach(section => {
      gsap.from(section, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    gsap.from('.card', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#projects',
        start: 'top 85%'
      }
    });
  })();

}); // DOMContentLoaded
