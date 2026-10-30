/* Valuecompass — site behaviour. No dependencies. */
(() => {
  "use strict";

  // Inquiries are mailed by Web3Forms (web3forms.com) to the address the access key was
  // created for. The key is public by design; paste it here.
  const WEB3FORMS_KEY = "14520e16-e9c5-473a-b3e5-f502ed1af8a3";
  const FORM_ENDPOINT = "https://api.web3forms.com/submit";

  const EASE = "cubic-bezier(.16, 1, .3, 1)";
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  const phoneMQ = window.matchMedia("(max-width: 809px)");
  const tabletMQ = window.matchMedia("(max-width: 1599px)");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- mobile menu ---------- */
  function initMenu() {
    const btn = $(".nav__menu"), panel = $("#mmenu");
    if (!btn || !panel) return;
    const set = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (open) setTimeout(() => $("a", panel)?.focus(), 60);
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("is-open")) { set(false); btn.focus(); }
    });
    phoneMQ.addEventListener("change", (e) => { if (!e.matches) set(false); });
  }

  /* ---------- text splitting ---------- */
  function splitChars(el, cls) {
    let i = 0;
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${c}</span>`).join("")}</span>`).join(" ");
    el.classList.add(cls);
  }
  function splitWords(el) {
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="wd" aria-hidden="true" style="--i:${i}">${w}</span>`).join(" ");
    el.classList.add("split-w");
  }
  function splitLines(el) {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p, i) => `<span class="ln" style="--i:${i}">${p.trim()}</span>`).join("<br>");
    el.classList.add("split-l");
  }
  function initSplits() {
    for (const el of $$("[data-split]")) {
      const kind = el.dataset.split;
      if (kind === "chars") splitChars(el, "split-c");
      else if (kind === "blur") splitChars(el, "split-b");
      else if (kind === "words") splitWords(el);
      else if (kind === "lines") splitLines(el);
    }
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    const targets = $$("[data-reveal], [data-split]");
    const show = (el) => el.classList.add("is-in");
    // the first screen of the home hero plays on load
    for (const el of $$(".hero [data-reveal], .hero [data-split]")) requestAnimationFrame(() => show(el));
    if (!("IntersectionObserver" in window)) { targets.forEach(show); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 });
    targets.filter((el) => !el.closest(".hero")).forEach((el) => io.observe(el));
  }

  /* ---------- home hero: rolling word, then the logo scene ---------- */
  function initRotator() {
    const root = $("[data-rotator]");
    if (!root) return;
    const words = root.dataset.words.split(",").map((w) => w.split("|"));
    const slot = $(".rotator__slot", root), line = $(".rotator__line", root), scene = $(".scene", root);
    const html = ([w, p]) => `<b>${w}</b>${p}`;
    const reduce = reduceMQ.matches;
    const STEP = 800;
    let index = 0, current = $(".rotator__word", root);

    const roll = () => {
      index++;
      const next = document.createElement("span");
      next.className = "rotator__word";
      next.innerHTML = html(words[index]);
      slot.appendChild(next);
      const opts = { duration: 300, easing: EASE, fill: "forwards" };
      const old = current;
      old.animate(reduce ? [{ opacity: 1 }, { opacity: 0 }] : [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-105%)", opacity: 0 }], opts).finished.then(() => old.remove());
      next.animate(reduce ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: "translateY(105%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], opts);
      current = next;
    };
    const finale = () => {
      root.classList.add("is-done");
      const img = $("img", scene), outro = $("p", scene);
      const c = "translate(-50%, -50%)";
      if (reduce) {
        line.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: EASE, fill: "forwards" });
        scene.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 780, delay: 120, easing: EASE, fill: "both" });
        img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 300, easing: EASE, fill: "both" });
        outro.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 660, delay: 1050, easing: EASE, fill: "both" });
        return;
      }
      line.animate([{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }, { opacity: 0, transform: "scale(.92)", filter: "blur(10px)" }], { duration: 420, easing: EASE, fill: "forwards" });
      scene.animate([{ opacity: 0, transform: `${c} scale(1.16)`, filter: "blur(14px)" }, { opacity: 1, transform: `${c} scale(1)`, filter: "blur(0px)" }], { duration: 780, delay: 120, easing: EASE, fill: "both" });
      img.animate([{ opacity: 0, transform: "scale(2.4)", filter: "blur(12px)" }, { opacity: 1, transform: "scale(1)", filter: "blur(0px)" }], { duration: 1150, delay: 300, easing: EASE, fill: "both" });
      outro.animate([{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 660, delay: 1050, easing: EASE, fill: "both" });
    };
    const tick = () => {
      if (index < words.length - 1) { roll(); setTimeout(tick, STEP); }
      else finale();
    };
    if (!Element.prototype.animate) { root.classList.add("is-done"); line.style.opacity = "0"; return; }
    setTimeout(tick, STEP);
  }

  /* ---------- ambient colour blobs behind the page ---------- */
  function initAmbient() {
    const COLORS = ["#0D9488", "#1F5F7A", "#176B5E", "#2A4A7F"];
    const OPACITY = [0.2, 0.18, 0.19, 0.17];
    const SIZES = [800, 760, 820, 740];
    const DURS = [19, 23, 17, 24, 21, 18, 22, 20];
    const layer = document.createElement("div");
    layer.className = "ambient";
    layer.setAttribute("aria-hidden", "true");
    document.body.prepend(layer);
    let lastKey = "";
    const draw = () => {
      layer.style.height = "0px";
      const H = document.documentElement.scrollHeight;
      const W = document.documentElement.clientWidth;
      const key = `${W}x${H}`;
      layer.style.height = H + "px";
      if (key === lastKey) return;
      lastKey = key;
      const k = phoneMQ.matches ? 0.62 : tabletMQ.matches ? 0.82 : 1;
      const blur = phoneMQ.matches ? 70 : 90;
      const n = Math.min(16, Math.max(2, Math.round(H / 900)));
      let out = "";
      for (let i = 0; i < n; i++) {
        const size = Math.round(SIZES[i % 4] * k);
        const frac = (i + 0.5) / n;
        const left = i % 2 === 0 ? (-200 + (i % 4) * 30) * k : W - size + 190 * k;
        const top = frac * H - size / 2;
        out += `<i style="width:${size}px;height:${size}px;left:${left}px;top:${top}px;background:${COLORS[i % 4]};opacity:${OPACITY[i % 4]};--blur:${blur}px;--dur:${DURS[i % 8]}s;animation-direction:${i % 2 ? "alternate-reverse" : "alternate"};animation-delay:-${(i * 3.7) % 11}s"></i>`;
      }
      layer.innerHTML = out;
    };
    draw();
    let t;
    const later = () => { clearTimeout(t); t = setTimeout(draw, 200); };
    window.addEventListener("resize", later);
    window.addEventListener("load", draw);
    if ("ResizeObserver" in window) new ResizeObserver(later).observe($("main"));
  }

  /* ---------- logo ticker: second copy for a seamless loop ---------- */
  function initTicker() {
    for (const track of $$(".ticker__track")) {
      for (const li of [...track.children]) {
        const copy = li.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        track.appendChild(copy);
      }
    }
  }

  /* ---------- consulting hero video: wide or tall cut ---------- */
  function initVideo() {
    const v = $("[data-hero-video]");
    if (!v) return;
    const pick = () => {
      const tall = phoneMQ.matches;
      const src = tall ? v.dataset.srcTall : v.dataset.srcWide;
      v.poster = tall ? v.dataset.posterTall : v.dataset.posterWide;
      if (reduceMQ.matches) { v.removeAttribute("src"); v.load(); return; }
      if (v.getAttribute("src") !== src) { v.src = src; v.load(); }
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    pick();
    phoneMQ.addEventListener("change", pick);
    reduceMQ.addEventListener("change", pick);
  }

  /* ---------- inquiry forms ---------- */
  function initForms() {
    for (const form of $$("form[data-inquiry]")) {
      const status = $(".form__status", form);
      const say = (msg, kind) => { status.textContent = msg; status.className = "form__status" + (kind ? " is-" + kind : ""); };
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const data = new FormData(form);
        if (data.get("website")) { form.reset(); say("문의가 접수되었습니다. 영업일 기준 하루 안에 연락드리겠습니다.", "ok"); return; }
        if (!WEB3FORMS_KEY) { say("지금은 온라인 접수를 받을 수 없습니다. main@vlcom.co.kr로 보내 주세요.", "err"); return; }
        const v = Object.fromEntries(["company", "name", "email", "phone", "message"].map((k) => [k, String(data.get(k) || "").trim()]));
        const payload = {
          access_key: WEB3FORMS_KEY,
          subject: `[홈페이지 문의] ${v.company} · ${v.name}`,
          from_name: "밸류컴퍼스 홈페이지",
          replyto: v.email,
          "회사명": v.company,
          "담당자 이름": v.name,
          "이메일": v.email,
          "연락처": v.phone,
          "문의 내용": v.message,
          "접수 페이지": location.pathname,
          botcheck: false,
        };
        form.classList.add("is-sending");
        say("보내는 중입니다…");
        try {
          const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
          const json = await res.json().catch(() => ({}));
          if (!res.ok || json.success !== true) throw new Error(json.message || res.status);
          form.reset();
          say("문의가 접수되었습니다. 영업일 기준 하루 안에 연락드리겠습니다.", "ok");
        } catch (err) {
          say("전송하지 못했습니다. 잠시 후 다시 시도하시거나 main@vlcom.co.kr로 보내 주세요.", "err");
        } finally {
          form.classList.remove("is-sending");
        }
      });
    }
  }

  const start = () => {
    initMenu();
    initSplits();
    initReveal();
    initRotator();
    initAmbient();
    initTicker();
    initVideo();
    initForms();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
