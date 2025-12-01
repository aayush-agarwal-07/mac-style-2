const brands = [
  {
    src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/arata-1.png",
    alt: "Arata",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/bannstudio-1.png",
    alt: "Bann Studio",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/bombay_shaving_company-1.png",
    alt: "Bombay Shaving Company",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/huft-1.png",
    alt: "Heads Up For Tails",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/pilgrim-1.png",
    alt: "Pilgrim",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/suhaag.png",
    alt: "Suhaag",
  },
];

export default function BrandsMarquee() {
  return (
    <div className="about-brands">
      <div className="marquee-track">
        {brands.map((brand, index) => (
          <article className="brand-card" key={`brand-${index}`}>
            <img src={brand.src} alt={brand.alt} />
          </article>
        ))}

        {brands.map((brand, index) => (
          <article
            className="brand-card"
            key={`brand-dup-${index}`}
            aria-hidden="true"
          >
            <img src={brand.src} alt={brand.alt} />
          </article>
        ))}
      </div>
    </div>
  );
}
