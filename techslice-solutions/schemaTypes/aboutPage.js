export default {
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    { name: "title", title: "Page Title", type: "string" },
    { name: "intro", title: "Intro", type: "text" },

    {
      name: "body",
      title: "Body Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Sub Heading", value: "h3" },
            { title: "Quote", value: "blockquote" }
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" }
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" }
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "URL",
                fields: [{ name: "href", type: "url", title: "URL" }]
              }
            ]
          }
        }
      ]
    },

    {
      name: "aboutImage",
      title: "About Section Image",
      type: "image",
      options: { hotspot: true }
    },
    {
  name: "heroTitle",
  title: "Hero Title",
  type: "string",
},
{
  name: "heroSubtitle",
  title: "Hero Subtitle",
  type: "string",
},
{
  name: "heroImage",
  title: "Hero Image",
  type: "image",
  options: { hotspot: true },
}
  ]
};
