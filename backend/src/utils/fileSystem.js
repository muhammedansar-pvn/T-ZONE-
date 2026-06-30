const fs = require("fs");
const path = require("path");

const ensureUploadsExists = () => {
  const uploadsDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

module.exports = {
  ensureUploadsExists,
};
