# 💈 ระบบจองคิวร้านตัดผม (Barber Booking) — OOP Mini Project

HTML + CSS + TypeScript | 6 คลาส | GUI ใช้งานได้จริง

## วิธีรัน (แก้บั๊กกดไม่ได้)
```bash
npm install
npm run build   # tsc -> สร้าง .js คู่ .ts
npx serve .     # ห้ามดับเบิลคลิก file:// เพราะ type="module" โดน CORS
# เปิด http://localhost:3000
```

## Features
- ลูกค้า: กรอกชื่อ+เบอร์ → เลือกบริการ (ตัด 120฿/โกนหนวด 80฿/สระ+ตัด 200฿) → เลือกช่าง (ช่างเอ/บี/ซี) → วัน/เวลา → จอง + กันคิวชน
- Admin: ดูคิว, ค้นหา (ชื่อ/ช่าง/บริการ/วันที่), เปลี่ยนสถานะ รอยืนยัน→กำลังตัด→เสร็จแล้ว/ยกเลิก, ลบ, ล้างคิวจบแล้ว, สรุปรายได้
- เก็บ localStorage รีเฟรชไม่หาย

## โครงสร้างคลาส (6 คลาส)
| คลาส | Attribute | Method | หน้าที่ |
|---|---|---|---|
| Person (abstract) | id:private, name:protected | getId(), getName(), abstract getRole() | แม่แบบ |
| Customer extends Person | phone:private, loyaltyPoints:private | getRole() override, getPhone(), addPoints() | ลูกค้า |
| Barber extends Person | specialty:private | getRole() override, getSpecialty() | ช่าง |
| Service | name, price, durationMin:private | getName/Price/Duration() | บริการ |
| Booking | bookingId, customer, service, barber, date, time, status:private | calculateTotalPrice(), getDetails() overload, setStatus() | ใบจอง |
| BarberShop | bookings:private | add/cancel/remove/updateStatus/search/isSlotAvailable/getRevenue/clearFinished() | จัดการคิว |

## ตาราง OOP สำหรับสไลด์
| หลักการ | อยู่ที่ไหน |
|---|---|
| Encapsulation | `Person.ts:4-5` private/protected, `Service.ts:3-5`, `Booking.ts:8-14`, `BarberShop.ts:5` + getter ทุกคลาส |
| Inheritance | `Customer.ts:4 extends Person`, `Barber.ts:4 extends Person` |
| Polymorphism (Override) | `Customer.ts:14 getRole()`, `Barber.ts:13 getRole()` เขียนทับ `Person.ts:16` |
| Polymorphism (Overload) | `Booking.ts:30-32 getDetails()` / `getDetails(short:boolean)` |
| Abstraction | `Person.ts:3 abstract class` + `Person.ts:16 abstract getRole()` (อาจารย์ไม่ประเมิน แต่มีโชว์) |
