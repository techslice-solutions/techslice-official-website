export default {
  name: "faq", // keep this as "faq" since your document type is faq
  title: "FAQ",
  type: "document",
  fields: [
    // ✅ Page basics
    { name: "title", title: "Page Title", type: "string" },
    { name: "intro", title: "Intro", type: "text" },

    // ✅ HERO (top-level, NOT inside faqs)
    { name: "heroTitle", title: "Hero Title", type: "string" },
    { name: "heroSubtitle", title: "Hero Subtitle", type: "text" },
    {
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    },

    // ✅ FAQs (array of objects only)
    {
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            { name: "question", title: "Question", type: "string" },
            { name: "answer", title: "Answer", type: "text" },
          ],
        },
      ],
    },
  ],
};