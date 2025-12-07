// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('E-Commerce API is running');
});

// TODO: require your routes here later
// const productRoutes = require('./routes/productRoutes');
// app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
