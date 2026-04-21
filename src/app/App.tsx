import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { CartProvider, useCart } from "./context/CartContext"; 
import { Toaster } from "sonner";
import { supabase } from "../supabase/client"; // 

function TableInitializer() {
  const { tableNumber, setTableNumber, setCartItems } = useCart();

  // --- 1. ส่วนดึงเลขโต๊ะจาก URL (โค้ดเดิมของคุณ) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    
    if (table) {
      setTableNumber(table); 
      localStorage.setItem('tableNumber', table); // บันทึกลงเครื่องเผื่อลูกค้าปิดหน้าจอแล้วเปิดใหม่
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [setTableNumber]);

  // --- 2. ส่วน Real-time: ดักสถานะ "Paid" เพื่อเตะออกทันที (ไม่ต้องรีเฟรช) ---
  useEffect(() => {
    if (!tableNumber) return; // ถ้าไม่มีเลขโต๊ะ ไม่ต้องดักฟัง

    const checkoutChannel = supabase
      .channel(`checkout-sync-${tableNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `table_number=eq.${tableNumber}` // ดักเฉพาะออเดอร์ของโต๊ะนี้
        },
        (payload) => {
          // 🚨 ถ้าพนักงานกดเช็คบิล (สถานะเปลี่ยนเป็น paid)
          if (payload.new.status === 'paid') {
            
            // 1. ล้างข้อมูลในระบบให้เกลี้ยง
            setTableNumber(''); 
            setCartItems([]);
            
            // 2. ล้างข้อมูลที่เซฟไว้ในเครื่อง
            localStorage.removeItem('tableNumber');
            // localStorage.removeItem('cart_storage_key'); // ถ้ามี key ตะกร้าให้ใส่ตรงนี้ด้วยครับ

            // 3. บังคับเด้งกลับหน้าแรกทันที
            // เนื่องจากเราอยู่ใน Component ที่อยู่นอก RouterProvider 
            // วิธีที่ชัวร์ที่สุดคือใช้ window.location.origin เพื่อกลับไปหน้าสแกน QR [image_f8c30b.jpg]
            window.location.href = window.location.origin; 
            
            alert('เช็คบิลเรียบร้อยแล้ว ขอบคุณที่ใช้บริการครับ 🙏');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(checkoutChannel);
    };
  }, [tableNumber, setTableNumber, setCartItems]);

  return null;
}

function App() {
  return (
    <CartProvider>
      <TableInitializer /> 
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </CartProvider>
  );
}

export default App;