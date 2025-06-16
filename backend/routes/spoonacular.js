const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Simple file-based log for API usage (for demo/dev)
const USAGE_FILE = path.join(__dirname, '../spoonacular_usage.json');

// Helper to read usage log
function readUsage() {
  try {
    if (!fs.existsSync(USAGE_FILE)) return {};
    return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

// Helper to write usage log
function writeUsage(usage) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2), 'utf8');
}

// Endpoint to get API usage for last 7 days
router.get('/usage', (req, res) => {
  const usage = readUsage();
  const today = new Date();
  const days = 7;
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({
      date: key,
      count: usage[key] || 0
    });
  }
  // If all counts are zero, return empty array to indicate no usage
  const hasUsage = result.some(r => r.count > 0);
  res.json({ usage: hasUsage ? result : [] });
});

// Middleware to log a Spoonacular API call (call this in your proxy or API call handler)
router.post('/log', (req, res) => {
  const usage = readUsage();
  const key = new Date().toISOString().slice(0, 10);
  usage[key] = (usage[key] || 0) + 1;
  writeUsage(usage);
  res.json({ success: true });
});

module.exports = router;
