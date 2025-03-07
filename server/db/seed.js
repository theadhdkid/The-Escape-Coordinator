import { query } from './index.js';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
    try {
        // Read and execute schema
        const schemaSQL = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
        await query(schemaSQL);
        console.log('Schema created successfully');

        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const userResult = await query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            ['testuser', 'test@example.com', hashedPassword]
        );
        const userId = userResult.rows[0].id;
        console.log('Test user created with ID:', userId);

        // Insert sample trips for test user
        const tripsData = [
            {
                title: 'Pho Time',
                destination: 'Hanoi, Vietnam',
                start_date: '2024-12-20',
                end_date: '2024-12-27',
                budget: 2500
            },
            {
                title: 'Exploring Italy',
                destination: 'Venice, Italy',
                start_date: '2024-01-15',
                end_date: '2024-01-21',
                budget: 4000
            },
            {
                title: 'Coldplay Concert and Sightseeing',
                destination: 'Santorini, Greece',
                start_date: '2024-03-10',
                end_date: '2024-03-20',
                budget: 5500
            }
        ];

        for (const trip of tripsData) {
            const result = await query(
                'INSERT INTO trips (user_id, title, destination, start_date, end_date, budget) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [userId, trip.title, trip.destination, trip.start_date, trip.end_date, trip.budget]
            );
            console.log(`Trip created with ID: ${result.rows[0].id}`);
        }

        // Get the ID of the first trip for activities
        const firstTripResult = await query(
            'SELECT id FROM trips WHERE title = $1 AND user_id = $2',
            ['Pho Time', userId]
        );
        const firstTripId = firstTripResult.rows[0].id;

        // Insert sample activities for the first trip
        const activitiesData = [
            {
                name: 'Street Food Tour',
                date: '2024-12-21',
                cost: 45,
                description: "Explore the best street food spots in Hanoi's Old Quarter"
            },
            {
                name: 'Ha Long Bay Cruise',
                date: '2024-12-23',
                cost: 150,
                description: 'Full-day cruise through Ha Long Bay with lunch included'
            }
        ];

        for (const activity of activitiesData) {
            await query(
                'INSERT INTO activities (trip_id, name, date, cost, description) VALUES ($1, $2, $3, $4, $5)',
                [firstTripId, activity.name, activity.date, activity.cost, activity.description]
            );
            console.log('Activity created successfully');
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        process.exit();
    }
}

seedDatabase();