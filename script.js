'use strict';
// Venue data model: 12 rows x 20 seats = 240 seats, split into three price zones.
const ZONES = [
  { name: 'VIP', rows: ['A', 'B', 'C'], price: 35, className: 'vip' },
  { name: 'Premium', rows: ['D', 'E', 'F', 'G'], price: 25, className: 'premium' },
  { name: 'Standard', rows: ['H', 'I', 'J', 'K', 'L'], price: 15, className: 'standard' }
];
const STORAGE_KEY = 'lumiere-cinema-cart-v1';
const seats = ZONES.flatMap(zone => zone.rows.flatMap((row, rowIndex) =>
  Array.from({ length: 20 }, (_, index) => {
    const number = index + 1;
    // Consistent demo unavailable seats (not random, so refresh remains predictable).
    const unavailable = ((row.charCodeAt(0) * 13 + number * 7) % 19 === 0) ||
      (row === 'A' && [9, 10].includes(number));
    return { id: `${row}${number}`, row, number, zone: zone.name,
      price: zone.price, className: zone.className, unavailable };
  })
));
const seatById = new Map(seats.map(seat => [seat.id, seat]));
const seatMap = document.getElementById('seat-map');
const seatDetails = document.getElementById('seat-details');
const addButton = document.getElementById('add-to-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const viewport = document.getElementById('map-viewport');
const mapContent = document.getElementById('map-content');
const zoomLabel = document.getElementById('zoom-label');
const toast = document.getElementById('toast');
let inspectedId = null;
let cart = restoreCart();
let view = { zoom: 1, x: 0, y: 0 };
let toastTimer;
function restoreCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return [...new Set(stored.filter(id => typeof id === 'string'))]
      .filter(id => seatById.has(id) && !seatById.get(id).unavailable);
  } catch (error) { return []; }
}
function persistCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
  catch (error) { notify('Unable to save cart in this browser.'); }
}
function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
function seatState(seat) {
  if (seat.unavailable) return 'unavailable';
  if (cart.includes(seat.id)) return 'in-cart';
  if (inspectedId === seat.id) return 'inspected';
  return 'available';
}
function renderSeats() {
  const fragment = document.createDocumentFragment();
  for (const row of 'ABCDEFGHIJKL') {
    const rowElement = document.createElement('div');
    rowElement.className = 'seat-row';
    const label = document.createElement('span');
    label.className = 'row-label'; label.textContent = row;
    rowElement.append(label);
    seats.filter(seat => seat.row === row).forEach(seat => {
      if (seat.number === 11) {
        const aisle = document.createElement('span');
        aisle.className = 'aisle'; aisle.setAttribute('aria-hidden', 'true');
        rowElement.append(aisle);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `seat ${seat.className} ${seatState(seat)}`;
      button.dataset.seatId = seat.id;
      button.textContent = seat.number;
      button.disabled = seat.unavailable;
      button.title = `${seat.id} · ${seat.zone} · ${seat.unavailable ? 'Unavailable' : `${seat.price} AZN`}`;
      button.setAttribute('aria-label', `Seat ${seat.id}, ${seat.zone}, ${seat.unavailable ? 'unavailable' : `${seat.price} AZN, ${seatState(seat)}`}`);
      button.setAttribute('aria-pressed', String(inspectedId === seat.id));
      button.addEventListener('click', () => inspectSeat(seat.id));
      rowElement.append(button);
    });
    const endLabel = document.createElement('span');
    endLabel.className = 'row-label'; endLabel.textContent = row;
    rowElement.append(endLabel);
    fragment.append(rowElement);
  }
  seatMap.replaceChildren(fragment);
}
function inspectSeat(id) {
  const seat = seatById.get(id);
  if (!seat || seat.unavailable) return;
  inspectedId = id;
  renderSeats(); renderDetails();
}
function renderDetails() {
  const seat = seatById.get(inspectedId);
  if (!seat) {
    seatDetails.className = 'empty-state';
    seatDetails.innerHTML = '<div class="empty-icon">◇</div><strong>No seat selected</strong><p>Choose an available seat on the map to inspect its details and price.</p>';
    addButton.disabled = true;
    addButton.innerHTML = 'ADD TO CART <span>↗</span>';
    return;
  }
  const inCart = cart.includes(seat.id);
  seatDetails.className = 'seat-detail-card';
  seatDetails.innerHTML = `<div class="seat-code">${seat.id}</div><div class="detail-line"><span>Section</span><strong>${seat.zone}</strong></div><div class="detail-line"><span>Row / Seat</span><strong>${seat.row} / ${seat.number}</strong></div><div class="detail-line"><span>Status</span><strong>${inCart ? 'Already in cart' : 'Available'}</strong></div><div class="detail-line"><span>Ticket price</span><span class="price">${seat.price} AZN</span></div>`;
  addButton.disabled = inCart;
  addButton.innerHTML = inCart ? 'ALREADY IN CART <span>✓</span>' : 'ADD TO CART <span>↗</span>';
}
function renderCart() {
  cartCount.textContent = cart.length;
  cartTotal.textContent = `${cart.reduce((sum, id) => sum + seatById.get(id).price, 0)} AZN`;
  cartItems.replaceChildren();
  if (!cart.length) {
    const empty = document.createElement('p'); empty.className = 'empty-cart';
    empty.textContent = 'Your cart is empty.'; cartItems.append(empty); return;
  }
  for (const id of cart) {
    const seat = seatById.get(id);
    const item = document.createElement('div'); item.className = 'cart-item';
    const description = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = `Seat ${seat.id}`;
    const sub = document.createElement('small'); sub.textContent = `${seat.zone} · Row ${seat.row}`;
    description.append(title, sub);
    const right = document.createElement('div'); right.className = 'cart-item-right';
    const price = document.createElement('b'); price.textContent = `${seat.price} AZN`;
    const remove = document.createElement('button'); remove.className = 'remove';
    remove.type = 'button'; remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove seat ${seat.id} from cart`);
    remove.addEventListener('click', () => removeFromCart(id));
    right.append(price, remove); item.append(description, right); cartItems.append(item);
  }
}
function updateUI() { renderSeats(); renderDetails(); renderCart(); }
function addToCart() {
  const seat = seatById.get(inspectedId);
  if (!seat || seat.unavailable || cart.includes(seat.id)) return;
  cart.push(seat.id); persistCart(); updateUI(); notify(`Seat ${seat.id} added to your cart`);
}
function removeFromCart(id) {
  cart = cart.filter(item => item !== id);
  persistCart(); updateUI(); notify(`Seat ${id} removed from cart`);
}
addButton.addEventListener('click', addToCart);
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function renderView() {
  const maxX = 300 * view.zoom, maxY = 230 * view.zoom;
  view.x = clamp(view.x, -maxX, maxX);
  view.y = clamp(view.y, -maxY, maxY);
  mapContent.style.transform = `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px)) scale(${view.zoom})`;
  zoomLabel.textContent = `${Math.round(view.zoom * 100)}%`;
}
function changeZoom(delta) { view.zoom = clamp(Math.round((view.zoom + delta) * 100) / 100, 0.65, 2); renderView(); }
document.getElementById('zoom-in').addEventListener('click', () => changeZoom(.15));
document.getElementById('zoom-out').addEventListener('click', () => changeZoom(-.15));
document.getElementById('move-up').addEventListener('click', () => { view.y += 45; renderView(); });
document.getElementById('move-down').addEventListener('click', () => { view.y -= 45; renderView(); });
document.getElementById('move-left').addEventListener('click', () => { view.x += 45; renderView(); });
document.getElementById('move-right').addEventListener('click', () => { view.x -= 45; renderView(); });
document.getElementById('reset-view').addEventListener('click', () => { view = { zoom: 1, x: 0, y: 0 }; renderView(); });
// Bonus: mouse wheel zoom, plus pointer-based drag panning without breaking seat clicks.
viewport.addEventListener('wheel', event => {
  event.preventDefault(); changeZoom(event.deltaY < 0 ? .08 : -.08);
}, { passive: false });
let drag = null;
viewport.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y, moved: false };
});
viewport.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
  if (Math.hypot(dx, dy) > 5) {
    if (!drag.moved) { drag.moved = true; viewport.setPointerCapture(event.pointerId); }
    viewport.classList.add('dragging');
    view.x = drag.x + dx; view.y = drag.y + dy; renderView();
  }
});
function finishDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  viewport.classList.remove('dragging');
  if (drag.moved) {
    // Captured pointer ends on viewport, so a drag does not accidentally select a seat.
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  }
  drag = null;
}
viewport.addEventListener('pointerup', finishDrag);
viewport.addEventListener('pointercancel', finishDrag);
updateUI(); renderView();
