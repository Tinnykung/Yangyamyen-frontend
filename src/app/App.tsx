import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { CartProvider, useCart } from "./context/CartContext"; // 🚨 อย่าลืม import useCart
import { Toaster } from "sonner";

// 🚨 1. สร้าง Component ที่ไม่มีหน้าตา (Hidden Component) เพื่อใช้ดึง URL
function TableInitializer() {
  const { setTableNumber } = useCart();

  useEffect(() => {
    // อ่านค่าจาก URL เช่น https://your-web.com/?table=12
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    
    if (table) {
      setTableNumber(table); // บันทึกเลขโต๊ะลงในระบบทันที
      
      // (แนะนำ) ลบพารามิเตอร์ ?table=... ออกจาก URL เพื่อให้ลิงก์ดูสะอาด
      // และป้องกันลูกค้าก๊อปปี้ลิงก์ไปส่งให้เพื่อนสั่งเล่นจากที่อื่น
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [setTableNumber]);

  return null; // ไม่ต้อง render อะไรออกมา
}

// 🚨 2. นำ Component ไปใส่ไว้ใน App
function App() {
  return (
    <CartProvider>
      <TableInitializer /> {/* ทำงานทันทีที่เว็บโหลด */}
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </CartProvider>
  );
}

export default App;