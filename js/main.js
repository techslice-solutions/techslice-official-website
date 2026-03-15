/* =========================
   SANITY CONFIG
========================= */
const sanityProjectId = "ibgcims7";
const dataset = "production";
const apiVersion = "v2023-01-01";

/* =========================
   GENERIC FETCH
========================= */
async function fetchContent(query) {
  const url =
    `https://${sanityProjectId}.api.sanity.io/${apiVersion}/data/query/${dataset}` +
    `?query=${encodeURIComponent(query)}`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sanity fetch failed (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json();

  if (data?.error) {
    throw new Error(`Sanity GROQ error: ${data.error.description || JSON.stringify(data.error)}`);
  }

  return data.result;
}

/* =========================
   HELPERS (AUTO-HIDE EMPTY)
========================= */
function setTextIf(el, value) {
  if (!el) return false;
  const v = (value ?? "").toString().trim();
  el.hidden = !v;
  if (v) el.textContent = v;
  return !!v;
}

function setHtmlIf(el, html) {
  if (!el) return false;
  const v = (html ?? "").toString().trim();
  el.hidden = !v;
  if (v) el.innerHTML = v;
  return !!v;
}

function setHrefIf(el, url) {
  if (!el) return false;
  const v = (url ?? "").toString().trim();
  el.hidden = !v;
  if (v) el.href = v;
  return !!v;
}

function escapeHtml(str) {
  return (str ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textToParagraphs(text) {
  const raw = (text ?? "").toString().trim();
  if (!raw) return "";
  return raw
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin-top:10px;">${escapeHtml(p)}</p>`)
    .join("");
}

function sanityImageUrl(image) {
  const ref = image?.asset?._ref;
  if (!ref) return null;
  const [, id, dims, format] = ref.split("-");
  return `https://cdn.sanity.io/images/${sanityProjectId}/${dataset}/${id}-${dims}.${format}`;
}

/* =========================
   PAGE HERO RENDERER
========================= */
function renderPageHero({ title, subtitle, image }) {
  const hero = document.getElementById("pageHero");
  if (!hero) return;

  const titleEl = document.getElementById("pageHeroTitle");
  const subtitleEl = document.getElementById("pageHeroSubtitle");
  const imgEl = document.getElementById("pageHeroImage");

  const t = (title ?? "").toString().trim();
  const s = (subtitle ?? "").toString().trim();
  const imgUrl = sanityImageUrl(image);

  if (titleEl) titleEl.textContent = t || "";

  if (subtitleEl) {
    subtitleEl.textContent = s || "";
    subtitleEl.style.display = s ? "" : "none";
  }

  if (imgEl) {
    if (imgUrl) {
      imgEl.src = imgUrl;
      imgEl.alt = t || "Page hero";
    } else {
      imgEl.removeAttribute("src");
      imgEl.alt = "";
    }
  }

  hero.hidden = !t && !s && !imgUrl;
}

/* =========================
   PORTABLE TEXT -> HTML
========================= */
function portableTextToHtml(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";

  const markDefsByKey = (block) => {
    const defs = Array.isArray(block?.markDefs) ? block.markDefs : [];
    const map = {};
    defs.forEach((d) => {
      if (d?._key) map[d._key] = d;
    });
    return map;
  };

  const renderSpans = (block) => {
    const defs = markDefsByKey(block);
    const children = Array.isArray(block?.children) ? block.children : [];

    return children
      .map((child) => {
        if (child?._type !== "span") return "";
        let txt = escapeHtml(child.text || "");

        const marks = Array.isArray(child.marks) ? child.marks : [];
        marks.forEach((m) => {
          if (m === "strong") txt = `<strong>${txt}</strong>`;
          else if (m === "em") txt = `<em>${txt}</em>`;
          else if (m === "underline") txt = `<u>${txt}</u>`;
          else if (defs[m]?._type === "link") {
            const href = (defs[m]?.href || "").toString().trim();
            const safeHref = escapeHtml(href);
            if (safeHref) txt = `<a href="${safeHref}" target="_blank" rel="noopener">${txt}</a>`;
          }
        });

        return txt;
      })
      .join("");
  };

  const html = [];
  let listMode = null;

  const closeListIfOpen = () => {
    if (listMode) {
      html.push(`</${listMode}>`);
      listMode = null;
    }
  };

  for (const block of blocks) {
    if (!block) continue;

    if (block._type === "block" && block.listItem) {
      const nextMode = block.listItem === "number" ? "ol" : "ul";
      if (listMode !== nextMode) {
        closeListIfOpen();
        listMode = nextMode;
        html.push(`<${listMode}>`);
      }
      html.push(`<li>${renderSpans(block)}</li>`);
      continue;
    }

    closeListIfOpen();

    if (block._type === "block") {
      const style = (block.style || "normal").toLowerCase();
      const inner = renderSpans(block);
      if (!inner.trim()) continue;

      if (style === "h1") html.push(`<h1>${inner}</h1>`);
      else if (style === "h2") html.push(`<h2>${inner}</h2>`);
      else if (style === "h3") html.push(`<h3>${inner}</h3>`);
      else if (style === "blockquote") html.push(`<blockquote>${inner}</blockquote>`);
      else html.push(`<p>${inner}</p>`);
      continue;
    }

    if (block._type === "image") {
      const url = sanityImageUrl(block);
      if (url) html.push(`<p><img src="${url}" alt=""></p>`);
    }
  }

  closeListIfOpen();
  return html.join("");
}

/* =========================
   ABOUT MISSION FLOW
========================= */
function renderMissionFlow(splitSections) {
  const splitSectionEl = document.getElementById("aboutSplitSections");
  const splitWrap = document.getElementById("aboutSplitWrap");
  if (!splitSectionEl || !splitWrap) return;

  const items = Array.isArray(splitSections) ? splitSections : [];
  if (!items.length) {
    splitSectionEl.hidden = true;
    splitWrap.innerHTML = "";
    return;
  }

  const themeClasses = [
    "theme-red",
    "theme-gold",
    "theme-sky",
    "theme-indigo",
    "theme-soft-red",
    "theme-steel"
  ];

  const icons = [
    `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="34" width="8" height="16" fill="currentColor"/>
      <rect x="23" y="24" width="8" height="26" fill="currentColor"/>
      <rect x="36" y="14" width="8" height="36" fill="currentColor"/>
      <rect x="49" y="6" width="8" height="44" fill="currentColor"/>
      <rect x="8" y="52" width="51" height="4" fill="currentColor"/>
    </svg>
    `,
    `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M25 10L29 6L35 12L39 11L42 15L40 20L43 24L39 29L34 27L30 30L24 24L25 20L22 16L25 10Z" fill="currentColor"/>
      <circle cx="32" cy="18" r="5" fill="white" opacity="0.95"/>
      <path d="M12 35L16 31L22 37L26 36L29 40L27 45L30 49L26 54L21 52L17 55L11 49L12 45L9 41L12 35Z" fill="currentColor"/>
      <circle cx="19" cy="43" r="5" fill="white" opacity="0.95"/>
    </svg>
    `,
    `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M32 8C22.6 8 15 15.4 15 24.5C15 30.1 17.9 35 22.5 37.9C25 39.5 26.4 41.7 26.7 44H37.3C37.6 41.7 39 39.5 41.5 37.9C46.1 35 49 30.1 49 24.5C49 15.4 41.4 8 32 8Z" stroke="currentColor" stroke-width="4" fill="none"/>
      <path d="M26 50H38" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <path d="M28 56H36" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <path d="M10 24H6" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <path d="M58 24H54" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <path d="M16 12L13 9" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <path d="M48 12L51 9" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    </svg>
    `,
    `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M39 10C30 11 22 18 20 27L11 36L18 38L20 45L29 43C38 41 45 33 46 24L47 17L39 10Z" fill="currentColor"/>
      <circle cx="37" cy="21" r="4" fill="white"/>
      <path d="M16 40L10 46" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <path d="M24 48L18 54" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    </svg>
    `,
    `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M15 16H49V24H15V16Z" fill="currentColor"/>
      <path d="M15 28H49V36H15V28Z" fill="currentColor" opacity="0.78"/>
      <path d="M15 40H37V48H15V40Z" fill="currentColor" opacity="0.58"/>
    </svg>
    `,
    `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="32" r="7" fill="currentColor"/>
      <circle cx="44" cy="20" r="7" fill="currentColor" opacity="0.8"/>
      <circle cx="44" cy="44" r="7" fill="currentColor" opacity="0.65"/>
      <path d="M26 30L38 22" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <path d="M26 34L38 42" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    </svg>
    `
  ];

  splitWrap.innerHTML = items
    .map((sec, index) => {
      const title = (sec?.title || "").trim();
      const leftHtml = portableTextToHtml(sec?.left);
      const rightHtml = portableTextToHtml(sec?.right);
      const bodyHtml = `${leftHtml}${rightHtml}`.trim();

      if (!title && !bodyHtml) return "";

      return `
        <article class="mission-card ${themeClasses[index % themeClasses.length]} ${index === 0 ? "active" : ""}" tabindex="0">
          <div class="mission-card-inner">
            <div class="mission-card-top">
              <div class="mission-icon">
                ${icons[index % icons.length]}
              </div>
            </div>
            <div class="mission-card-bottom">
              ${title ? `<h3 class="mission-title">${escapeHtml(title)}</h3>` : ""}
              <div class="mission-divider"></div>
              <div class="mission-body richtext">${bodyHtml}</div>
            </div>
          </div>
        </article>
      `;
    })
    .filter(Boolean)
    .join("");

  const cards = Array.from(splitWrap.querySelectorAll(".mission-card"));
  if (!cards.length) {
    splitSectionEl.hidden = true;
    return;
  }

  splitSectionEl.hidden = false;

  let activeIndex = 0;
  let intervalId = null;

  function setActive(index) {
    cards.forEach((card, i) => {
      card.classList.toggle("active", i === index);
    });
    activeIndex = index;
  }

  function stopRotation() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startRotation() {
    stopRotation();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (cards.length <= 1) return;

    intervalId = setInterval(() => {
      activeIndex = (activeIndex + 1) % cards.length;
      setActive(activeIndex);
    }, 2600);
  }

  cards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => {
      stopRotation();
      setActive(index);
    });

    card.addEventListener("mouseleave", () => {
      startRotation();
    });

    card.addEventListener("focusin", () => {
      stopRotation();
      setActive(index);
    });

    card.addEventListener("focusout", () => {
      startRotation();
    });

    card.addEventListener("click", () => {
      setActive(index);
    });
  });

  setActive(0);
  startRotation();
}

/* =========================
   ABOUT UI ENHANCERS
========================= */
function buildAboutHighlightsAndStats() {
  const body = document.getElementById("aboutBody");
  if (!body) return;

  const highlightsWrap = document.getElementById("aboutHighlights");
  const highlightsGrid = document.getElementById("aboutHighlightsGrid");
  const statsWrap = document.getElementById("aboutStats");
  const statsGrid = document.getElementById("aboutStatsGrid");

  if (!highlightsWrap || !highlightsGrid || !statsWrap || !statsGrid) return;

  const h3s = Array.from(body.querySelectorAll("h3"));
  const cards = [];

  h3s.forEach((h3) => {
    const next = h3.nextElementSibling;
    const desc = next && next.tagName.toLowerCase() === "p" ? next.textContent.trim() : "";
    const title = h3.textContent.trim();
    if (!title && !desc) return;

    cards.push({ title, desc });

    h3.remove();
    if (next && next.tagName && next.tagName.toLowerCase() === "p") next.remove();
  });

  if (cards.length) {
    highlightsGrid.innerHTML = cards
      .slice(0, 6)
      .map((c) => {
        return `
          <div class="mini-card">
            <h3 style="color:var(--indigo); margin-bottom:6px;">${escapeHtml(c.title)}</h3>
            ${c.desc ? `<p style="margin:0;">${escapeHtml(c.desc)}</p>` : ""}
          </div>
        `;
      })
      .join("");

    highlightsWrap.hidden = false;
  } else {
    highlightsWrap.hidden = true;
  }

  const ps = Array.from(body.querySelectorAll("p"));
  const stats = [];

  ps.forEach((p) => {
    const txt = (p.textContent || "").trim();
    const m = txt.match(/^(\d[\d,\.]*%?)\s+(.+)$/);
    if (!m) return;

    const value = m[1].trim();
    const label = m[2].trim();

    if (label.length > 42) return;

    stats.push({ value, label });
    p.remove();
  });

  if (stats.length) {
    statsGrid.innerHTML = stats
      .slice(0, 4)
      .map((s) => {
        return `
          <div style="min-width:130px; text-align:center; padding:10px 12px; border-radius:14px; background:#fff; box-shadow:0 10px 26px rgba(0,0,0,.06);">
            <div style="font-size:1.9rem; font-weight:900; color:var(--indigo); line-height:1;">${escapeHtml(s.value)}</div>
            <div style="margin-top:6px; font-weight:750; color:rgba(0,0,0,.65); font-size:.95rem;">${escapeHtml(s.label)}</div>
          </div>
        `;
      })
      .join("");

    statsWrap.hidden = false;
  } else {
    statsWrap.hidden = true;
  }
}

/* =========================
   GLOBAL SETTINGS
========================= */
async function loadSiteSettings() {
  const settings = await fetchContent(`*[_type=="siteSettings"][0]{
    brandName, place, phone, linkedin, logo
  }`);

  if (!settings) return;

  const logoEl = document.getElementById("siteLogo");
  const logoUrl = sanityImageUrl(settings.logo);
  if (logoEl && logoUrl) logoEl.src = logoUrl;

  setTextIf(document.getElementById("footerBrand"), settings.brandName);
  setTextIf(document.getElementById("footerPlace"), settings.place);

  const phoneEl = document.getElementById("footerPhone");
  const phoneLine = phoneEl?.closest(".footer-line");
  if (phoneEl && settings.phone) {
    phoneEl.hidden = false;
    phoneEl.textContent = settings.phone;
    phoneEl.href = `tel:${String(settings.phone).replace(/[^\d+]/g, "")}`;
    if (phoneLine) phoneLine.hidden = false;
  } else {
    if (phoneEl) phoneEl.hidden = true;
    if (phoneLine) phoneLine.hidden = true;
  }

  setHrefIf(document.getElementById("footerLinkedin"), settings.linkedin);
}

/* =========================
   HOME: Trusted Partners renderer
========================= */
function renderPartnersBelt(partnersTitle, partners) {
  const section = document.getElementById("partnersSection");
  const titleEl = document.getElementById("partnersTitle");
  const track = document.getElementById("partnersTrack");

  if (!section || !titleEl || !track) return;

  const items = Array.isArray(partners) ? partners : [];
  const cards = items
    .map((p) => {
      const name = (p?.name ?? "").toString().trim();
      const logo = sanityImageUrl(p?.logo);
      const url = (p?.url ?? "").toString().trim();

      if (!name && !logo) return "";

      const inner = `
        <span class="partner-logo">
          ${logo ? `<img src="${logo}" alt="${escapeHtml(name)}">` : ""}
        </span>
        ${name ? `<span class="partner-name">${escapeHtml(name)}</span>` : ""}
      `.trim();

      return url
        ? `<a class="partner-item" href="${escapeHtml(url)}" target="_blank" rel="noopener">${inner}</a>`
        : `<div class="partner-item">${inner}</div>`;
    })
    .filter(Boolean);

  if (cards.length === 0) {
    section.hidden = true;
    return;
  }

  setTextIf(titleEl, partnersTitle || "Our Trusted Partners");
  track.innerHTML = cards.concat(cards).join("");
  track.classList.toggle("partners-track-anim", cards.length >= 3);
  section.hidden = false;
}

/* =========================
   HOME PAGE
========================= */
async function loadHomePage() {
  const hero = document.getElementById("homeHero");
  if (!hero) return;

  const page = await fetchContent(`*[_type=="homePage"][0]{
    heroTitle, heroSubtitle, heroFlow,
    primaryCtaText, primaryCtaLink,
    secondaryCtaText, secondaryCtaLink,
    heroImage,
    partnersTitle,
    trustedPartners[]{name, logo, url}
  }`);

  if (!page) return;

  const titleEl = document.getElementById("homeHeroTitle");
  const subtitleEl = document.getElementById("homeHeroSubtitle");
  const flowEl = document.getElementById("homeHeroFlow");
  const actionsEl = document.getElementById("homeHeroActions");

  const primaryBtn = document.getElementById("homePrimaryCta");
  const secondaryBtn = document.getElementById("homeSecondaryCta");

  const hasTitle = setTextIf(titleEl, page.heroTitle);
  const hasSub = setTextIf(subtitleEl, page.heroSubtitle);
  const hasFlow = setTextIf(flowEl, page.heroFlow);

  const showPrimary = !!(page.primaryCtaText && page.primaryCtaLink && primaryBtn);
  if (primaryBtn) {
    primaryBtn.hidden = !showPrimary;
    if (showPrimary) {
      primaryBtn.textContent = page.primaryCtaText;
      primaryBtn.href = page.primaryCtaLink;
    }
  }

  const showSecondary = !!(page.secondaryCtaText && page.secondaryCtaLink && secondaryBtn);
  if (secondaryBtn) {
    secondaryBtn.hidden = !showSecondary;
    if (showSecondary) {
      secondaryBtn.textContent = page.secondaryCtaText;
      secondaryBtn.href = page.secondaryCtaLink;
    }
  }

  if (actionsEl) actionsEl.hidden = !(showPrimary || showSecondary);

  const imgUrl = sanityImageUrl(page.heroImage);
  if (imgUrl) {
    hero.style.backgroundImage = `linear-gradient(90deg, rgba(41,57,105,.75), rgba(200,16,46,.55)), url('${imgUrl}')`;
    hero.style.backgroundSize = "cover";
    hero.style.backgroundPosition = "center";
  }

  hero.hidden = !(hasTitle || hasSub || hasFlow || showPrimary || showSecondary || imgUrl);
  renderPartnersBelt(page.partnersTitle, page.trustedPartners);
}

/* =========================
   CONTACT PAGE
========================= */
async function loadContactPage() {
  const section = document.getElementById("contactSection");
  if (!section) return;

  let page = null;
  try {
    page = await fetchContent(`*[_type=="contactPage"][0]{
      title, intro,
      heroTitle, heroSubtitle, heroImage,
      contactCardTitle, address, phone, email
    }`);
  } catch (e) {
    console.error(e);
  }

  let fallbackSettings = null;
  if (!page) {
    fallbackSettings = await fetchContent(`*[_type=="siteSettings"][0]{
      address, phone, email, contactCardTitle
    }`);
  }

  const titleEl = document.getElementById("contactTitle");
  const introEl = document.getElementById("contactIntro");

  if (page) {
    setTextIf(titleEl, page.title || "Contact Us");
    setTextIf(introEl, page.intro);

    renderPageHero({
      title: page.heroTitle || page.title || "Contact Us",
      subtitle: page.heroSubtitle || "",
      image: page.heroImage,
    });
  } else {
    renderPageHero({
      title: titleEl?.textContent || "Contact Us",
      subtitle: "",
      image: null,
    });
  }

  const detailsWrap = document.getElementById("contactDetailsSection");
  if (!detailsWrap) return;

  const data = page || fallbackSettings;
  if (!data) return;

  const cardTitle = data.contactCardTitle || "Reach us directly";
  setTextIf(document.getElementById("contactCardTitle"), cardTitle);

  const addressLine = document.getElementById("contactAddressLine");
  const addressEl = document.getElementById("contactAddress");
  const hasAddress = setTextIf(addressEl, data.address);
  if (addressLine) addressLine.hidden = !hasAddress;

  const phoneLine = document.getElementById("contactPhoneLine");
  const phoneEl = document.getElementById("contactPhone");
  if (phoneEl && data.phone) {
    phoneEl.textContent = data.phone;
    phoneEl.href = `tel:${String(data.phone).replace(/[^\d+]/g, "")}`;
    phoneEl.hidden = false;
    if (phoneLine) phoneLine.hidden = false;
  } else {
    if (phoneEl) phoneEl.hidden = true;
    if (phoneLine) phoneLine.hidden = true;
  }

  const emailLine = document.getElementById("contactEmailLine");
  const emailEl = document.getElementById("contactEmail");
  if (emailEl && data.email) {
    emailEl.textContent = data.email;
    emailEl.href = `mailto:${String(data.email).trim()}`;
    emailEl.hidden = false;
    if (emailLine) emailLine.hidden = false;
  } else {
    if (emailEl) emailEl.hidden = true;
    if (emailLine) emailLine.hidden = true;
  }

  detailsWrap.hidden = !(hasAddress || !!data.phone || !!data.email);
}

/* =========================
   ABOUT PAGE
========================= */
async function loadAboutPage() {
  const aboutSection = document.getElementById("aboutSection");
  if (!aboutSection) return;

  const aboutTitleEl = document.getElementById("aboutTitle");
  const aboutIntroEl = document.getElementById("aboutIntro");
  const aboutBodyEl = document.getElementById("aboutBody");

  const aboutImgWrap = document.getElementById("aboutImageWrap");
  const aboutImgEl = document.getElementById("aboutImage");

  const splitSectionEl = document.getElementById("aboutSplitSections");
  const missionTitleEl = document.getElementById("aboutMissionTitle");
  const aboutValuesQuote = document.getElementById("aboutValuesQuote");

  const statsSection = document.getElementById("aboutStatsSection");
  const statsTitleEl = document.getElementById("aboutStatsTitle");
  const statsSubtitleEl = document.getElementById("aboutStatsSubtitle");
  const statsGrid = document.getElementById("aboutStatsGrid");
  const statsFootnoteEl = document.getElementById("aboutStatsFootnote");

  const founderSection = document.getElementById("founderSection");
  const founderNameEl = document.getElementById("founderName");
  const founderBioEl = document.getElementById("founderBio");
  const founderPhotoWrap = document.getElementById("founderPhotoWrap");
  const founderPhotoEl = document.getElementById("founderPhoto");
  const founderCardEl = document.getElementById("founderCard");

  const query = `{
    "aboutDoc": *[_type=="aboutPage"][0]{
      title, intro, body, aboutImage,
      heroTitle, heroSubtitle, heroImage,
      missionSectionTitle, missionSectionIntro,
      splitSections[]{title,left,right},
      statsTitle, stats[]{value,label,note}, statsFootnote
    },
    "founderDoc": *[_type=="founder"][0]{ name, bio, photo }
  }`;

  const data = await fetchContent(query);
  const aboutDoc = data?.aboutDoc || null;
  const founderDoc = data?.founderDoc || null;

  if (aboutDoc) {
    renderPageHero({
      title: aboutDoc.heroTitle || aboutDoc.title || "",
      subtitle: aboutDoc.heroSubtitle || "",
      image: aboutDoc.heroImage || null,
    });
  }

  const hasTitle = setTextIf(aboutTitleEl, aboutDoc?.title);

  if (aboutIntroEl) {
    const introHtml = textToParagraphs(aboutDoc?.intro);
    setHtmlIf(aboutIntroEl, introHtml);
  }
  const hasIntro = aboutIntroEl && !aboutIntroEl.hidden;

  if (aboutBodyEl) {
    const bodyHtml = portableTextToHtml(aboutDoc?.body);
    setHtmlIf(aboutBodyEl, bodyHtml);
  }
  const hasBody = aboutBodyEl && !aboutBodyEl.hidden;

  const aboutImg = sanityImageUrl(aboutDoc?.aboutImage);
  if (aboutImgWrap && aboutImgEl && aboutImg) {
    aboutImgWrap.hidden = false;
    aboutImgEl.src = aboutImg;
    aboutImgEl.alt = aboutDoc?.title || "About image";
  } else if (aboutImgWrap) {
    aboutImgWrap.hidden = true;
  }

  setTextIf(missionTitleEl, aboutDoc?.missionSectionTitle || "Our Mission");
  const hasMissionIntro = setTextIf(aboutValuesQuote, aboutDoc?.missionSectionIntro || "");

  renderMissionFlow(aboutDoc?.splitSections || []);
  if (splitSectionEl) {
    if (!missionTitleEl?.textContent?.trim() && !hasMissionIntro && !(aboutDoc?.splitSections || []).length) {
      splitSectionEl.hidden = true;
    }
  }

  const stats = Array.isArray(aboutDoc?.stats) ? aboutDoc.stats : [];
  const iconSvgs = [
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 21V3h11v18H4Zm13 0V9h3v12h-3ZM6 5v2h3V5H6Zm0 4v2h3V9H6Zm0 4v2h3v-2H6Zm0 4v2h3v-2H6Zm5-12v2h2V9h-2Zm0 4v2h2v-2h-2Zm0 4v2h2v-2h-2Zm0 4v2h2v-2h-2Z"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 4l2 2h8a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h6Zm10 6H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8Z"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h3V2Zm14 8H3v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V10Z"/></svg>`
  ];

  if (statsSection && statsGrid && stats.length) {
    if (statsTitleEl) statsTitleEl.textContent = aboutDoc?.statsTitle || "Our Success in Numbers";

    const sub = (aboutDoc?.heroSubtitle || "").toString().trim();
    if (statsSubtitleEl) {
      statsSubtitleEl.textContent = sub;
      statsSubtitleEl.hidden = !sub;
    }

    statsGrid.innerHTML = stats
      .map((s, idx) => {
        const v = (s?.value || "").trim();
        const l = (s?.label || "").trim();
        const n = (s?.note || "").trim();
        if (!v && !l) return "";

        const icon = iconSvgs[idx % iconSvgs.length];

        return `
          <div class="stat-tile">
            <div class="stat-icon">${icon}</div>
            <div class="stat-big">${escapeHtml(v)}</div>
            <div class="stat-small">${escapeHtml(l)}</div>
            ${n ? `<div class="stat-note">${escapeHtml(n)}</div>` : ""}
          </div>
        `;
      })
      .filter(Boolean)
      .join("");

    const foot = (aboutDoc?.statsFootnote || "").trim();
    if (statsFootnoteEl) {
      statsFootnoteEl.textContent = foot;
      statsFootnoteEl.hidden = !foot;
    }

    statsSection.hidden = !statsGrid.innerHTML.trim();
  } else if (statsSection) {
    statsSection.hidden = true;
  }

  aboutSection.hidden = !(hasTitle || hasIntro || hasBody || aboutImg);

  const hasFounderName = setTextIf(founderNameEl, founderDoc?.name);

  if (founderBioEl) {
    const bioHtml = textToParagraphs(founderDoc?.bio);
    setHtmlIf(founderBioEl, bioHtml);
  }
  const hasFounderBio = founderBioEl && !founderBioEl.hidden;

  const founderImg = sanityImageUrl(founderDoc?.photo);
  if (founderPhotoWrap && founderPhotoEl && founderImg) {
    founderPhotoWrap.hidden = false;
    founderPhotoEl.src = founderImg;
    founderPhotoEl.alt = founderDoc?.name || "Founder photo";
  } else if (founderPhotoWrap) {
    founderPhotoWrap.hidden = true;
  }

  const hasFounderImg = !!founderImg;

  if (founderCardEl) founderCardEl.hidden = !(hasFounderName || hasFounderBio || hasFounderImg);
  if (founderSection) founderSection.hidden = founderCardEl ? founderCardEl.hidden : true;
}

/* =========================
   SERVICES PAGE
========================= */
async function loadServicesPage() {
  const track = document.getElementById("svcTrack");
  if (!track) return;

  const page = await fetchContent(`*[_type=="servicesPage"][0]{
    title, intro,
    heroTitle, heroSubtitle, heroImage,
    services[]{title,description,image}
  }`);

  if (!page) return;

  renderPageHero({
    title: page.heroTitle || page.title || "",
    subtitle: page.heroSubtitle || "",
    image: page.heroImage || null,
  });

  setTextIf(document.getElementById("servicesTitle"), page.title);
  setTextIf(document.getElementById("servicesIntro"), page.intro);

  const items = Array.isArray(page.services) ? page.services : [];
  const wrapper = document.getElementById("servicesCard");
  if (wrapper) wrapper.hidden = items.length === 0;

  track.innerHTML = items
    .map((s) => {
      const img = sanityImageUrl(s.image);
      const imageBlock = img
        ? `<div style="height:140px;border-radius:14px;margin-bottom:10px;overflow:hidden;">
             <img src="${img}" alt="${escapeHtml(s.title || "")}" style="width:100%;height:100%;object-fit:cover;">
           </div>`
        : "";

      const title = (s.title ?? "").toString().trim();
      const desc = (s.description ?? "").toString().trim();
      if (!title && !desc && !img) return "";

      return `
        <div class="mini-card">
          ${imageBlock}
          ${title ? `<h3 style="color:var(--indigo);">${escapeHtml(title)}</h3>` : ""}
          ${desc ? `<p>${escapeHtml(desc)}</p>` : ""}
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  if (wrapper) wrapper.hidden = !track.innerHTML.trim();
}

/* =========================
   FAQ PAGE
========================= */
async function loadFaqPage() {
  const list = document.getElementById("faqList");
  if (!list) return;

  const page = await fetchContent(`*[_type=="faq"][0]{
    title, intro,
    heroTitle, heroSubtitle, heroImage,
    faqs[]{question,answer}
  }`);
  if (!page) return;

  renderPageHero({
    title: page.heroTitle || page.title || "",
    subtitle: page.heroSubtitle || "",
    image: page.heroImage || null,
  });

  setTextIf(document.getElementById("faqTitle"), page.title);
  setTextIf(document.getElementById("faqIntro"), page.intro);

  const items = Array.isArray(page.faqs) ? page.faqs : [];
  list.innerHTML = items
    .map((f, i) => {
      const q = (f.question ?? "").toString().trim();
      const a = (f.answer ?? "").toString().trim();
      if (!q && !a) return "";

      return `
        <div class="mini-card">
          <details ${i === 0 ? "open" : ""}>
            <summary style="cursor:pointer; font-weight:800; color:var(--indigo);">
              ${escapeHtml(q)}
            </summary>
            ${a ? `<p style="margin-top:8px;">${escapeHtml(a)}</p>` : ""}
          </details>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  list.hidden = !list.innerHTML.trim();
}

/* =========================
   TESTIMONIALS PAGE
========================= */
function formatMultilineText(text = "") {
  const safe = escapeHtml(text);
  return safe.replaceAll("\n", "<br>");
}

async function loadTestimonialsPage() {
  const section = document.getElementById("testimonialsSection");
  if (!section) return;

  const titleEl = document.getElementById("testimonialsTitle");
  const introEl = document.getElementById("testimonialsIntro");
  const listEl = document.getElementById("testimonialsList");
  if (!listEl) return;

  const query = `*[_type == "testimonialsPage"][0]{
    title,
    intro,
    heroTitle, heroSubtitle, heroImage,
    testimonials[]{
      title,
      quote,
      body,
      author,
      byline,
      role,
      company,
      name
    }
  }`;

  const page = await fetchContent(query);
  if (!page) return;

  renderPageHero({
    title: page.heroTitle || page.title || "",
    subtitle: page.heroSubtitle || "",
    image: page.heroImage || null,
  });

  if (titleEl) titleEl.textContent = page.title || "Client Testimonial";
  if (introEl) introEl.textContent = page.intro || "";

  const items = Array.isArray(page.testimonials) ? page.testimonials : [];
  listEl.innerHTML = "";

  items.forEach((t, idx) => {
    const tTitle = t?.title || "";
    const tBody = t?.quote || t?.body || "";
    const by =
      t?.byline ||
      t?.author ||
      t?.name ||
      [t?.role, t?.company].filter(Boolean).join(", ");

    const article = document.createElement("article");
    article.className = "testimonial-block";

    article.innerHTML = `
      ${tTitle ? `<h2 class="testimonial-title">${escapeHtml(tTitle)}</h2>` : ""}
      ${tBody ? `
        <blockquote class="testimonial-quote">
          <p>"${formatMultilineText(tBody)}"</p>
        </blockquote>
      ` : ""}
      ${by ? `<div class="testimonial-by">— ${escapeHtml(by)}</div>` : ""}
      ${idx < items.length - 1 ? `<hr class="testimonial-divider">` : ""}
    `;

    listEl.appendChild(article);
  });
}

/* =========================
   MOBILE NAV + YEAR
========================= */
(function () {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

/* =========================
   RUN
========================= */
loadSiteSettings().catch(console.error);
loadHomePage().catch(console.error);
loadAboutPage().catch(console.error);
loadServicesPage().catch(console.error);
loadFaqPage().catch(console.error);
loadTestimonialsPage().catch(console.error);
loadContactPage().catch(console.error);