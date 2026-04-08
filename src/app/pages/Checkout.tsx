import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CreditCard, MapPin, User, FileText } from 'lucide-react'; // 🚨 เพิ่ม FileText icon
import { UtensilsCrossed } from 'lucide-react';
import { supabase } from '../../supabase/client';

export function Checkout() {
  const { cart, getCartTotal, clearCart, tableNumber, setTableNumber } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: tableNumber,
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    specialInstructions: '', // มี State นี้อยู่แล้ว พร้อมใช้งาน
  });
  
  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  interface OrderData {
    table: string;
    cart: typeof cart;
    total: number;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        // 1. ส่งข้อมูลไปที่ตาราง orders ใน Supabase
        const { error } = await supabase
          .from('orders')
          .insert([
            {
              table_number: formData.name,   
              items: cart,                   
              total_amount: getCartTotal(),  
              status: 'pending',             
              note: formData.specialInstructions // 🚨 เพิ่มหมายเหตุส่งไปที่ฐานข้อมูล (ตั้งชื่อคอลัมน์ว่า note)
            }
          ]);

        // 2. เช็คว่ามี Error จาก Database ไหม
        if (error) {
          console.error('Supabase Error:', error);
          alert('เกิดข้อผิดพลาดในการส่งออเดอร์: ' + error.message);
          return; // หยุดการทำงาน ไม่เปลี่ยนหน้า
        }

        // 3. ถ้าสำเร็จ ให้เซ็ตเลขโต๊ะและไปหน้า Confirmation
        console.log('บันทึกออเดอร์ลง Database สำเร็จ!');
        setTableNumber(formData.name);
        navigate('/confirmation');

      } catch (err) {
        console.error('Unexpected Error:', err);
        alert('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่');
      }
    };

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }
  }, [cart.length, navigate]);

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl mb-8 text-neutral-900 font-bold">ยืนยันการสั่งอาหาร</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* ส่วนกรอกข้อมูลโต๊ะและหมายเหตุ */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            
            {/* เลขโต๊ะ */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
                <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-neutral-900">ข้อมูลโต๊ะ</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  เลขโต๊ะ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="เช่น 1, 2, A1, B3"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly={!!tableNumber}
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-lg ${
                    tableNumber 
                      ? "bg-neutral-100 border-neutral-200 text-neutral-600 font-bold cursor-not-allowed" 
                      : "bg-white border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  }`}
                />
              </div>
            </div>

            {/* 🚨 เพิ่มส่วนหมายเหตุ (Special Instructions) ตรงนี้ */}
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
                <FileText className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-neutral-900">หมายเหตุเพิ่มเติม</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  (ถ้ามี)
                </label>
                <textarea
                  name="specialInstructions"
                  rows={3}
                  placeholder="เช่น ไม่ใส่ผักชี, เผ็ดน้อย, ขอช้อนส้อม 3 คู่..."
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-4 rounded-xl hover:bg-orange-700 transition-colors font-bold text-lg shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.23)] hover:-translate-y-0.5"
          >
            ยืนยันรายการอาหาร
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6 text-neutral-900 border-b border-neutral-100 pb-3">สรุปการสั่งอาหาร</h2>
            
            <div className="space-y-4 mb-6 max-h-80 pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <span className="text-neutral-700 flex-1 pr-4">
                    <span className="font-semibold text-orange-600 mr-2">{item.quantity}x</span> 
                    {item.name}
                  </span>
                  <span className="text-neutral-900 font-medium whitespace-nowrap mt-0.5">
                    {(item.price * item.quantity).toLocaleString()} บาท
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-4 bg-orange-50 -mx-6 -mb-6 px-6 py-5 rounded-b-2xl">
              <div className="flex justify-between text-lg font-bold text-neutral-900">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-orange-600 text-xl">{getCartTotal().toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}