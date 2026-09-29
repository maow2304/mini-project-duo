import { Person } from './Person.js';
// Inheritance: Customer สืบทอดจาก Person
export class Customer extends Person {
    constructor(id, name, phone) {
        super(id, name);
        this.loyaltyPoints = 0;
        this.phone = phone;
    }
    // Polymorphism (Override): เขียนทับ getRole ของ Person
    getRole() {
        return "ลูกค้า";
    }
    getPhone() {
        return this.phone;
    }
    addPoints(points) {
        this.loyaltyPoints += points;
    }
    getPoints() {
        return this.loyaltyPoints;
    }
}
