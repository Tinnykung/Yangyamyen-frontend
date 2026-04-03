import { QrCode } from 'lucide-react';

export function RequireQR() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-sm w-full border border-neutral-100 animate-in fade-in zoom-in duration-500">
        <div className="bg-orange-100 text-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <QrCode size={40} />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">ยินดีต้อนรับ!</h1>
        <p className="text-neutral-500 mb-8">
          กรุณาสแกน QR Code ที่โต๊ะของคุณ<br />เพื่อเริ่มต้นสั่งอาหาร
        </p>
        <div className="text-sm text-neutral-400 bg-neutral-50 p-4 rounded-xl">
          หากสแกนแล้วยังไม่สามารถสั่งได้<br />โปรดแจ้งพนักงาน
        </div>
      </div>
    </div>
  );
}