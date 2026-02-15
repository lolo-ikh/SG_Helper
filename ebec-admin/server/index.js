const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for PDF storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads/reports');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Initialize DB file if it doesn't exist
const initialData = {
    meetings: [
        {
            id: 1,
            title: "Board Weekly Sync",
            date: "2026-02-15",
            time: "18:00",
            attendees: ["Enzo Chaabnia", "Oumaima Boucekkine", "Leena IKHLEF"],
            description: "Standard weekly synchronization."
        }
    ],
    techCards: [
        {
            id: 101,
            title: "Arduino Workshop",
            theme: "Electronics",
            duration: "3 Hours",
            reference: "01/26",
            isSponsored: true,
            sponsorName: "TechCorp",
            agenda: "1. Intro, 2. Circuit building, 3. Coding",
            needs: "20 Arduinos, 40 LEDs, Breadboards"
        }
    ],
    refCounter: 2
};

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Routes
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #6366f1;">EBEC Admin API</h1>
            <p>The SG Helper Backend is live and running.</p>
            <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; display: inline-block; margin-top: 20px;">
                <code>Status: Online</code><br>
                <code>Port: ${PORT}</code>
            </div>
        </div>
    `);
});

app.get('/api/data', (req, res) => {
    res.json(readDB());
});

app.post('/api/meetings', (req, res) => {
    const db = readDB();
    const newMeeting = { ...req.body, id: Date.now() };
    db.meetings.unshift(newMeeting);
    writeDB(db);
    res.status(201).json(newMeeting);
});

app.delete('/api/meetings/:id', (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    db.meetings = db.meetings.filter(m => m.id !== id);
    writeDB(db);
    res.status(204).send();
});

app.patch('/api/meetings/:id/notes', (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    const { notes } = req.body;
    db.meetings = db.meetings.map(m => m.id === id ? { ...m, notes } : m);
    writeDB(db);
    res.json({ success: true });
});

app.patch('/api/meetings/:id/attendance', (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    const { attendance } = req.body;
    db.meetings = db.meetings.map(m => m.id === id ? { ...m, attendance } : m);
    writeDB(db);
    res.json({ success: true });
});

app.patch('/api/meetings/:id/report', (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    const { report } = req.body;
    db.meetings = db.meetings.map(m => m.id === id ? { ...m, report } : m);
    writeDB(db);
    res.json({ success: true });
});

app.put('/api/meetings/:id', (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    const updatedMeeting = { ...req.body, id };
    db.meetings = db.meetings.map(m => m.id === id ? updatedMeeting : m);
    writeDB(db);
    res.json(updatedMeeting);
});

app.post('/api/upload-report', upload.single('reportFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the relative URL to access the file
    const fileUrl = `/uploads/reports/${req.file.filename}`;
    res.json({ success: true, fileName: req.file.originalname, fileUrl: fileUrl });
});

app.post('/api/tech-cards', (req, res) => {
    try {
        const db = readDB();
        const newCard = { ...req.body, id: Date.now() };
        console.log("[POST /api/tech-cards] Creating new tech card:", newCard);
        db.techCards.unshift(newCard);
        db.refCounter += 1;
        writeDB(db);
        console.log("New tech card created with ID:", newCard.id);
        res.status(201).json(newCard);
    } catch (error) {
        console.error("Error creating tech card:", error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tech-cards/:id', (req, res) => {
    try {
        const db = readDB();
        const id = parseInt(req.params.id);
        console.log(`[DELETE /api/tech-cards/${id}] Deleting tech card...`);
        const beforeCount = db.techCards.length;
        db.techCards = db.techCards.filter(tc => tc.id !== id);
        const afterCount = db.techCards.length;
        writeDB(db);
        console.log(`Tech card deleted. Count: ${beforeCount} -> ${afterCount}`);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting tech card:", error);
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/tech-cards/:id', (req, res) => {
    try {
        const db = readDB();
        const id = parseInt(req.params.id);
        console.log(`[PATCH /api/tech-cards/${id}] Updating tech card...`);
        console.log("Request body:", req.body);
        
        const index = db.techCards.findIndex(tc => tc.id === id);
        console.log(`Card index found: ${index}`);
        
        if (index !== -1) {
            db.techCards[index] = { ...db.techCards[index], ...req.body };
            writeDB(db);
            console.log("Card updated and saved to database");
            res.json(db.techCards[index]);
        } else {
            console.log(`Card with ID ${id} not found in database`);
            res.status(404).json({ error: `Tech card ${id} not found` });
        }
    } catch (error) {
        console.error("Error updating tech card:", error);
        res.status(500).json({ error: error.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`ERROR: Port ${PORT} is already in use!`);
        console.error(`The server is likely already running in another terminal.`);
        process.exit(1);
    } else {
        console.error(err);
    }
});
