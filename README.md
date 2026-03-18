🎊 VIP Boozer
<img src="next-client/public/favicon/android-chrome-512x512.png" width="120" />

🚀 Getting Started
1. Clone the Repository
git clone https://github.com/OksanaMosk/Boozer.git
2. Environment Setup (BASE_URL) (.env, settings.py)
The BASE_URL variable is used for redirects (e.g., account activation, password recovery). Please configure it based on your setup:
Full Docker Deployment (Recommended)**  
    If you are running the entire project via Docker Compose (using Nginx on port 80), ensure your `.env` file has:  
    BASE_URL=http://localhost

Hybrid Setup (Local Next.js + Docker Backend):**  
    If you are running the Next.js client locally (`npm run dev` on port 3000) while the backend is in Docker, set:  
    BASE_URL=http://localhost:3000

3. Running the Project
docker-compose up --build

4. Access & Credentials
Once the containers are running, you can log in with:
Admin Email: admin@gmail.com
Password: 111111

VIP Boozer is a modern platform for discovering venues, booking tables, planning events, and creating personalized “Boozer” orders with additional services like transfers, hotels, decor, and more.
🚀 Core Features
👤 Authentication

Email registration (with activation link)
Login via:
Google
Facebook
Only authenticated users can:
Create orders
View real prices
Requirements:
Provide date of birth
Confirm legal age
Accept platform rules

🏢 Venue Management
For all users:
Browse venues

🧑‍💼 Venue Admin
Can:

Create venues:
country, city, currency
photos
description
Edit / delete venues

Create menus:
multiple menus
one public menu
drag & drop categories and items

Configure venue layout:
hall background (canvas)
table positioning (coordinates)

Add:
news (text + images)
additional services:
transfer (airport → flight → venue)
hotel
insurance
decor

Set pricing
View statistics

🍽️ Menu (Drag & Drop)
Built with React Drag & Drop
Supports:
moving items between categories
reordering categories

🪑 Table Booking
Canvas-based layout (coordinates)
User selects table visually
Availability:
no time overlaps
Database: PostgreSQL / Supabase

💸 Boozer (Order System)
Order Flow (7 steps):

Travel dates
Number of people
Budget
Gender
Comment
Menu selection (optional)
Table selection (if available)
Additional services
Route preview
Price calculation & payment
All prices and amounts are available at each selection step, but for visual reference only.
Once the order is confirmed, a confirmation email is sent.

💱 Currency Logic
This means that:
Venue revenue is calculated in the venue’s own currency
Visitor expenses are calculated in the visitor’s own currency

Real conversion happens only at checkout

⏳ Automation
Incomplete orders:
marked as expired via Celery
reserved tables are released

🗺️ Routing
Integrated with Google Maps API
Automatic calculation:
distance
transfer cost

📰 News
Categories:
General
Promotions
Events
Promotions and events may require payment to be published

👥 Roles
Visitor
Browse platform
Create Boozer orders
Book menus, tables, transfer, and more
Make payments

Venue Admin
Manage own venues
Menus, tables, services

Admin
Manage:
users
venues
Moderation
Analytics

⚙️ Tech Stack
Backend
Python
Django
Celery
Redis
Supabase

Frontend
Next.js
React
Drag & Drop
React Canvas

Infrastructure
Nginx
Docker
Google Maps API
OAuth (Google, Facebook)

Authentication Architecture
The authentication system is built using a custom social login implementation based on OAuth and JWT.

🔑 Core Principles:
OAuth is used to obtain access tokens from providers (Google, Facebook)
The backend uses its own JWT tokens for application-level authorization

The frontend (built with NextAuth) initiates OAuth authentication via Google or Facebook
After successful login, a provider access token is obtained
This token is sent to the backend

The backend:
validates the token with the provider retrieves user data
After successful verification, the backend:
creates or updates the user
generates an application-specific JWT token
The JWT token is then used for all subsequent API requests

🔒 Advantages:
No password storage required
Secure integration with external providers
Scalable and stateless authentication via JWT
Unified authorization system across frontend and backend

🐳 Run Project
Local:
npm install
npm run dev
Docker:
docker-compose up --build

🔒 Access Rules
Browsing — public
Orders & real pricing — authenticated users only

🚧 In Progress
Search & Filtering
Reviews system
Favorites
Discounts & бонус system
User dashboards
Notifications
Profile editing
Extended news system
Admin panel (partial)
Statistics
Tags system
Average check calculations
Chat

💡 Product Vision
VIP Boozer is more than booking — it’s a full experience:
travel
entertainment
comfort
personalization

