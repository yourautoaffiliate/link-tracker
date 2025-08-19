import express from 'express';
import dotenv from 'dotenv';
import trackFunction from './src/main.js'; // ✅ import your Appwrite function

dotenv.config();

const app = express();
const port = 3000;

// Pass Express req/res directly to your Appwrite function
app.get('/track', (req, res) => {
  trackFunction({ req, res });
});

app.listen(port, () =>
  console.log(`🚀 Local server running at http://localhost:${port}`)
);
