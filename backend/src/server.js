const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from root .env or backend/.env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = require("./app");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
