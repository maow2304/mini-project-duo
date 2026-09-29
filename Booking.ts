import { Customer } from './Customer.js';
import { Barber } from './Barber.js';
import { Service } from './Service.js';

export type BookingStatus = "รอยืนยัน" | "กำลังตัด" | "เสร็จแล้ว" | "ยกเลิก";

export class Booking {
    private bookingId: number;
    private customer: Customer;
    private service: Service;
    private barber: Barber;
    private date: string; // YYYY-MM-DD
    private time: string; // HH:MM
    private status: BookingStatus;
    private static counter: number = 1;

    constructor(customer: Customer, service: Service, barber: Barber, date: string, time: string) {
        this.bookingId = Booking.counter++;
        this.customer = customer;
        this.service = service;
        this.barber = barber;
        this.date = date;
        this.time = time;
        this.status = "รอยืนยัน";
    }

    public static setCounter(n: number): void {
        Booking.counter = n;
    }

    public calculateTotalPrice(): number {
        return this.service.getPrice();
    }

    public setStatus(status: BookingStatus): void {
        this.status = status;
    }

    // Polymorphism (Overload): เรียกแบบสั้น/ยาวได้
    public getDetails(): string;
    public getDetails(short: boolean): string;
    public getDetails(short: boolean = false): string {
        const base = `[คิว #${this.bookingId}] ${this.customer.getName()} (${this.customer.getPhone()}) | ${this.service.getName()} ${this.calculateTotalPrice()}฿ | ${this.barber.getName()} | ${this.date} ${this.time} | ${this.status}`;
        if (short) {
            return `#${this.bookingId} ${this.customer.getName()} - ${this.service.getName()} (${this.status})`;
        }
        return base;
    }

    // getters สำหรับค้นหา/บันทึก
    public getId(): number { return this.bookingId; }
    public getCustomer(): Customer { return this.customer; }
    public getBarber(): Barber { return this.barber; }
    public getService(): Service { return this.service; }
    public getDate(): string { return this.date; }
    public getTime(): string { return this.time; }
    public getStatus(): BookingStatus { return this.status; }
}
