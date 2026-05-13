'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Feather } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/* ─── Mini phone mockup screens ────────────────────────── */

function MockScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-50 h-90 rounded-[28px] border-[6px] border-gray-800 bg-white shadow-2xl overflow-hidden select-none">
      {/* notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-b-xl z-10" />
      <div className="h-full overflow-hidden pt-4 flex flex-col">{children}</div>
      {/* home bar */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full" />
    </div>
  );
}

function MockBar({ color = 'green', label }: { color?: string; label: string }) {
  return (
    <div
      className={`px-3 py-2 flex items-center gap-2 sticky top-0 z-10 text-white text-[9px] font-bold ${
        color === 'green' ? 'bg-green-600' : color === 'blue' ? 'bg-blue-600' : 'bg-gray-800'
      }`}
    >
      <Feather className="w-3 h-3" />
      {label}
    </div>
  );
}

function MockBtn({
  label,
  color = 'green',
  small,
}: {
  label: string;
  color?: 'green' | 'gray' | 'blue' | 'amber';
  small?: boolean;
}) {
  const cls = {
    green: 'bg-green-600 text-white',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-600 text-white',
    amber: 'bg-amber-500 text-white',
  }[color];
  return (
    <div
      className={`w-full rounded-xl py-1.5 text-center font-semibold ${small ? 'text-[8px]' : 'text-[9px]'} ${cls}`}
    >
      {label}
    </div>
  );
}

function MockCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">{children}</div>
  );
}

function MockTag({ label, color = 'green' }: { label: string; color?: 'green' | 'blue' | 'amber' | 'gray' }) {
  const cls = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-500',
  }[color];
  return (
    <span className={`text-[7px] font-semibold px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>
  );
}

/* ─── Screen 1: Bootstrap ─────────────────────────────── */
function Screen1() {
  return (
    <MockScreen>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-3 pb-4">
        <div className="text-3xl mb-1">🏸</div>
        <div className="text-[11px] font-bold text-gray-800 text-center">ยินดีต้อนรับสู่ตีก๊วน!</div>
        <div className="text-[8px] text-gray-400 text-center">บริหารก๊วนแบด คิดเงิน ออก QR</div>
        <div className="w-full mt-3 space-y-1.5">
          <MockBtn label="✨ สร้างบัญชีใหม่" color="green" />
          <MockBtn label="🔑 กู้คืนบัญชีเดิม" color="gray" />
        </div>
      </div>
    </MockScreen>
  );
}

/* ─── Screen 2: Bootstrap form ────────────────────────── */
function Screen2() {
  return (
    <MockScreen>
      <div className="flex-1 flex flex-col gap-2 px-3 pt-2 pb-4">
        <div className="text-[10px] font-bold text-gray-700 mt-2">ตั้งชื่อให้ตัวเอง (ไม่บังคับ)</div>
        <div className="border border-gray-200 rounded-lg px-2 py-1.5 text-[9px] text-gray-400">เช่น น้องอาร์ม</div>
        <MockBtn label="เริ่มใช้งาน →" color="green" />
        <div className="mt-1 bg-amber-50 border border-amber-200 rounded-lg p-2">
          <div className="text-[8px] font-bold text-amber-800 mb-1">⚠️ บันทึก Recovery Key ไว้ด้วย!</div>
          <div className="font-mono text-[8px] text-amber-700 tracking-widest text-center font-bold bg-white border border-amber-200 rounded px-1 py-1">
            XXXX-YYYY-ZZZZ
          </div>
          <div className="text-[7px] text-red-500 mt-1 text-center">แสดงครั้งเดียวเท่านั้น</div>
        </div>
        <MockBtn label="จดแล้ว เข้าใช้งานเลย →" color="green" small />
      </div>
    </MockScreen>
  );
}

/* ─── Screen 3: Settings ──────────────────────────────── */
function Screen3() {
  return (
    <MockScreen>
      <MockBar label="ตั้งค่า" color="green" />
      <div className="flex-1 px-3 py-2 space-y-2">
        <MockCard>
          <div className="text-[8px] font-bold text-gray-600 mb-1">ชื่อของคุณ</div>
          <div className="border border-gray-200 rounded px-2 py-1 text-[8px] text-gray-400">น้องอาร์ม</div>
        </MockCard>
        <MockCard>
          <div className="text-[8px] font-bold text-gray-700 mb-0.5">PromptPay สำหรับรับเงิน</div>
          <div className="text-[7px] text-gray-400 mb-1">ตั้งครั้งเดียว ใบเสร็จทุกใบจะมี QR อัตโนมัติ</div>
          <div className="flex gap-1 mb-1">
            <div className="flex-1 bg-green-100 border border-green-400 rounded px-1 py-0.5 text-[7px] text-green-700 text-center font-semibold">เบอร์โทร</div>
            <div className="flex-1 bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-[7px] text-gray-400 text-center">เลขบัตร</div>
          </div>
          <div className="border border-gray-200 rounded px-2 py-1 text-[8px] text-gray-400">08X-XXX-XXXX</div>
        </MockCard>
        <MockBtn label="💾 บันทึก" color="green" />
      </div>
    </MockScreen>
  );
}

/* ─── Screen 4: Squad list + New squad ───────────────── */
function Screen4() {
  return (
    <MockScreen>
      <MockBar label="สร้างก๊วนใหม่" color="green" />
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {/* Squad name */}
        <div>
          <div className="text-[7px] font-bold text-gray-600 mb-0.5">ชื่อก๊วน *</div>
          <div className="border border-gray-200 rounded-lg px-2 py-1.5 text-[7px] text-gray-400">เช่น ก๊วนวันศุกร์</div>
        </div>

        {/* Court split + billing mode */}
        <div className="flex gap-1.5">
          <div className="flex-1">
            <div className="text-[7px] text-gray-500 mb-0.5">กำหนดค่าสนาม</div>
            <div className="border border-gray-200 rounded-lg px-1.5 py-1 flex items-center justify-between">
              <span className="text-[7px] text-gray-700">หารเท่ากัน</span>
              <span className="text-[6px] text-gray-400">▾</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[7px] text-gray-500 mb-0.5">โหมดการคิดเงิน</div>
            <div className="border border-gray-200 rounded-lg px-1.5 py-1 flex items-center justify-between">
              <span className="text-[7px] text-gray-700">หารเท่ากัน</span>
              <span className="text-[6px] text-gray-400">▾</span>
            </div>
          </div>
        </div>

        {/* Shuttle pricing */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[7px] text-gray-500">ตั้งค่าการเงิน</div>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-[6px] font-semibold">
              <div className="bg-white text-gray-800 px-1.5 py-0.5">ราคา / ลูก</div>
              <div className="bg-gray-100 text-gray-400 px-1.5 py-0.5">ราคา / หลอด</div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg px-2 py-1.5 text-[7px] text-gray-400">ราคาต่อลูก (บาท)</div>
        </div>

        {/* Players */}
        <div>
          <div className="text-[7px] font-bold text-gray-600 mb-0.5">ผู้เล่น</div>
          <div className="flex gap-1 mb-0.5">
            <div className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-[7px] text-gray-400">ชื่อผู้เล่น</div>
            <div className="bg-green-500 text-white rounded-lg px-2 py-1 text-[7px] font-bold">เพิ่ม</div>
          </div>
          <div className="text-[6px] text-gray-400">เพิ่มทีหลังได้ในหน้าก๊วน</div>
        </div>
      </div>
    </MockScreen>
  );
}

/* ─── Screen 5: Active session ───────────────────────── */
function Screen5() {
  return (
    <MockScreen>
      <MockBar label="เซสชัน: วันนี้" color="green" />
      <div className="flex-1 px-2 py-1.5 space-y-1.5">
        <div className="flex gap-1">
          <MockTag label="🔴 Active" color="green" />
          <MockTag label="4 คน" color="blue" />
        </div>

        {/* Game card */}
        <MockCard>
          <div className="text-[8px] font-bold text-gray-700 mb-1">เกมที่ 3</div>
          <div className="flex gap-1">
            <div className="flex-1 bg-blue-50 rounded p-1">
              <div className="text-[7px] text-blue-600 font-semibold mb-0.5">ทีม A</div>
              <div className="text-[8px]">อาร์ม · บอม</div>
            </div>
            <div className="text-[9px] font-bold text-gray-300 self-center">VS</div>
            <div className="flex-1 bg-red-50 rounded p-1">
              <div className="text-[7px] text-red-500 font-semibold mb-0.5">ทีม B</div>
              <div className="text-[8px]">ออย · มิ้ง</div>
            </div>
          </div>
        </MockCard>

        {/* Shuffle button */}
        <div className="grid grid-cols-2 gap-1">
          <MockBtn label="🔀 สุ่มทีม" color="gray" small />
          <MockBtn label="+ เพิ่มเกม" color="green" small />
        </div>

        {/* Player list */}
        <div className="space-y-0.5">
          {[
            { name: 'อาร์ม', games: 3 },
            { name: 'บอม', games: 2 },
            { name: 'ออย', games: 3 },
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between bg-gray-50 rounded px-2 py-0.5">
              <span className="text-[8px] text-gray-700">{p.name}</span>
              <span className="text-[7px] text-gray-400">{p.games} เกม</span>
            </div>
          ))}
        </div>

        <MockBtn label="🔒 ปิด Session" color="amber" small />
      </div>
    </MockScreen>
  );
}

/* ─── Screen 6: Close session form ───────────────────── */
function Screen6() {
  return (
    <MockScreen>
      <MockBar label="ปิด Session" color="green" />
      <div className="flex-1 px-3 py-2 space-y-1.5">
        <div className="text-[8px] text-gray-500 font-medium">กรอกค่าใช้จ่ายรวม</div>
        {[
          { label: 'จำนวนลูกแบด', val: '8' },
          { label: 'ค่าคอร์ต (บาท)', val: '400' },
          { label: 'ค่าอื่นๆ (บาท)', val: '50' },
        ].map((f) => (
          <MockCard key={f.label}>
            <div className="text-[7px] text-gray-500">{f.label}</div>
            <div className="text-[9px] font-bold text-gray-800">{f.val}</div>
          </MockCard>
        ))}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
          <div className="text-[7px] text-blue-600 font-bold mb-0.5">สรุปค่าใช้จ่าย</div>
          <div className="text-[7px] text-gray-600">ลูก 8 ลูก × ฿25 = ฿200</div>
          <div className="text-[7px] text-gray-600">ค่าคอร์ต = ฿400</div>
          <div className="text-[8px] font-bold text-gray-800 mt-0.5">รวม ฿650 / 4 คน = ฿162.50</div>
        </div>

        <MockBtn label="✅ ปิดและออกใบเสร็จ" color="green" small />
      </div>
    </MockScreen>
  );
}

/* ─── Screen 7: Receipts ─────────────────────────────── */
function Screen7() {
  return (
    <MockScreen>
      <MockBar label="ใบเสร็จ" color="green" />
      <div className="flex-1 px-2 py-1.5 space-y-1.5">
        <div className="text-[8px] text-gray-500 font-medium px-1">ส่งลิงก์ หรือแชร์ QR ให้เพื่อน</div>
        {[
          { name: 'บอม', amt: '162', paid: false },
          { name: 'ออย', amt: '162', paid: true },
          { name: 'มิ้ง', amt: '162', paid: false },
        ].map((r) => (
          <MockCard key={r.name}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] font-bold text-gray-800">{r.name}</div>
                <div className="text-[8px] text-gray-500">฿{r.amt}</div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {/* QR placeholder */}
                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded grid grid-cols-4 gap-px p-0.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${[0,1,4,5,8,10,13,15].includes(i) ? 'bg-gray-700' : 'bg-gray-100'}`}
                    />
                  ))}
                </div>
                <MockTag label={r.paid ? '✓ จ่ายแล้ว' : 'รอชำระ'} color={r.paid ? 'green' : 'amber'} />
              </div>
            </div>
          </MockCard>
        ))}
        <MockBtn label="📤 แชร์ลิงก์ทั้งหมด" color="blue" small />
      </div>
    </MockScreen>
  );
}

/* ─── Screen 8: Reports ──────────────────────────────── */
function Screen8() {
  return (
    <MockScreen>
      <MockBar label="สรุปรายเดือน" color="blue" />
      <div className="flex-1 px-3 py-2 space-y-1.5">
        <div className="bg-blue-50 rounded-xl p-2.5 text-center">
          <div className="text-[8px] text-blue-500 font-semibold">พฤษภาคม 2026</div>
          <div className="text-[18px] font-bold text-blue-700 leading-none mt-0.5">฿3,250</div>
          <div className="text-[7px] text-blue-400 mt-0.5">8 เซสชัน</div>
        </div>
        <div className="space-y-1">
          {[
            { date: '12 พ.ค.', cost: '฿650', players: 4 },
            { date: '9 พ.ค.', cost: '฿520', players: 4 },
            { date: '5 พ.ค.', cost: '฿780', players: 6 },
          ].map((s) => (
            <div key={s.date} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-2 py-1">
              <div>
                <div className="text-[8px] font-semibold text-gray-700">{s.date}</div>
                <div className="text-[7px] text-gray-400">{s.players} คน</div>
              </div>
              <div className="text-[9px] font-bold text-gray-800">{s.cost}</div>
            </div>
          ))}
        </div>
      </div>
    </MockScreen>
  );
}

/* ─── Steps data ─────────────────────────────────────── */
const steps = [
  {
    num: 1,
    title: 'สร้างบัญชีก๊วน',
    desc: 'เปิดแอปครั้งแรก กด "สร้างบัญชีใหม่" แล้วตั้งชื่อให้ตัวเอง (ไม่บังคับ) แอปจะสร้าง Recovery Key ให้ — จดไว้ด้วย! ใช้กู้คืนบัญชีถ้าเปลี่ยนเครื่อง',
    tip: '🔑 Recovery Key แสดงครั้งเดียว ถ่ายรูปหรือคัดลอกเก็บไว้',
    tipColor: 'amber',
    screen: <Screen1 />,
    accentColor: 'green',
  },
  {
    num: 2,
    title: 'บันทึก Recovery Key',
    desc: 'หลังสร้างบัญชีสำเร็จ แอปจะแสดง Recovery Key คัดลอกและเก็บไว้ในที่ปลอดภัย เช่น Notes หรือส่งหาตัวเองใน Line ก่อนกด "จดแล้ว เข้าใช้งานเลย"',
    tip: '⚠️ ถ้าหาย key ไม่มีทางกู้คืนข้อมูลได้',
    tipColor: 'red',
    screen: <Screen2 />,
    accentColor: 'amber',
  },
  {
    num: 3,
    title: 'ตั้งค่า PromptPay',
    desc: 'ไปที่ ⚙️ ตั้งค่า แล้วกรอกเบอร์โทรหรือเลขบัตรประชาชน PromptPay ของคุณ ตั้งครั้งเดียว ทุกใบเสร็จจะสร้าง QR Code ตามยอดอัตโนมัติ',
    tip: '💡 ต้องตั้งค่า PromptPay ก่อนถึงสร้างก๊วนได้',
    tipColor: 'blue',
    screen: <Screen3 />,
    accentColor: 'blue',
  },
  {
    num: 4,
    title: 'สร้างก๊วนและเพิ่มผู้เล่น',
    desc: 'กด "ก๊วนของฉัน" → "สร้างก๊วนใหม่" ตั้งชื่อก๊วน เลือกวิธีคิดเงิน (หารเท่า/หารตามเกม) แล้วเพิ่มชื่อผู้เล่นประจำ กด "+" เพื่อเพิ่มทีละคน',
    tip: '🏸 เพิ่มผู้เล่นทีหลังได้ตลอดเวลา',
    tipColor: 'green',
    screen: <Screen4 />,
    accentColor: 'green',
  },
  {
    num: 5,
    title: 'บันทึกเกมระหว่างเล่น',
    desc: 'กด "สุ่มทีม" ให้แอปเลือกผู้เล่น 4 คนอัตโนมัติ (คำนึงถึงคนที่นั่งพัก) แล้วกด "เพิ่มเกม" บันทึกการเล่น ทำซ้ำทุกเกมตลอดวัน',
    tip: '🔀 ระบบสุ่มทีมจะลด pairing ซ้ำ ให้ทุกคนได้เล่นด้วยกันหลากหลาย',
    tipColor: 'green',
    screen: <Screen5 />,
    accentColor: 'green',
  },
  {
    num: 6,
    title: 'ปิด Session และคิดเงิน',
    desc: 'เล่นเสร็จแล้วกด "ปิด Session" กรอกจำนวนลูกแบดที่ใช้ ค่าคอร์ต และค่าใช้จ่ายอื่นๆ แอปจะคำนวณยอดของแต่ละคนให้อัตโนมัติ',
    tip: '💰 ระบบแยกคิดตามจำนวนเกมที่เล่นจริง ถ้าเลือกโหมดหารตามเกม',
    tipColor: 'blue',
    screen: <Screen6 />,
    accentColor: 'amber',
  },
  {
    num: 7,
    title: 'แชร์ใบเสร็จ QR ให้เพื่อน',
    desc: 'หลังปิด Session ใบเสร็จพร้อม QR PromptPay จะสร้างให้ทุกคน กด "แชร์ลิงก์" ส่งให้เพื่อนจ่ายตามยอด เมื่อได้รับเงินแล้วกด ✓ ทำเครื่องหมายจ่ายแล้ว',
    tip: '📲 เพื่อนแสกน QR จ่ายได้เลย ไม่ต้องคำนวณเอง',
    tipColor: 'green',
    screen: <Screen7 />,
    accentColor: 'green',
  },
  {
    num: 8,
    title: 'ดูสรุปรายเดือน',
    desc: 'กด "สรุปรายเดือน" เพื่อดูค่าใช้จ่ายรวมแต่ละเดือน จำนวนเซสชัน และค่าเฉลี่ยต่อครั้ง ช่วยวางแผนงบค่าแบดได้ง่ายขึ้น',
    tip: '📊 ดูย้อนหลังได้ไม่จำกัด',
    tipColor: 'blue',
    screen: <Screen8 />,
    accentColor: 'blue',
  },
];

const accentMap: Record<string, string> = {
  green: 'bg-green-600',
  blue: 'bg-blue-600',
  amber: 'bg-amber-500',
};

const accentTextMap: Record<string, string> = {
  green: 'text-green-600',
  blue: 'text-blue-600',
  amber: 'text-amber-600',
};

const accentBorderMap: Record<string, string> = {
  green: 'border-green-500',
  blue: 'border-blue-500',
  amber: 'border-amber-500',
};

const tipMap: Record<string, string> = {
  green: 'bg-green-50 border-green-200 text-green-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  red: 'bg-red-50 border-red-200 text-red-800',
};

/* ─── Main page ──────────────────────────────────────── */
export default function HowToUsePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeStep]);

  const prev = () => setActiveStep((s) => Math.max(0, s - 1));
  const next = () => setActiveStep((s) => Math.min(steps.length - 1, s + 1));

  return (
    <div className="max-w-lg mx-auto min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Feather className="w-5 h-5 text-green-600" />
          <h1 className="font-bold text-gray-800 text-lg">วิธีใช้งาน</h1>
        </div>
        <div className="ml-auto text-sm text-gray-400 font-medium">
          {activeStep + 1}/{steps.length}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center py-3 bg-white border-b border-gray-100">
        {steps.map((s, i) => (
          <button
            key={s.num}
            onClick={() => setActiveStep(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeStep
                ? `w-6 ${accentMap[step.accentColor]}`
                : i < activeStep
                ? 'w-2 bg-gray-400'
                : 'w-2 bg-gray-200'
            }`}
            aria-label={`ขั้นตอนที่ ${s.num}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 pt-6 pb-28">
        {/* Step number + title */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-2xl ${accentMap[step.accentColor]} text-white flex items-center justify-center text-base font-black shadow-md shrink-0`}
          >
            {step.num}
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">ขั้นตอนที่ {step.num}</div>
            <h2 className={`text-xl font-bold ${accentTextMap[step.accentColor]}`}>{step.title}</h2>
          </div>
        </div>

        {/* Phone mockup */}
        <div
          className={`flex justify-center mb-6 border-4 ${accentBorderMap[step.accentColor]} rounded-4xl p-1 bg-white shadow-xl mx-auto w-fit`}
        >
          {step.screen}
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{step.desc}</p>

        {/* Tip */}
        <div className={`border rounded-xl px-4 py-3 text-sm font-medium ${tipMap[step.tipColor]}`}>
          {step.tip}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 z-20">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={prev}
            disabled={activeStep === 0}
            className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Step thumbnails */}
          <div ref={thumbScrollRef} className="flex-1 flex gap-1 overflow-x-auto scrollbar-hide">
            {steps.map((s, i) => (
              <button
                key={s.num}
                ref={i === activeStep ? activeThumbRef : null}
                onClick={() => setActiveStep(i)}
                className={`shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition ${
                  i === activeStep
                    ? `${accentMap[step.accentColor]} text-white`
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <span className="text-[9px] font-bold">{s.num}</span>
                <span className="text-[8px] font-medium leading-tight text-center max-w-13 truncate">
                  {s.title}
                </span>
              </button>
            ))}
          </div>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={next}
              className={`w-12 h-12 rounded-2xl ${accentMap[step.accentColor]} flex items-center justify-center text-white shadow-md hover:opacity-90 transition active:scale-95`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/')}
              className="h-12 px-4 rounded-2xl bg-green-600 text-white text-xs font-bold shadow-md hover:opacity-90 transition active:scale-95 whitespace-nowrap"
            >
              เริ่มใช้งาน!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
