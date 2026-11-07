# LUMIÈRE CINEMA — Interactive Venue Ticketing System

Web & Mobile I (INFT-2302) student project. A front-end-only cinema ticket selector built with HTML, CSS and vanilla JavaScript.

## Run
Open `index.html` in a browser. No dependencies, build tools, server, or account needed. The Google Fonts stylesheet is optional; the page has system font fallbacks.

## Features
- 240 dynamically generated seats in VIP (35 AZN), Premium (25 AZN), and Standard (15 AZN) zones.
- Available, inspected, in-cart, and unavailable states.
- Seat inspection is separate from adding to cart.
- Remove tickets, prevent duplicates, show totals, synchronize seat states.
- Persist cart IDs with localStorage and restore on reload.
- Visible zoom, pan, and reset controls; optional mouse-wheel zoom and drag pan.
- Responsive desktop and mobile layout, semantic seat buttons.

## Files
- `index.html`: interface structure
- `styles.css`: visual design and responsive layout
- `script.js`: seat model, rendering, cart, persistence and navigation

## Notes

This project focuses on front-end functionality. Seat availability is predefined, and selected tickets are saved using localStorage.
