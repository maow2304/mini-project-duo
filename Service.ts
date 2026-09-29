// Encapsulation: เก็บชื่อ ราคา ระยะเวลา ไว้ภายใน อ่านผ่าน getter เท่านั้น
export class Service {
    private name: string;
    private price: number;
    private durationMin: number;

    constructor(name: string, price: number, durationMin: number) {
        this.name = name;
        this.price = price;
        this.durationMin = durationMin;
    }

    public getName(): string {
        return this.name;
    }

    public getPrice(): number {
        return this.price;
    }

    public getDuration(): number {
        return this.durationMin;
    }
}
