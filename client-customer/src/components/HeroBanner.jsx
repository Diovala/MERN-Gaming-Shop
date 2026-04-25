import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ✅ Import Link để điều hướng

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
      title: 'LAPTOP GAMING CAO CẤP',
      subtitle: 'Giảm giá đến 30% - Chỉ trong tuần này!'
    },
    {
      image: 'https://images.unsplash.com/photo-1587202372634-32705e3e568e?w=1200',
      title: 'PC GAMING CUSTOM',
      subtitle: 'Build PC theo yêu cầu - Cấu hình mạnh nhất'
    },
    {
      image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200',
      title: 'PHỤ KIỆN GAMING',
      subtitle: 'Chuột, Bàn phím, Tai nghe - Chính hãng 100%'
    }
  ];

  // Tự động chuyển sau 5s
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Hàm chuyển Next
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  // ✅ Hàm chuyển Prev
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  return (
    <div className="hero-banner">
      {/* Nút Trái */}
      <button className="slider-arrow left" onClick={prevSlide}>❮</button>
      
      {/* Nút Phải */}
      <button className="slider-arrow right" onClick={nextSlide}>❯</button>

      {banners.map((banner, idx) => (
        <div 
          key={idx} 
          className={`banner-slide ${idx === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${banner.image})` }}
        >
          <div className="banner-content">
            <h2>{banner.title}</h2>
            <p>{banner.subtitle}</p>
            
            {/* Đổi button thành Link để cuộn xuống khu vực sản phẩm (id="product-grid") */}
            <Link to="/#product-grid" className="banner-btn">
              XEM NGAY
            </Link>
          </div>
        </div>
      ))}

      <div className="banner-dots">
        {banners.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${idx === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;