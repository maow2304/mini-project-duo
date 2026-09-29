import { Person } from './Person.js';
// Inheritance: Barber สืบทอดจาก Person
export class Barber extends Person {
    constructor(id, name, specialty) {
        super(id, name);
        this.specialty = specialty;
    }
    // Polymorphism (Override)
    getRole() {
        return `ช่าง (${this.specialty})`;
    }
    getSpecialty() {
        return this.specialty;
    }
}
