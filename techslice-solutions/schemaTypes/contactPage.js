export default {
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    // =========================
    // HERO SECTION (NEW)
    // =========================
    { name: "title", title: "Page Title", type: "string" },

    { name: "heroTitle", title: "Hero Title", type: "string" },

    { name: "heroSubtitle", title: "Hero Subtitle", type: "text" },

    {
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    },

    { name: "intro", title: "Intro", type: "text" },

    // =========================
    // CONTACT CARD SECTION
    // =========================
    {
      name: "contactCardTitle",
      title: "Contact Card Title",
      type: "string",
      initialValue: "Reach us directly",
    },
    { name: "address", title: "Address", type: "text" },
    { name: "phone", title: "Phone", type: "string" },
    { name: "email", title: "Email", type: "string" },

    // =========================
    // FORM SETTINGS
    // =========================
    { name: "formToEmail", title: "Form Receiver Email", type: "string" },

    {
      name: "formSubject",
      title: "Form Email Subject",
      type: "string",
      initialValue: "New enquiry from website",
    },

    {
      name: "formBodyTemplate",
      title: "Form Body Template",
      type: "text",
      description: "Use placeholders: {{name}}, {{email}}, {{phone}}, {{message}}",
      initialValue:
        "Name: {{name}}\nEmail: {{email}}\nPhone: {{phone}}\n\nMessage:\n{{message}}",
    },

    {
      name: "successMessage",
      title: "Success Message",
      type: "string",
      initialValue: "Thanks! We’ll get back to you shortly.",
    },

    {
      name: "errorMessage",
      title: "Error Message",
      type: "string",
      initialValue: "Sorry — something went wrong. Please try again.",
    },
  ],
};