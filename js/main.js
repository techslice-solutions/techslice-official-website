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
   PAGE HERO RENDERER (CMS-driven per page)
========================= */
function renderPageHero({ title, subtitle, image }) {
  const hero = document.getElementById("pageHero");
  if (!hero) return;

  const titleEl = document.getElementById("pageHeroTitle");
  const subtitleEl = document.getElementById("pageHeroSubtitle");

  const t = (title ?? "").toString().trim();
  const s = (subtitle ?? "").toString().trim();
  const imgUrl = sanityImageUrl(image);

  if (titleEl) titleEl.textContent = t || "";

  if (subtitleEl) {
    subtitleEl.textContent = s || "";
    subtitleEl.style.display = s ? "" : "none";
  }

  // ✅ apply hero image as background (CSS variable)
  const inner = hero.querySelector(".page-hero-inner");
  if (inner) {
    if (imgUrl) {
      inner.style.setProperty("--page-hero-bg", `url('${imgUrl}')`);
    } else {
      inner.style.removeProperty("--page-hero-bg");
    }
  }

  hero.hidden = !t && !imgUrl;
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
   GLOBAL SETTINGS (HEADER + FOOTER)
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
   HOME PAGE (UNCHANGED)
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
   CONTACT PAGE (heroSubtitle ONLY from heroSubtitle)
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
      subtitle: page.heroSubtitle || "", // ✅ no intro fallback
      image: page.heroImage,
    });
  } else {
    renderPageHero({
      title: titleEl?.textContent || "Contact Us",
      subtitle: "", // ✅ no intro fallback
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
   ABOUT PAGE (heroSubtitle ONLY from heroSubtitle)
========================= */
async function loadAboutPage() {
  const aboutSection = document.getElementById("aboutSection");
  if (!aboutSection) return;

  const aboutTitleEl = document.getElementById("aboutTitle");
  const aboutIntroEl = document.getElementById("aboutIntro");
  const aboutBodyEl = document.getElementById("aboutBody");
  const aboutImgWrap = document.getElementById("aboutImageWrap");
  const aboutImgEl = document.getElementById("aboutImage");

  const founderSection = document.getElementById("founderSection");
  const founderNameEl = document.getElementById("founderName");
  const founderBioEl = document.getElementById("founderBio");
  const founderPhotoWrap = document.getElementById("founderPhotoWrap");
  const founderPhotoEl = document.getElementById("founderPhoto");
  const founderCardEl = document.getElementById("founderCard");

  const query = `{
    "aboutDoc": *[_type=="aboutPage"][0]{
      title, intro, body, aboutImage,
      heroTitle, heroSubtitle, heroImage
    },
    "founderDoc": *[_type=="founder"][0]{ name, bio, photo }
  }`;

  const data = await fetchContent(query);
  const aboutDoc = data?.aboutDoc || null;
  const founderDoc = data?.founderDoc || null;

  if (aboutDoc) {
    renderPageHero({
      title: aboutDoc.heroTitle || aboutDoc.title || "",
      subtitle: aboutDoc.heroSubtitle || "", // ✅ no intro fallback
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
   SERVICES PAGE (heroSubtitle ONLY from heroSubtitle)
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
    subtitle: page.heroSubtitle || "", // ✅ no intro fallback
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
   FAQ PAGE (heroSubtitle ONLY from heroSubtitle)
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
    subtitle: page.heroSubtitle || "", // ✅ no intro fallback
    image: page.heroImage || null,
    
  });
  

  setTextIf(document.getElementById("faqTitle"), page.title);
  setTextIf(document.getElementById("faqIntro"), page.intro);

  const items = Array.isArray(page.faqs) ? page.faqs : [];
  list.innerHTML = items
    .map((f) => {
      const q = (f.question ?? "").toString().trim();
      const a = (f.answer ?? "").toString().trim();
      if (!q && !a) return "";
      return `
        <div class="mini-card">
          <details>
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
   TESTIMONIALS PAGE (heroSubtitle ONLY from heroSubtitle)
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
    subtitle: page.heroSubtitle || "", // ✅ no intro fallback
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