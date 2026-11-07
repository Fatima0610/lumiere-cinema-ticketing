# LUMIÈRE CINEMA — Interactive Venue Ticketing System

Web & Mobile I (INFT-2302) student project. An HTML/CSS/vanilla JS front-end only cinema ticket selector.

## Run
Open `index.html` in a browser. No Dependencies, build tools, server or account required. The Google Fonts stylesheet is not required, the page has system font fallbacks.

## Features
- 240 dynamically generated seats in VIP (35 AZN), Premium (25 AZN), and Standard (15 AZN) zones.
- The four states: Available, inspected, in-cart, and unavailable.
- Please note that seat inspection is not part of the adding to cart process.
- Cleanup tickets, avoid duplicate tickets, display ticket totals and sync seat states.
- Store cart IDs in localStorage and load when page is reloaded.
- Zoom, pan and reset controls visible and mouse-wheel zoom/drag pan available.
- Responsiveness of the layout and semantic buttons on the desktop and mobile versions.

## Files
- `index.html`: interface structure
- `styles.css`: visual design and responsive layout
- `script.js`: seat model, rendering, cart, persistence and navigation

## Notes

This project focuses on front-end functionality. Seat availability is predefined, and selected tickets are saved using localStorage.
