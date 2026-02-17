require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DB_FILE = path.join(__dirname, 'db.json');

async function migrate() {
    console.log('Starting migration...');

    try {
        // Read existing data
        if (!fs.existsSync(DB_FILE)) {
            console.error('db.json not found!');
            return;
        }

        const rawData = fs.readFileSync(DB_FILE, 'utf8');
        const db = JSON.parse(rawData);

        // Migrate Meetings
        if (db.meetings && db.meetings.length > 0) {
            console.log(`Migrating ${db.meetings.length} meetings...`);

            // Transform data if necessary to match Supabase schema
            // Ensure column names match exactly (dates, boolean fields, etc.)
            const meetingsData = db.meetings.map(m => ({
                id: m.id,
                title: m.title,
                date: m.date,
                time: m.time,
                description: m.description,
                attendees: m.attendees,
                useMeet: m.useMeet,
                sendEmail: m.sendEmail,
                notes: m.notes,
                attendance: m.attendance,
                report: m.report
            }));

            const { error: meetingsError } = await supabase
                .from('meetings')
                .upsert(meetingsData);

            if (meetingsError) {
                console.error('Error migrating meetings:', meetingsError);
            } else {
                console.log('Meetings migrated successfully!');
            }
        }

        // Migrate Tech Cards
        if (db.techCards && db.techCards.length > 0) {
            console.log(`Migrating ${db.techCards.length} tech cards...`);

            const techCardsData = db.techCards.map(t => ({
                id: t.id,
                title: t.title,
                theme: t.theme,
                duration: t.duration,
                reference: t.reference,
                isSponsored: t.isSponsored,
                sponsorName: t.sponsorName,
                agenda: t.agenda,
                needs: t.needs
            }));

            const { error: techError } = await supabase
                .from('tech_cards') // Ensure table name matches in Supabase
                .upsert(techCardsData);

            if (techError) {
                console.error('Error migrating tech cards:', techError);
            } else {
                console.log('Tech cards migrated successfully!');
            }
        }

        console.log('Migration completed.');

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
