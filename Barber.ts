import { Person } from './Person.js';

// Inheritance: Barber สืบทอดจาก Person
export class Barber extends Person {
    // Encapsulation
    private specialty: string;

    constructor(id: string, name: string, specialty: string) {
        super(id, name);
        this.specialty = specialty;
    }

    // Polymorphism (Override)
    public override getRole(): string {
        return `ช่าง (${this.specialty})`;
    }

    public getSpecialty(): string {
        return this.specialty;
    }
}
