import { Icons } from "@/components";

export const perks = [
  {
    icon: Icons.auth,
    title: "Sign Up",
    info: "Create your free account to get started with Themis.",
  },
  {
    icon: Icons.upload,
    title: "Customize",
    info: "Upload your documents and analyse and get insights",
  },
  {
    icon: Icons.save,
    title: "Save",
    info: "Save your analysis and insights for future reference.",
  },
];

export const features = [
  {
    icon: Icons.upload,
    title: "Document Analysis",
    info: "Upload and analyze legal documents",
  },
  {
    icon: Icons.bot,
    title: "Legal Q&A",
    info: "Get answers to complex legal questions",
  },
  {
    icon: Icons.file,
    title: "Document Generation",
    info: "Create legal documents from templates",
  },
  {
    icon: Icons.search,
    title: "Automated Document Review",
    info: "Extract key information, detect inconsistencies, and redact sensitive data",
  },
  {
    icon: Icons.filePen,
    title: "Legal Case Law Summarization",
    info: "Generate summaries, analyze citations, and identify key precedents",
  },
  {
    icon: Icons.barChart,
    title: "Legal Insights & Analytics",
    info: "Analyze trends, assess contract risks, and visualize performance metrics",
  },
];

export const pricingCards = [
  {
    title: "Basic",
    description: "For individual legal professionals",
    price: "Free",
    duration: "",
    highlight: "Core legal tools",
    buttonText: "Start for free",
    features: [
      "Up to 5 document uploads per month",
      "Basic document analysis",
      "Limited Q&A functionality",
      "Basic case law summarization",
      "Single user account"
    ],
    priceId: "",
  },
  {
    title: "Professional",
    description: "For small legal practices",
    price: "$20",
    duration: "month",
    highlight: "Enhanced legal toolkit",
    buttonText: "Upgrade to Pro",
    features: [
      "Up to 100 document uploads per month",
      "Advanced document review & analysis",
      "Full Q&A with IPC database access",
      "Comprehensive case summarization",
      "Up to 5 team members",
      "Document drafting assistance"
    ],
    priceId: "price_1OYxkqFj9oKEERu1KfJGWxgN",
  },
  {
    title: "Enterprise",
    description: "For law firms and legal departments",
    price: "$100",
    duration: "month",
    highlight: "Complete legal solution",
    buttonText: "Contact Sales",
    features: [
      "Unlimited document management",
      "Advanced analytics & insights dashboard",
      "Customizable AI training on firm precedents",
      "Full integration with legal databases",
      "Unlimited team members",
      "Priority 24/7 support",
      "Custom workflow automation"
    ],
    priceId: "price_1OYxkqFj9oKEERu1NbKUxXxN",
  },
];

// export const bentoCards = [
//   {
//     title: "Start with Inspiration",
//     info: "Browse our vast library of pre-designed templates or upload your own images.",
//     imgSrc: "/assets/bento-1.svg", // Lightbulb or Inspiration icon
//     alt: "Inspiration for website creation",
//   },
//   {
//     title: "AI Assists Your Vision",
//     info: "Our intelligent AI tailors suggestions and functionalities based on your goals.",
//     imgSrc: "/assets/bento1.svg", // AI Assistant icon
//     alt: "AI website building assistant",
//   },
//   {
//     title: "Drag & Drop Customization",
//     info: "Effortlessly personalize your website with our intuitive drag-and-drop editor.",
//     imgSrc: "/assets/bento1.svg", // Drag and Drop icon or hand editing a website
//     alt: "Website customization with drag and drop",
//   },
//   {
//     title: "Launch & Shine Online",
//     info: "Publish your website with a single click and take your brand to the world.",
//     imgSrc: "/assets/bento1.svg", // Rocket launching or website going live
//     alt: "Website launch and publication",
//   },
// ];

export const reviews = [
  {
    name: "Sarah M.",
    username: "@sarahlaw",
    body: "Themis has transformed how I handle client documents. The automated review feature saved me countless hours on my last case.",
  },
  {
    name: "Daniel Chen",
    username: "@dchen_legal",
    body: "The case law summarization is incredibly accurate. It helped me identify precedents I might have missed otherwise.",
  },
  {
    name: "Priya Sharma",
    username: "@priyalawyer",
    body: "As a solo practitioner, Themis gives me capabilities that usually only big firms have. Document analysis is spot-on.",
  },
  {
    name: "Robert Wilson",
    username: "@rwilson",
    body: "Our firm's efficiency increased by 30% after implementing Themis. The Q&A feature with IPC database access is invaluable.",
  },
  {
    name: "Maya Johnson",
    username: "@maya_counsel",
    body: "The contract risk assessment saved our client from a potentially costly oversight. This tool pays for itself.",
  },
  {
    name: "Thomas Rivera",
    username: "@tom_legal",
    body: "I was skeptical about AI for legal work, but Themis changed my mind. The document generation is precise and time-saving.",
  },
];
