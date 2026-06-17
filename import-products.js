const { createClient } = require("@sanity/client");

// Replace with your Sanity API token (Editor permission)
// Get it from: sanity.io/manage → your project → API → Tokens
const TOKEN = "sk7mDGBSfTK293faT4ongYxH5JM3FpWMjLb9xD1hbDrWuXr3J2Xd50ZRwDjtAu54V84AVSM1pzCVUaGPY84Xoqd5RFf2bc3F4RoXZzg21pL67jdzhDe227fZpyh3uccxC4co2F2tKvkfK88ofSnnnFK2XQgQSHsW413CcfrUZiL5vY4IHoUX";

const client = createClient({
  projectId: "ibgcims7",
  dataset:   "production",
  apiVersion: "2023-01-01",
  token: TOKEN,
  useCdn: false,
});

const columns = [
  {
    heading: "Inserts and Grades",
    items: [
      { label: "Concept Inserts", link: "https://www.sandvik.coromant.com/en-us/tools/inserts-grades/concept-inserts" },
      { label: "ISO Inserts",     link: "https://www.sandvik.coromant.com/en-us/tools/inserts-grades/iso-inserts" },
    ],
  },
  {
    heading: "Turning Tools",
    items: [
      { label: "External", link: "https://www.sandvik.coromant.com/en-us/tools/turning-tools/external-turning-tools" },
      { label: "Internal", link: "https://www.sandvik.coromant.com/en-us/tools/turning-tools/internal-turning-tools" },
    ],
  },
  {
    heading: "Parting and Grooving Inserts",
    items: [
      { label: "Parting and Grooving Inserts", link: "https://www.sandvik.coromant.com/en-us/tools/parting-and-grooving-inserts" },
    ],
  },
  {
    heading: "Parting and Grooving Tools",
    items: [
      { label: "Parting off tools", link: "https://www.sandvik.coromant.com/en-us/tools/parting-and-grooving-tools/parting-off-tools" },
      { label: "External grooving", link: "https://www.sandvik.coromant.com/en-us/tools/parting-and-grooving-tools/external-grooving-tools" },
      { label: "Internal grooving", link: "https://www.sandvik.coromant.com/en-us/tools/parting-and-grooving-tools/internal-grooving-tools" },
      { label: "Face grooving",     link: "https://www.sandvik.coromant.com/en-us/tools/parting-and-grooving-tools/face-grooving-tools" },
    ],
  },
  {
    heading: "Milling Tools",
    items: [
      { label: "Shoulder milling, edging",         link: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/shoulder-milling-edging-tools" },
      { label: "Face milling",                      link: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/face-milling-tools" },
      { label: "High-feed milling",                 link: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/high-feed-milling-tools" },
      { label: "Cut off, Slot and Groove milling",  link: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/cut-off-slot-and-groove-milling-tools" },
      { label: "Solid Carbide end mills",           link: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/solid-carbide-end-mills" },
      { label: "Ball nose end mills",               link: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/ball-nose-end-mills" },
      { label: "Thread milling tools",              link: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/thread-milling-tools" },
      { label: "Chamfer milling",                   link: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/chamfer-milling-tools" },
    ],
  },
  {
    heading: "Drilling Tools",
    items: [
      { label: "Indexable Insert drills", link: "https://www.sandvik.coromant.com/en-us/tools/drilling-tools/indexable-drills" },
      { label: "Exchangeable tip drills", link: "https://www.sandvik.coromant.com/en-us/tools/drilling-tools/exchangeable-tip-drills" },
      { label: "Solid Carbide drills",    link: "https://www.sandvik.coromant.com/en-us/tools/drilling-tools/solid-carbide-drills" },
      { label: "Tapping",                 link: "https://www.sandvik.coromant.com/en-us/tools/drilling-tools/solid-carbide-threading-tools" },
    ],
  },
  {
    heading: "Threading Tools",
    items: [
      { label: "Thread turning",       link: "https://www.sandvik.coromant.com/en-us/tools/threading-tools/thread-turning-tools" },
      { label: "Thread milling tools", link: "https://www.sandvik.coromant.com/en-us/tools/threading-tools/thread-milling-tools" },
      { label: "Taps",                 link: "https://www.sandvik.coromant.com/en-us/tools/threading-tools/tapping-tools" },
    ],
  },
  {
    heading: "Tooling Systems",
    items: [
      { label: "Rotating holders",    link: "https://www.sandvik.coromant.com/en-us/tools/tooling-systems/rotating-holders" },
      { label: "Stationary adapters", link: "https://www.sandvik.coromant.com/en-us/tools/tooling-systems/stationary-adapters" },
      { label: "Collets",             link: "https://www.sandvik.coromant.com/en-us/tools/tooling-systems/collets" },
    ],
  },
  {
    heading: "Silent Tools",
    items: [
      { label: "Silent Tools", link: "https://www.sandvik.coromant.com/en-us/tools/silent-tools" },
    ],
  },
  {
    heading: "Sliding Head Machines",
    items: [
      { label: "Sliding Head Machines", link: "https://www.sandvik.coromant.com/en-us/tools/tools-for-sliding-head-machines" },
    ],
  },
  {
    heading: "Boring and Reaming Tools",
    items: [
      { label: "Rough boring tools", link: "https://www.sandvik.coromant.com/en-us/tools/boring-and-reaming-tools/rough-boring-tools" },
      { label: "Fine boring tools",  link: "https://www.sandvik.coromant.com/en-us/tools/boring-and-reaming-tools/fine-boring-tools" },
    ],
  },
];

function makeKey() {
  return Math.random().toString(36).slice(2, 12);
}

function buildColumns(cols) {
  return cols.map(col => ({
    _type: "object",
    _key: makeKey(),
    heading: col.heading,
    items: col.items.map(item => ({
      _type: "object",
      _key: makeKey(),
      label: item.label,
      link: item.link,
      openInNewTab: true,
    })),
  }));
}

async function run() {
  const existing = await client.fetch(`*[_type == "productMenu"][0]{ _id, title }`);

  if (!existing) {
    console.error("❌ No productMenu document found in Sanity.");
    process.exit(1);
  }

  console.log(`✅ Found: "${existing.title}" (${existing._id})`);
  console.log(`   Importing ${columns.length} columns...`);

  await client
    .patch(existing._id)
    .set({ columns: buildColumns(columns) })
    .commit({ autoGenerateArrayKeys: false });

  console.log("✅ Done! Now go to Sanity Studio → Product Menu → Products → Publish.");
}

run().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});