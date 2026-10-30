// Round 2 alternatives for DKcast (projects-b4, 30 Oct 2026): temperature chart, sunshine and rain chart, "How good is it?".
// Uses D, day, sid, el, hr, loc from the page script; tipShow/tipHide from alt-dk.js. Scores come from the dk-forecast study data.
let DK2W = null;
fetch("https://bolgacg.github.io/dk-forecast/data/weather.json").then(r => r.json()).then(w => { DK2W = w; if (D) dk2All(); }).catch(() => {});
const dk2VW = () => innerWidth < 600 ? 360 : 640;
function dk2Frame(S, H, h) {
  const VW = dk2VW(), L = 34, R = VW - 8, n = H.length - 1; S.setAttribute("viewBox", `0 0 ${VW} ${h}`); S.innerHTML = "";
  return {VW, L, R, n, X: i => L + i * (R - L) / n};
}
function dk2Hours(S, H, F, y) { H.forEach((h, i) => { if (i % (dk2VW() < 400 ? 6 : 3) == 0) el("text", {x: F.X(i), y, "font-size": 11, fill: "#5b6875", "text-anchor": "middle"}, S, loc(h.t)); }); }
function dk2Now(S, H, F, top, bot) { if (day != 0) return; const k = H.findIndex(h => h.t.slice(0, 13) == new Date().toISOString().slice(0, 13)); if (k < 0) return;
  el("line", {x1: F.X(k), x2: F.X(k), y1: top, y2: bot, stroke: "#14202b", "stroke-dasharray": "3 3"}, S); el("text", {x: F.X(k) + 4, y: top + 10, "font-size": 11, fill: "#14202b"}, S, "now"); }
function dk2Hover(S, H, F, top, bot, fmt) { const w = (F.R - F.L) / F.n;
  H.forEach((h, i) => { const r = el("rect", {x: F.X(i) - w / 2, y: top, width: w, height: bot - top, fill: "transparent"}, S);
    r.addEventListener("pointermove", e => tipShow(e, `<b>${loc(h.t)}</b><br>` + fmt(h))); r.addEventListener("pointerleave", tipHide); }); }
const dk2Tfmt = h => `Temperature ${h.temp.toFixed(1)} °C<br>8 in 10: ${h.temp_lo.toFixed(1)} to ${h.temp_hi.toFixed(1)} °C<br>Sunshine ${h.sun} min, rain ${h.rain}%`;

// ---------- temperature A: clean line and range, high and low labelled, now marked ----------
function tA() {
  const S = document.getElementById("tA"), H = hours(), F = dk2Frame(S, H, 230), top = 14, bot = 196;
  const lo = Math.floor(Math.min(...H.map(h => h.temp_lo)) - .5), hi = Math.ceil(Math.max(...H.map(h => h.temp_hi)) + .5), Y = v => bot - (v - lo) / (hi - lo) * (bot - top);
  for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) { el("line", {x1: F.L, x2: F.R, y1: Y(v), y2: Y(v), stroke: "#e3e9f0"}, S); el("text", {x: F.L - 6, y: Y(v) + 4, "font-size": 12, fill: "#5b6875", "text-anchor": "end"}, S, v + "°"); }
  el("path", {d: "M" + H.map((h, i) => `${F.X(i)},${Y(h.temp_hi)}`).join("L") + "L" + H.map((h, i) => `${F.X(F.n - i)},${Y(H[F.n - i].temp_lo)}`).join("L") + "Z", fill: "rgba(228,87,46,.15)"}, S);
  el("path", {d: "M" + H.map((h, i) => `${F.X(i)},${Y(h.temp)}`).join("L"), fill: "none", stroke: "#e4572e", "stroke-width": 3}, S);
  for (const [h, up] of [[H.reduce((a, b) => b.temp > a.temp ? b : a), true], [H.reduce((a, b) => b.temp < a.temp ? b : a), false]]) { const i = H.indexOf(h);
    el("circle", {cx: F.X(i), cy: Y(h.temp), r: 4.5, fill: "#e4572e", stroke: "#fff", "stroke-width": 2}, S);
    el("text", {x: Math.min(Math.max(F.X(i), F.L + 30), F.R - 30), y: up ? Y(h.temp_hi) - 6 : Y(h.temp_lo) + 16, "font-size": 12.5, "font-weight": 600, fill: "#14202b", "text-anchor": "middle"}, S,
      `${up ? "high" : "low"} ${h.temp.toFixed(0)}° at ${loc(h.t)}`); }
  dk2Now(S, H, F, top, bot); dk2Hours(S, H, F, 220); dk2Hover(S, H, F, top, bot, dk2Tfmt);
}
// ---------- temperature B: one column per hour, the 8-in-10 range as the column ----------
function tB() {
  const S = document.getElementById("tB"), H = hours(), F = dk2Frame(S, H, 230), top = 14, bot = 196;
  const lo = Math.floor(Math.min(...H.map(h => h.temp_lo)) - .5), hi = Math.ceil(Math.max(...H.map(h => h.temp_hi)) + .5), Y = v => bot - (v - lo) / (hi - lo) * (bot - top), w = (F.R - F.L) / F.n * .62;
  for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) { el("line", {x1: F.L, x2: F.R, y1: Y(v), y2: Y(v), stroke: "#e3e9f0"}, S); el("text", {x: F.L - 6, y: Y(v) + 4, "font-size": 12, fill: "#5b6875", "text-anchor": "end"}, S, v + "°"); }
  H.forEach((h, i) => { el("rect", {x: F.X(i) - w / 2, y: Y(h.temp_hi), width: w, height: Math.max(2, Y(h.temp_lo) - Y(h.temp_hi)), rx: w / 2, fill: tcol(h.temp), opacity: .55}, S);
    el("line", {x1: F.X(i) - w / 2, x2: F.X(i) + w / 2, y1: Y(h.temp), y2: Y(h.temp), stroke: "#14202b", "stroke-width": 2}, S);
    if (dk2VW() > 400 && i % 3 == 0) el("text", {x: F.X(i), y: Y(h.temp_hi) - 5, "font-size": 11, "font-weight": 600, fill: "#14202b", "text-anchor": "middle"}, S, h.temp.toFixed(0) + "°"); });
  dk2Now(S, H, F, top, bot); dk2Hours(S, H, F, 220); dk2Hover(S, H, F, top, bot, dk2Tfmt);
}
// ---------- temperature C: the whole day in one chart: temperature on top, sun and rain below ----------
function tC() {
  const S = document.getElementById("tC"), H = hours(), F = dk2Frame(S, H, 330), top = 14, bot = 170;
  const lo = Math.floor(Math.min(...H.map(h => h.temp_lo)) - .5), hi = Math.ceil(Math.max(...H.map(h => h.temp_hi)) + .5), Y = v => bot - (v - lo) / (hi - lo) * (bot - top);
  for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) { el("line", {x1: F.L, x2: F.R, y1: Y(v), y2: Y(v), stroke: "#e3e9f0"}, S); el("text", {x: F.L - 6, y: Y(v) + 4, "font-size": 12, fill: "#5b6875", "text-anchor": "end"}, S, v + "°"); }
  el("path", {d: "M" + H.map((h, i) => `${F.X(i)},${Y(h.temp_hi)}`).join("L") + "L" + H.map((h, i) => `${F.X(F.n - i)},${Y(H[F.n - i].temp_lo)}`).join("L") + "Z", fill: "rgba(228,87,46,.15)"}, S);
  el("path", {d: "M" + H.map((h, i) => `${F.X(i)},${Y(h.temp)}`).join("L"), fill: "none", stroke: "#e4572e", "stroke-width": 3}, S);
  const w = (F.R - F.L) / F.n * .7, Ys = v => 256 - v / 60 * 48, Yr = v => 262 + v / 100 * 40;
  el("text", {x: F.L, y: 202, "font-size": 11.5, fill: "#c47f0c", "font-weight": 600}, S, "sunshine, minutes in the hour");
  el("text", {x: F.L, y: 318, "font-size": 11.5, fill: "#2f7fd8", "font-weight": 600}, S, "chance of rain");
  el("line", {x1: F.L, x2: F.R, y1: 256, y2: 256, stroke: "#cbd5df"}, S);
  H.forEach((h, i) => { el("rect", {x: F.X(i) - w / 2, y: Ys(h.sun), width: w, height: 256 - Ys(h.sun), rx: 2, fill: "#f5a524", opacity: .85}, S);
    el("rect", {x: F.X(i) - w / 2, y: 262, width: w, height: Yr(h.rain) - 262, rx: 2, fill: "#2f7fd8", opacity: .7}, S); });
  el("text", {x: F.L - 6, y: Ys(60) + 4, "font-size": 11, fill: "#c47f0c", "text-anchor": "end"}, S, "60"); el("text", {x: F.L - 6, y: Yr(100), "font-size": 11, fill: "#2f7fd8", "text-anchor": "end"}, S, "100%");
  dk2Now(S, H, F, top, 302); dk2Hours(S, H, F, 186); dk2Hover(S, H, F, top, 306, dk2Tfmt);
}
// ---------- sun and rain A: two clear rows ----------
function sA() {
  const S = document.getElementById("sA"), H = hours(), F = dk2Frame(S, H, 230), w = (F.R - F.L) / F.n * .7, Ys = v => 100 - v / 60 * 80, Yr = v => 196 - v / 100 * 70;
  el("text", {x: F.L, y: 14, "font-size": 12, fill: "#c47f0c", "font-weight": 600}, S, "Sunshine, minutes in each hour");
  [0, 30, 60].forEach(v => { el("line", {x1: F.L, x2: F.R, y1: Ys(v), y2: Ys(v), stroke: "#e3e9f0"}, S); el("text", {x: F.L - 6, y: Ys(v) + 4, "font-size": 11, fill: "#c47f0c", "text-anchor": "end"}, S, v); });
  el("text", {x: F.L, y: 120, "font-size": 12, fill: "#2f7fd8", "font-weight": 600}, S, "Chance of rain in each hour");
  [0, 50, 100].forEach(v => { el("line", {x1: F.L, x2: F.R, y1: Yr(v), y2: Yr(v), stroke: "#e3e9f0"}, S); el("text", {x: F.L - 6, y: Yr(v) + 4, "font-size": 11, fill: "#2f7fd8", "text-anchor": "end"}, S, v + "%"); });
  H.forEach((h, i) => { el("rect", {x: F.X(i) - w / 2, y: Ys(h.sun), width: w, height: 100 - Ys(h.sun), rx: 2, fill: "#f5a524"}, S);
    el("rect", {x: F.X(i) - w / 2, y: Yr(h.rain), width: w, height: 196 - Yr(h.rain), rx: 2, fill: "#2f7fd8", opacity: .8}, S); });
  dk2Now(S, H, F, 20, 196); dk2Hours(S, H, F, 216); dk2Hover(S, H, F, 20, 200, h => `Sunshine ${h.sun} min<br>Chance of rain ${h.rain}%`);
}
// ---------- sun and rain B: a sky strip, one cell per hour ----------
function sB() {
  const S = document.getElementById("sB"), H = hours(), F = dk2Frame(S, H, 212), cw = (F.R - F.L) / (F.n + 1), rmax = Math.max(...H.map(h => h.rain));
  H.forEach((h, i) => { const x = F.L + i * cw, k = hr(h.t), night = k < 7 || k > 17;
    el("rect", {x: x + 1, y: 10, width: cw - 2, height: 70, rx: 4, fill: night ? "#2b3f5e" : "#e9eef3"}, S);
    if (!night) el("rect", {x: x + 1, y: 80 - h.sun / 60 * 70, width: cw - 2, height: h.sun / 60 * 70, rx: 4, fill: "#f5a524"}, S);
    if (h.rain >= 1) el("circle", {cx: x + cw / 2, cy: 98, r: 1.6 + h.rain / 100 * 8, fill: "#2f7fd8", opacity: .4 + h.rain / 200}, S);
    if (dk2VW() > 400 && h.rain >= 20) el("text", {x: x + cw / 2, y: 124, "font-size": 10.5, fill: "#2f7fd8", "text-anchor": "middle"}, S, h.rain + "%"); });
  dk2Hours(S, H, {X: i => F.L + (i + .5) * cw}, 138);
  const lg = [["#f5a524", "sun: the taller, the more minutes of sun"], ["#2b3f5e", "night"]]; let lx = F.L;
  lg.forEach(([c, t], j) => { el("rect", {x: lx, y: 152 + j * 18, width: 12, height: 12, rx: 3, fill: c}, S); el("text", {x: lx + 17, y: 162 + j * 18, "font-size": 11.5, fill: "#5b6875"}, S, t); });
  el("circle", {cx: F.L + 6, cy: 193, r: 5, fill: "#2f7fd8"}, S);
  el("text", {x: F.L + 17, y: 197, "font-size": 11.5, fill: "#5b6875"}, S, rmax < 10 ? `rain: bigger dot, likelier. Dry: at most ${rmax}% in any hour` : "rain: the bigger the dot, the likelier; % shown from 20%");
  dk2Hover(S, H, {X: i => F.L + (i + .5) * cw, R: F.R, L: F.L, n: F.n + 1}, 10, 130, h => `Sunshine ${h.sun} min<br>Chance of rain ${h.rain}%`);
}

// ---------- how good is it ----------
const DK2V = [["wind", "Wind speed"], ["temp", "Temperature"], ["sun", "Sunshine"], ["rain", "Rain"]];
function dk2Score(k) { const d = DK2W[k], me = d.rows.find(r => r.name == "DKcast"), pub = d.rows.filter(r => r.name != "DKcast").sort((a, b) => a.val - b.val);
  return {u: d.unit, me: me.val, best: pub[0], ifs: d.rows.find(r => r.name == "ECMWF IFS"), dmi: d.rows.find(r => r.name == "DMI HARMONIE"), yr: d.rows.find(r => r.name.startsWith("yr.no")), all: pub}; }
const dk2F = (v, u) => u == "Brier" ? v.toFixed(3) : v.toFixed(u == "min/h" ? 1 : 2);
const dk2U = u => u == "Brier" ? "Brier score" : u == "min/h" ? "minutes per hour" : u;
const dk2Lead = () => { if (!DK2W) return ""; const s = DK2V.map(([k]) => Math.round(100 * (1 - dk2Score(k).me / dk2Score(k).best.val)));
  return `On 2026 data it never saw, DKcast had ${Math.min(...s)} to ${Math.max(...s)}% less error than the best public forecast on wind, temperature and sunshine, and was better at calling rain or no rain.`; };
function gA() {
  const host = document.getElementById("gA"); if (!DK2W) return;
  host.innerHTML = `<p style="margin:0 0 10px;font-size:15px;font-weight:500">${dk2Lead()}</p><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr style="color:var(--soft);font-size:12px"><th style="text-align:left;font-weight:500;padding:6px 8px">Typical miss</th><th style="text-align:right;font-weight:500;padding:6px 8px">DKcast</th><th style="text-align:right;font-weight:500;padding:6px 8px">Best public</th><th style="text-align:right;font-weight:500;padding:6px 8px">DMI</th><th style="text-align:right;font-weight:500;padding:6px 8px">DKcast's lead</th></tr>` +
    DK2V.map(([k, nm]) => { const s = dk2Score(k), p = Math.round(100 * (1 - s.me / s.best.val));
      return `<tr style="border-top:1px solid var(--line)"><td style="padding:8px">${nm}<div style="font-size:11.5px;color:var(--soft)">${dk2U(s.u)}</div></td>
        <td style="text-align:right;padding:8px;font-weight:700;color:var(--accent)">${dk2F(s.me, s.u)}</td>
        <td style="text-align:right;padding:8px" title="${s.best.name}">${dk2F(s.best.val, s.u)}<div class="ec" style="font-size:11px;color:var(--soft)">${s.best.name}</div></td>
        <td style="text-align:right;padding:8px">${s.dmi ? dk2F(s.dmi.val, s.u) : "n/a"}</td><td style="text-align:right;padding:8px;font-weight:700">${p}%</td></tr>`; }).join("") +
    `</table></div><p class="note">Lower is better. DMI is DMI's own HARMONIE model. Every public model was given its own correction per station before the comparison. "Best public" is whichever did best on that variable; for temperature and sunshine that is the plain average of all the models.</p>`;
}
function gB() {
  const host = document.getElementById("gB"); if (!DK2W) return;
  host.innerHTML = `<p style="margin:0 0 10px;font-size:15px;font-weight:500">${dk2Lead()}</p><svg id="gBsvg" style="width:100%"></svg><p class="note">Each row is one kind of weather. The dashed line is the best public forecast for it, set to 100%; grey dots are the other public models, blue is ECMWF and green is DKcast. Hover a dot for its exact error.</p>`;
  const S = document.getElementById("gBsvg"), VW = dk2VW(), L = VW < 400 ? 96 : 120, R = VW - (VW < 400 ? 66 : 70), lo = .8, hi = 1.45, x = q => L + (Math.min(hi, Math.max(lo, q)) - lo) / (hi - lo) * (R - L);
  S.setAttribute("viewBox", `0 0 ${VW} 250`);
  for (let q = .8; q <= 1.401; q += .2) { el("line", {x1: x(q), x2: x(q), y1: 6, y2: 222, stroke: "#e3e9f0"}, S); el("text", {x: x(q), y: 240, "font-size": 11, fill: "#5b6875", "text-anchor": "middle"}, S, Math.round(q * 100) + "%"); }
  el("line", {x1: x(1), x2: x(1), y1: 6, y2: 222, stroke: "#14202b", "stroke-dasharray": "4 3"}, S);
  DK2V.forEach(([k, nm], i) => { const s = dk2Score(k), y = 34 + i * 54;
    el("text", {x: L - 12, y: y + 4, "font-size": VW < 400 ? 12 : 13, "font-weight": 600, "text-anchor": "end", fill: "#14202b"}, S, nm);
    el("line", {x1: L, x2: R, y1: y, y2: y, stroke: "#e3e9f0"}, S);
    s.all.forEach(r => { const c = el("circle", {cx: x(r.val / s.best.val), cy: y, r: 5, fill: r.name == "ECMWF IFS" ? "#2f7fd8" : "#a3afbd", stroke: "#fff"}, S);
      c.addEventListener("pointermove", e => tipShow(e, `${r.name}: ${dk2F(r.val, s.u)} ${dk2U(s.u)}`)); c.addEventListener("pointerleave", tipHide); });
    const c = el("circle", {cx: x(s.me / s.best.val), cy: y, r: 8, fill: "#0f766e", stroke: "#fff", "stroke-width": 1.5}, S);
    c.addEventListener("pointermove", e => tipShow(e, `DKcast: ${dk2F(s.me, s.u)} ${dk2U(s.u)}<br>best public, ${s.best.name}: ${dk2F(s.best.val, s.u)}`)); c.addEventListener("pointerleave", tipHide);
    el("text", {x: R + 8, y: y + 4, "font-size": 12.5, "font-weight": 600, fill: "#0f766e"}, S, Math.round(100 * (1 - s.me / s.best.val)) + "% less"); });
}
function gC() {
  const host = document.getElementById("gC"); if (!DK2W) return;
  // yr.no is what most Danes check; this option compares DKcast with yr.no and DMI, the two forecasts people know
  const cell = (k, who) => { const s = dk2Score(k), r = DK2W[k].rows.find(x => x.name == who); if (!r) return `<td style="padding:8px;color:var(--soft);font-style:italic">no ${k == "sun" ? "sunshine " : ""}forecast published</td>`;
    const p = Math.round(100 * (1 - s.me / r.val)); return `<td style="padding:8px" title="DKcast ${dk2F(s.me, s.u)} against ${dk2F(r.val, s.u)} ${dk2U(s.u)}"><b style="font-size:20px;color:var(--accent)">${p}%</b> less error<div style="height:6px;background:#eef2f6;border-radius:3px;margin-top:5px"><i style="display:block;height:6px;border-radius:3px;background:var(--accent);width:${p / 35 * 100}%"></i></div></td>`; };
  host.innerHTML = `<p style="margin:0 0 10px;font-size:15px;font-weight:500">Against the two forecasts most people in Denmark check, yr.no and DMI, DKcast made less error on everything they forecast.</p>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="font-size:12px;color:var(--soft)"><th></th><th style="text-align:left;font-weight:500;padding:6px 8px">against yr.no</th><th style="text-align:left;font-weight:500;padding:6px 8px">against DMI</th></tr>` +
    DK2V.map(([k, nm]) => `<tr style="border-top:1px solid var(--line)"><td style="padding:8px;font-weight:600">${nm}</td>${cell(k, "yr.no (MET Nordic)")}${cell(k, "DMI HARMONIE")}</td></tr>`).join("") +
    `</table></div><p class="note">yr.no is MET Norway's 1 km forecast as issued; DMI is its HARMONIE model. Each was given its own correction per station first. Tested once on 1 January to 18 October 2026. Hover a cell for the two errors.</p>`;
}
function dk2All() { if (!D || !sid) return; tA(); tB(); tC(); tD(); sA(); sB(); gA(); gB(); gC(); yFix(); }

// ---------- temperature D: the chart as it is now, with option A's type sizes ----------
function tD() {
  const S = document.getElementById("tD"), H = hours(), F = dk2Frame(S, H, 230), top = 14, bot = 196;
  const lo = Math.floor(Math.min(...H.map(h => h.temp_lo)) - .5), hi = Math.ceil(Math.max(...H.map(h => h.temp_hi)) + .5), Y = v => bot - (v - lo) / (hi - lo) * (bot - top);
  for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) { el("line", {x1: F.L, x2: F.R, y1: Y(v), y2: Y(v), stroke: "#e3e9f0"}, S); el("text", {x: F.L - 6, y: Y(v) + 4, "font-size": 12, fill: "#5b6875", "text-anchor": "end"}, S, v + "°"); }
  el("path", {d: "M" + H.map((h, i) => `${F.X(i)},${Y(h.temp_hi)}`).join("L") + "L" + H.map((h, i) => `${F.X(F.n - i)},${Y(H[F.n - i].temp_lo)}`).join("L") + "Z", fill: "rgba(228,87,46,.15)"}, S);
  el("path", {d: "M" + H.map((h, i) => `${F.X(i)},${Y(h.temp)}`).join("L"), fill: "none", stroke: "#e4572e", "stroke-width": 3}, S);
  dk2Hours(S, H, F, 220); dk2Hover(S, H, F, top, bot, dk2Tfmt);
}
// ---------- yesterday's chart, redrawn with the same type sizes as the other charts ----------
function yFix() {
  const S = document.getElementById("ychart"), Y0 = D && D.yesterday; if (!S || !Y0) return; const H = Y0.stations[sid] || []; if (!H.length) return;
  const F = dk2Frame(S, H, 210), top = 10, bot = 180, vals = H.flatMap(h => [h.temp, h.temp_obs]).filter(v => v != null), lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1), Y = v => bot - (v - lo) / (hi - lo) * (bot - top);
  for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) { el("line", {x1: F.L, x2: F.R, y1: Y(v), y2: Y(v), stroke: "#e3e9f0"}, S); el("text", {x: F.L - 6, y: Y(v) + 4, "font-size": 12, fill: "#5b6875", "text-anchor": "end"}, S, v + "°"); }
  el("path", {d: "M" + H.map((h, i) => `${F.X(i)},${Y(h.temp)}`).join("L"), fill: "none", stroke: "#e4572e", "stroke-width": 3}, S);
  H.forEach((h, i) => { if (h.temp_obs != null) el("circle", {cx: F.X(i), cy: Y(h.temp_obs), r: 3.5, fill: "#14202b"}, S); });
  dk2Hours(S, H, F, 202); dk2Hover(S, H, F, top, bot, h => `Forecast ${h.temp.toFixed(1)} °C<br>Measured ${h.temp_obs != null ? h.temp_obs.toFixed(1) + " °C" : "no reading"}`);
}
