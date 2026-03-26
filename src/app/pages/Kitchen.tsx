import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';

// กำหนดโครงสร้างข้อมูลให้ตรงกับใน Supabase
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  table_number: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
}

export function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลออเดอร์เมื่อโหลดหน้านี้
  useEffect(() => {
    fetchOrders();
    
    const subscription = supabase
      .channel('kitchen-orders') // ตั้งชื่อช่องสัญญาณ
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' }, // ฟังทุกการเคลื่อนไหว (Insert, Update, Delete) ของตาราง orders
        (payload) => {
          console.log('🔔 มีอัปเดตจากห้องครัว!', payload);
          // พอมีคนสั่งใหม่ หรือเปลี่ยนสถานะ ให้โหลดข้อมูลมาแสดงใหม่ทันที
          fetchOrders(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        // ลบบรรทัด .neq('status', 'served') ออกไปแล้ว
        .order('created_at', { ascending: false }); // เปลี่ยนเป็น false เพื่อให้ออเดอร์ใหม่สุดอยู่บนสุด

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะออเดอร์
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // อัปเดตหน้าจอทันทีเมื่อเปลี่ยนสถานะสำเร็จ
      fetchOrders(); 
    } catch (error: any) {
      console.error('Error updating status:', error.message);
      alert('เปลี่ยนสถานะไม่สำเร็จ!');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xl font-semibold">กำลังโหลดออเดอร์... ⏳</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8 text-neutral-900 border-b pb-4">แผงควบคุมห้องครัว</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-neutral-500 py-10 bg-neutral-50 rounded-lg">
          <p className="text-xl">ยังไม่มีออเดอร์เข้ามาครับ เช็ดเตารอได้เลย! ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
<div key={order.id} className={`bg-white rounded-lg shadow-md p-8 text-center ${order.status === 'served' ? 'border-green-200 opacity-75' : 'border-orange-100'}`}>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className={`text-2xl font-bold ${order.status === 'served' ? 'text-green-600' : 'text-orange-600'}`}>
                  โต๊ะ: {order.table_number}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {new Date(order.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} น.
                </p>
                
                {/* อัปเดตป้ายสถานะให้รองรับ 3 แบบ */}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === 'cooking' ? 'bg-blue-100 text-blue-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status === 'pending' ? 'รอทำ ⏳' : 
                   order.status === 'cooking' ? 'กำลังทำ 🍳' : 
                   'เสิร์ฟแล้ว ✅'}
                </span>
              </div>
              
              <ul className="space-y-2 mb-6 flex-grow">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between text-neutral-700">
                    <span>- {item.name}</span>
                    <span className="font-bold">x{item.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-2 pt-4 border-t">
                {/* ซ่อนปุ่มถ้าสถานะเป็น served แล้วแสดงข้อความแทน */}
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'cooking')}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    รับออเดอร์ (เริ่มทำ)
                  </button>
                )}
                {order.status === 'cooking' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'served')}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-semibold"
                  >
                    เสิร์ฟแล้ว (ปิดออเดอร์)
                  </button>
                )}
                {order.status === 'served' && (
                  <div className="text-center text-green-600 font-semibold py-2 bg-green-50 rounded-lg">
                    ออเดอร์นี้เสร็จสมบูรณ์แล้ว 🎉
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}