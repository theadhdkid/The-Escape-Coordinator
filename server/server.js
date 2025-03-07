import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db/index.js';
import bcrypt from 'bcrypt';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Set up session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication middleware
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        next();
    }
};

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Routes
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        req.session.userId = user.id;
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred during login' });
    }
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirm_password } = req.body;

        if (password !== confirm_password) {
            return res.render('register', { error: 'Passwords do not match' });
        }

        const existingUser = await query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.render('register', { error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );

        req.session.userId = result.rows[0].id;
        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'An error occurred during registration' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Protected Routes
app.get('/', requireLogin, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date',
            [req.session.userId]
        );
        res.render('index', { trips: result.rows });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Error loading the page');
    }
});

// Trip details route
app.get('/trips/:id', requireLogin, async (req, res) => {
    try {
        const tripId = parseInt(req.params.id);
        
        // Get trip details and verify ownership
        const tripResult = await query(
            'SELECT * FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, req.session.userId]
        );

        if (tripResult.rows.length === 0) {
            res.status(404).send('Trip not found');
            return;
        }

        // Get trip activities
        const activitiesResult = await query(
            'SELECT * FROM activities WHERE trip_id = $1 ORDER BY date',
            [tripId]
        );

        const trip = {
            ...tripResult.rows[0],
            activities: activitiesResult.rows
        };

        res.render('trip-details', { trip });
    } catch (error) {
        console.error('Error loading trip details:', error);
        res.status(500).send('Error loading trip details');
    }
});

// Create new trip
app.post('/api/trips', requireLogin, async (req, res) => {
    try {
        const { title, destination, start_date, end_date, budget } = req.body;
        const result = await query(
            'INSERT INTO trips (user_id, title, destination, start_date, end_date, budget) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.session.userId, title, destination, start_date, end_date, budget]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({ error: 'Failed to create trip' });
    }
});

// Update trip
app.patch('/api/trips/:id', requireLogin, async (req, res) => {
    try {
        const tripId = parseInt(req.params.id);
        const { title, destination, start_date, end_date, budget } = req.body;
        
        const result = await query(
            'UPDATE trips SET title = $1, destination = $2, start_date = $3, end_date = $4, budget = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
            [title, destination, start_date, end_date, budget, tripId, req.session.userId]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Trip not found' });
            return;
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({ error: 'Failed to update trip' });
    }
});

// Delete trip
app.delete('/api/trips/:id', requireLogin, async (req, res) => {
    try {
        const tripId = parseInt(req.params.id);
        const result = await query(
            'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING *',
            [tripId, req.session.userId]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Trip not found' });
            return;
        }
        
        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({ error: 'Failed to delete trip' });
    }
});

// Activity Routes
app.post('/api/trips/:tripId/activities', requireLogin, async (req, res) => {
    try {
        const tripId = parseInt(req.params.tripId);
        
        // Verify trip ownership
        const tripCheck = await query(
            'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
            [tripId, req.session.userId]
        );

        if (tripCheck.rows.length === 0) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        const { name, date, cost, description } = req.body;
        const result = await query(
            'INSERT INTO activities (trip_id, name, date, cost, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [tripId, name, date, cost, description]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding activity:', error);
        res.status(500).json({ error: 'Failed to add activity' });
    }
});

// Update activity
app.patch('/api/activities/:id', requireLogin, async (req, res) => {
    try {
        const activityId = parseInt(req.params.id);
        
        // Verify activity belongs to user's trip
        const activityCheck = await query(
            'SELECT a.id FROM activities a JOIN trips t ON a.trip_id = t.id WHERE a.id = $1 AND t.user_id = $2',
            [activityId, req.session.userId]
        );

        if (activityCheck.rows.length === 0) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        const { name, date, cost, description } = req.body;
        const result = await query(
            'UPDATE activities SET name = $1, date = $2, cost = $3, description = $4 WHERE id = $5 RETURNING *',
            [name, date, cost, description, activityId]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ error: 'Failed to update activity' });
    }
});

// Delete activity
app.delete('/api/activities/:id', requireLogin, async (req, res) => {
    try {
        const activityId = parseInt(req.params.id);
        
        // Verify activity belongs to user's trip
        const activityCheck = await query(
            'SELECT a.id FROM activities a JOIN trips t ON a.trip_id = t.id WHERE a.id = $1 AND t.user_id = $2',
            [activityId, req.session.userId]
        );

        if (activityCheck.rows.length === 0) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        const result = await query('DELETE FROM activities WHERE id = $1 RETURNING *', [activityId]);
        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ error: 'Failed to delete activity' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});