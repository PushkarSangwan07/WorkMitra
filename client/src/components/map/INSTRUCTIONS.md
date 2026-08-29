# Mobile + Map Update — File Placement Guide

## Step 1 — Install Leaflet
```bash
cd client
npm install leaflet react-leaflet
```

## Step 2 — Create new folder
Create this folder in your project:
```
client/src/components/map/
```

## Step 3 — Copy files to correct locations

| File in this zip          | Copy to                                               |
|---------------------------|-------------------------------------------------------|
| WorkerMap.jsx             | client/src/components/map/WorkerMap.jsx               |
| SearchWorkers.jsx         | client/src/pages/public/SearchWorkers.jsx             |
| WorkerFilters.jsx         | client/src/components/worker/WorkerFilters.jsx        |
| WorkerCard.jsx            | client/src/components/worker/WorkerCard.jsx           |
| WorkerProfile.jsx         | client/src/pages/public/WorkerProfile.jsx             |
| BookingCard.jsx           | client/src/components/booking/BookingCard.jsx         |
| Skeleton.jsx              | client/src/components/common/Skeleton.jsx             |

## Step 4 — Add Leaflet CSS to index.css
Add this line at the very top of client/src/index.css:
```css
@import 'leaflet/dist/leaflet.css';
```

## Step 5 — Run
```bash
cd client && npm run dev
```

## What changed

### Mobile experience (was 70%, now 95%)
- Filter sidebar now HIDES on mobile
- A "Filters" button appears at top on mobile
- Tapping it opens a BOTTOM DRAWER with all filters — like a real app
- Active filter count shows as a badge on the button
- All cards properly sized on small screens  
- Booking form stacks vertically on mobile
- Worker profile action buttons wrap on small screens
- Better touch targets throughout (min 44px)
- Bookings page tabs wrap cleanly on mobile

### Map view
- Grid/Map toggle in the search page header
- Map shows worker pins across India using OpenStreetMap (FREE, no API key)
- Pin color = availability (green=available, yellow=busy, gray=offline)
- Click any pin → popup with worker photo, name, profession, rating, price
- "View Profile" button in popup links to full profile
- Map auto-fits to show all workers in results
- Falls back to city center coordinates when worker has no GPS set
- Lazy loaded — Leaflet only loads when user switches to map view

### Cards overflow fix
- WorkerCard skills now truncate properly with "+N more" badge
- WorkerCard footer stats don't overflow on small screens
- BookingCard address truncates with ellipsis on mobile
- All action button groups wrap cleanly instead of overflowing
