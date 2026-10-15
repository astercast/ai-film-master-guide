/* Hero film grain (2026-10-15 rebuild). A hand-rolled WebGL shader:
   animated monochrome grain with a soft vignette, laid over the hero
   still. No library. The still is a plain <img> underneath, so when
   WebGL is unavailable, reduced motion is on, or the canvas fails,
   the hero is simply a graded photograph. The loop runs at about
   12 frames a second, pauses when the hero leaves the viewport or
   the tab hides, and draws at three-quarter resolution: grain has
   no detail worth full pixels. The alpha is kept barely-there on
   purpose: grain you notice is noise, grain you feel is film. */
(function () {
  "use strict";
  var canvas = document.getElementById("hero-grain");
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.remove();
    return;
  }
  var gl;
  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false });
  } catch (e) {
    gl = null;
  }
  if (!gl) {
    canvas.remove();
    return;
  }
  var vert = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";
  var frag = [
    "precision mediump float;",
    "uniform vec2 u_res;",
    "uniform float u_time;",
    "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "void main(){",
    "  vec2 cell = floor(gl_FragCoord.xy) + vec2(fract(u_time) * 371.0, fract(u_time * 0.7) * 197.0);",
    "  float g = hash(cell);",
    "  float white = step(0.5, g);",
    "  vec2 c = gl_FragCoord.xy / u_res - 0.5;",
    "  float vig = smoothstep(0.95, 0.30, length(c));",
    "  float base = mix(0.016, 0.030, vig);",
    "  float a = base * (white > 0.5 ? 1.0 : 0.8);",
    "  gl_FragColor = vec4(vec3(white) * a, a);",
    "}"
  ].join("\n");
  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = shader(gl.VERTEX_SHADER, vert);
  var fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) {
    canvas.remove();
    return;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.remove();
    return;
  }
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uRes = gl.getUniformLocation(prog, "u_res");
  var uTime = gl.getUniformLocation(prog, "u_time");

  function size() {
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(r.width * 0.75));
    canvas.height = Math.max(2, Math.round(r.height * 0.75));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  size();
  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(size, 150);
  });

  var running = true;
  var visible = true;
  var last = 0;
  function frame(now) {
    if (!running) return;
    window.requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    if (now - last < 80) return;
    last = now;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, now / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  window.requestAnimationFrame(frame);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && running) window.requestAnimationFrame(frame);
  });
})();
