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
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "URL",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
      ],
    },

    {
      name: "aboutImage",
      title: "About Section Image",
      type: "image",
      options: { hotspot: true },
    },

    {
      name: "missionSectionTitle",
      title: "Mission Section Title",
      type: "string",
      initialValue: "Our Mission",
    },
    {
      name: "missionSectionIntro",
      title: "Mission Section Intro",
      type: "text",
      description: "Optional intro text shown above the mission flow cards.",
    },

    {
      name: "splitSections",
      title: "Mission Steps",
      type: "array",
      description:
        "Each item becomes one animated mission card. Keep content concise for best layout.",
      of: [
        {
          type: "object",
          name: "splitSection",
          title: "Mission Step",
          fields: [
            {
              name: "title",
              title: "Card Title",
              type: "string",
            },
            {
              name: "left",
              title: "Primary Content",
              type: "array",
              of: [{ type: "block" }],
            },
            {
              name: "right",
              title: "Secondary Content",
              type: "array",
              of: [{ type: "block" }],
            },
          ],
          preview: {
            select: {
              title: "title",
            },
            prepare({ title }) {
              return {
                title: title || "Untitled mission step",
              };
            },
          },
        },
      ],
    },

    {
      name: "statsTitle",
      title: "Stats Section Title",
      type: "string",
      initialValue: "By the Numbers",
    },
    {
      name: "stats",
      title: "Stats (Numbers Cards)",
      type: "array",
      of: [
        {
          type: "object",
          name: "stat",
          title: "Stat",
          fields: [
            { name: "value", title: "Value (e.g., 15+)", type: "string" },
            { name: "label", title: "Label (e.g., Years of experience)", type: "string" },
            { name: "note", title: "Optional note (small text)", type: "string" },
          ],
        },
      ],
    },
    {
      name: "statsFootnote",
      title: "Stats Footnote (optional)",
      type: "string",
    },

    { name: "heroTitle", title: "Hero Title", type: "string" },
    { name: "heroSubtitle", title: "Hero Subtitle", type: "string" },
    {
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    },
  ],
};