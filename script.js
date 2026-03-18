const MY_SHOP_ADDRESS = "4 Nilgiri, Near Muni Dairy, Opp. Rushabh App., Airport Road-364001"; 
const ENQUIRY_PHONE = "9409072662";

const PICKLES = [
  { id:'gol',  en:'Gol Sambhari',        gu:'ગોળ સંભારી', p250:120, p500:230, p1kg:450 },
  { id:'kes',  en:'Kesar Murabbo',       gu:'કેસર મુરબ્બો', p250:110, p500:210, p1kg:400 },
  { id:'chh',  en:'Chhundo',             gu:'ચૂંદો', p250:110, p500:210, p1kg:400 },
  { id:'kat',  en:'Katki',               gu:'કટકી', p250:120, p500:230, p1kg:450 },
  { id:'khj',  en:'Khajur nu Athanu',    gu:'ખજૂરનું અથાણું', p250:130, p500:250, p1kg:480 },
  { id:'gar',  en:'Garmar',              gu:'ગરમર', p250:120, p500:220, p1kg:420 },
  { id:'ker',  en:'Kerda',               gu:'કેરડા', p250:120, p500:220, p1kg:420 }
];

let cart = {};

function renderGrid() {
    const grid = document.getElementById('pickleGrid');
    grid.innerHTML = PICKLES.map(p => `
        <div class="pickle-card">
            <div class="card-head"><strong>${p.en}</strong></div>
            <div class="size-row"><span>250g - ₹${p.p250}</span> ${qtyCtrl(p.id, '250g')}</div>
            <div class="size-row"><span>500g - ₹${p.p500}</span> ${qtyCtrl(p.id, '500g')}</div>
            <div class="size-row"><span>1kg - ₹${p.p1kg}</span> ${qtyCtrl(p.id, '1kg')}</div>
        </div>
    `).join('');
}

function qtyCtrl(id, size) {
    return `<div style="display:flex; align-items:center; gap:8px;">
        <button class="qty-btn" onclick="updateQty('${id}','${size}',-1)">-</button>
        <span id="q_${id}_${size}" style="font-weight:bold;">0</span>
        <button class="qty-btn" onclick="updateQty('${id}','${size}',1)">+</button>
    </div>`;
}

function updateQty(id, size, delta) {
    const key = `${id}_${size}`;
    const p = PICKLES.find(x => x.id === id);
    const price = size === '250g' ? p.p250 : size === '500g' ? p.p500 : p.p1kg;

    if (!cart[key]) cart[key] = { name: p.en, size, qty: 0, price };
    cart[key].qty = Math.max(0, cart[key].qty + delta);
    
    if (cart[key].qty === 0) delete cart[key];
    document.getElementById(`q_${id}_${size}`).innerText = cart[key]?.qty || 0;
    updateSummary();
}

function updateSummary() {
    const items = Object.values(cart);
    const total = items.reduce((s, i) => s + (i.price * i.qty), 0);
    document.getElementById('totalAmt').innerText = `₹${total}`;
    document.getElementById('sendBtn').disabled = total === 0;

    const list = document.getElementById('orderList');
    list.innerHTML = items.length ? items.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #eee;">
            <span>${i.name} (${i.size}) x ${i.qty}</span>
            <strong>₹${i.price * i.qty}</strong>
        </div>
    `).join('') : '<p class="empty-msg">No items added yet.</p>';
}

function toggleAddressField() {
    const type = document.getElementById('orderType').value;
    const section = document.getElementById('addressSection');
    section.style.display = (type === 'delivery') ? 'block' : 'none';
}

function sendToWhatsApp() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const orderType = document.getElementById('orderType').value;
    const custAddress = document.getElementById('custAddress').value.trim();

    if (!name || !phone || (orderType === 'delivery' && !custAddress)) {
        return alert("Please fill all required fields!");
    }

    let msg = `*HOME MADE PICKLES - ORDER CONFIRMED* 🥭\n\n`;
    msg += `👤 *Customer Name:* ${name}\n`;
    msg += `📦 *Order Type:* ${orderType.toUpperCase()}\n`;
    
    if (orderType === 'delivery') {
        msg += `📍 *Delivery Address:* ${custAddress}\n`;
    } else {
        msg += `🏠 *Pickup Address:* ${MY_SHOP_ADDRESS}\n`;
    }

    msg += `\n*Order Details:* \n`;
    Object.values(cart).forEach(i => { 
        msg += `• ${i.name} (${i.size}) x ${i.qty} = ₹${i.price * i.qty}\n`; 
    });
    
    msg += `\n*Total Amount: ${document.getElementById('totalAmt').innerText}*`;
    msg += `\n\n━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🙏 *Thank you for your purchase!* \n`;
    msg += `📞 If any enquiry please contact us on ${ENQUIRY_PHONE}`;

    const cleanPhone = phone.replace(/\D/g,'');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

function resetAll() {
    if(confirm("New order?")) location.reload();
}

renderGrid();
