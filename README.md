# The Escape Coordinator

## Description
The Escape Coordinator is a **full-stack travel itinerary planner** that helps users organize trips, track expenses, and manage activities. The application features **user authentication, trip and activity management, and budgeting tools**. Built with **Node.js, Express.js, PostgreSQL, and EJS**, this app allows users to create and edit trips, add activities, and manage trip-related budgets.

## Features
- **User Authentication:** Secure login and registration using bcrypt and Express Sessions.
- **Trip Management:** Users can create, update, and delete trips.
- **Activity Management:** Add, edit, and delete activities within a trip.
- **Budget Tracking:** Assign budgets to trips and activities.
- **Responsive UI:** Built with EJS templates and CSS.
- **Database Storage:** PostgreSQL for structured trip and activity data.
- **Deployed on Railway** for accessibility.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript (EJS for templating)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (hosted on Railway)
- **Authentication:** bcrypt for password hashing, Express Sessions for user management

## Installation
### **Prerequisites**
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

### **Setup Instructions**
1. **Clone the repository:**
   ```sh
   git clone https://github.com/theadhdkid/The-Escape-Coordinator.git
   cd The-Escape-Coordinator
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up the database:**
   - Create a PostgreSQL database.
   - Update `.env` with database credentials:
     ```env
     DATABASE_URL=your_postgres_database_url
     SESSION_SECRET=your_secret_key
     ```
   - Run the database schema:
     ```sh
     psql -d your_database_name -f server/db/schema.sql
     ```
   - Seed the database:
     ```sh
     npm run seed-db
     ```

4. **Start the server:**
   ```sh
   npm start
   ```
   The app will run at `http://localhost:3000`

## API Endpoints
### **User Authentication**
- `POST /login` - Logs in a user.
- `POST /register` - Registers a new user.
- `GET /logout` - Logs out the user.

### **Trips**
- `GET /` - Lists all trips for the logged-in user.
- `POST /api/trips` - Creates a new trip.
- `PATCH /api/trips/:id` - Updates an existing trip.
- `DELETE /api/trips/:id` - Deletes a trip.

### **Activities**
- `POST /api/trips/:tripId/activities` - Adds an activity to a trip.
- `PATCH /api/activities/:id` - Updates an activity.
- `DELETE /api/activities/:id` - Removes an activity.

## Deployment
This project is **deployed on Railway**. To deploy:
```sh
railway up
```

## Author
**Anzara** - Developed the entire project, including **frontend, backend, database design, and deployment**.

