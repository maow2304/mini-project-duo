import { Booking, BookingStatus } from './Booking.js';

// Manager ดูแลคิวทั้งหมด: เพิ่ม / ลบ / ค้นหา / เช็คชน / สรุปรายได้
export class BarberShop {
    // Encapsulation: ซ่อน array ไว้ภายใน
    private bookings: Booking[] = [];

    public addBooking(b: Booking): void {
        this.bookings.push(b);
    }

    public cancelBooking(id: number): boolean {
        const b = this.findById(id);
        if (!b) return false;
        b.setStatus("ยกเลิก");
        return true;
    }

    public removeBooking(id: number): boolean {
        const i = this.bookings.findIndex(b => b.getId() === id);
        if (i === -1) return false;
        this.bookings.splice(i, 1);
        return true;
    }

    public updateStatus(id: number, status: BookingStatus): boolean {
        const b = this.findById(id);
        if (!b) return false;
        b.setStatus(status);
        return true;
    }

    public findById(id: number): Booking | undefined {
        return this.bookings.find(b => b.getId() === id);
    }

    // กันจองชน: ช่างเดียวกัน + วันเดียวกัน + เวลาเดียวกัน (ที่ไม่ถูกยกเลิก) = ชน
    public isSlotAvailable(barberName: string, date: string, time: string): boolean {
        if (barberName === "ไม่ระบุช่าง") return true;
        return !this.bookings.some(b =>
            b.getBarber().getName() === barberName &&
            b.getDate() === date &&
            b.getTime() === time &&
            b.getStatus() !== "ยกเลิก"
        );
    }

    public search(keyword: string): Booking[] {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return this.getAll();
        return this.bookings.filter(b =>
            b.getCustomer().getName().toLowerCase().includes(kw) ||
            b.getBarber().getName().toLowerCase().includes(kw) ||
            b.getService().getName().toLowerCase().includes(kw) ||
            b.getDate().includes(kw)
        );
    }

    public getAll(): Booking[] {
        return [...this.bookings];
    }

    public clearFinished(): number {
        const before = this.bookings.length;
        this.bookings = this.bookings.filter(b => b.getStatus() !== "เสร็จแล้ว" && b.getStatus() !== "ยกเลิก");
        return before - this.bookings.length;
    }

    // รายได้ = ผลรวมราคาของคิวที่เสร็จแล้วเท่านั้น
    public getRevenue(): number {
        return this.bookings
            .filter(b => b.getStatus() === "เสร็จแล้ว")
            .reduce((sum, b) => sum + b.calculateTotalPrice(), 0);
    }
}
