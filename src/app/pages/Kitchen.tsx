import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';

// เพิ่ม isCancelled เข้ามาใน OrderItem
interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  isCancelled?: boolean; 
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

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('🔔 มีอัปเดตจากห้องครัว!', payload);
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. ฟังก์ชันเดิม: เปลี่ยนสถานะทั้งออเดอร์
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      const isConfirmed = window.confirm('คุณต้องการยกเลิก "ทั้งออเดอร์" นี้เลยใช่หรือไม่?');
      if (!isConfirmed) return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating status:', error.message);
      alert('เปลี่ยนสถานะไม่สำเร็จ!');
    }
  };

  // 2. ฟังก์ชันใหม่: ยกเลิกแค่บางเมนู
  const cancelSingleItem = async (orderId: string, itemIndex: number) => {
    const isConfirmed = window.confirm('ต้องการยกเลิก "เฉพาะเมนูนี้" ใช่หรือไม่?');
    if (!isConfirmed) return;

    // หาออเดอร์ต้นทาง
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    // จำลอง array ของ items ขึ้นมาใหม่เพื่อแก้ไข
    const updatedItems = [...orderToUpdate.items];
    
    // ติดป้ายให้เมนูที่เลือกว่า isCancelled = true
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], isCancelled: true };

    // คำนวณยอดเงินรวมใหม่ (เอาเฉพาะเมนูที่ไม่ได้ถูกยกเลิกมาบวกกัน)
    const newTotalAmount = updatedItems.reduce((sum, item) => {
      if (item.isCancelled) return sum;
      return sum + (item.price * item.quantity);
    }, 0);

    // เช็คว่าถ้ายกเลิกเมนูย่อยจนหมดทุกอันแล้ว ให้เปลี่ยนสถานะบิลหลักเป็น cancelled ไปเลย
    const allItemsCancelled = updatedItems.every(item => item.isCancelled);
    const newOrderStatus = allItemsCancelled ? 'cancelled' : orderToUpdate.status;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          items: updatedItems, 
          total_amount: newTotalAmount,
          status: newOrderStatus
        })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error: any) {
      console.error('Error cancelling item:', error.message);
      alert('ยกเลิกเมนูไม่สำเร็จ โปรดลองอีกครั้ง');
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
            <div key={order.id} className={`bg-white rounded-lg shadow-md p-8 text-center border-2 ${
                order.status === 'served' ? 'border-green-200 opacity-75' : 
                order.status === 'cancelled' ? 'border-red-200 opacity-75 bg-red-50' : 
                'border-orange-100'
              }`}>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className={`text-2xl font-bold ${
                    order.status === 'served' ? 'text-green-600' : 
                    order.status === 'cancelled' ? 'text-red-600' : 
                    'text-orange-600'
                  }`}>
                  โต๊ะ: {order.table_number}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {new Date(order.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} น.
                </p>

                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'cooking' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status === 'pending' ? 'รอทำ ⏳' :
                    order.status === 'cooking' ? 'กำลังทำ 🍳' :
                    order.status === 'cancelled' ? 'ยกเลิกแล้ว ❌' :
                    'เสิร์ฟแล้ว ✅'}
                </span>
              </div>

              {/* รายการอาหาร */}
              <ul className="space-y-3 mb-6 flex-grow text-left">
                {order.items.map((item, index) => {
                  // เช็คว่าเมนูนี้โดนยกเลิก หรือทั้งบิลโดนยกเลิกหรือไม่
                  const isItemCancelled = item.isCancelled || order.status === 'cancelled';
                  
                  return (
                    <li key={index} className="flex justify-between items-center">
                      <div className={`flex gap-2 items-start ${isItemCancelled ? 'text-red-400 line-through opacity-70' : 'text-neutral-700'}`}>
                        <span>- {item.name}</span>
                        <span className="font-bold">x{item.quantity}</span>
                        {item.isCancelled && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full mt-0.5">ยกเลิกแล้ว</span>}
                      </div>

                      {/* ปุ่ม X สำหรับยกเลิกทีละเมนู (แสดงเฉพาะออเดอร์ที่ยังไม่เสร็จ/ไม่โดนยกเลิก) */}
                      {(order.status === 'pending' || order.status === 'cooking') && !isItemCancelled && (
                        <button
                          onClick={() => cancelSingleItem(order.id, index)}
                          className="text-xs bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 px-2 py-1 rounded border border-red-100 transition-colors"
                          title="ยกเลิกเฉพาะเมนูนี้"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto space-y-2 pt-4 border-t">
                {(order.status === 'pending' || order.status === 'cooking') && (
                  <div className="flex flex-col gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cooking')}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold transition-colors"
                      >
                        รับออเดอร์ (เริ่มทำ)
                      </button>
                    )}
                    {order.status === 'cooking' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-semibold transition-colors"
                      >
                        เสิร์ฟแล้ว (ปิดออเดอร์)
                      </button>
                    )}
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 font-semibold transition-colors mt-1"
                    >
                      ยกเลิกทั้งออเดอร์
                    </button>
                  </div>
                )}
                
                {order.status === 'served' && (
                  <div className="text-center text-green-600 font-semibold py-2 bg-green-50 rounded-lg">
                    ออเดอร์นี้เสร็จแล้ว
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="text-center text-red-600 font-semibold py-2 bg-red-100 rounded-lg">
                    ออเดอร์นี้ถูกยกเลิกแล้ว ❌
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