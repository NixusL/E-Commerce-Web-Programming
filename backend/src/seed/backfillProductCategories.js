// backend/src/seed/backfillProductCategories.js
// Backfill products so that string category names get converted to Category ObjectId refs
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function backfill() {
  await connectDB();
  let fixed = 0;
  let skipped = 0;
  const products = await Product.find().lean();
  for (const p of products) {
    if (!p.category) {
      skipped++;
      continue;
    }
    if (typeof p.category === 'string') {
      // try find category by name
      const catByName = await Category.findOne({ name: p.category.trim() });
      if (catByName) {
        await Product.findByIdAndUpdate(p._id, { category: catByName._id });
        fixed++;
        continue;
      }
      // otherwise, if string looks like an ObjectId and category exists, skip
      if (/^[0-9a-fA-F]{24}$/.test(p.category)) {
        const catById = await Category.findById(p.category);
        if (catById) {
          skipped++;
          continue;
        }
      }
      // nothing matched
      skipped++;
    } else {
      skipped++;
    }
  }

  console.log('Backfill complete. Fixed:', fixed, 'Skipped:', skipped);
  await mongoose.disconnect();
}

backfill().catch((err) => {
  console.error('Backfill error:', err);
  mongoose.disconnect().then(() => process.exit(1));
});
