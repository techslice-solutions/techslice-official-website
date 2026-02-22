export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
  { name: "brandName", title: "Brand Name", type: "string" },
  { name: "place", title: "Location", type: "string" },
  { name: "phone", title: "Phone", type: "string" },
  { name: "linkedin", title: "LinkedIn URL", type: "url" },
  {
    name: "logo",
    title: "Logo",
    type: "image",
    options: { hotspot: true }
  },
  { name: "address", title: "Address", type: "text" },
{ name: "email", title: "Email", type: "string" },
{ name: "contactCardTitle", title: "Contact Card Title", type: "string" }
]

}
