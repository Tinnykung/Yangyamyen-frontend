import { useState, useEffect } from 'react';
import { Search, AlertCircle, ChefHat, Clock, Utensils, ClipboardList } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { OrderStatusTracker } from '../components/OrderStatusTracker';

interface OrderItem {
  id?: string | number;
  name: string;
  quantity: number;
  price: number;
}

interface ActiveOrder {
  id: string | number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export function OrderTracking() {
  const [tableNumber, setTableNumber] = useState('');
  const [searchedTable, setSearchedTable] = useState('');
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ระบบ Real-time
  useEffect(() => {
    if (!searchedTable) return;

    const orderSubscription = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `table_number=eq.${searchedTable}` },
        (payload: any) => {
          setActiveOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === payload.new.id ? { ...order, status: payload.new.status } : order
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `table_number=eq.${searchedTable}` },
        (payload: any) => {
          setActiveOrders(prevOrders => [...prevOrders, payload.new as ActiveOrder]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [searchedTable]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    setLoading(true);
    setError('');
    setSearchedTable('');
    setActiveOrders([]);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, status, created_at, table_number, items') 
        .eq('table_number', tableNumber)
        .neq('status', 'paid')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setError('ไม่พบรายการอาหารที่กำลังสั่งของโต๊ะนี้ครับ (หรืออาจจะชำระเงินไปแล้ว)');
      } else {
        setActiveOrders(data);
        setSearchedTable(tableNumber);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err.message);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ โปรดลองอีกครั้งครับ');
    } finally {
      setLoading(false);
    }
  };

  // 1. คำนวณยอดรวมทั้งหมด (Grand Total)
  const grandTotalQuantity = activeOrders.reduce((total, order) => {
    const orderQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
    return total + orderQuantity;
  }, 0);

  const grandTotalPrice = activeOrders.reduce((total, order) => {
    const orderPrice = order.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
    return total + orderPrice;
  }, 0);

  // 2. จัดกลุ่มรายการอาหารที่ซ้ำกันจากทุกรอบเข้าด้วยกัน
  const orderSummary = activeOrders.reduce((acc, order) => {
    order.items?.forEach(item => {
      const key = item.name;
      if (!acc[key]) {
        acc[key] = { name: item.name, quantity: 0, totalPrice: 0 };
      }
      acc[key].quantity += (item.quantity || 1);
      acc[key].totalPrice += (item.price || 0) * (item.quantity || 1);
    });
    return acc;
  }, {} as Record<string, { name: string, quantity: number, totalPrice: number }>);

  const summaryList = Object.values(orderSummary);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* กล่องค้นหา */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-full mb-4">
            <ChefHat size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">ติดตามสถานะอาหาร</h1>
          <p className="text-neutral-500 mb-8">กรอกเลขโต๊ะของคุณเพื่อดูว่าอาหารทำถึงไหนแล้ว</p>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="ระบุเลขโต๊ะ เช่น 1, 12"
                className="w-full pl-5 pr-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:ring-0 text-lg transition-colors outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-70 shadow-md"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search size={20} />
                  <span className="hidden sm:inline">ตรวจสอบ</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 flex items-center justify-center gap-2 text-red-600 bg-red-50 py-3 px-4 rounded-lg">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {searchedTable && !error && activeOrders.length > 0 && (
          <div className="bg-white rounded-3xl shadow-md border-t-4 border-amber-500 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs text-neutral-400 font-medium hidden sm:block">Real-time Active</span>
            </div>

            <h2 className="text-2xl font-bold text-center text-neutral-800 mb-2 mt-4 sm:mt-0">
              สถานะโต๊ะ <span className="text-amber-600 text-3xl">{searchedTable}</span>
            </h2>
            <p className="text-center text-neutral-500 mb-8">มีทั้งหมด {activeOrders.length} รอบที่กำลังดำเนินการ</p>

            {/* 📋 รายการสรุปอาหารทั้งหมด + ยอดรวม (จบในกล่องเดียว) */}
            {summaryList.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-5 sm:p-7 mb-10 border border-amber-100 shadow-sm">
                <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2 border-b border-amber-200 pb-3">
                  <ClipboardList size={22} className="text-amber-600" />
                  สรุปรายการอาหารทั้งหมด
                </h4>
                
                {/* ลิสต์รายการอาหาร */}
                <ul className="space-y-3 mb-6">
                  {summaryList.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm sm:text-base border-b border-amber-100/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="text-center ">
                          {item.quantity}x
                        </span>
                        <span className="text-neutral-700 font-medium">{item.name}</span>
                      </div>
                      <span className="text-neutral-600 font-semibold">
                        {item.totalPrice.toLocaleString()} บาท
                      </span>
                    </li>
                  ))}
                </ul>

                {/* แถบสรุปยอดสุทธิด้านล่างของกล่อง */}
                <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-2 border border-amber-200/60 shadow-sm">
                  <div className="text-neutral-600 font-medium">
                    รวมทั้งหมด <span className="font-bold text-amber-600 text-lg">{grandTotalQuantity}</span> รายการ
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-neutral-800 flex items-center gap-2">
                    ทั้งหมด <span className="text-xl text-amber-600">{grandTotalPrice.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* เส้นคั่นแบ่งระหว่างสรุปรวม กับ รายละเอียดแต่ละรอบ */}
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-sm font-medium">รายละเอียดสถานะแต่ละรอบ</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            {/* 🔄 ลูปแสดงสถานะของแต่ละออเดอร์ (แยกตามรอบ) */}
            <div className="space-y-12 mt-6">
              {activeOrders.map((order, index) => (
                <div key={order.id} className="relative pb-8 border-b border-neutral-100 last:border-0 last:pb-0">
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-neutral-100 text-neutral-700 font-bold px-4 py-1.5 rounded-full text-sm">
                      รอบที่ {index + 1}
                    </div>
                    <div className="flex items-center gap-1 text-neutral-400 text-sm">
                      <Clock size={14} />
                      <span>{new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                    </div>
                  </div>

                  <OrderStatusTracker status={order.status} />

                  {/* กล่องแสดงรายการอาหารของรอบย่อย */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-8 bg-neutral-50/50 rounded-xl p-4 border border-neutral-100">
                      <h4 className="text-xs font-bold text-neutral-500 mb-3 flex items-center gap-2">
                        <Utensils size={14} /> รายการอาหาร
                      </h4>
                      <ul className="space-y-2">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400 w-6">{item.quantity}x</span>
                              <span>{item.name}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ))}
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}