// Manager ดูแลคิวทั้งหมด: เพิ่ม / ลบ / ค้นหา / เช็คชน / สรุปรายได้
export class BarberShop {
    constructor() {
        // Encapsulation: ซ่อน array ไว้ภายใน
        this.bookings = [];
    }
    addBooking(b) {
        this.bookings.push(b);
    }
    cancelBooking(id) {
        const b = this.findById(id);
        if (!b)
            return false;
        b.setStatus("ยกเลิก");
        return true;
    }
    removeBooking(id) {
        const i = this.bookings.findIndex(b => b.getId() === id);
        if (i === -1)
            return false;
        this.bookings.splice(i, 1);
        return true;
    }
    updateStatus(id, status) {
        const b = this.findById(id);
        if (!b)
            return false;
        b.setStatus(status);
        return true;
    }
    findById(id) {
        return this.bookings.find(b => b.getId() === id);
    }
    // กันจองชน: ช่างเดียวกัน + วันเดียวกัน + เวลาเดียวกัน (ที่ไม่ถูกยกเลิก) = ชน
    isSlotAvailable(barberName, date, time) {
        if (barberName === "ไม่ระบุช่าง")
            return true;
        return !this.bookings.some(b => b.getBarber().getName() === barberName &&
            b.getDate() === date &&
            b.getTime() === time &&
            b.getStatus() !== "ยกเลิก");
    }
    search(keyword) {
        const kw = keyword.trim().toLowerCase();
        if (!kw)
            return this.getAll();
        return this.bookings.filter(b => b.getCustomer().getName().toLowerCase().includes(kw) ||
            b.getBarber().getName().toLowerCase().includes(kw) ||
            b.getService().getName().toLowerCase().includes(kw) ||
            b.getDate().includes(kw));
    }
    getAll() {
        return [...this.bookings];
    }
    clearFinished() {
        const before = this.bookings.length;
        this.bookings = this.bookings.filter(b => b.getStatus() !== "เสร็จแล้ว" && b.getStatus() !== "ยกเลิก");
        return before - this.bookings.length;
    }
    // รายได้ = ผลรวมราคาของคิวที่เสร็จแล้วเท่านั้น
    getRevenue() {
        return this.bookings
            .filter(b => b.getStatus() === "เสร็จแล้ว")
            .reduce((sum, b) => sum + b.calculateTotalPrice(), 0);
    }
}
