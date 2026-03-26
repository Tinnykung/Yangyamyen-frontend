import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Root() {
  const { cart, getCartCount } = useCart();
  const location = useLocation();
  const cartCount = getCartCount();

  // ใส่ลิงก์รูปภาพพื้นหลังตรงนี้
  const backgroundImage = "/654748065_122114432403236814_8283769321234183639_n.jpg";

  return (
    // คงพื้นหลังสีสว่างดั้งเดิมไว้
    <div className="min-h-screen bg-neutral-50 flex flex-col relative">
      
      {/* แอนิเมชันสำหรับภาพพื้นหลัง (Motion Animation) */}
      <style>
        {`
          @keyframes slowMotion {
            0% { transform: scale(1) translate(0px, 0px); }
            50% { transform: scale(1.05) translate(-10px, -10px); }
            100% { transform: scale(1) translate(0px, 0px); }
          }
          .animate-bg-motion {
            animation: slowMotion 15s ease-in-out infinite;
          }
        `}
      </style>

      {/* ภาพพื้นหลังเคลื่อนไหวช้าๆ (อยู่เลเยอร์ล่างสุด) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.1]">
        <img 
          src={backgroundImage} 
          alt="background decoration" 
          className="w-full h-full object-cover animate-bg-motion"
        />
      </div>

      {/* 🌟 Header สีขาวดั้งเดิม (แต่เพิ่มลูกเล่นตอนชี้เมาส์) */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <Link to="/" className="flex items-center gap-3 group">
              {/* โลโก้จะหมุนดุ๊กดิ๊กนิดๆ ตอนเอาเมาส์ไปชี้ */}
              <div className="transform duration-500 group-hover:rotate-4 group-hover:scale-110">
                <ImageWithFallback 
                  src="https://scontent.fbkk5-4.fna.fbcdn.net/v/t39.30808-6/619258884_5171381759753893_6892651003205238714_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=jts7BNSON4oQ7kNvwHH8epC&_nc_oc=AdrDAgfQSkN7YGA8rzWIR9v11lwgZRPkG6SPIoGDDk4BpjwmhiLkjSzvDsdHxtNu_dKs5UqynBfeMh8m-eceX6XD&_nc_zt=23&_nc_ht=scontent.fbkk5-4.fna&_nc_gid=65miqv6DmQOV97m3Jx3eww&_nc_ss=7a32e&oh=00_AfzcIpgAXAvtIa5NVf156JREGS42cjK63Ov_5vmHksAkng&oe=69C81B76"
                  alt="ย่างยามเย็น-304 Logo" 
                  className="w-20 h-20 object-contain rounded"
                />
              </div>
              <span className="text-base md:text-xl font-semibold text-neutral-900 group-hover:text-amber-700 transition-colors duration-300">
                ย่างยามเย็น-304
              </span>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link
                to="/"
                className={`text-base md:text-xl transition-all duration-300 hover:-translate-y-1 ${
                  location.pathname === '/'
                    ? 'text-amber-500 font-bold'
                    : 'text-neutral-400 hover:text-neutral-900'
                }`}
              >
                เมนู
              </Link>
              <Link
                to="/tracking"
                className={`text-base md:text-xl transition-all duration-300 hover:-translate-y-1 ${
                  location.pathname === '/tracking'
                    ? 'text-amber-500 font-bold'
                    : 'text-neutral-400 hover:text-neutral-900'
                }`}
              >
                ติดตามอาหาร
              </Link>
              <Link
                to="/cart"
                className="relative flex items-center text-neutral-600 hover:text-amber-700 transition-all duration-300 hover:scale-110"
              >
                <ShoppingCart className="w-8 h-8" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/*ส่วนเนื้อหาหลัก */}
      <main className="flex-grow relative z-10 w-full">
        {/* ห่อ Outlet ด้วย div เพื่อเพิ่ม Transition ตอนเปลี่ยนหน้า */}
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
          <Outlet />
        </div>
      </main>

      {/* Footer สีดำดั้งเดิม */}
      <footer className="bg-neutral-900 text-white mt-16 relative z-10 shadow-inner">
        <div className="max-w-7xl mx-auto px-10 sm:px-10 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 group hover:opacity-80 transition-opacity cursor-pointer">
              <ImageWithFallback 
                src="https://scontent.fbkk5-4.fna.fbcdn.net/v/t39.30808-6/619258884_5171381759753893_6892651003205238714_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=jts7BNSON4oQ7kNvwHH8epC&_nc_oc=AdrDAgfQSkN7YGA8rzWIR9v11lwgZRPkG6SPIoGDDk4BpjwmhiLkjSzvDsdHxtNu_dKs5UqynBfeMh8m-eceX6XD&_nc_zt=23&_nc_ht=scontent.fbkk5-4.fna&_nc_gid=65miqv6DmQOV97m3Jx3eww&_nc_ss=7a32e&oh=00_AfzcIpgAXAvtIa5NVf156JREGS42cjK63Ov_5vmHksAkng&oe=69C81B76"
                alt="ย่างยามเย็น-304 Logo" 
                className="w-15 h-15 object-contain rounded transition-transform group-hover:scale-105"
              />
              <span className="font-semibold">Yangyamyen-304</span>
            </div>
            <p className="text-neutral-400 text-sm">© 2026 Yangyamyen-304. All rights reserved.</p>
            <p className="text-neutral-400 text-sm">Email: Yangyamyen@gmail.com | Contact: 092-351-6354</p>
          </div>
        </div>
      </footer>
    </div>
  );
}