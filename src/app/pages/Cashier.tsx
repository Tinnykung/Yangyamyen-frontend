import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import generatePayload from 'promptpay-qr'; 
import QRCode from 'react-qr-code'; 
import { useNavigate } from 'react-router-dom';

// 🚨 เพิ่ม isCancelled เข้ามาใน OrderItem
interface OrderItem { id: string; name: string; price: number; quantity: number; isCancelled?: boolean; }
interface Order { id: string; table_number: string; items: OrderItem[]; total_amount: number; status: string; created_at: string; receipt_id?: string; }
interface SummaryItem { name: string; price: number; quantity: number; }
interface TableSummary { table_number: string; total_amount: number; order_count: number; all_served: boolean; first_order_time: string; items: SummaryItem[]; receipt_id?: string; }

// 🟢 ใส่เบอร์พร้อมเพย์
const PROMPTPAY_ID = "0923516354"; 

export function Cashier() {
  const [activeTables, setActiveTables] = useState<TableSummary[]>([]);
  const [paidTables, setPaidTables] = useState<TableSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [notification, setNotification] = useState<string | null>(null);
  const navigate = useNavigate();

  const [showQRForTable, setShowQRForTable] = useState<string | null>(null);

  // 🔊 ฟังก์ชันเล่นเสียงแจ้งเตือน
  const playSound = () => {
    const audio = new Audio('Apple pay sucess_sound track.mp3'); 
    audio.play().catch(err => console.log('เล่นเสียงไม่ได้ (เบราว์เซอร์อาจบล็อก):', err));
  };

  const playSuccessSound = () => {
    const audio = new Audio('Cash_Money Sound Effect.mp3'); 
    audio.play().catch(err => console.log('เล่นเสียงไม่ได้:', err));
  };

  useEffect(() => {
    fetchTables();

    const subscription = supabase
      .channel('cashier-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          // 1. ดักจับตอนมีออเดอร์เข้ามาใหม่ (ของเดิม)
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            showNotification(`มีออเดอร์ใหม่จาก โต๊ะ ${newOrder.table_number}!`);
            playSound();
          }
          
          // 2. เพิ่มใหม่: ดักจับตอนสถานะออเดอร์ถูกอัปเดต
          if (payload.eventType === 'UPDATE') {
            const newOrder = payload.new as Order;
            const oldOrder = payload.old as Order;
            
            // เช็คว่าสถานะเพิ่งเปลี่ยนเป็น 'paid' สดๆ ร้อนๆ
            if (newOrder.status === 'paid' && oldOrder.status !== 'paid') {
              showNotification(`โต๊ะ ${newOrder.table_number} ชำระเงินเรียบร้อยแล้ว!`);
              playSuccessSound(); // เรียกใช้เสียงตอนจ่ายเงิน
            }
          }

          fetchTables();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) throw error;

      const activeGroup: Record<string, any> = {};
      const paidGroup: Record<string, any> = {};

      (data || []).forEach((order: Order) => {
        // 1. ข้ามออเดอร์ที่ถูกยกเลิกทั้งบิลไปเลย
        if (order.status === 'cancelled') return;

        // 2. 🚨 คำนวณยอดรวมใหม่ & นับจำนวนเมนูที่ "ยังปกติอยู่" ในออเดอร์นี้
        let validOrderAmount = 0;
        let validItemsCount = 0;

        order.items?.forEach(item => {
          if (!item.isCancelled) {
            validOrderAmount += (item.price * item.quantity);
            validItemsCount += 1;
          }
        });

        // 3. 🚨 ถ้าออเดอร์นี้โดนยกเลิกเมนูย่อยจน "ไม่เหลือเมนูเลย" ให้ข้ามออเดอร์นี้ไปเลย (โต๊ะจะได้ไม่โผล่มาเป็นโต๊ะผี)
        if (validItemsCount === 0) return;

        // ---------------- ดำเนินการจัดกลุ่มโต๊ะตามปกติ ----------------
        if (order.status === 'paid') {
          const groupId = order.receipt_id || `OLD-${order.id}`;
          if (!paidGroup[groupId]) {
            paidGroup[groupId] = { data: { table_number: order.table_number, total_amount: 0, order_count: 0, all_served: true, first_order_time: order.created_at, receipt_id: order.receipt_id }, itemsMap: {} };
          } else {
            if (new Date(order.created_at) < new Date(paidGroup[groupId].data.first_order_time)) paidGroup[groupId].data.first_order_time = order.created_at;
          }
          
          // 🚨 ใช้ยอดที่คำนวณใหม่เท่านั้น หักลบของยกเลิกแล้ว
          paidGroup[groupId].data.total_amount += validOrderAmount;
          paidGroup[groupId].data.order_count += 1;
          
          order.items.forEach(item => {
            if (item.isCancelled) return; 
            if (paidGroup[groupId].itemsMap[item.name]) paidGroup[groupId].itemsMap[item.name].quantity += item.quantity;
            else paidGroup[groupId].itemsMap[item.name] = { name: item.name, price: item.price, quantity: item.quantity };
          });
        } else {
          if (!activeGroup[order.table_number]) {
            activeGroup[order.table_number] = { data: { table_number: order.table_number, total_amount: 0, order_count: 0, all_served: order.status === 'served', first_order_time: order.created_at, }, itemsMap: {} };
          } else {
            if (new Date(order.created_at) < new Date(activeGroup[order.table_number].data.first_order_time)) activeGroup[order.table_number].data.first_order_time = order.created_at;
          }
          
          // 🚨 ใช้ยอดที่คำนวณใหม่เท่านั้น
          activeGroup[order.table_number].data.total_amount += validOrderAmount;
          activeGroup[order.table_number].data.order_count += 1;
          if (order.status !== 'served') activeGroup[order.table_number].data.all_served = false;
          
          order.items.forEach(item => {
            if (item.isCancelled) return; 
            if (activeGroup[order.table_number].itemsMap[item.name]) activeGroup[order.table_number].itemsMap[item.name].quantity += item.quantity;
            else activeGroup[order.table_number].itemsMap[item.name] = { name: item.name, price: item.price, quantity: item.quantity };
          });
        }
      });

      const finalActive: TableSummary[] = Object.values(activeGroup).map((group: any) => ({ ...group.data, items: Object.values(group.itemsMap) }));
      finalActive.sort((a, b) => new Date(a.first_order_time).getTime() - new Date(b.first_order_time).getTime());

      const finalPaid: TableSummary[] = Object.values(paidGroup).map((group: any) => ({ ...group.data, items: Object.values(group.itemsMap) }));
      finalPaid.sort((a, b) => new Date(b.first_order_time).getTime() - new Date(a.first_order_time).getTime());

      setActiveTables(finalActive);
      setPaidTables(finalPaid);
    } catch (error: any) {
      console.error('Error fetching cashier data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (tableNumber: string) => {
    const confirmCheckout = window.confirm(`ลูกค้าโต๊ะ ${tableNumber} ชำระเงินเรียบร้อยแล้วใช่หรือไม่?`);
    if (!confirmCheckout) return;

    const generateReceiptId = `REC-${Date.now()}`;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid', receipt_id: generateReceiptId })
        .eq('table_number', tableNumber)
        .in('status', ['pending', 'cooking', 'served']); 

      if (error) throw error;
      
      showNotification(`เช็คบิลโต๊ะ ${tableNumber} เรียบร้อยแล้ว!`);
      setShowQRForTable(null); 
      fetchTables();
    } catch (error: any) {
      console.error('Checkout error:', error.message);
      alert('เกิดข้อผิดพลาดในการชำระเงิน');
    }
  };

  const renderTableCards = (tables: TableSummary[], isHistory: boolean) => {
    if (tables.length === 0) {
      return (
        <div className="text-center text-neutral-500 py-10 bg-neutral-50 rounded-lg">
          <p className="text-xl">{isHistory ? 'ยังไม่มีประวัติการชำระเงิน' : 'ยังไม่มีลูกค้านั่งทานในร้าน'}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table, index) => {
          const qrPayload = generatePayload(PROMPTPAY_ID, { amount: table.total_amount });
          const isShowingQR = showQRForTable === table.table_number;

          return (
            <div key={`${table.table_number}-${index}`} className={`bg-white border-2 rounded-xl shadow-sm p-6 flex flex-col transition-all duration-300 ${isHistory ? 'border-green-200 opacity-90' : 'border-neutral-200 hover:border-blue-300'}`}>
              
              {isShowingQR && !isHistory ? (
                <div className="flex flex-col items-center justify-center bg-white rounded-lg pb-4 h-full">
                  <h3 className="text-xl font-bold text-blue-800 mb-2">สแกนจ่ายผ่านพร้อมเพย์</h3>
                  <div className="bg-white p-2 border-4 border-blue-900 rounded-xl mb-4">
                     <QRCode value={qrPayload} size={180} />
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-4">{table.total_amount.toLocaleString()} บาท</p>
                  
                  <div className="flex gap-2 w-full mt-auto">
                    <button onClick={() => setShowQRForTable(null)} className="flex-1 bg-neutral-200 text-neutral-700 py-2 rounded-lg font-semibold">
                      ยกเลิก
                    </button>
                    <button onClick={() => handleCheckout(table.table_number)} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600">
                      ยืนยันว่าจ่ายแล้ว
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4 border-b pb-2">
                    <div>
                      <h2 className={`text-3xl font-bold ${isHistory ? 'text-green-700' : 'text-neutral-800'}`}>
                        โต๊ะ: {table.table_number}
                      </h2>
                      {isHistory && table.receipt_id && (
                        <p className="text-xs font-mono text-green-600 mb-1 mt-1 bg-green-50 inline-block px-2 py-1 rounded">บิล: {table.receipt_id}</p>
                      )}
                      <p className="text-sm text-neutral-500 mt-1">
                        {isHistory ? 'เริ่มทาน:' : 'เปิดโต๊ะ:'} {new Date(table.first_order_time).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} น.
                      </p>
                    </div>
                    {isHistory && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold mt-1">ชำระแล้ว ✅</span>}
                  </div>
                  
                  <div className="mb-4 bg-neutral-50 p-3 rounded-lg border max-h-48 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-neutral-600 mb-2 border-b pb-1">รายการอาหาร:</h3>
                    <ul className="space-y-2">
                      {table.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm text-neutral-700">
                          <span>{item.name} <span className="text-blue-600 font-medium">x{item.quantity}</span></span>
                          <span className="font-medium text-neutral-900">{(item.price * item.quantity).toLocaleString()} บาท</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex justify-between text-2xl mt-4 border-t pt-4">
                      <span className="font-bold text-neutral-700">ยอดรวม:</span>
                      <span className="font-bold text-green-600">{table.total_amount.toLocaleString()} บาท</span>
                    </div>
                  </div>

                  {/* 🚨 อัปเดตส่วนปุ่มด้านล่างตรงนี้ครับ */}
                  {!isHistory ? (
                    <div className="mt-auto pt-4 flex gap-2 border-t">
                      <button 
                        onClick={() => navigate(`/payment/${table.table_number}`)}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold flex justify-center items-center gap-2"
                      >
                        สแกนจ่าย
                      </button>
                      <button 
                        onClick={() => handleCheckout(table.table_number)}
                        className="flex-1 bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 font-bold flex justify-center items-center gap-2"
                      >
                        เงินสด
                      </button>
                    </div>
                  ) : (
                    // 🚨 เพิ่มปุ่มดูใบเสร็จ สำหรับแท็บประวัติเช็คบิล
                    table.receipt_id && (
                      <div className="mt-auto pt-4 flex gap-2 border-t">
                        <button 
                          onClick={() => navigate(`/receipt/${table.receipt_id}`)}
                          className="w-full bg-neutral-100 text-neutral-700 py-3 rounded-lg hover:bg-neutral-200 font-bold flex justify-center items-center gap-2 border border-neutral-300 transition-colors"
                        >
                          ดูใบเสร็จ
                        </button>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="text-center py-20 text-xl font-semibold">กำลังโหลดข้อมูล... </div>;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {notification && (
        <div className="fixed top-24 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg font-bold text-lg animate-bounce z-50 flex items-center gap-2">
          {notification}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-neutral-900">ระบบแคชเชียร์</h1>
      
      <div className="flex gap-4 mb-8 border-b pb-4">
        <button onClick={() => setActiveTab('active')} className={`px-6 py-2 rounded-lg font-bold text-lg transition-colors ${activeTab === 'active' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
          โต๊ะที่กำลังทาน ({activeTables.length})
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg font-bold text-lg transition-colors ${activeTab === 'history' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'}`}>
          ประวัติเช็คบิล ({paidTables.length})
        </button>
      </div>

      {activeTab === 'active' ? renderTableCards(activeTables, false) : renderTableCards(paidTables, true)}
    </div>
  );
}