export default {
  name: "servicesPage",
  title: "Services Page",
  type: "document",
  fields: [
    // ✅ Page-level hero fields (top-level)
    { name: "heroTitle", title: "Hero Title", type: "string" },
    { name: "heroSubtitle", title: "Hero Subtitle", type: "string" },
    {
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true }
    },

    // Page content
    { name: "title", title: "Page Title", type: "string" },
    { name: "intro", title: "Intro", type: "text" },

    {
      name: "services",
      title: "Services List",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Service Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
            {
              name: "image",
              title: "Service Image",
              type: "image",
              options: { hotspot: true }
            }
          ]
        }
      ]
    }
  ]
};