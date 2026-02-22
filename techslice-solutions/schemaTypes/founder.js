export default {
  name: "founder",
  title: "Founder",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string" },
    { name: "bio", title: "Biography", type: "text" },
    {
      name: "photo",
      title: "Founder Photo",
      type: "image",
      options: { hotspot: true },
    },
  ],
};
