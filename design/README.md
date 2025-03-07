# The Escape Coordinator

## Introducing the Escape Coordinator! It is a Travel Itinerary Planner, a web application which can be an online tool. Being created to assist users in efficiently planning and organising their travels. Users can track their travel budget, add activities for each day of their trip, and make thorough travel plans. By providing all trip-related information in one accessible location, this platform improves the vacation planning process.

## Features
Trip Overview Page (Main page):

Welcomes User
Displays all upcoming trips sorted by date
Each trip shows destination, dates, and budget overview
Button to create new trips

Trip Details Page:

Shows comprehensive trip information including:

Trip name, destination, and dates
Daily timeline of activities
Budget tracking and remaining balance
Form to add new activities to the trip

REST API Endpoints:

Create new trips (POST)
Edit existing trip details (PATCH)
Delete trips (DELETE)
Add activities to trips (POST)
Edit activities (PATCH)
Delete activities (DELETE)

Database Models:

Users table: stores user information
Trips table: stores trip details
Activities table: stores activity information
One-to-many relationship between Users and Trips
One-to-many relationship between Trips and Activities
