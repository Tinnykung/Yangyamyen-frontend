import { MenuItem } from '../context/CartContext';

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'หมูกะทะชุดเล็ก',
    description: 'Beer-battered cod with crispy chips and mushy peas',
    price: 220,
    category: 'หมูกะทะ',
    image: 'https://scontent.fbkk5-1.fna.fbcdn.net/v/t39.30808-6/654422608_122114432535236814_6273855305036585792_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_ohc=lgOzVa3BajAQ7kNvwFmMKjo&_nc_oc=AdoXbyRhciQc7bLOS_Nj98ODuEVIw3HlowfqyzouGdavdmL9chZBw3FKvPG0ah39HaCS8620RYm16W1hbGNEMj3c&_nc_zt=23&_nc_ht=scontent.fbkk5-1.fna&_nc_gid=WgqZRfL7li2__5DB_Z3nrg&_nc_ss=7a32e&oh=00_Afx65qexK9_qeq-N1_WjDIw9zDqOiXwWv1S_13kSZkOjcQ&oe=69C83268',
  },
  {
    id: 2,
    name: 'หมูกะทะชุดใหญ่',
    description: 'Roast beef with Yorkshire pudding, roast potatoes, and seasonal vegetables',
    price: 300,
    category: 'หมูกะทะ',
    image: 'https://scontent.fbkk5-1.fna.fbcdn.net/v/t39.30808-6/654422608_122114432535236814_6273855305036585792_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_ohc=lgOzVa3BajAQ7kNvwFmMKjo&_nc_oc=AdoXbyRhciQc7bLOS_Nj98ODuEVIw3HlowfqyzouGdavdmL9chZBw3FKvPG0ah39HaCS8620RYm16W1hbGNEMj3c&_nc_zt=23&_nc_ht=scontent.fbkk5-1.fna&_nc_gid=WgqZRfL7li2__5DB_Z3nrg&_nc_ss=7a32e&oh=00_Afx65qexK9_qeq-N1_WjDIw9zDqOiXwWv1S_13kSZkOjcQ&oe=69C83268',
  },
  {
    id: 3,
    name: 'หมูกะทะชุดใหญ่รวมเนื้อ',
    description: 'Minced beef in rich gravy topped with creamy mashed potato',
    price: 350,
    category: 'หมูกะทะ',
    image: 'https://scontent.fbkk5-7.fna.fbcdn.net/v/t39.30808-6/641363536_122109408567236814_9168784001652292715_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=x_ztda4-CmwQ7kNvwGvTr4o&_nc_oc=Adrlbo4_-3kmJnky_scEBhjvFbJd6ctNrwvBC0pbu1yY59vyOJYLUa1jQQIVFb-jxwMwNzAL3acqqPZ07mgWplHl&_nc_zt=23&_nc_ht=scontent.fbkk5-7.fna&_nc_gid=N86rQtO89fH5LDZ2eYPWYw&_nc_ss=7a32e&oh=00_Afz5vxEuKSYtGAwa3E0-HO8TN02-vUNVRDvAxPyOTUUsLA&oe=69C84026',
  },
  {
    id: 4,
    name: 'เฟรนซ์ฟรายส์',
    description: 'Cumberland sausages with creamy mash and onion gravy',
    price: 50,
    category: 'ของทานเล่น',
    image: 'https://www.kuchpakrahahai.in/wp-content/uploads/2023/05/Air-fryer-french-fries-recipe.jpg',
  },
  {
    id: 5,
    name: 'ปีกไก่ทอด',
    description: 'Traditional pasty filled with beef, potato, swede, and onion',
    price: 80,
    category: 'ของทานเล่น',
    image: 'https://scontent.fbkk5-5.fna.fbcdn.net/v/t39.30808-6/647314098_122111126715236814_6234166172198969799_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=GTwqXlGJ5rQQ7kNvwEMc9GT&_nc_oc=AdrJqcPqGBQWHLuVdJ0dDlnHXfDPnWyGGPbbbkXhKlZjCiZ9Pw_64SefDhozvX33o4NX_hhsb-1tbKrjI4W9scS6&_nc_zt=23&_nc_ht=scontent.fbkk5-5.fna&_nc_gid=_Ddx5ULFKGurAkXtkfFh-Q&_nc_ss=7a32e&oh=00_Afwzx2YGknJymEa4saq6G2OOqpcPOxQqFo5b6XKfsayYBA&oe=69C82B74',
  },
  {
    id: 6,
    name: 'เม็ดมะม่วงหิมพรานต์',
    description: 'Warm sponge cake with toffee sauce and vanilla ice cream',
    price: 100,
    category: 'ของทานเล่น',
    image: 'https://filebroker-cdn.lazada.co.th/kf/S867f555bed8d41f79995c363ba638775C.jpg',
  },
  {
    id: 7,
    name: 'เนื้อแดดเดียว',
    description: 'Crushed meringue, strawberries, and whipped cream',
    price: 100,
    category: 'ของทานเล่น',
    image: 'https://img.wongnai.com/p/1920x0/2019/02/15/9424f3e55d214f6292c096b8855f21d3.jpg',
  },
  {
    id: 8,
    name: 'ไส้กรอกอีสาน',
    description: 'Scones with clotted cream, jam, and a pot of English tea',
    price: 70,
    category: 'ของทานเล่น',
    image: 'https://scontent.fbkk5-6.fna.fbcdn.net/v/t39.30808-6/632553228_122105415027236814_5350203416701215679_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=BtOm8hB-7vAQ7kNvwHy1LsI&_nc_oc=AdovD5YOiHVb1IdxEyUNcRYbeix3oYuuSEZQNKWRS9J1LEwpuowojvlJ_luz3HDcpelur45-wyvW8kvt7XHV-9Ga&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&_nc_gid=JnFWdY1vk_F8CVusXKeMRw&_nc_ss=7a32e&oh=00_Afyts4GAE-f55rBtMjOad-76St8JlCiOEDr93QQHEwFJxg&oe=69C84AB6',
  },
  {
    id: 9,
    name: 'ปูอัดซาชิมิ',
    description: 'Traditional pot of English breakfast tea',
    price: 120,
    category: 'ของทานเล่น',
    image: 'https://img.wongnai.com/p/1920x0/2021/04/15/edfeb47726054ebd9ecf7a58c57cb68e.jpg',
  },
  {
    id: 10,
    name: 'Pepsiเล็ก',
    description: '',
    price: 13,
    category: 'เมนูน้ำ',
    image: 'https://filebroker-cdn.lazada.co.th/kf/S2facb1ebcaff42c9be541c219303ee7bR.jpg'
  },
  {
    id: 11,
    name: 'Pepsiกลาง',
    description: '',
    price: 16,
    category: 'เมนูน้ำ',
    image: 'https://tse4.mm.bing.net/th/id/OIP.zJ0RMmHULR9NBj_xaCcsQQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 12,
    name: 'Pepsiใหญ่',
    description: '',
    price: 30,
    category: 'เมนูน้ำ',
    image: 'https://cf.shopee.co.th/file/9f12c72fb43744b3b55ce7e2b0e41f8b'
  },
  {
    id: 13,
    name: 'น้ำแข็ง',
    description: '',
    price: 20,
    category: 'เมนูน้ำ',
    image: 'https://media.istockphoto.com/id/1337387250/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B8%96%E0%B8%B1%E0%B8%87%E0%B9%82%E0%B8%A5%E0%B8%AB%E0%B8%B0%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A1%E0%B8%B5%E0%B8%81%E0%B9%89%E0%B8%AD%E0%B8%99%E0%B8%99%E0%B9%89%E0%B9%8D%E0%B8%B2%E0%B9%81%E0%B8%82%E0%B9%87%E0%B8%87%E0%B9%81%E0%B8%A2%E0%B8%81%E0%B8%9A%E0%B8%99%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7.jpg?s=612x612&w=0&k=20&c=FZWSfei1Wt0C-fda8irxkKvsVwoL6zxC6DuaMBxl2_c='
  },
  {
    id: 14,
    name: 'น้ำเปล่าขวดเล็ก',
    description: '',
    price: 10,
    category: 'เมนูน้ำ',
    image: 'https://scontent.fbkk5-1.fna.fbcdn.net/v/t39.30808-6/654422608_122114432535236814_6273855305036585792_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_ohc=lgOzVa3BajAQ7kNvwFmMKjo&_nc_oc=AdoXbyRhciQc7bLOS_Nj98ODuEVIw3HlowfqyzouGdavdmL9chZBw3FKvPG0ah39HaCS8620RYm16W1hbGNEMj3c&_nc_zt=23'
  },
  {
    id: 15,
    name: 'น้ำเปล่าขวดใหญ่',
    description: '',
    price: 20,
    category: 'เมนูน้ำ',
    image: 'https://scontent.fbkk5-1.fna.fbcdn.net/v/t39.30808-6/654422608_122114432535236814_6273855305036585792_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_ohc=lgOzVa3BajAQ7kNvwFmMKjo&_nc_oc=AdoXbyRhciQc7bLOS_Nj98ODuEVIw3HlowfqyzouGdavdmL9chZBw3FKvPG0ah39HaCS8620RYm16W1hbGNEMj3c&_nc_zt=23'
  },
  {
    id: 16,
    name: 'เบียร์สิงห์',
    description: '',
    price: 65,
    category: 'เบียร์',
    image: 'https://tse4.mm.bing.net/th/id/OIP.LF2ytdhftaJTUwqVyTa4yAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 17,
    name: 'เบียร์ช้าง',
    description: '',
    price: 75,
    category: 'เบียร์',
    image: 'https://th.bing.com/th/id/OIP.lFd4iy-78DQr5mtYfgna6wHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
];

export const categories = [
  'All',
  'หมูกะทะ',
  'ของทานเล่น',
  'เมนูน้ำ',
  'เบียร์',
];