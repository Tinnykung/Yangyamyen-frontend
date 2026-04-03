import { useState, useEffect } from 'react'; // 🚨 เพิ่ม useEffect
import { menuItems, categories } from '../data/menu';
import { MenuItemCard } from '../components/MenuItemCard';
import { RequireQR } from '../pages/RequireQR';
import { useCart } from '../context/CartContext'; // 
import { supabase } from '../../supabase/client'; // 

export function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // 🚨 ดึงข้อมูลจาก CartContext
  const { tableNumber, setTableNumber, clearCart } = useCart();

  // 🚨 1. ระบบดักฟังสถานะ "เช็คบิล" แบบ Real-time
  useEffect(() => {
    // ถ้าไม่มีเลขโต๊ะ ไม่ต้องรัน Real-time
    if (!tableNumber) return;

    const subscription = supabase
      .channel(`check-paid-${tableNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `table_number=eq.${tableNumber}`
        },
        (payload) => {
          // ถ้าสถานะเปลี่ยนเป็น paid
          if (payload.new.status === 'paid') {
            alert('ชำระเงินเรียบร้อยแล้ว ขอบคุณที่ใช้บริการครับ!');
            
            // 🚨 ล้างข้อมูลในเครื่องลูกค้า (เตะออกจากโต๊ะ)
            clearCart();
            setTableNumber(''); 
            
            // ล้าง Query String ใน URL ด้วย (ถ้ามี) เพื่อป้องกันการ Refresh แล้วกลับมาโต๊ะเดิม
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [tableNumber, setTableNumber, clearCart]);

  // 🚨 2. ถ้าไม่มีเลขโต๊ะ (ยังไม่ได้สแกน หรือ จ่ายเงินแล้วโดนเตะออก) ให้โชว์หน้าสแกน QR
  if (!tableNumber) {
    return <RequireQR />;
  }

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4 text-neutral-900 font-bold">ย่างยามเย็น</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          ย่างยามเย็น หมูกระทะ & มิวสิก ดื่มด่ำกับบรรยากาศยามเย็น เลิกงานแล้วมานั่งย่างหมูเนื้อนุ่มๆกับน้ำจิ้มรสเด็ด พร้อมกับฟังเพลงเพราะๆ สไตล์โฟล์คซอง
        </p>
        <div className="mt-4">
          <span className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full font-bold border border-orange-200">
            โต๊ะ : {tableNumber}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full transition-all font-medium ${
              selectedCategory === category
                ? 'bg-amber-700 text-white shadow-md'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}