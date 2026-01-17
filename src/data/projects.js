const projects = [
  {
    slug: "arata",
    title: "Arata",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/arata-final-1.jpg",
    sections: [
      {
        id: "intro",
        title: "",
        text: "Arata’s rebranding redefines how the brand speaks—simpler, warmer, and more intuitive. The new system focuses on clear, emotionally resonant naming that’s easy to say, easy to remember, and built to scale across categories. By moving away from overly clinical, complex, or trend-led language, Arata creates a cohesive, gender-neutral portfolio that feels confident yet approachable—designed to connect seamlessly with modern Indian consumers while staying future-ready.",
      },
    ],
    infoPoints: [
      { percent: 0, text: "Let's get scroll to your left" },
      { percent: 5, text: "Intro — Establishing baseline grid and canvas" },
      { percent: 22, text: "Composition — Testing column widths and gutters" },
      { percent: 47, text: "Typography — Scale tests and line-length checks" },
      { percent: 73, text: "Color — Palette decisions and contrast checks" },
      { percent: 95, text: "Wrap-up — Final spacing and export-ready assets" },
    ],
  },

  {
    slug: "sara",
    title: "Sara",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "overview",
        title: "",
        text: "A comprehensive brand and packaging project for Sara’s Wholesome Food, focused on creating a warm, trustworthy, and nutrition-forward identity for pet food. The project involved developing a cohesive visual system across packaging, digital assets, and communication touchpoints, balancing ingredient transparency with approachability. The design language uses earthy tones, bold color coding, and clear hierarchy to simplify product selection while reinforcing freshness, quality, and care. The outcome is a scalable brand system that feels wholesome, premium, and emotionally reassuring for pet parents.",
      },
    ],
    infoPoints: [
      { percent: 0, text: "Let's get scroll to your left" },
      { percent: 8, text: "Kickoff — Goals and constraints for grid behavior" },
      { percent: 30, text: "Breakpoints — Adaptive rules for small screens" },
      { percent: 55, text: "Modules — Reusable blocks and composition swaps" },
      {
        percent: 78,
        text: "Edge cases — Long copy and media-heavy adjustments",
      },
      {
        percent: 92,
        text: "Recommendations — Patterns to reuse across products",
      },
    ],
  },

  {
    slug: "dashdog",
    title: "Dash Dog",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/dash-dog.png",
    sections: [
      {
        id: "overview",
        title: "",
        text: "A bold brand identity and visual system created for Dash Dog, designed to capture energy, movement, and adventure in the pet accessories category. The project focused on building a distinctive, high contrast design language that reflects an active lifestyle while remaining functional and informative. Through expressive illustration, dynamic color gradients, and modular layouts, the system clearly communicates product benefits, safety features, and use cases across harnesses, leashes, and accessories. The result is a cohesive, scalable brand experience that balances playfulness with performance, positioning Dash Dog as a confident, outdoor first brand for modern dog parents.",
      },
    ],
    infoPoints: [
      { percent: 0, text: "Let's get scroll to your left" },
      {
        percent: 3,
        text: "Micro-interactions — defining small motion vocabulary",
      },
      { percent: 28, text: "Hover — lift tests and shadow depth variations" },
      { percent: 50, text: "Scroll — reveal timing and stagger patterns" },
      { percent: 68, text: "Performance — throttling and GPU-friendly props" },
      { percent: 88, text: "Accessibility — reduced-motion and focus states" },
    ],
  },

  {
    slug: "aiwork",
    title: "AI Work",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/ai-work-new-2.jpg",
    sections: [
      {
        id: "overview",
        title: "",
        text: "A series of high-resolution AI visuals created to explore scalable content production for beauty and lifestyle brands. This project leveraged a multi-channel AI workflow using Pinterest for visual direction and mood mapping, ChatGPT for prompt engineering and creative logic, and Google Studio for refinement and consistency. The focus was on achieving photorealistic textures, accurate product representation, and emotionally resonant lifestyle moments, while maintaining brand coherence across models, lighting, and surfaces. The outcome demonstrates how AI can be used not as a shortcut, but as a strategic design tool to rapidly generate premium, production ready visual assets.",
      },
    ],
    infoPoints: [
      { percent: 0, text: "Let's get scroll to your left" },
      { percent: 2, text: "Cards — baseline spacing and aspect ratio rules" },
      { percent: 25, text: "Variants — title-first vs. image-first layouts" },
      { percent: 49, text: "Density — compact vs. comfortable card spacing" },
      { percent: 66, text: "Media — handling mixed image and video content" },
      {
        percent: 90,
        text: "System — tokens for padding, radius and elevation",
      },
    ],
  },

  {
    slug: "superrange",
    title: "Super Range",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/serum-and-conditioner-new-2.jpg",
    sections: [
      {
        id: "goal",
        title: "",
        text: "The Fifth project introduces storytelling sections that combine visual pacing with expressive typography.",
      },
    ],
    infoPoints: [
      { percent: 0, text: "Let's get scroll to your left" },
      { percent: 6, text: "Narrative — defining pacing and entry points" },
      { percent: 35, text: "Typography — expressive headings and rhythm" },
      { percent: 58, text: "Anchors — aligning visuals to narrative beats" },
      { percent: 80, text: "Flow — smoothing transitions between chapters" },
      { percent: 98, text: "Delivery — export guidelines and QA" },
    ],
  },

  {
    slug: "campaigns",
    title: "Campaigns",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/campaign-final-1.jpg",
    sections: [
      {
        id: "overview",
        title: "",
        text: "The Eighth project combined all previous concepts — typography, grid behavior, motion, and visual pacing — into one blended layout.",
      },
    ],
    infoPoints: [
      { percent: 0, text: "Let's get scroll to your left" },
      {
        percent: 7,
        text: "Synthesis — combining prior patterns into a single system",
      },
      { percent: 38, text: "Harmony — balancing type, motion, and imagery" },
      {
        percent: 61,
        text: "Optimization — minimizing layout shifts and repaints",
      },
      { percent: 84, text: "Testing — cross-device and accessibility sweep" },
      { percent: 99, text: "Ship — final build checklist and handoff notes" },
    ],
  },
  {
    slug: "bau",
    title: "BAU",
    hero: [
      {
        type: "image",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/slide-1-final.jpg",
      },

      {
        type: "image",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/slide-3.jpg",
      },

      {
        type: "video",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/video-5-final.mp4",
      },
      {
        type: "image",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/slide-6.jpg",
      },

      {
        type: "image",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/slide-9.jpg",
      },
      {
        type: "video",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/video-10.mp4",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "",
        text: "Led day-to-day BAU design operations across digital platforms, delivering high-impact website banners, campaign creatives, motion graphics, and performance ads. Owned the end-to-end creative process from concept to execution, ensuring brand consistency and performance alignment. Showcased detailed process videos in the folio to highlight ideation, iterations, and problem-solving approach, while mentoring junior designers and maintaining fast turnaround timelines.",
      },
    ],
    infoPoints: [
      { percent: 0, text: "Let's get scroll to your left" },
      {
        percent: 7,
        text: "Synthesis — combining prior patterns into a single system",
      },
      { percent: 38, text: "Harmony — balancing type, motion, and imagery" },
      {
        percent: 61,
        text: "Optimization — minimizing layout shifts and repaints",
      },
      { percent: 84, text: "Testing — cross-device and accessibility sweep" },
      { percent: 99, text: "Ship — final build checklist and handoff notes" },
    ],
  },
  {
    slug: "kurkure",
    title: "Kurkure",
    hero: [
      {
        type: "video",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/kurkure-1.mp4",
      },
      {
        type: "video",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/kurkure-2.mp4",
      },
      {
        type: "video",
        src: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/kurkure-3.mp4",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "",
        text: "An end-to-end motion graphics campaign for Kurkure’s Diwali festival, built around the idea of transforming khayal into chatpata hai. The concept was translated into a festive visual language using bold motion, rhythmic pacing, and Diwali-inspired elements to enhance brand recall and connect with Indian audiences in a celebratory context.",
      },
    ],
    infoPoints: [
      { percent: 0, text: "Let's get scroll to your left" },
      {
        percent: 7,
        text: "Synthesis — combining prior patterns into a single system",
      },
      { percent: 38, text: "Harmony — balancing type, motion, and imagery" },
      {
        percent: 61,
        text: "Optimization — minimizing layout shifts and repaints",
      },
      { percent: 84, text: "Testing — cross-device and accessibility sweep" },
      { percent: 99, text: "Ship — final build checklist and handoff notes" },
    ],
  },
];

export default projects;
