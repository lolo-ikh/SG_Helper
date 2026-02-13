const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Initialize DB file if it doesn't exist
const initialData = {
    meetings: [
        {
            id: 1,
            title: "Board Weekly Sync",
            date: "2026-02-15",
            time: "18:00",
            attendees: ["Enzo Chaabnia", "Boucekkine Oumaima", "Leena IKHLEF"],
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

app.post('/api/tech-cards', (req, res) => {
    const db = readDB();
    const newCard = { ...req.body, id: Date.now() };
    db.techCards.unshift(newCard);
    db.refCounter += 1;
    writeDB(db);
    res.status(201).json(newCard);
});

app.delete('/api/tech-cards/:id', (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    db.techCards = db.techCards.filter(tc => tc.id !== id);
    writeDB(db);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
