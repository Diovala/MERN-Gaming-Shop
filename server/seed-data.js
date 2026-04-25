require('dotenv').config();
const mongoose = require('mongoose');
const { Category, Product, Admin } = require('./models/Models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ✅ XÓA TOÀN BỘ DỮ LIỆU CŨ TRƯỚC KHI SEED
    console.log('🗑️ Đang xóa dữ liệu cũ...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Đã xóa sạch categories và products');

    // ==================== 1. TẠO CATEGORIES ====================
    const categoriesData = [
      { name: 'Laptop Gaming', slug: 'laptop-gaming', isActive: true },
      { name: 'PC Gaming', slug: 'pc-gaming', isActive: true },
      { name: 'Linh kiện PC', slug: 'linh-kien-pc', isActive: true },
      { name: 'Màn hình', slug: 'man-hinh', isActive: true },
      { name: 'Bàn phím', slug: 'ban-phim', isActive: true },
      { name: 'Chuột', slug: 'chuot', isActive: true },
      { name: 'Tai nghe', slug: 'tai-nghe', isActive: true },
      { name: 'Ghế Gaming', slug: 'ghe-gaming', isActive: true },
      { name: 'Phụ kiện', slug: 'phu-kien', isActive: true }
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`✅ Đã tạo ${categories.length} danh mục`);

    // Lấy ID các categories
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // ==================== 2. TẠO PRODUCTS ====================
    const productsData = [
      // LAPTOP GAMING
      {
        name: 'ASUS ROG Strix G15 G513',
        price: 35790000,
        discountPrice: 32990000,
        brand: 'ASUS',
        stock: 10,
        category: categoryMap['Laptop Gaming'],
        images: ['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600'],
        specs: [
          { k: 'CPU', v: 'AMD Ryzen 7 5800H' },
          { k: 'RAM', v: '16GB DDR4' },
          { k: 'GPU', v: 'RTX 3060 6GB' },
          { k: 'Ổ cứng', v: '512GB SSD NVMe' },
          { k: 'Màn hình', v: '15.6" FHD 144Hz' }
        ],
        isActive: true
      },
      {
        name: 'MSI Katana GF66',
        price: 28990000,
        discountPrice: 0,
        brand: 'MSI',
        stock: 8,
        category: categoryMap['Laptop Gaming'],
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
        specs: [
          { k: 'CPU', v: 'Intel Core i7-11800H' },
          { k: 'RAM', v: '16GB DDR4' },
          { k: 'GPU', v: 'RTX 3050Ti 4GB' },
          { k: 'Ổ cứng', v: '512GB SSD' },
          { k: 'Màn hình', v: '15.6" FHD 144Hz' }
        ],
        isActive: true
      },
      {
        name: 'Lenovo Legion 5 Pro',
        price: 42990000,
        discountPrice: 39990000,
        brand: 'Lenovo',
        stock: 5,
        category: categoryMap['Laptop Gaming'],
        images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600'],
        specs: [
          { k: 'CPU', v: 'AMD Ryzen 7 5800H' },
          { k: 'RAM', v: '32GB DDR4' },
          { k: 'GPU', v: 'RTX 3070 8GB' },
          { k: 'Ổ cứng', v: '1TB SSD' },
          { k: 'Màn hình', v: '16" 2K 165Hz' }
        ],
        isActive: true
      },

      // PC GAMING
      {
        name: 'PC Gaming ASUS ROG',
        price: 45990000,
        discountPrice: 42990000,
        brand: 'ASUS',
        stock: 3,
        category: categoryMap['PC Gaming'],
        images: ['https://images.unsplash.com/photo-1587202372634-32705e3e568e?w=600'],
        specs: [
          { k: 'CPU', v: 'Intel Core i9-12900K' },
          { k: 'Mainboard', v: 'ASUS ROG Z690' },
          { k: 'RAM', v: '32GB DDR5' },
          { k: 'GPU', v: 'RTX 3080 10GB' },
          { k: 'Ổ cứng', v: '1TB SSD + 2TB HDD' },
          { k: 'Nguồn', v: '850W 80 Plus Gold' }
        ],
        isActive: true
      },
      {
        name: 'PC Gaming MSI',
        price: 35990000,
        discountPrice: 0,
        brand: 'MSI',
        stock: 5,
        category: categoryMap['PC Gaming'],
        images: ['https://images.unsplash.com/photo-1555617778-02518510b9fa?w=600'],
        specs: [
          { k: 'CPU', v: 'Intel Core i7-12700K' },
          { k: 'Mainboard', v: 'MSI Z690' },
          { k: 'RAM', v: '16GB DDR4' },
          { k: 'GPU', v: 'RTX 3060Ti 8GB' },
          { k: 'Ổ cứng', v: '512GB SSD' },
          { k: 'Nguồn', v: '650W 80 Plus' }
        ],
        isActive: true
      },

      // MÀN HÌNH
      {
        name: 'Màn hình ASUS ROG 27"',
        price: 12990000,
        discountPrice: 11490000,
        brand: 'ASUS',
        stock: 15,
        category: categoryMap['Màn hình'],
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'],
        specs: [
          { k: 'Kích thước', v: '27 inch' },
          { k: 'Độ phân giải', v: '2K (2560x1440)' },
          { k: 'Tần số quét', v: '165Hz' },
          { k: 'Tấm nền', v: 'IPS' },
          { k: 'Thời gian phản hồi', v: '1ms' }
        ],
        isActive: true
      },
      {
        name: 'Màn hình LG UltraGear 32"',
        price: 15990000,
        discountPrice: 0,
        brand: 'LG',
        stock: 8,
        category: categoryMap['Màn hình'],
        images: ['https://images.unsplash.com/photo-1527443060892-b83a8f8c9d9c?w=600'],
        specs: [
          { k: 'Kích thước', v: '32 inch' },
          { k: 'Độ phân giải', v: '4K UHD' },
          { k: 'Tần số quét', v: '144Hz' },
          { k: 'Tấm nền', v: 'IPS' },
          { k: 'HDR', v: 'HDR10' }
        ],
        isActive: true
      },

      // BÀN PHÍM
      {
        name: 'Bàn phím Corsair K70',
        price: 3990000,
        discountPrice: 3490000,
        brand: 'Corsair',
        stock: 20,
        category: categoryMap['Bàn phím'],
        images: ['https://images.unsplash.com/photo-1595225476474-875641b6616d?w=600'],
        specs: [
          { k: 'Loại switch', v: 'Cherry MX Red' },
          { k: 'LED', v: 'RGB' },
          { k: 'Kết nối', v: 'USB' },
          { k: 'Bố cục', v: 'Full-size' }
        ],
        isActive: true
      },
      {
        name: 'Bàn phím Razer BlackWidow',
        price: 4590000,
        discountPrice: 0,
        brand: 'Razer',
        stock: 12,
        category: categoryMap['Bàn phím'],
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'],
        specs: [
          { k: 'Loại switch', v: 'Razer Green' },
          { k: 'LED', v: 'Chroma RGB' },
          { k: 'Kết nối', v: 'USB' },
          { k: 'Bố cục', v: 'Full-size' }
        ],
        isActive: true
      },

      // CHUỘT
      {
        name: 'Chuột Logitech G Pro X',
        price: 2490000,
        discountPrice: 2190000,
        brand: 'Logitech',
        stock: 25,
        category: categoryMap['Chuột'],
        images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600'],
        specs: [
          { k: 'Cảm biến', v: 'HERO 25K' },
          { k: 'DPI', v: '25,600' },
          { k: 'Kết nối', v: 'Wireless' },
          { k: 'Trọng lượng', v: '80g' }
        ],
        isActive: true
      },
      {
        name: 'Chuột Razer DeathAdder V2',
        price: 1890000,
        discountPrice: 0,
        brand: 'Razer',
        stock: 30,
        category: categoryMap['Chuột'],
        images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600'],
        specs: [
          { k: 'Cảm biến', v: 'Focus+ 20K' },
          { k: 'DPI', v: '20,000' },
          { k: 'Kết nối', v: 'USB-C' },
          { k: 'Trọng lượng', v: '82g' }
        ],
        isActive: true
      },

      // TAI NGHE
      {
        name: 'Tai nghe HyperX Cloud II',
        price: 2290000,
        discountPrice: 1990000,
        brand: 'HyperX',
        stock: 18,
        category: categoryMap['Tai nghe'],
        images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600'],
        specs: [
          { k: 'Driver', v: '53mm' },
          { k: 'Kết nối', v: 'USB + 3.5mm' },
          { k: 'Micro', v: 'Có thể tháo rời' },
          { k: 'Âm thanh', v: '7.1 Surround' }
        ],
        isActive: true
      },
      {
        name: 'Tai nghe SteelSeries Arctis 7',
        price: 3490000,
        discountPrice: 0,
        brand: 'SteelSeries',
        stock: 10,
        category: categoryMap['Tai nghe'],
        images: ['https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=600'],
        specs: [
          { k: 'Driver', v: '40mm' },
          { k: 'Kết nối', v: 'Wireless 2.4GHz' },
          { k: 'Pin', v: '24 giờ' },
          { k: 'Micro', v: 'ClearCast' }
        ],
        isActive: true
      }
    ];

    const products = await Product.insertMany(productsData);
    console.log(`✅ Đã tạo ${products.length} sản phẩm`);

    console.log('\n📊 TÓM TẮT:');
    console.log(`   - ${categories.length} danh mục`);
    console.log(`   - ${products.length} sản phẩm`);
    console.log('\n🎉 HOÀN THÀNH! Refresh trang web để xem kết quả.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

seedData();