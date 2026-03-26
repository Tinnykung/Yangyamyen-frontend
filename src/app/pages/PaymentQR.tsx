import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import generatePayload from 'promptpay-qr';
import QRCode from 'react-qr-code';

// 🟢 ใส่เบอร์พร้อมเพย์ (เบอร์มือถือ หรือ เลขบัตรประชาชน) ของร้านตรงนี้!
const PROMPTPAY_ID = "0923516354"; 

export function PaymentQR() {
  const { tableNumber } = useParams(); // รับเลขโต๊ะจาก URL
  const navigate = useNavigate();
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔊 ฟังก์ชันเล่นเสียงแจ้งเตือน
  const playSound = () => {
    const audio = new Audio('/bell.mp3'); 
    audio.play().catch(err => console.log('เล่นเสียงไม่ได้:', err));
  };

  useEffect(() => {
    fetchTableTotal();
  }, [tableNumber]);

  const fetchTableTotal = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('table_number', tableNumber)
        .neq('status', 'paid');

      if (error) throw error;

      // รวมยอดเงินทั้งหมดที่ยังไม่จ่ายของโต๊ะนี้
      const total = (data || []).reduce((sum, order) => sum + order.total_amount, 0);
      setTotalAmount(total);
    } catch (error: any) {
      console.error('Error fetching total:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    const generateReceiptId = `REC-${Date.now()}`;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid', receipt_id: generateReceiptId })
        .eq('table_number', tableNumber)
        .neq('status', 'paid');

      if (error) throw error;
      
      playSound(); // 🔊 เล่นเสียงตอนเช็คบิลสำเร็จ!
      alert(`ชำระเงินโต๊ะ ${tableNumber} เรียบร้อยแล้ว!`);
      navigate('/cashier'); // จ่ายเสร็จ เด้งกลับหน้าแคชเชียร์อัตโนมัติ
    } catch (error: any) {
      console.error('Checkout error:', error.message);
      alert('เกิดข้อผิดพลาดในการชำระเงิน');
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-semibold">กำลังโหลดข้อมูล...</div>;

  // สร้างข้อมูล PromptPay
  const qrPayload = generatePayload(PROMPTPAY_ID, { amount: totalAmount });

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border-t-8 border-blue-600">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">สแกนเพื่อชำระเงิน</h1>
        <p className="text-lg text-neutral-500 mb-8">โต๊ะ: <span className="font-bold text-blue-600">{tableNumber}</span></p>
        
        <div className="bg-white p-4 border-4 border-blue-100 rounded-xl mb-6 inline-block shadow-sm">
          <QRCode value={qrPayload} size={220} />
        </div>
        
        <p className="text-sm text-neutral-500 mb-1">ยอดรวมที่ต้องชำระ</p>
        <p className="text-4xl font-bold text-green-600 mb-10">{totalAmount.toLocaleString()} บาท</p>
        
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleConfirmPayment} 
            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-xl hover:bg-green-600 transition-colors shadow-md"
          >
            ยืนยันว่ารับเงินแล้ว
          </button>
          <button 
            onClick={() => navigate('/cashier')} 
            className="w-full bg-neutral-200 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-300 transition-colors"
          >
            กลับหน้าแคชเชียร์
          </button>
        </div>
      </div>
    </div>
  );
}