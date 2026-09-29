import { Customer } from './Customer.js';
import { Barber } from './Barber.js';
import { Service } from './Service.js';
import { Booking, BookingStatus } from './Booking.js';
import { BarberShop } from './BarberShop.js';

// ===== ข้อมูลตั้งต้นตามสเปคที่อนุมัติ =====
const services: Service[] = [
    new Service("ตัดผมชาย", 120, 30),
    new Service("โกนหนวด", 80, 15),
    new Service("สระ+ตัด", 200, 60),
];

const barbers: Barber[] = [
    new Barber("B01", "ช่างเอ", "Fade เก่ง"),
    new Barber("B02", "ช่างบี", "วินเทจ"),
    new Barber("B03", "ช่างซี", "ทุกทรง"),
    new Barber("B00", "ไม่ระบุช่าง", "ตามคิวว่าง"),
];

const timeSlots = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];

const shop = new BarberShop();

// ===== DOM =====
const $ = (id: string) => document.getElementById(id) as HTMLElement;
const showCustomerTab = $("showCustomerTab") as HTMLButtonElement;
const showAdminTab = $("showAdminTab") as HTMLButtonElement;
const customerSection = $("customerSection") as HTMLDivElement;
const adminSection = $("adminSection") as HTMLDivElement;
const serviceSelect = $("serviceSelect") as HTMLSelectElement;
const barberSelect = $("barberSelect") as HTMLSelectElement;
const dateInput = $("dateInput") as HTMLInputElement;
const timeSelect = $("timeSelect") as HTMLSelectElement;
const bookBtn = $("bookBtn") as HTMLButtonElement;
const adminList = $("adminList") as HTMLDivElement;
const searchInput = $("searchInput") as HTMLInputElement;
const revenueText = $("revenueText") as HTMLParagraphElement;
const themeToggle = $("themeToggle") as HTMLButtonElement;

// ===== โหมดมืด / โหมดสว่าง =====
type Theme = "dark" | "light";
const THEME_KEY = "barber-theme";

function applyTheme(theme: Theme): void {
    const isLight = theme === "light";
    document.documentElement.classList.toggle("light", isLight);
    document.documentElement.classList.toggle("dark", !isLight);
    document.body.classList.toggle("light", isLight);
    themeToggle.textContent = isLight ? "☀️ โหมดสว่าง" : "🌙 โหมดมืด";
    themeToggle.setAttribute("aria-pressed", String(isLight));
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch { /* private mode ก็ข้ามไป */ }
}

function initTheme(): void {
    let saved: string | null = null;
    try {
        saved = localStorage.getItem(THEME_KEY);
    } catch { /* อ่านไม่ได้ก็ใช้ค่า default */ }
    if (saved === "light" || saved === "dark") {
        applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        applyTheme("light");
    } else {
        applyTheme("dark");
    }
}

themeToggle.addEventListener("click", () => {
    const isLightNow = document.documentElement.classList.contains("light");
    applyTheme(isLightNow ? "dark" : "light");
});

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
function getSelectedBarberName(): string {
    const b = barbers[Number(barberSelect.value)];
    return b ? b.getName() : "ไม่ระบุช่าง";
}
function refreshAvailableTimes(keepValue: boolean = true): void {
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
const slotGrid = $("slotGrid") as HTMLDivElement;
const slotGridDate = $("slotGridDate") as HTMLParagraphElement;
const gridBarbers = barbers.filter(b => b.getName() !== "ไม่ระบุช่าง");

function findBookingAt(barberName: string, date: string, time: string) {
    return shop.getAll().find(b =>
        b.getBarber().getName() === barberName &&
        b.getDate() === date &&
        b.getTime() === time &&
        b.getStatus() !== "ยกเลิก"
    );
}
function esc(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderSlotGrid(): void {
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
            } else {
                html += `<button class="slot-free" data-bi="${bi}" data-time="${t}" title="จอง ${esc(br.getName())} ${t}">ว่าง</button>`;
            }
        });
    });
    slotGrid.innerHTML = html;
}
slotGrid.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button.slot-free") as HTMLButtonElement | null;
    if (!btn) return;
    const bi = Number(btn.dataset.bi);
    const t = btn.dataset.time ?? "";
    const idx = barbers.findIndex(b => b.getName() === gridBarbers[bi].getName());
    if (idx >= 0) barberSelect.value = String(idx);
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
interface PlainBooking { id: number; name: string; phone: string; service: number; barber: number; date: string; time: string; status: BookingStatus; }
function saveToStorage(): void {
    const data: PlainBooking[] = shop.getAll().map(b => ({
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
function loadFromStorage(): void {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;
        const data = JSON.parse(raw) as PlainBooking[];
        let maxId = 0;
        data.forEach(d => {
            const c = new Customer(`C-${d.id}`, d.name, d.phone);
            const s = services[d.service] ?? services[0];
            const br = barbers[d.barber] ?? barbers[3];
            const b = new Booking(c, s, br, d.date, d.time);
            b.setStatus(d.status);
            // ยัด id เดิมกลับ (ใช้ private ผ่าน any อย่างปลอดภัยครั้งเดียวตอนโหลด)
            (b as unknown as { bookingId: number }).bookingId = d.id;
            shop.addBooking(b);
            if (d.id > maxId) maxId = d.id;
        });
        if (maxId > 0) Booking.setCounter(maxId + 1);
    } catch { /* ไฟล์เสียก็เริ่มใหม่ */ }
}

// ===== Tabs + PIN Admin 6 หลัก =====
const ADMIN_PIN = "123456";
let adminUnlocked = false;
const pinGate = $("pinGate") as HTMLDivElement;
const adminContent = $("adminContent") as HTMLDivElement;
const pinInput = $("pinInput") as HTMLInputElement;
const pinError = $("pinError") as HTMLParagraphElement;

function lockAdmin(): void {
    adminUnlocked = false;
    pinInput.value = "";
    pinError.textContent = "";
    pinGate.style.display = "block";
    adminContent.style.display = "none";
}
function unlockAdmin(): void {
    if (pinInput.value.trim() === ADMIN_PIN) {
        adminUnlocked = true;
        pinError.textContent = "";
        pinGate.style.display = "none";
        adminContent.style.display = "block";
        renderAdmin();
    } else {
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
    } else {
        lockAdmin();
        setTimeout(() => pinInput.focus(), 0);
    }
});
($("unlockBtn") as HTMLButtonElement).addEventListener("click", unlockAdmin);
pinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlockAdmin();
});
($("lockBtn") as HTMLButtonElement).addEventListener("click", lockAdmin);

// ===== จอง =====
bookBtn.addEventListener("click", () => {
    const name = ($("customerName") as HTMLInputElement).value.trim();
    const phone = ($("customerPhone") as HTMLInputElement).value.trim();
    if (!name) { alert("กรุณากรอกชื่อ"); return; }
    if (!/^[0-9]{9,10}$/.test(phone)) { alert("เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก"); return; }
    if (!dateInput.value) { alert("กรุณาเลือกวันที่"); return; }
    if (dateInput.value < dateInput.min) { alert("ห้ามจองวันย้อนหลัง"); return; }

    const service = services[Number(serviceSelect.value)];
    const barber = barbers[Number(barberSelect.value)];
    const date = dateInput.value;
    const time = timeSelect.value;
    if (!time) { alert("เวลานี้เต็มทุกช่อง กรุณาเปลี่ยนวันหรือช่าง"); return; }

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
function statusBadge(s: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
        "รอยืนยัน": "badge-pending",
        "กำลังตัด": "badge-cutting",
        "เสร็จแล้ว": "badge-done",
        "ยกเลิก": "badge-cancel",
    };
    return `<span class="badge ${map[s]}">${s}</span>`;
}

function renderAdmin(): void {
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
    const btn = (e.target as HTMLElement).closest("button[data-action]") as HTMLButtonElement | null;
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === "cutting") shop.updateStatus(id, "กำลังตัด");
    else if (action === "done") shop.updateStatus(id, "เสร็จแล้ว");
    else if (action === "cancel") shop.updateStatus(id, "ยกเลิก");
    else if (action === "delete") shop.removeBooking(id);
    saveToStorage();
    renderAdmin();
});

searchInput.addEventListener("input", renderAdmin);
($("clearFinishedBtn") as HTMLButtonElement).addEventListener("click", () => {
    const n = shop.clearFinished();
    saveToStorage();
    renderAdmin();
    alert(`ล้างคิวที่เสร็จ/ยกเลิกแล้ว ${n} คิว`);
});

loadFromStorage();
initTheme();
refreshAvailableTimes(false);
renderSlotGrid();
