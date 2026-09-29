import { Person } from './Person.js';

// Inheritance: Customer สืบทอดจาก Person
export class Customer extends Person {
    // Encapsulation: ซ่อนเบอร์โทร + แต้ม
    private phone: string;
    private loyaltyPoints: number = 0;

    constructor(id: string, name: string, phone: string) {
        super(id, name);
        this.phone = phone;
    }

    // Polymorphism (Override): เขียนทับ getRole ของ Person
    public override getRole(): string {
        return "ลูกค้า";
    }

    public getPhone(): string {
        return this.phone;
    }

    public addPoints(points: number): void {
        this.loyaltyPoints += points;
    }

    public getPoints(): number {
        return this.loyaltyPoints;
    }
}
