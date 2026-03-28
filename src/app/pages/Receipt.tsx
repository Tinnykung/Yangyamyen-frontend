import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';

// Interfaces
interface OrderItem {
  id?: string | number;
  name: string;
  price: number;
  quantity: number;
  isCancelled?: boolean;
}

interface ReceiptData {
  receiptId: string;
  tableNumber: string;
  paidAt: string;
  items: { name: string; price: number; quantity: number }[];
  totalAmount: number;
}

export function Receipt() {
  const { receiptId } = useParams(); // รับ receipt_id จาก URL เช่น /receipt/REC-123456789
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (receiptId) {
      fetchReceiptData();
    }
  }, [receiptId]);

  const fetchReceiptData = async () => {
    try {
      // 1. ดึงออเดอร์ทั้งหมดที่มี receipt_id ตรงกัน
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('receipt_id', receiptId)
        .neq('status', 'cancelled'); // ข้ามบิลผี

      if (error) throw error;

      if (!data || data.length === 0) {
        setReceiptData(null);
        return;
      }

      // 2. รวบรวมเมนูและคิดเงินใหม่ (กรอง isCancelled ออก)
      let calculatedTotal = 0;
      const itemsMap: Record<string, { name: string; price: number; quantity: number }> = {};
      
      data.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: OrderItem) => {
            if (!item.isCancelled) {
              calculatedTotal += (item.price || 0) * (item.quantity || 1);
              
              // รวมจำนวนเมนูชื่อเดียวกันเข้าด้วยกัน
              if (itemsMap[item.name]) {
                itemsMap[item.name].quantity += item.quantity;
              } else {
                itemsMap[item.name] = { 
                  name: item.name, 
                  price: item.price, 
                  quantity: item.quantity 
                };
              }
            }
          });
        }
      });

      // 3. จัดเตรียมข้อมูลสำหรับแสดงผล
      setReceiptData({
        receiptId: receiptId || '',
        tableNumber: data[0].table_number,
        paidAt: data[data.length - 1].updated_at || data[0].created_at, // ใช้ออเดอร์ล่าสุดเป็นเวลาจ่ายเงิน
        items: Object.values(itemsMap),
        totalAmount: calculatedTotal
      });

    } catch (error: any) {
      console.error('Error fetching receipt:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-semibold">กำลังโหลดใบเสร็จ... ⏳</div>;

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">ไม่พบข้อมูลใบเสร็จ</h2>
          <p className="text-neutral-500 mb-6">รหัสอ้างอิง: {receiptId}</p>
          <button 
            onClick={() => navigate('/cashier')}
            className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-semibold"
          >
            กลับหน้าแคชเชียร์
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4 py-10">
      
      {/* 🧾 ส่วนสลิปใบเสร็จ (กระดาษใบเสร็จ) */}
      <div id="receipt-paper" className="bg-white max-w-sm w-full rounded-sm shadow-xl p-8 border-t-8 border-neutral-800 relative">
        {/* รอยหยักด้านบนใบเสร็จ (ตกแต่ง) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=')] -mt-2"></div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">ใบเสร็จรับเงิน</h1>
          <p className="text-sm text-neutral-500">ร้านอาหารของคุณ (Your Restaurant)</p>
        </div>

        <div className="text-sm text-neutral-600 mb-6 space-y-1">
          <div className="flex justify-between">
            <span>เลขที่ใบเสร็จ:</span>
            <span className="font-mono">{receiptData.receiptId}</span>
          </div>
          <div className="flex justify-between">
            <span>โต๊ะ:</span>
            <span className="font-bold text-neutral-900">{receiptData.tableNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>วันที่:</span>
            <span>{new Date(receiptData.paidAt).toLocaleString('th-TH')}</span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-neutral-300 my-4"></div>

        {/* รายการอาหาร */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold text-neutral-500 mb-2">
            <span>รายการ</span>
            <span>ราคา</span>
          </div>
          <ul className="space-y-3">
            {receiptData.items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm text-neutral-800">
                <div className="flex-1">
                  <span>{item.name}</span>
                  <div className="text-xs text-neutral-500">
                    {item.price.toLocaleString()} x {item.quantity}
                  </div>
                </div>
                <span className="font-medium mt-1">
                  {(item.price * item.quantity).toLocaleString()} ฿
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t-2 border-dashed border-neutral-300 my-4"></div>

        {/* ยอดรวม */}
        <div className="flex justify-between items-end mb-8">
          <span className="text-lg font-bold text-neutral-800">ยอดสุทธิ</span>
          <span className="text-2xl font-bold text-green-600">
            {receiptData.totalAmount.toLocaleString()} บาท
          </span>
        </div>

        <div className="text-center text-sm text-neutral-500 mt-8">
          <p>ขอบคุณที่ใช้บริการ</p>
          <p>Please come again!</p>
        </div>

        {/* รอยหยักด้านล่างใบเสร็จ (ตกแต่ง) */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=')] -mb-2 rotate-180"></div>
      </div>

      {/* ปุ่มกดสั่งงาน (จะไม่ถูกพิมพ์ลงกระดาษถ้าใช้คำสั่ง Print) */}
      <div className="mt-8 flex gap-4 w-full max-w-sm print:hidden">
        <button 
          onClick={() => window.print()} 
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
         พิมพ์ใบเสร็จ
        </button>
        <button 
          onClick={() => navigate('/cashier')} 
          className="flex-1 bg-neutral-200 text-neutral-700 py-3 rounded-xl font-bold hover:bg-neutral-300 transition-colors shadow-sm"
        >
          กลับแคชเชียร์
        </button>
      </div>

      {/* สไตล์สำหรับซ่อนปุ่มตอนกด Print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-paper, #receipt-paper * {
            visibility: visible;
          }
          #receipt-paper {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>

    </div>
  );
}