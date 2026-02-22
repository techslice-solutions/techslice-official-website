export default {
  name: "testimonialsPage",
  title: "Testimonials Page",

  type: 'document',
  fields: [
  { name: "title", title: "Page Title", type: "string" },
  { name: "intro", title: "Intro", type: "text" },
  {
    name: "testimonials",
    title: "Testimonials",
    type: "array",
    of: [
      {
        type: "object",
        fields: [
          { name: "company", title: "Company", type: "string" },
          { name: "quote", title: "Quote", type: "text" }
        ]
      }
    ]
  },
  {
  name: 'logo',
  title: 'Company Logo',
  type: 'image',
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

}
