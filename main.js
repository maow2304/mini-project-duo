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
const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
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
    o.textContent = `${s.getName()} (${s.getPrice()}฿ / ${s.getDuration()}นาที)`;
    serviceSelect.appendChild(o);
});
barbers.forEach((b, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = `${b.getName()} - ${b.getSpecialty()}`;
    barberSelect.appendChild(o);
});
timeSlots.forEach(t => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = t;
    timeSelect.appendChild(o);
});
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
// ===== Tabs =====
showCustomerTab.addEventListener("click", () => {
    customerSection.classList.add("active");
    adminSection.classList.remove("active");
});
showAdminTab.addEventListener("click", () => {
    adminSection.classList.add("active");
    customerSection.classList.remove("active");
    renderAdmin();
});
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
    if (!shop.isSlotAvailable(barber.getName(), date, time)) {
        alert(`คิวชน! ${barber.getName()} ไม่ว่าง ${date} เวลา ${time} กรุณาเปลี่ยนเวลาหรือช่าง`);
        return;
    }
    const customer = new Customer(`C-${Date.now()}`, name, phone);
    const booking = new Booking(customer, service, barber, date, time);
    shop.addBooking(booking);
    saveToStorage();
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
