require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Routes
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #6366f1;">EBEC Admin API</h1>
            <p>The SG Helper Backend is live and running with Supabase.</p>
            <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; display: inline-block; margin-top: 20px;">
                <code>Status: Online</code><br>
                <code>Port: ${PORT}</code>
            </div>
        </div>
    `);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/data', async (req, res) => {
    try {
        const { data: meetings, error: meetingsError } = await supabase
            .from('meetings')
            .select('*')
            .order('id', { ascending: false });

        if (meetingsError) throw meetingsError;

        const { data: techCards, error: techCardsError } = await supabase
            .from('tech_cards')
            .select('*')
            .order('id', { ascending: false });

        if (techCardsError) throw techCardsError;

        // Calculate refCounter based on max reference number
        let maxRef = 0;
        if (techCards && techCards.length > 0) {
            const refs = techCards.map(tc => {
                if (!tc.reference) return 0;
                const parts = tc.reference.split('/');
                return parseInt(parts[0]) || 0;
            });
            maxRef = Math.max(...refs);
        }

        res.json({ meetings, techCards, refCounter: maxRef + 1 });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- SG Judgments (Traitors Detection) ---
app.get('/api/sg-judgments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sg_judgments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sg-judgments', async (req, res) => {
    try {
        const { name, role, judgment } = req.body;
        const { data, error } = await supabase
            .from('sg_judgments')
            .insert([{ name, role, judgment }]);

        if (error) throw error;

        // Mocking "Email sent to SG"
        console.log(`[ALERT] ${name} (${role}) just said the SG is ${judgment}!`);

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/meetings', async (req, res) => {
    try {
        const newMeeting = { ...req.body, id: Date.now() };
        const { error } = await supabase
            .from('meetings')
            .insert([newMeeting]);

        if (error) throw error;

        res.status(201).json(newMeeting);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/meetings/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { error } = await supabase
            .from('meetings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/meetings/:id/notes', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { notes } = req.body;
        const { error } = await supabase
            .from('meetings')
            .update({ notes })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating meeting notes:', error);
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/meetings/:id/attendance', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { attendance } = req.body;
        const { error } = await supabase
            .from('meetings')
            .update({ attendance })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating meeting attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/meetings/:id/report', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { report } = req.body;
        const { error } = await supabase
            .from('meetings')
            .update({ report })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating meeting report:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/meetings/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updatedMeeting = { ...req.body, id };
        const { error } = await supabase
            .from('meetings')
            .update(updatedMeeting)
            .eq('id', id);

        if (error) throw error;

        res.json(updatedMeeting);
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/upload-report', upload.single('reportFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the relative URL to access the file
    const fileUrl = `/uploads/reports/${req.file.filename}`;
    res.json({ success: true, fileName: req.file.originalname, fileUrl: fileUrl });
});

app.post('/api/tech-cards', async (req, res) => {
    try {
        const newCard = { ...req.body, id: Date.now() };
        console.log("[POST /api/tech-cards] Creating new tech card:", newCard);

        const { error } = await supabase
            .from('tech_cards')
            .insert([newCard]);

        if (error) throw error;

        console.log("New tech card created with ID:", newCard.id);
        res.status(201).json(newCard);
    } catch (error) {
        console.error("Error creating tech card:", error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tech-cards/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        console.log(`[DELETE /api/tech-cards/${id}] Deleting tech card...`);

        const { error } = await supabase
            .from('tech_cards')
            .delete()
            .eq('id', id);

        if (error) throw error;

        console.log(`Tech card deleted.`);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting tech card:", error);
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/tech-cards/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        console.log(`[PATCH /api/tech-cards/${id}] Updating tech card...`);
        console.log("Request body:", req.body);

        const updateData = { ...req.body };
        delete updateData.id;

        const { data, error } = await supabase
            .from('tech_cards')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data && data.length > 0) {
            console.log("Card updated and saved to database");
            res.json(data[0]);
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
