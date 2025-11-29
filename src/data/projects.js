const projects = [
  {
    slug: "first",
    title: "First",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "intro",
        title: "Project Overview",
        text: "The First project explores the fundamentals of layout, color flow, and balance. It focuses on establishing a clean design direction and defining a modern aesthetic foundation.",
      },
      {
        id: "approach",
        title: "Design Approach",
        text: "We experimented with multiple layout variations and typography scales to achieve a harmonious visual hierarchy. The aim was to keep the interface light and effortless.",
      }
    ],
    infoPoints: [
      { percent: 5, text: "Intro — Establishing baseline grid and canvas" },
      { percent: 22, text: "Composition — Testing column widths and gutters" },
      { percent: 47, text: "Typography — Scale tests and line-length checks" },
      { percent: 73, text: "Color — Palette decisions and contrast checks" },
      { percent: 95, text: "Wrap-up — Final spacing and export-ready assets" },
    ],
  },

  {
    slug: "second",
    title: "Second",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "overview",
        title: "Concept",
        text: "The Second project focuses on refining composition techniques and experimenting with grid flexibility. The goal was to explore adaptive layout behaviors.",
      },
      {
        id: "method",
        title: "Methodology",
        text: "We introduced modular blocks that could be rearranged based on content needs. This allowed for scalability across device sizes.",
      },
    ],
    infoPoints: [
      { percent: 8, text: "Kickoff — Goals and constraints for grid behavior" },
      { percent: 30, text: "Breakpoints — Adaptive rules for small screens" },
      { percent: 55, text: "Modules — Reusable blocks and composition swaps" },
      { percent: 78, text: "Edge cases — Long copy and media-heavy adjustments" },
      { percent: 92, text: "Recommendations — Patterns to reuse across products" },
    ],
  },

  {
    slug: "third",
    title: "Third",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "overview",
        title: "Project Intent",
        text: "The Third project shifts focus to subtle motion and micro-interactions. The intention was to breathe life into otherwise static layouts.",
      },
      {
        id: "interaction",
        title: "Interaction Design",
        text: "Hover lifts, gentle fade-ins, and scroll-triggered transitions enhanced the storytelling and guided user attention effectively.",
      }
    ],
    infoPoints: [
      { percent: 3, text: "Micro-interactions — defining small motion vocabulary" },
      { percent: 28, text: "Hover — lift tests and shadow depth variations" },
      { percent: 50, text: "Scroll — reveal timing and stagger patterns" },
      { percent: 68, text: "Performance — throttling and GPU-friendly props" },
      { percent: 88, text: "Accessibility — reduced-motion and focus states" },
    ],
  },

  {
    slug: "fourth",
    title: "Fourth",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "overview",
        title: "Brief",
        text: "The Fourth project explores modular card systems designed to operate across grid layouts and variable content densities.",
      },
      {
        id: "structure",
        title: "Structure & Components",
        text: "We examined how varying card shapes, sizes, and ratios influence readability and user engagement.",
      },
    ],
    infoPoints: [
      { percent: 2, text: "Cards — baseline spacing and aspect ratio rules" },
      { percent: 25, text: "Variants — title-first vs. image-first layouts" },
      { percent: 49, text: "Density — compact vs. comfortable card spacing" },
      { percent: 66, text: "Media — handling mixed image and video content" },
      { percent: 90, text: "System — tokens for padding, radius and elevation" },
    ],
  },

  {
    slug: "fifth",
    title: "Fifth",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "goal",
        title: "Objective",
        text: "The Fifth project introduces storytelling sections that combine visual pacing with expressive typography.",
      },
      {
        id: "motion",
        title: "Motion System",
        text: "Scroll-based reveal animations were tested here, creating a rhythm and narrative progression through content.",
      }
    ],
    infoPoints: [
      { percent: 6, text: "Narrative — defining pacing and entry points" },
      { percent: 35, text: "Typography — expressive headings and rhythm" },
      { percent: 58, text: "Anchors — aligning visuals to narrative beats" },
      { percent: 80, text: "Flow — smoothing transitions between chapters" },
      { percent: 98, text: "Delivery — export guidelines and QA checks" },
    ],
  },

  {
    slug: "sixth",
    title: "Sixth",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "intro",
        title: "Starting Point",
        text: "The Sixth project focuses on image-heavy layouts, ensuring the visuals guide the emotional direction of the page.",
      },
      {
        id: "composition",
        title: "Composition Strategy",
        text: "Proper spacing and controlled image dimensions were critical to avoid overwhelming the layout.",
      },
    ],
    infoPoints: [
      { percent: 10, text: "Hero — image treatments and aspect handling" },
      { percent: 34, text: "Crop — focal-point preservation on resize" },
      { percent: 57, text: "Lazy load — prioritized asset loading strategy" },
      { percent: 76, text: "Contrast — legibility over images and overlays" },
      { percent: 95, text: "Export — optimized image sizes and formats" },
    ],
  },

  {
    slug: "seventh",
    title: "Seventh",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "overview",
        title: "Exploration",
        text: "The Seventh project experimented with dark–light contrast and depth layering using shadows and highlights.",
      },
      {
        id: "depth",
        title: "Depth Treatments",
        text: "Soft shadows and subtle elevation changes were used to add dimensionality without being distracting.",
      },
    ],
    infoPoints: [
      { percent: 5, text: "Contrast — baseline dark/light token decisions" },
      { percent: 29, text: "Elevation — subtle shadow scale and opacity" },
      { percent: 52, text: "Layering — z-index patterns and clipping" },
      { percent: 74, text: "Highlights — small specular touches and glows" },
      { percent: 97, text: "Polish — final color balance and tone mapping" },
    ],
  },

  {
    slug: "eighth",
    title: "Eighth",
    hero: "https://cdn.jsdelivr.net/gh/aayush-agarwal-07/assets@main/sara-wholesome-food.jpg",
    sections: [
      {
        id: "overview",
        title: "Final Phase",
        text: "The Eighth project combined all previous concepts — typography, grid behavior, motion, and visual pacing — into one blended layout.",
      },
      {
        id: "polish",
        title: "Final Polish",
        text: "The finishing touches included smoothing animation curves, refining spacing, and ensuring responsive perfection.",
      },
    ],
    infoPoints: [
      { percent: 7, text: "Synthesis — combining prior patterns into a single system" },
      { percent: 38, text: "Harmony — balancing type, motion, and imagery" },
      { percent: 61, text: "Optimization — minimizing layout shifts and repaints" },
      { percent: 84, text: "Testing — cross-device and accessibility sweep" },
      { percent: 99, text: "Ship — final build checklist and handoff notes" },
    ],
  },
];

export default projects;
