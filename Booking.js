export class Booking {
    constructor(customer, service, barber, date, time) {
        this.bookingId = Booking.counter++;
        this.customer = customer;
        this.service = service;
        this.barber = barber;
        this.date = date;
        this.time = time;
        this.status = "รอยืนยัน";
    }
    static setCounter(n) {
        Booking.counter = n;
    }
    calculateTotalPrice() {
        return this.service.getPrice();
    }
    setStatus(status) {
        this.status = status;
    }
    getDetails(short = false) {
        const base = `[คิว #${this.bookingId}] ${this.customer.getName()} (${this.customer.getPhone()}) | ${this.service.getName()} ${this.calculateTotalPrice()}฿/${this.service.getDuration()}นาที | ${this.barber.getName()} | ${this.date} ${this.time} | ${this.status}`;
        if (short) {
            return `#${this.bookingId} ${this.customer.getName()} - ${this.service.getName()} (${this.status})`;
        }
        return base;
    }
    // getters สำหรับค้นหา/บันทึก
    getId() { return this.bookingId; }
    getCustomer() { return this.customer; }
    getBarber() { return this.barber; }
    getService() { return this.service; }
    getDate() { return this.date; }
    getTime() { return this.time; }
    getStatus() { return this.status; }
}
Booking.counter = 1;
