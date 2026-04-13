🎊 VIP Boozer
<img src="next-client/public/favicon/android-chrome-512x512.png" width="120" />

🚀 Getting Started.

Clone the Repository. git clone https://github.com/OksanaMosk/Boozer.git
Environment Setup (BASE_URL) (.env, settings.py). The BASE_URL variable is used for redirects (e.g., account activation, password recovery). Please configure it based on your setup: Full Docker Deployment (Recommended)
If you are running the entire project via Docker Compose (using Nginx on port 80), ensure your .env file has:
BASE_URL=http://localhost
Hybrid Setup (Local Next.js + Docker Backend): If you are running the Next.js client locally (npm run dev on port 3000) while the backend is in Docker, set:
BASE_URL=http://localhost:3000

Run Project: Docker: docker-compose up --build.
Or

Local Next: npm install, npm run dev or npm run build

Docker Backend docker compose up --build app redis celery celery-beat
Access & Credentials. Once the containers are running, you can log in with: Admin Email: admin@gmail.com. Password: 111111(kkkkkk).

🧪 API Testing (Postman).
The project includes a pre-configured Postman collection and environment to help you start testing the API immediately.
**Location:** Files are stored in the `/postman` folder.

**How to use:**.
1. **Import Collection:** Open Postman, click **Import**, and select `postman/postman_collection.json`.
2. **Import Environment:** Click **Import** again and select `postman/environment.json`.
3. **Select Environment:** In the top-right corner of Postman, select **Local Dev** from the dropdown menu.
4. **Base URL:** The environment is pre-set to `http://localhost:8888/api` (standard Docker backend port).
**Note:** For requests requiring authentication, ensure you run the **Login** request first to obtain a JWT token.
"key": "adminToken",
 "value": "".

🎊VIP Boozer is a modern platform for discovering venues, booking tables, planning events, and creating personalized “Boozer” orders with additional services like transfers, hotels, decor, and more. Core Features.

👤 Authentication. Email registration (with activation link). Login via: Google Facebook. Only authenticated users can: Create orders, View real prices, Requirements: Provide date of birth, Confirm legal age, Accept platform rules.

🏢 Venue Management. For all users: Browse venues.

🧑‍💼 Venue Admin. Can: Create venues: country, city, currency, photos, description. Edit / delete venues.

Create menus: multiple menus, one public menu, drag & drop categories and items.

Configure venue layout: hall background (canvas), table positioning (coordinates).

Add: news (text + images), additional services: transfer (airport → flight → venue), hotel, insurance, decor.

Set pricing, View statistics,

Average Check: The value is populated by the Venue Admin according to the Technical Specifications (TS). The calculations are performed automatically within the Analytics section.

🍽️ Menu (Drag & Drop). Built with React Drag & Drop. Supports: moving items between categories, reordering categories.

🪑🪑 Table Booking. Canvas-based layout (coordinates), User selects table visually. Availability: no time overlaps. Database: PostgreSQL / Supabase.

✈️Boozer (Order System). Order Flow (7 steps): Country, City, Venue, Travel dates, Number of people, Budget, Gender, Comment, Menu selection (optional), Table selection (if available), Additional services, Route preview, Price calculation & payment. All prices and amounts are available at each selection step, but for visual reference only. Once the order is confirmed, a confirmation email is sent.

💵 Currency Logic. This means that: Venue revenue is calculated in the venue’s own currency. Visitor expenses are calculated in the visitor’s own currency.

Real conversion happens only at checkout.

⏳ Automation. Incomplete orders: marked as expired via Celery, reserved tables are released.

🗺️ Routing. Integrated with Google Maps API. Automatic calculation: distance, transfer cost.

📰 News. Categories: General, Promotions, Events, Promotions and events may require payment to be published.

📊 Automated Analytics: The Average Check is automatically calculated in the venue’s local currency. For reference, the payment currency used by each visitor is also displayed.

📊 Statistical Insights: The Analytics section provides data on all orders, including:
Total number of confirmed orders.
Visitor demographics (gender distribution).
Budget preferences to analyze potential customer expectations and adjust pricing strategies accordingly.

📰 Reviews — can only be posted after a confirmed order. Review Limits: Users will see a notification: "You have already submitted reviews for all your confirmed visits" if there are no new confirmed orders available for feedback.

Roles. 👫Visitor: Browse platform, Create Boozer orders, Book menus, tables, transfer, and more, Make payments.

🤵Venue Admin: Manage own venues, Menus, tables, services.

👨‍⚖️Admin: Manage: users, venues, Moderation, Analytics.

⚙️ Tech Stack: Backend: Python, Django, Celery, Redis, Supabase.

Frontend: Next.js, React, Drag & Drop, React Canvas.

Infrastructure: Nginx, Docker, Google Maps API, OAuth (Google, Facebook).

Authentication Architecture: The authentication system is built using a custom social login implementation based on OAuth and JWT.

🔑 Core Principles: OAuth is used to obtain access tokens from providers (Google, Facebook). The backend uses its own JWT tokens for application-level authorization.

The frontend (built with NextAuth) initiates OAuth authentication via Google or Facebook. After successful login, a provider access token is obtained. This token is sent to the backend.

The backend: validates the token with the provider retrieves user data. After successful verification, the backend: creates or updates the user, generates an application-specific JWT token. The JWT token is then used for all subsequent API requests.

🔒 Advantages: No password storage required. Secure integration with external providers. Scalable and stateless authentication via JWT. Unified authorization system across frontend and backend.

🔒 Access Rules: Browsing — public, Orders & real pricing — authenticated users only. 

🚧 In Progress: Chat.
Postman collection is not tested for the Favorites, Review.

🎊 Product Vision VIP Boozer is more than booking — it’s a full experience: travel, entertainment, comfort, personalization.