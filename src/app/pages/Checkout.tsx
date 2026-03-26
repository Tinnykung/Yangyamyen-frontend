import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CreditCard, MapPin, User } from 'lucide-react';
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
    specialInstructions: '',
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
              table_number: formData.name,   // จับคู่คอลัมน์ table_number
              items: cart,                   // จับคู่คอลัมน์ items (jsonb)
              total_amount: getCartTotal(),  // จับคู่คอลัมน์ total_amount
              status: 'pending'              // สถานะเริ่มต้น
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
      <h1 className="text-3xl mb-8 text-neutral-900">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="w-5 h-5 text-amber-700" />
              <h2 className="text-xl font-semibold text-neutral-900">เลขโต๊ะ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  กรุณากรอกเลขโต๊ะ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="เช่น 1, 2, A1, B3"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-4 rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg"
          >
            ยืนยันรายการอาหาร
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900">สรุปการสั่งอาหาร</h2>
            
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-neutral-700">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-neutral-900 font-medium">
                    {(item.price * item.quantity).toFixed(2)} บาท
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 mb-4">
              <div className="flex justify-between text-neutral-600">
                <span>ทั้งหมด</span>
                <span>{getCartTotal().toFixed(2)} บาท</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold text-neutral-900">
                  <span>ทั้งหมด</span>
                  <span>{getCartTotal().toFixed(2)} บาท</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}