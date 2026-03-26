import { useState } from 'react';
import { menuItems, categories } from '../data/menu';
import { MenuItemCard } from '../components/MenuItemCard';

export function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4 text-neutral-900">ย่างยามเย็น</h1>
        <p className="text-lg text-neutral-600">ย่างยามเย็น หมูกระทะ & มิวสิก ดื่มด่ำกับบรรยากาศยามเย็น เลิกงานแล้วมานั่งย่างหมูเนื้อนุ่มๆกับน้ำจิ้มรสเด็ด พร้อมกับฟังเพลงเพราะๆ สไตล์โฟล์คซอง
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full transition-all ${
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