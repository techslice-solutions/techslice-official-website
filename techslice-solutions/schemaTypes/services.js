export default {
  name: "services",
  title: "Services",
  type: "document",
  fields: [
    { name: "title", title: "Service Title", type: "string" },
    { name: "description", title: "Description", type: "text" },
    {
      name: "image",
      title: "Service Image",
      type: "image",
      options: { hotspot: true },
    },
  ],
};
