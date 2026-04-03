import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useEffect } from 'react';

export function OrderConfirmation() {
  const { tableNumber , clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when the component mounts
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="w-20 h-20 mx-auto text-green-600 mb-6" />
        
        <h1 className="text-3xl mb-4 text-neutral-900">ยืนยันการสั่งอาหาร!</h1>
        
        <p className="text-lg text-neutral-600 mb-2">
          ขอบคุณที่สั่งอาหารกับเรา! ออเดอร์ของคุณได้รับการยืนยันแล้ว
        </p>

        {tableNumber && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-700 mb-1">โต๊ะของคุณ</p>
            <p className="text-4xl font-bold text-amber-800">โต๊ะ {tableNumber}</p>
          </div>
        )}

        <div className="bg-neutral-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-neutral-600 mb-2">หมายเลขออเดอร์</p>
          <p className="text-2xl font-mono text-neutral-900">
            #{Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-neutral-600">
            ใช้เวลาประมาณ: <span className="font-semibold text-neutral-900">5-10 นาที</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-amber-700 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition-colors font-semibold"
          >
            สั่งอาหารอีกครั้ง
          </Link>
        </div>
      </div>
    </div>
  );
}
