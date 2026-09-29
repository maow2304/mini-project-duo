// Abstraction: คลาสแม่แบบที่ไม่สามารถ new ตรงๆ ได้ บังคับให้คลาสลูก implement getRole()
export class Person {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
}
