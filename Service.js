// Encapsulation: เก็บชื่อ ราคา ระยะเวลา ไว้ภายใน อ่านผ่าน getter เท่านั้น
export class Service {
    constructor(name, price, durationMin) {
        this.name = name;
        this.price = price;
        this.durationMin = durationMin;
    }
    getName() {
        return this.name;
    }
    getPrice() {
        return this.price;
    }
    getDuration() {
        return this.durationMin;
    }
}
