// Small SVG chart helpers shared by the Invest and College pages.
// All charts: one y-axis, recessive grid, 2px lines, hover crosshair/tooltip, theme-aware colors.
const Charts = (() => {
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const color = (c) => (c.startsWith("--") ? css(c) : c);

  function niceStep(range, ticks = 4) {
    const raw = range / ticks, mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    for (const s of [1, 2, 2.5, 5, 10]) if (s * mag >= raw) return s * mag;
    return 10 * mag;
  }
  function scaleY(min, max) {
    const step = niceStep(max - min || Math.abs(max) || 1);
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
    return { lo, hi, ticks };
  }

  function legendHtml(series) {
    if (series.length < 2) return "";
    return `<div class="chart-legend">${series.map((s) => `<span><i style="background:${color(s.color)}"></i>${s.name}</span>`).join("")}</div>`;
  }

  // Multi-series line chart. opts: { x: [labels], series: [{name, color, values, dash?}], yFormat, xFormat,
  //   height, minZero, markers: [{i, label}], bands: [[i0, i1]] }
  function line(host, opts) {
    const W = host.clientWidth || 600;
    const H = opts.height || Math.round(Math.min(340, Math.max(220, W * 0.45)));
    const m = { t: 14, r: 12, b: 28, l: 60 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b, n = opts.x.length;
    const all = opts.series.flatMap((s) => s.values).filter((v) => v != null);
    const sy = scaleY(opts.minZero === false ? Math.min(...all) : Math.min(0, ...all), Math.max(...all));
    const x = (i) => m.l + (n > 1 ? (i / (n - 1)) * iw : iw / 2);
    const y = (v) => m.t + ih - ((v - sy.lo) / (sy.hi - sy.lo)) * ih;
    const fy = opts.yFormat || ((v) => v);
    const fx = opts.xFormat || ((v) => v);
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${opts.label || "Line chart"}">`;
    (opts.bands || []).forEach(([a, b]) => (svg += `<rect x="${x(a)}" y="${m.t}" width="${Math.max(1, x(b) - x(a))}" height="${ih}" fill="${css("--surface-2")}"/>`));
    sy.ticks.forEach((v) => {
      svg += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"${v === 0 ? ` style="stroke:${css("--muted")};opacity:.5"` : ""}/>`;
      svg += `<g class="axis"><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${fy(v)}</text></g>`;
    });
    const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 60))));
    for (let i = 0; i < n; i += every) svg += `<g class="axis"><text x="${x(i)}" y="${H - 8}" text-anchor="middle">${fx(opts.x[i])}</text></g>`;
    opts.series.forEach((s) => {
      const d = s.values.map((v, i) => (v == null ? "" : `${i && s.values[i - 1] != null ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)).join("");
      svg += `<path d="${d}" fill="none" stroke="${color(s.color)}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ' stroke-dasharray="5 4"' : ""}/>`;
    });
    (opts.markers || []).forEach((mk) => {
      const v = opts.series[0].values[mk.i];
      svg += `<line x1="${x(mk.i)}" x2="${x(mk.i)}" y1="${m.t}" y2="${m.t + ih}" stroke="${css("--muted")}" stroke-dasharray="3 3"/>`;
      svg += `<circle cx="${x(mk.i)}" cy="${y(v)}" r="5" fill="${css("--surface")}" stroke="${css("--text")}" stroke-width="2"/>`;
      svg += `<g class="axis"><text x="${Math.min(x(mk.i) + 6, W - 90)}" y="${m.t + 12}" style="fill:${css("--text")};font-weight:600">${mk.label}</text></g>`;
    });
    svg += `<line class="xhair" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" stroke="${css("--muted")}" opacity="0"/>`;
    opts.series.forEach((s, k) => (svg += `<circle class="xdot" data-k="${k}" r="4" fill="${color(s.color)}" stroke="${css("--surface")}" stroke-width="2" opacity="0"/>`));
    svg += `</svg>`;
    host.innerHTML = legendHtml(opts.series) + `<div class="chart-wrap">${svg}<div class="tooltip"></div></div>`;

    const wrap = host.querySelector(".chart-wrap"), tip = wrap.querySelector(".tooltip");
    const xh = wrap.querySelector(".xhair"), dots = wrap.querySelectorAll(".xdot");
    wrap.onmousemove = (e) => {
      const r = wrap.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W;
      const i = Math.round(((px - m.l) / iw) * (n - 1));
      if (i < 0 || i >= n) return hide();
      xh.setAttribute("x1", x(i)); xh.setAttribute("x2", x(i)); xh.setAttribute("opacity", 0.6);
      dots.forEach((d) => {
        const v = opts.series[d.dataset.k].values[i];
        if (v == null) return d.setAttribute("opacity", 0);
        d.setAttribute("cx", x(i)); d.setAttribute("cy", y(v)); d.setAttribute("opacity", 1);
      });
      tip.innerHTML = `<strong>${opts.tipTitle ? opts.tipTitle(i) : fx(opts.x[i])}</strong>` + opts.series.map((s) =>
        s.values[i] == null ? "" : `<div class="row"><span><i style="background:${color(s.color)}"></i>${s.name}</span><span>${(opts.tipFormat || fy)(s.values[i])}</span></div>`).join("") + (opts.tipExtra ? opts.tipExtra(i) : "");
      const lx = (x(i) / W) * r.width;
      tip.style.left = (lx + 210 > r.width ? lx - 200 : lx + 12) + "px";
      tip.style.top = "8px";
      tip.style.opacity = 1;
    };
    const hide = () => { tip.style.opacity = 0; xh.setAttribute("opacity", 0); dots.forEach((d) => d.setAttribute("opacity", 0)); };
    wrap.onmouseleave = hide;
  }

  // Vertical bars around a zero baseline (e.g. yearly returns). opts: { x, values, color, yFormat, tipTitle, highlight: Set of indexes }
  function bars(host, opts) {
    const W = host.clientWidth || 600, H = opts.height || 240;
    const m = { t: 10, r: 8, b: 26, l: 48 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b, n = opts.values.length;
    const sy = scaleY(Math.min(0, ...opts.values), Math.max(0, ...opts.values));
    const y = (v) => m.t + ih - ((v - sy.lo) / (sy.hi - sy.lo)) * ih;
    const slot = iw / n, gap = slot > 6 ? 2 : slot > 3 ? 1 : 0, bw = Math.max(1, slot - gap);
    const fy = opts.yFormat || ((v) => v);
    const c = color(opts.color || "--series-1"), hc = color(opts.highlightColor || "--series-2");
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${opts.label || "Bar chart"}">`;
    sy.ticks.forEach((v) => {
      svg += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><g class="axis"><text x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end">${fy(v)}</text></g>`;
    });
    const r = Math.min(4, bw / 2);
    opts.values.forEach((v, i) => {
      const x0 = m.l + i * slot + gap / 2, y0 = y(0), y1 = y(v), h = Math.abs(y1 - y0);
      const fill = opts.highlight && opts.highlight.has(i) ? hc : c;
      if (h < 0.5) return;
      const rr = Math.min(r, h);
      // rounded data-end, square at the baseline
      svg += v >= 0
        ? `<path d="M${x0},${y0} V${y1 + rr} Q${x0},${y1} ${x0 + rr},${y1} H${x0 + bw - rr} Q${x0 + bw},${y1} ${x0 + bw},${y1 + rr} V${y0} Z" fill="${fill}"/>`
        : `<path d="M${x0},${y0} V${y1 - rr} Q${x0},${y1} ${x0 + rr},${y1} H${x0 + bw - rr} Q${x0 + bw},${y1} ${x0 + bw},${y1 - rr} V${y0} Z" fill="${fill}"/>`;
    });
    svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(0)}" y2="${y(0)}" stroke="${css("--muted")}"/>`;
    const every = Math.max(1, Math.ceil(n / Math.floor(iw / 44)));
    for (let i = 0; i < n; i += every) svg += `<g class="axis"><text x="${m.l + i * slot + slot / 2}" y="${H - 8}" text-anchor="middle">${opts.x[i]}</text></g>`;
    svg += `<rect class="hl" y="${m.t}" height="${ih}" width="${slot}" fill="${css("--text")}" opacity="0"/></svg>`;
    host.innerHTML = `<div class="chart-wrap">${svg}<div class="tooltip"></div></div>`;
    const wrap = host.querySelector(".chart-wrap"), tip = wrap.querySelector(".tooltip"), hl = wrap.querySelector(".hl");
    wrap.onmousemove = (e) => {
      const rc = wrap.getBoundingClientRect();
      const i = Math.floor((((e.clientX - rc.left) / rc.width) * W - m.l) / slot);
      if (i < 0 || i >= n) { tip.style.opacity = 0; hl.setAttribute("opacity", 0); return; }
      hl.setAttribute("x", m.l + i * slot); hl.setAttribute("opacity", 0.06);
      tip.innerHTML = `<strong>${opts.tipTitle ? opts.tipTitle(i) : opts.x[i]}</strong><div class="row"><span>${opts.name || "Value"}</span><span>${fy(opts.values[i])}</span></div>`;
      const lx = ((m.l + i * slot) / W) * rc.width;
      tip.style.left = (lx + 190 > rc.width ? lx - 180 : lx + 14) + "px";
      tip.style.top = "8px";
      tip.style.opacity = 1;
    };
    wrap.onmouseleave = () => { tip.style.opacity = 0; hl.setAttribute("opacity", 0); };
  }

  const pct = (v, d = 0) => (v * 100).toFixed(d) + "%";
  return { line, bars, pct, css };
})();
