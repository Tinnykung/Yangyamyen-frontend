import { ClipboardList, ChefHat, Utensils, CheckCircle } from 'lucide-react';

// กำหนดประเภทของสถานะที่มีในระบบ
type OrderStatus = 'pending' | 'cooking' | 'served' | 'paid';

interface OrderStatusTrackerProps {
  status: string; // รับค่าสถานะมาจากฐานข้อมูล
}

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  // ข้อมูลแต่ละสเต็ปของการสั่งอาหาร
  const steps = [
    { id: 'pending', label: 'รับออเดอร์', icon: ClipboardList },
    { id: 'cooking', label: 'กำลังเตรียม', icon: ChefHat },
    { id: 'served', label: 'เสิร์ฟแล้ว', icon: Utensils },
    { id: 'paid', label: 'ชำระเงิน', icon: CheckCircle },
  ];

  // คำนวณว่าตอนนี้อยู่สเต็ปที่เท่าไหร่
  const currentStepIndex = steps.findIndex(s => s.id === status);
  // ถ้าหาสถานะไม่เจอ (เป็น -1) ให้มองว่าเป็นสเต็ปแรกไปก่อน
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
      <div className="flex items-center justify-between relative">
        
        {/* เส้นพื้นหลังสีเทา (ยังไม่ถึง) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-neutral-200 rounded-full z-0"></div>
        
        {/* เส้นสีส้ม (ทำถึงสเต็ปนี้แล้ว) */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-amber-500 rounded-full z-0 transition-all duration-700 ease-in-out"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* วงกลมไอคอนแต่ละสถานะ */}
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              {/* วงกลมไอคอน */}
              <div 
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm
                  ${isCompleted 
                    ? 'bg-amber-500 border-white text-white scale-110 shadow-amber-500/30' 
                    : 'bg-neutral-100 border-white text-neutral-400'
                  }
                  ${isCurrent && 'animate-pulse border-amber-200'}
                `}
              >
                <Icon size={isCompleted ? 24 : 20} className={isCurrent ? 'animate-bounce' : ''} />
              </div>
              
              {/* ข้อความบอกสถานะ */}
              <span 
                className={`mt-3 text-xs md:text-sm font-bold absolute top-14 w-24 text-center transition-colors duration-300
                  ${isCompleted ? 'text-amber-600' : 'text-neutral-400'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* เว้นพื้นที่ด้านล่างเผื่อข้อความ */}
      <div className="h-10"></div> 
    </div>
  );
}