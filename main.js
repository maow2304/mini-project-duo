import { Customer } from './Customer.js';
import { Barber } from './Barber.js';
import { Service } from './Service.js';
import { Booking } from './Booking.js';
import { BarberShop } from './BarberShop.js';
// ===== ข้อมูลตั้งต้นตามสเปคที่อนุมัติ =====
const services = [
    new Service("ตัดผมชาย", 120, 30),
    new Service("โกนหนวด", 80, 15),
    new Service("สระ+ตัด", 200, 60),
];
const barbers = [
    new Barber("B01", "ช่างเอ", "Fade เก่ง"),
    new Barber("B02", "ช่างบี", "วินเทจ"),
    new Barber("B03", "ช่างซี", "ทุกทรง"),
    new Barber("B00", "ไม่ระบุช่าง", "ตามคิวว่าง"),
];
const timeSlots = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];
const shop = new BarberShop();
// ===== DOM =====
const $ = (id) => document.getElementById(id);
const showCustomerTab = $("showCustomerTab");
const showAdminTab = $("showAdminTab");
const customerSection = $("customerSection");
const adminSection = $("adminSection");
const serviceSelect = $("serviceSelect");
const barberSelect = $("barberSelect");
const dateInput = $("dateInput");
const timeSelect = $("timeSelect");
const bookBtn = $("bookBtn");
const adminList = $("adminList");
const searchInput = $("searchInput");
const revenueText = $("revenueText");
// เติม dropdown
services.forEach((s, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = `${s.getName()} (${s.getPrice()}฿)`;
    serviceSelect.appendChild(o);
});
barbers.forEach((b, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = `${b.getName()} - ${b.getSpecialty()}`;
    barberSelect.appendChild(o);
});
// เติม dropdown เวลาแบบกรองแยกช่าง: เวลาที่ช่างนั้นโดนจองแล้วจะไม่ขึ้นมา
// แต่ถ้าสลับไปช่างอื่นที่ว่างเวลานั้นก็จะขึ้นปกติ
function getSelectedBarberName() {
    const b = barbers[Number(barberSelect.value)];
    return b ? b.getName() : "ไม่ระบุช่าง";
}
function refreshAvailableTimes(keepValue = true) {
    const prev = timeSelect.value;
    const barberName = getSelectedBarberName();
    const date = dateInput.value;
    timeSelect.innerHTML = "";
    const available = timeSlots.filter(t => shop.isSlotAvailable(barberName, date, t));
    if (available.length === 0) {
        const o = document.createElement("option");
        o.value = "";
        o.textContent = "เต็มทุกเวลา กรุณาเปลี่ยนวัน/ช่าง";
        timeSelect.appendChild(o);
        return;
    }
    available.forEach(t => {
        const o = document.createElement("option");
        o.value = t;
        o.textContent = t;
        timeSelect.appendChild(o);
    });
    if (keepValue && prev && available.includes(prev)) {
        timeSelect.value = prev;
    }
}
// ===== ตารางคิวว่าง (แถว=ช่าง, คอลัมน์=เวลา 30 นาที) =====
const slotGrid = $("slotGrid");
const slotGridDate = $("slotGridDate");
const gridBarbers = barbers.filter(b => b.getName() !== "ไม่ระบุช่าง");
function findBookingAt(barberName, date, time) {
    return shop.getAll().find(b => b.getBarber().getName() === barberName &&
        b.getDate() === date &&
        b.getTime() === time &&
        b.getStatus() !== "ยกเลิก");
}
function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderSlotGrid() {
    const date = dateInput.value;
    slotGridDate.textContent = date ? `วันที่ ${date} (เขียว=ว่างกดได้ / ชมพู=ไม่ว่าง)` : "";
    slotGrid.style.gridTemplateColumns = `150px repeat(${timeSlots.length}, minmax(64px, 1fr))`;
    let html = `<div class="slot-cell slot-head">ช่าง / เวลา</div>`;
    timeSlots.forEach(t => { html += `<div class="slot-cell slot-head">${t}</div>`; });
    gridBarbers.forEach((br, bi) => {
        html += `<div class="slot-cell slot-barber">${esc(br.getName())}<br><small style="font-weight:normal">${esc(br.getSpecialty())}</small></div>`;
        timeSlots.forEach(t => {
            const booked = findBookingAt(br.getName(), date, t);
            if (booked) {
                html += `<div class="slot-cell slot-booked">✓ ${esc(booked.getCustomer().getName())}<br><small>${esc(booked.getService().getName())}</small></div>`;
            }
            else {
                html += `<button class="slot-free" data-bi="${bi}" data-time="${t}" title="จอง ${esc(br.getName())} ${t}">ว่าง</button>`;
            }
        });
    });
    slotGrid.innerHTML = html;
}
slotGrid.addEventListener("click", (e) => {
    var _a;
    const btn = e.target.closest("button.slot-free");
    if (!btn)
        return;
    const bi = Number(btn.dataset.bi);
    const t = (_a = btn.dataset.time) !== null && _a !== void 0 ? _a : "";
    const idx = barbers.findIndex(b => b.getName() === gridBarbers[bi].getName());
    if (idx >= 0)
        barberSelect.value = String(idx);
    refreshAvailableTimes(false);
    if (t && (Array.from(timeSelect.options).some(o => o.value === t))) {
        timeSelect.value = t;
    }
    bookBtn.scrollIntoView({ behavior: "smooth", block: "center" });
});
barberSelect.addEventListener("change", () => { refreshAvailableTimes(false); renderSlotGrid(); });
dateInput.addEventListener("change", () => { refreshAvailableTimes(false); renderSlotGrid(); });
// วันที่ขั้นต่ำ = วันนี้
dateInput.min = new Date().toISOString().slice(0, 10);
dateInput.value = dateInput.min;
// ===== localStorage =====
const LS_KEY = "barber-bookings-v1";
function saveToStorage() {
    const data = shop.getAll().map(b => ({
        id: b.getId(),
        name: b.getCustomer().getName(),
        phone: b.getCustomer().getPhone(),
        service: services.findIndex(s => s.getName() === b.getService().getName()),
        barber: barbers.findIndex(x => x.getName() === b.getBarber().getName()),
        date: b.getDate(),
        time: b.getTime(),
        status: b.getStatus(),
    }));
    localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function loadFromStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw)
            return;
        const data = JSON.parse(raw);
        let maxId = 0;
        data.forEach(d => {
            var _a, _b;
            const c = new Customer(`C-${d.id}`, d.name, d.phone);
            const s = (_a = services[d.service]) !== null && _a !== void 0 ? _a : services[0];
            const br = (_b = barbers[d.barber]) !== null && _b !== void 0 ? _b : barbers[3];
            const b = new Booking(c, s, br, d.date, d.time);
            b.setStatus(d.status);
            // ยัด id เดิมกลับ (ใช้ private ผ่าน any อย่างปลอดภัยครั้งเดียวตอนโหลด)
            b.bookingId = d.id;
            shop.addBooking(b);
            if (d.id > maxId)
                maxId = d.id;
        });
        if (maxId > 0)
            Booking.setCounter(maxId + 1);
    }
    catch ( /* ไฟล์เสียก็เริ่มใหม่ */_a) { /* ไฟล์เสียก็เริ่มใหม่ */ }
}
// ===== Tabs + PIN Admin 6 หลัก =====
const ADMIN_PIN = "123456";
let adminUnlocked = false;
const pinGate = $("pinGate");
const adminContent = $("adminContent");
const pinInput = $("pinInput");
const pinError = $("pinError");
function lockAdmin() {
    adminUnlocked = false;
    pinInput.value = "";
    pinError.textContent = "";
    pinGate.style.display = "block";
    adminContent.style.display = "none";
}
function unlockAdmin() {
    if (pinInput.value.trim() === ADMIN_PIN) {
        adminUnlocked = true;
        pinError.textContent = "";
        pinGate.style.display = "none";
        adminContent.style.display = "block";
        renderAdmin();
    }
    else {
        pinError.textContent = "PIN ไม่ถูกต้อง กรุณาลองใหม่";
        pinInput.value = "";
        pinInput.focus();
    }
}
showCustomerTab.addEventListener("click", () => {
    customerSection.classList.add("active");
    adminSection.classList.remove("active");
    lockAdmin();
    refreshAvailableTimes();
    renderSlotGrid();
});
showAdminTab.addEventListener("click", () => {
    adminSection.classList.add("active");
    customerSection.classList.remove("active");
    if (adminUnlocked) {
        renderAdmin();
    }
    else {
        lockAdmin();
        setTimeout(() => pinInput.focus(), 0);
    }
});
$("unlockBtn").addEventListener("click", unlockAdmin);
pinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
        unlockAdmin();
});
$("lockBtn").addEventListener("click", lockAdmin);
// ===== จอง =====
bookBtn.addEventListener("click", () => {
    const name = $("customerName").value.trim();
    const phone = $("customerPhone").value.trim();
    if (!name) {
        alert("กรุณากรอกชื่อ");
        return;
    }
    if (!/^[0-9]{9,10}$/.test(phone)) {
        alert("เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก");
        return;
    }
    if (!dateInput.value) {
        alert("กรุณาเลือกวันที่");
        return;
    }
    if (dateInput.value < dateInput.min) {
        alert("ห้ามจองวันย้อนหลัง");
        return;
    }
    const service = services[Number(serviceSelect.value)];
    const barber = barbers[Number(barberSelect.value)];
    const date = dateInput.value;
    const time = timeSelect.value;
    if (!time) {
        alert("เวลานี้เต็มทุกช่อง กรุณาเปลี่ยนวันหรือช่าง");
        return;
    }
    if (!shop.isSlotAvailable(barber.getName(), date, time)) {
        alert(`คิวชน! ${barber.getName()} ไม่ว่าง ${date} เวลา ${time} กรุณาเปลี่ยนเวลาหรือช่าง`);
        return;
    }
    const customer = new Customer(`C-${Date.now()}`, name, phone);
    const booking = new Booking(customer, service, barber, date, time);
    shop.addBooking(booking);
    saveToStorage();
    refreshAvailableTimes(false);
    renderSlotGrid();
    alert(`จองสำเร็จ! ${booking.getDetails(true)}\nราคารวม ${booking.calculateTotalPrice()} บาท`);
});
// ===== หน้าจอ Admin (ใช้ event delegation แทน onclick) =====
function statusBadge(s) {
    const map = {
        "รอยืนยัน": "badge-pending",
        "กำลังตัด": "badge-cutting",
        "เสร็จแล้ว": "badge-done",
        "ยกเลิก": "badge-cancel",
    };
    return `<span class="badge ${map[s]}">${s}</span>`;
}
function renderAdmin() {
    const list = shop.search(searchInput.value);
    revenueText.textContent = `คิวทั้งหมด ${shop.getAll().length} | รายได้จากคิวที่เสร็จแล้ว ${shop.getRevenue()} บาท`;
    if (list.length === 0) {
        adminList.innerHTML = "<p>ยังไม่มีคิว (ลองจองฝั่งลูกค้าก่อน หรือล้างคำค้นหา)</p>";
        return;
    }
    adminList.innerHTML = list.map(b => `
        <div class="order-card">
            <p><b>${b.getDetails()}</b> ${statusBadge(b.getStatus())}</p>
            <button data-action="cutting" data-id="${b.getId()}">รับตัด</button>
            <button data-action="done" data-id="${b.getId()}" style="background-color:#4CAF50">เสร็จแล้ว</button>
            <button data-action="cancel" data-id="${b.getId()}" style="background-color:#f44336">ยกเลิก</button>
            <button data-action="delete" data-id="${b.getId()}" style="background-color:#757575">ลบ</button>
        </div>
    `).join("");
}
adminList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn)
        return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === "cutting")
        shop.updateStatus(id, "กำลังตัด");
    else if (action === "done")
        shop.updateStatus(id, "เสร็จแล้ว");
    else if (action === "cancel")
        shop.updateStatus(id, "ยกเลิก");
    else if (action === "delete")
        shop.removeBooking(id);
    saveToStorage();
    renderAdmin();
});
searchInput.addEventListener("input", renderAdmin);
$("clearFinishedBtn").addEventListener("click", () => {
    const n = shop.clearFinished();
    saveToStorage();
    renderAdmin();
    alert(`ล้างคิวที่เสร็จ/ยกเลิกแล้ว ${n} คิว`);
});
loadFromStorage();
refreshAvailableTimes(false);
renderSlotGrid();
