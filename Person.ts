// Abstraction: คลาสแม่แบบที่ไม่สามารถ new ตรงๆ ได้ บังคับให้คลาสลูก implement getRole()
export abstract class Person {
    // Encapsulation: ซ่อนข้อมูลด้วย private/protected
    private id: string;
    protected name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    // Abstraction: บังคับให้คลาสลูกต้อง implement ต่อ
    abstract getRole(): string;
}
