// backend/src/seed/seedCategories.js
//
// Seed default tech categories with brand lists.
// Usage:
//   node src/seed/seedCategories.js
// or via npm script "seed:categories".

const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env from project root
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const connectDB = require("../config/db");
const Category = require("../models/Category");

const CATEGORY_SEED_DATA = [
  {
    name: "Phones & Smartphones",
    brands: [
      "Apple",
      "Samsung",
      "Google",
      "OnePlus",
      "Xiaomi",
      "Huawei",
      "Motorola",
      "Nokia",
      "Sony",
      "Oppo",
      "Vivo",
      "Asus",
    ],
  },
  {
    name: "Laptops",
    brands: [
      "Apple",
      "Dell",
      "HP",
      "Lenovo",
      "Asus",
      "Acer",
      "MSI",
      "Razer",
      "Microsoft",
      "Samsung",
      "LG",
      "Huawei",
    ],
  },
  {
    name: "Desktop PCs",
    brands: [
      "Dell",
      "HP",
      "Lenovo",
      "Asus",
      "Acer",
      "MSI",
      "Alienware",
      "iBuyPower",
      "CyberPowerPC",
      "Origin PC",
      "Corsair",
      "NZXT",
    ],
  },
  {
    name: "PC Components",
    brands: [
      "NVIDIA",
      "AMD",
      "Intel",
      "ASUS ROG",
      "MSI",
      "Gigabyte",
      "ASRock",
      "Corsair",
      "Cooler Master",
      "EVGA",
      "Kingston",
      "Crucial",
    ],
  },
  {
    name: "Monitors & Displays",
    brands: [
      "Dell",
      "LG",
      "Samsung",
      "ASUS",
      "Acer",
      "BenQ",
      "ViewSonic",
      "MSI",
      "AOC",
      "Philips",
      "HP",
      "Gigabyte",
    ],
  },
  {
    name: "Tablets & E-Readers",
    brands: [
      "Apple",
      "Samsung",
      "Microsoft",
      "Lenovo",
      "Amazon (Kindle)",
      "Huawei",
      "Xiaomi",
      "TCL",
      "Asus",
      "BOOX",
      "Kobo",
      "Google",
    ],
  },
  {
    name: "Headphones & Audio",
    brands: [
      "Sony",
      "Bose",
      "Sennheiser",
      "Apple (Beats)",
      "JBL",
      "Audio-Technica",
      "Skullcandy",
      "Anker (Soundcore)",
      "Marshall",
      "Bang & Olufsen",
      "AKG",
      "Shure",
    ],
  },
  {
    name: "Smart Watches & Wearables",
    brands: [
      "Apple",
      "Samsung",
      "Garmin",
      "Fitbit",
      "Huawei",
      "Xiaomi",
      "Amazfit",
      "Withings",
      "Polar",
      "Suunto",
      "Fossil",
      "Google",
    ],
  },
  {
    name: "Gaming Consoles & Accessories",
    brands: [
      "Sony (PlayStation)",
      "Microsoft (Xbox)",
      "Nintendo",
      "Razer",
      "Logitech",
      "SteelSeries",
      "Corsair",
      "Turtle Beach",
      "Scuf",
      "8BitDo",
      "HyperX",
      "PowerA",
    ],
  },
  {
    name: "Keyboards & Mice",
    brands: [
      "Logitech",
      "Razer",
      "SteelSeries",
      "Corsair",
      "HyperX",
      "Keychron",
      "Glorious",
      "Roccat",
      "Microsoft",
      "Asus",
      "Cooler Master",
      "Ducky",
    ],
  },
  {
    name: "Networking (Routers/Wi-Fi)",
    brands: [
      "TP-Link",
      "Netgear",
      "Asus",
      "Linksys",
      "Ubiquiti",
      "Google (Nest)",
      "Amazon (eero)",
      "D-Link",
      "Cisco",
      "MikroTik",
      "Arris",
      "Zyxel",
    ],
  },
  {
    name: "Storage (SSD/HDD/Flash)",
    brands: [
      "Samsung",
      "Western Digital",
      "Seagate",
      "Crucial",
      "Kingston",
      "SanDisk",
      "Toshiba",
      "Intel",
      "ADATA",
      "Sabrent",
      "LaCie",
      "Transcend",
    ],
  },
  {
    name: "Printers & Scanners",
    brands: [
      "HP",
      "Canon",
      "Epson",
      "Brother",
      "Xerox",
      "Lexmark",
      "Fujifilm",
      "Ricoh",
      "Kyocera",
      "Panasonic",
      "Zebra",
      "Dymo",
    ],
  },
  {
    name: "Cameras & Photography",
    brands: [
      "Canon",
      "Nikon",
      "Sony",
      "Fujifilm",
      "Panasonic",
      "GoPro",
      "DJI",
      "Leica",
      "Olympus (OM System)",
      "Sigma",
      "Tamron",
      "Insta360",
    ],
  },
  {
    name: "Smart Home",
    brands: [
      "Google (Nest)",
      "Amazon",
      "Apple (HomeKit)",
      "Philips Hue",
      "Ring",
      "Arlo",
      "TP-Link (Kasa)",
      "Ecobee",
      "Eufy",
      "Wyze",
      "Nanoleaf",
      "Sonos",
    ],
  },
];

async function seed() {
  await connectDB();

  let createdCount = 0;
  let updatedCount = 0;

  for (const entry of CATEGORY_SEED_DATA) {
    const { name, brands } = entry;
    const base = (Array.isArray(brands) ? brands : [])
      .map((b) => String(b).trim())
      .filter(Boolean);

    let category = await Category.findOne({ name });
    if (!category) {
      // create new category with normalized and sorted brands
      const uniq = Array.from(new Set(base.map((b) => b)));
      uniq.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      category = await Category.create({ name, brands: uniq });
      createdCount += 1;
    } else {
      const existing = Array.isArray(category.brands) ? category.brands.map((b) => String(b).trim()).filter(Boolean) : [];
      const existingLower = new Set(existing.map((b) => b.toLowerCase()));
      const merged = [...existing];
      for (const b of base) {
        if (!existingLower.has(b.toLowerCase())) {
          merged.push(b);
          existingLower.add(b.toLowerCase());
        }
      }
      // normalize + sort
      const normalized = Array.from(new Set(merged.map((b) => String(b).trim()).filter(Boolean)));
      normalized.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      // save only if changed
      if (normalized.length !== existing.length || !normalized.every((v, i) => v === existing[i])) {
        category.brands = normalized;
        await category.save();
        updatedCount += 1;
      }
    }
  }

  const total = await Category.countDocuments();

  console.log("Category seeding complete.");
  console.log("Created categories:", createdCount);
  console.log("Updated categories:", updatedCount);
  console.log("Total categories in DB:", total);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Error during category seeding:", err);
  mongoose.disconnect().then(() => process.exit(1));
});

