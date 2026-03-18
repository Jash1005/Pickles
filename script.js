const MY_SHOP_ADDRESS = "4 Nilgiri, Near Muni Dairy, Opp. Rushabh App., Airport Road-364001"; 
const ENQUIRY_PHONE = "9409072662";
const SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyRqDZRjX8IyxYEUpIqv2nSnR4m-fGXI-70ekle29UheIQU_mqQ0xRVFXOHdr-76t4q/exec"; // REPLACE THIS!

const PICKLES = [
  { id: 'amk', en: 'Akhi Methi Keri', p250: 120, p500: 230, p1kg: 450 },
  { id: 'gol', en: 'Gol Sambhari', p250: 120, p500: 230, p1kg: 450 },
  { id: 'skg', en: 'Sambhari Keri Gunda', p250: 130, p500: 250, p1kg: 480 },
  { id: 'cmk', en: 'Chana Methi Keri', p250: 120, p500: 230, p1kg: 450 },
  { id: 'gar', en: 'Garmar', p250: 120, p500: 220, p1kg: 420 },
  { id: 'bed', en: 'Bedekar', p250: 120, p500: 230, p1kg: 450 },
  { id: 'kat', en: 'Katki', p250: 120, p500: 230, p1kg: 450 },
  { id: 'bfg', en: 'Bafya Gunda', p250: 130, p500: 250, p1kg: 480 },
  { id: 'chh', en: 'Chundo', p250: 110, p500: 210, p1kg: 400 },
  { id: 'ker', en: 'Kerda', p250: 120, p500: 220, p1kg: 420 },
  { id: 'khj', en: 'Khajur nu Athanu', p250: 130, p500: 250, p1kg: 480 },
  { id: 'kes', en: 'Kesar Murabbo', p250: 110, p500: 210, p1kg: 400 },
  { id: 'kgu', en: 'Kacha Gunda', p250: 100, p500: 180, p1kg: 350 },
  { id: 'bgu', en: 'Bol Gunda', p250: 110, p500: 210, p1kg: 400 },
  { id: 'ske', en: 'Sambhari Keri', p250: 120, p500: 230, p1kg: 450 },
  { id: 'dal', en: 'Dala', p250: 120, p500: 230, p1kg: 450 }
];

let cart = {};

// Set default date to today
document.getElementById('orderDate').valueAsDate = new Date();

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
    let itemTotal = items.reduce((s, i) => s + (i.price * i.qty), 0);
    
    const orderType = document.getElementById('orderType').value;
    const courierVal = parseFloat(document.getElementById('courierCharges').value) || 0;
    const courierDisplay = document.getElementById('courierDisplay');
    
    if (orderType === 'delivery' && courierVal > 0) {
        courierDisplay.style.display = 'flex';
        document.getElementById('courierAmtText').innerText = "₹" + courierVal;
        itemTotal += courierVal;
    } else {
        courierDisplay.style.display = 'none';
    }

    document.getElementById('totalAmt').innerText = "₹" + itemTotal;
    document.getElementById('sendBtn').disabled = itemTotal === 0;

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
    document.getElementById('addressSection').style.display = (type === 'delivery') ? 'block' : 'none';
    updateSummary();
}

function sendToWhatsApp() {
    const date = document.getElementById('orderDate').value;
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const orderType = document.getElementById('orderType').value;
    const custAddress = document.getElementById('custAddress').value.trim();
    const courierVal = parseFloat(document.getElementById('courierCharges').value) || 0;
    const total = document.getElementById('totalAmt').innerText;

    if (!date || !name || !phone || (orderType === 'delivery' && !custAddress)) {
        return alert("Please fill all required fields!");
    }

    // Prepare items for Sheet
    const itemString = Object.values(cart).map(i => `${i.name} (${i.size}) x ${i.qty}`).join(", ");

    // Save to Google Sheet (runs in background)
    fetch(SHEET_WEBAPP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
            orderDate: date,
            name: name,
            phone: phone,
            orderType: orderType,
            address: orderType === 'delivery' ? custAddress : 'Pickup',
            courier: courierVal,
            items: itemString,
            total: total
        })
    });

    // WhatsApp Message
    let msg = "🥭 *HOME MADE PICKLES - ORDER CONFIRMED* 🥭\n\n";
    msg += "📅 *Date:* " + date + "\n";
    msg += "👤 *Customer:* " + name + "\n";
    msg += "📦 *Type:* " + orderType.toUpperCase() + "\n";
    
    if (orderType === 'delivery') {
        msg += "📍 *Address:* " + custAddress + "\n";
        if (courierVal > 0) msg += "🚚 *Courier:* ₹" + courierVal + "\n";
    } else {
        msg += "🏠 *Pickup:* " + MY_SHOP_ADDRESS + "\n";
    }

    msg += "\n*Order Details:* \n";
    Object.values(cart).forEach(i => { 
        msg += "• " + i.name + " (" + i.size + ") x " + i.qty + " = ₹" + (i.price * i.qty) + "\n"; 
    });
    
    msg += "\n*Total Amount: " + total + "*";
    msg += "\n\n━━━━━━━━━━\n🙏 *Thank you!* \n📞 For any Enquiry: " + ENQUIRY_PHONE;

    const cleanPhone = phone.replace(/\D/g,'');
    window.open("https://wa.me/91" + cleanPhone + "?text=" + encodeURIComponent(msg), '_blank');
}

function resetAll() {
    if(confirm("Start new order?")) location.reload();
}

renderGrid();

function testSheet() {
  SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow(["Test Date", "Test Name"]);
}
