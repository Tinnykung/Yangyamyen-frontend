import { useState, useEffect, useCallback } from 'react'; 
import { Search, AlertCircle, ChefHat, Clock, Utensils, ClipboardList } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { OrderStatusTracker } from '../components/OrderStatusTracker';
import { useCart } from '../context/CartContext'; 

interface OrderItem {
  id?: string | number;
  name: string;
  quantity: number;
  price: number;
  isCancelled?: boolean; 
}

interface ActiveOrder {
  id: string | number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export function OrderTracking() {
  // ดึง tableNumber จาก Context
  const { tableNumber: contextTableNumber } = useCart();
  
  const [tableNumber, setTableNumber] = useState('');
  const [searchedTable, setSearchedTable] = useState('');
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ฟังก์ชัน Fetch ข้อมูลแยกออกมาเพื่อให้เรียกใช้ซ้ำได้
  const fetchOrders = useCallback(async (targetTable: string) => {
    if (!targetTable.trim()) return;

    setLoading(true);
    setError('');
    setActiveOrders([]);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, status, created_at, table_number, items') 
        .eq('table_number', targetTable)
        .neq('status', 'paid')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setError('ไม่พบรายการอาหารที่กำลังสั่งของโต๊ะนี้ครับ');
        setSearchedTable('');
      } else {
        setActiveOrders(data);
        setSearchedTable(targetTable);
      }
    } catch (err: any) {
      console.error('Error:', err.message);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect สำหรับดึงข้อมูลอัตโนมัติเมื่อมีเลขโต๊ะจาก Context (สแกน QR)
  useEffect(() => {
    if (contextTableNumber) {
      setTableNumber(contextTableNumber); // ใส่เลขในช่อง Input ให้ด้วย
      fetchOrders(contextTableNumber);
    }
  }, [contextTableNumber, fetchOrders]);

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
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `table_number=eq.${searchedTable}` },
        (payload: any) => {
          // เมื่อมีออเดอร์ใหม่เข้า ให้โหลดข้อมูลใหม่ทั้งหมดเพื่อให้ได้ข้อมูล items ที่ถูกต้อง
          fetchOrders(searchedTable);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [searchedTable, fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(tableNumber);
  };

  // Logic การคำนวณยอดรวม 
  const displayOrders = activeOrders.filter(order => {
    if (order.status === 'cancelled') return false;
    const hasValidItems = order.items?.some(item => !item.isCancelled);
    return hasValidItems;
  });

  const grandTotalQuantity = displayOrders.reduce((total, order) => {
    return total + (order.items?.reduce((sum, item) => sum + (!item.isCancelled ? (item.quantity || 1) : 0), 0) || 0);
  }, 0);

  const grandTotalPrice = displayOrders.reduce((total, order) => {
    return total + (order.items?.reduce((sum, item) => sum + (!item.isCancelled ? ((item.price || 0) * (item.quantity || 1)) : 0), 0) || 0);
  }, 0);

  const orderSummary = displayOrders.reduce((acc, order) => {
    order.items?.forEach(item => {
      if (item.isCancelled) return;
      const key = item.name;
      if (!acc[key]) acc[key] = { name: item.name, quantity: 0, totalPrice: 0 };
      acc[key].quantity += (item.quantity || 1);
      acc[key].totalPrice += (item.price || 0) * (item.quantity || 1);
    });
    return acc;
  }, {} as Record<string, { name: string, quantity: number, totalPrice: number }>);

  const summaryList = Object.values(orderSummary);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* กล่องสถานะ/ค้นหา */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-full mb-4">
            <ChefHat size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">ติดตามสถานะอาหาร</h1>
          
          {/* แสดงสถานะการล็อค */}
          {contextTableNumber ? (
            <div className="mb-8">
              <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                กำลังติดตามออเดอร์ของโต๊ะ {contextTableNumber}
              </p>
              <p className="text-xs text-neutral-400 mt-1">(ระบบล็อคเลขโต๊ะอัตโนมัติตาม QR Code ที่สแกน)</p>
            </div>
          ) : (
            <p className="text-neutral-500 mb-8">กรุณาระบุเลขโต๊ะเพื่อตรวจสอบ</p>
          )}

          {/* 🚨 แบบฟอร์มสไตล์ที่ 3 (อบอุ่น เป็นกันเอง) */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto flex flex-col gap-3">
            
            <div className="text-left pl-2">
              <label className="text-sm font-semibold text-neutral-500">
                {contextTableNumber ? "ออเดอร์นี้สำหรับ" : "กรุณาระบุหมายเลขโต๊ะ"}
              </label>
            </div>

            <div className="relative flex gap-3">
              <div className="relative flex-grow">
                {/* คำว่า "โต๊ะ" ลอยอยู่ด้านซ้าย */}
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className={`font-bold text-lg ${contextTableNumber ? 'text-amber-600' : 'text-neutral-400'}`}>
                    โต๊ะ
                  </span>
                </div>
                
                <input
                  type="text"
                  value={tableNumber}
                  readOnly={!!contextTableNumber} 
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="เช่น 1, 12"
                  className={`w-full pl-16 pr-5 py-4 rounded-2xl border-2 text-xl outline-none transition-all shadow-sm ${
                    contextTableNumber 
                      ? "bg-amber-50/80 border-amber-200 text-amber-700 font-extrabold cursor-not-allowed ring-4 ring-amber-50" 
                      : "bg-white border-neutral-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 text-neutral-800 font-medium hover:border-neutral-300"
                  }`}
                  required
                />
              </div>

              {!contextTableNumber && (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Search size={22} />
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-center justify-center gap-2 text-red-600 bg-red-50 py-3 px-4 rounded-lg">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

{searchedTable && activeOrders.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. แสดงรายการแยกตามแต่ละบิล (Order) */}
            <div className="space-y-6">
              {activeOrders.map((order, index) => (
                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
                  {/* หัวบิล */}
                  <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <span className="font-bold text-neutral-800">
                      บิลที่ {index + 1}
                    </span>
                    <span className="text-sm text-neutral-500 flex items-center gap-1">
                      <Clock size={16} />
                      {new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>

                  <div className="p-6">
                    {/* หลอดติดตามสถานะ (OrderStatusTracker) */}
                    <div className="mb-8">
                      <OrderStatusTracker status={order.status} />
                    </div>

                    {/* รายการอาหารในบิลนี้ */}
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => {
                        const isCancelled = item.isCancelled || order.status === 'cancelled';
                        return (
                          <div key={idx} className={`flex justify-between items-center text-sm sm:text-base ${isCancelled ? 'opacity-50 line-through text-red-500' : 'text-neutral-700'}`}>
                            <div className="flex gap-3">
                              <span className="font-bold min-w-[24px]">{item.quantity}x</span>
                              <span>{item.name}</span>
                            </div>
                            <span className="font-medium whitespace-nowrap ml-4">
                              {(item.price * item.quantity).toLocaleString()} บาท
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. สรุปยอดรวมทั้งหมดของโต๊ะนี้ (ดึงมาจาก orderSummary ที่คุณคำนวณไว้) */}
            {displayOrders.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-sm border border-amber-200 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6 text-amber-800 border-b border-amber-200/50 pb-4">
                  <ClipboardList size={24} />
                  <h2 className="text-xl font-bold">สรุปยอดรวม</h2>
                </div>
                
                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {summaryList.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-neutral-700">
                      <div className="flex gap-2">
                        <span className="text-amber-600 font-bold">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">
                        {item.totalPrice.toLocaleString()} บาท
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-amber-200/50 flex justify-between items-end">
                  <span className="text-neutral-600 font-medium">
                    รวมทั้งสิ้น ({grandTotalQuantity} รายการ)
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                    {grandTotalPrice.toLocaleString()} บาท
                  </span>
                </div>
              </div>
            )}
            
          </div>
        )}
        
      </div>
    </div>
  );
}