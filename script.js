(() => {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  let rafId = null;

  // modes: 'clear', 'clouds', 'rain', 'snow', 'mist', 'default'
  let mode = 'default';
  let elements = [];

  // utilities
  function rand(min, max){ return Math.random() * (max - min) + min; }

  // resize canvas
  function onResize(){
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }
  addEventListener('resize', onResize);

  /* DRAWERS */
  // sun (glowing radial)
  function drawSun(t){
    const x = W * 0.8, y = H * 0.18;
    const r = Math.min(140, Math.max(60, W/8));
    const grd = ctx.createRadialGradient(x, y, r*0.1, x, y, r*1.2);
    grd.addColorStop(0, 'rgba(255, 245, 157, 0.95)');
    grd.addColorStop(0.5, 'rgba(255, 183, 77, 0.5)');
    grd.addColorStop(1, 'rgba(255, 112, 67, 0.07)');
    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.arc(x, y, r*1.1, 0, Math.PI*2);
    ctx.fill();
  }

  // soft sky gradient base
  function drawSky(){
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, 'rgba(24, 58, 95, 0.95)');   // top
    g.addColorStop(0.5, 'rgba(46, 96, 144, 0.9)');
    g.addColorStop(1, 'rgba(8, 18, 34, 0.95)');    // bottom
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
  }

  /* Cloud particle */
  class Cloud {
    constructor(){
      this.x = rand(-W*0.2, W);
      this.y = rand(H*0.05, H*0.45);
      this.speed = rand(0.2, 0.8);
      this.scale = rand(0.8, 1.6);
      this.alpha = rand(0.08, 0.22);
      this.width = rand(140, 420);
    }
    update(dt){
      this.x += this.speed * dt;
      if(this.x > W + 200) this.x = -this.width - rand(40,200);
    }
    draw(){
      const g = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + 80);
      g.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
      g.addColorStop(1, `rgba(255,255,255,${this.alpha*0.6})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      const h = 40 * this.scale;
      ctx.ellipse(this.x, this.y, this.width*0.4*this.scale, h, 0, 0, Math.PI*2);
      ctx.fill();

      // fluffy lobes
      for(let i=0;i<3;i++){
        ctx.beginPath();
        ctx.ellipse(this.x + (i-1)*40*this.scale, this.y - 10*this.scale, 60*this.scale, 36*this.scale, 0, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  /* Rain drop */
  class Drop {
    constructor(){
      this.x = rand(0, W);
      this.y = rand(-H, 0);
      this.len = rand(10, 24);
      this.speed = rand(400, 900);
      this.alpha = rand(0.15, 0.4);
    }
    update(dt){
      this.y += this.speed * dt;
      if(this.y > H + 20){
        this.y = rand(-200, -20);
        this.x = rand(0, W);
      }
    }
    draw(){
      ctx.strokeStyle = `rgba(180,210,255,${this.alpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y + this.len);
      ctx.stroke();
    }
  }

  /* Snowflake */
  class Snow {
    constructor(){
      this.x = rand(0, W);
      this.y = rand(-H, 0);
      this.size = rand(1.8, 4.2);
      this.speed = rand(30, 100);
      this.swing = rand(20, 80);
      this.phase = rand(0, Math.PI*2);
    }
    update(dt){
      this.y += this.speed * dt;
      this.x += Math.sin((Date.now() * 0.001) + this.phase) * 0.4;
      if(this.y > H + 20){
        this.y = rand(-200, -20);
        this.x = rand(0, W);
      }
    }
    draw(){
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // create elements for a mode
  function populateForMode(m){
    elements = [];
    if(m === 'clear'){
      // few drifting clouds + a subtle sun glow (sun drawn separately)
      for(let i=0;i<6;i++) elements.push(new Cloud());
    } else if(m === 'clouds' || m === 'mist'){
      for(let i=0;i<9;i++) elements.push(new Cloud());
    } else if(m === 'rain'){
      for(let i=0;i<12;i++) elements.push(new Cloud());
      for(let i=0;i<160;i++) elements.push(new Drop());
    } else if(m === 'snow'){
      for(let i=0;i<8;i++) elements.push(new Cloud());
      for(let i=0;i<120;i++) elements.push(new Snow());
    } else {
      for(let i=0;i<5;i++) elements.push(new Cloud());
    }
  }

  // rendering loop
  let last = performance.now();
  function loop(now){
    const dt = Math.min(60, now - last) / 1000; // seconds
    last = now;

    // clear
    ctx.clearRect(0,0,W,H);

    // base sky (color depends on mode)
    if(mode === 'clear'){
      // slightly brighter gradient
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0, '#7bdff6');
      g.addColorStop(0.5, '#66b3ff');
      g.addColorStop(1, '#06324a');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);

      // sun
      drawSun(now);
    } else if(mode === 'clouds' || mode === 'mist'){
      drawSky();
    } else if(mode === 'rain'){
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#738290');
      g.addColorStop(1,'#1e2a3a');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);
    } else if(mode === 'snow'){
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#bfe0ff');
      g.addColorStop(1,'#1b2a3a');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);
    } else {
      drawSky();
    }

    // update + draw each element
    for(const el of elements){
      el.update(dt);
      el.draw();
    }

    rafId = requestAnimationFrame(loop);
  }

  // public API: setMode by condition string
  function setModeFromCondition(cond){
    if(!cond) { mode = 'default'; populateForMode(mode); return; }
    const s = cond.toLowerCase();
    if(s.includes('clear') || s.includes('sun')) mode = 'clear';
    else if(s.includes('cloud')) mode = 'clouds';
    else if(s.includes('rain') || s.includes('drizzle')) mode = 'rain';
    else if(s.includes('snow') || s.includes('sleet')) mode = 'snow';
    else if(s.includes('mist') || s.includes('haze') || s.includes('fog')) mode = 'mist';
    else mode = 'default';
    populateForMode(mode);
  }

  // automatically start
  populateForMode('default');
  loop(performance.now());

  // expose globally for template to call
  window.setWeatherBackground = function(condition){
    setModeFromCondition(condition);
    // small UI hint: add class to app for color tweaks (optional)
    document.documentElement.dataset.weather = mode;
  };

  // on load, if template passed initial condition, set it
  window.addEventListener('load', () => {
    const initial = window.__INITIAL_CONDITION__;
    if(initial) window.setWeatherBackground(initial);
  });

  // also expose a helper to switch by sample name
  window.__bgEngine = { setMode: setModeFromCondition };

})();
