// Import required modules
import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables
import { notFound } from './middleware/notFound.js';
import { handleError } from './middleware/handleError.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Connect to database
import './config/db.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Get current file and directory paths (ESM-friendly)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as view engine and views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Basic route
app.get('/', (req, res) => {
    res.send('Home Page');
});

app.get('/error', (req, res)=>{
    res.send('Internal server error')
})
// Handle 404 errors
app.use(notFound);
app.use(handleError);
// Start server
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});
