export default {
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    { name: "heroTitle", title: "Hero Title", type: "string" },
    { name: "heroSubtitle", title: "Hero Subtitle", type: "text" },
    { name: "heroFlow", title: "Flow Text", type: "string" },

    { name: "primaryCtaText", title: "Primary Button Text", type: "string" },
    {
  name: "primaryCtaLink",
  title: "Primary Button Link",
  type: "string",
  description: "Use /contact.html or https://example.com",
},

    { name: "secondaryCtaText", title: "Secondary Button Text", type: "string" },
    {
  name: "secondaryCtaLink",
  title: "Secondary Button Link",
  type: "string",
  description: "Use /services.html or https://example.com",
},

    {
      name: "heroImage",
      title: "Hero Background Image",
      type: "image",
      options: { hotspot: true },
    },
    {
  name: "partnersTitle",
  title: "Trusted Partners - Title",
  type: "string",
  initialValue: "Our Trusted Partners",
},
{
  name: "trustedPartners",
  title: "Trusted Partners (Logos)",
  type: "array",
  of: [
    {
      type: "object",
      name: "partner",
      fields: [
        { name: "name", title: "Partner Name", type: "string", validation: (Rule) => Rule.required() },
        { name: "logo", title: "Logo", type: "image", options: { hotspot: true }, validation: (Rule) => Rule.required() },
        { name: "url", title: "Website URL (optional)", type: "url" },
      ],
      preview: {
        select: { title: "name", media: "logo" },
      },
    },
  ],
},

  ],
};
