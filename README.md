# WorkMitra

A full-stack, two-sided marketplace engineered to connect customers with verified skilled trades professionals (electricians, plumbers, carpenters, AC technicians) across India. 

Beyond standard CRUD operations, WorkMitra implements real-world marketplace logistics, including automated platform fee guards, strict booking state machines, and real-time Socket.io dispatching.

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Context API
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** MongoDB, Mongoose (with 2dsphere geospatial indexing)
* **Authentication & Security:** JWT (Access/Refresh), Zod validation, bcrypt, Helmet, API rate limiting
* **External Services:** Cloudinary (Media), Nodemailer (SMTP), Maps API

## Core Business Logic & Architecture
* **Anti-Leakage Ledger System:** Automatically detects overdue or "stalled" jobs used to bypass the 10% platform fee. Triggers time-based UI lockouts and restricts new bookings if a worker's wallet balance drops below -₹500.
* **Double-Booking Guards:** Strict backend state machine preventing overlapping schedules. Bookings enforce a rigid lifecycle (`Pending` -> `Accepted` -> `In-Progress` -> `Completed`).
* **Geospatial Matching:** Implements MongoDB `$near` queries against `2dsphere` indexes to match customers with workers in their immediate physical radius.
* **Real-Time Dispatch & Chat:** WebSocket integration for instant messaging, live typing indicators, read receipts, and real-time booking status updates.

## Feature Modules
* **Role-Based Access Control (RBAC):** Distinct dashboard interfaces, routing, and API permissions for Customers, Workers, and Admins.
* **Worker Portal:** Profile management, Cloudinary-backed portfolio uploads, live availability toggles, and document verification queues.
* **Search & Match Engine:** Dynamic filtering by profession, price range, city, dynamic rating aggregation, and localized availability.
* **Admin Command Center:** Real-time analytics (revenue, user growth, top cities), manual dispute resolution, and worker verification approvals.

## Infrastructure & Testing Notes
To run this project locally, ensure the following environment constraints are met:
* **Media Uploads:** Requires active Cloudinary credentials in the `.env` file to process avatars and portfolio images.
* **Email Dispatch:** Password reset flows require SMTP credentials. Without them, the backend falls back to logging the reset token directly to the terminal for local testing.
* **Location Services:** Geospatial queries are fully implemented on the backend. Frontend map UI components are currently in development; coordinates can be manually passed via the profile update endpoints.
* **Payment Gateway:** Platform fee calculations and ledger negative-balance lockouts are fully functional. Direct Razorpay integration for clearing dues is scheduled for a future release.

## Local Setup

**1. Clone & Configure Backend**
```bash
cd server
cp .env.example .env   # Hydrate MongoDB URI, JWT secrets, Cloudinary, and SMTP
npm install
npm run dev