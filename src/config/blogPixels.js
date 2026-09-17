const BLOG_PIXELS = {
  "personal-loan": {
    pixelId: (import.meta.env.VITE_PIXEL_PERSONAL_LOAN_ID || "").trim(),
    blogId: "personal-loan-online-eligibility-check-apply",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "personal-loan-variant-2": {
    pixelId: (
      import.meta.env.VITE_PIXEL_PERSONAL_LOAN_VARIANT_2_ID || ""
    ).trim(),
    blogId: "personal-loan-online-apply-guide",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "aadhaar-loan": {
    pixelId: (import.meta.env.VITE_PIXEL_AADHAAR_LOAN_ID || "").trim(),
    blogId: "aadhaarpe-loan-online-eligibility-check-apply",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "aadhaar-loan-variant-2": {
    pixelId: (
      import.meta.env.VITE_PIXEL_AADHAAR_LOAN_VARIANT_2_ID || ""
    ).trim(),
    blogId: "aadhaarpe-loan-online-application-guide",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "car-loan": {
    pixelId: (import.meta.env.VITE_PIXEL_CAR_LOAN_ID || "").trim(),
    blogId: "car-loan-check-offers-apply-online",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "gold-loan": {
    pixelId: (import.meta.env.VITE_PIXEL_GOLD_LOAN_ID || "").trim(),
    blogId: "gold-loan-check-offers-apply-online",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "student-loan": {
    pixelId: (import.meta.env.VITE_PIXEL_STUDENT_LOAN_ID || "").trim(),
    blogId: "student-loan-education-finance-options",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "student-loan-variant-2": {
    pixelId: (
      import.meta.env.VITE_PIXEL_STUDENT_LOAN_VARIANT_2_ID || ""
    ).trim(),
    blogId: "student-loan-online-education-finance-guide",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "home-loan": {
    pixelId: (import.meta.env.VITE_PIXEL_HOME_LOAN_ID || "").trim(),
    blogId: "home-loan-housing-finance-options",
    language: "hi",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "personal-loan-english": {
    pixelId: (import.meta.env.VITE_PIXEL_PERSONAL_LOAN_ENGLISH_ID || "").trim(),
    blogId: "personal-loan-online-check-eligibility-apply",
    language: "en",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "personal-loan-english-variant-2": {
    pixelId: (
      import.meta.env.VITE_PIXEL_PERSONAL_LOAN_ENGLISH_VARIANT_2_ID || ""
    ).trim(),
    blogId: "personal-loan-online-application-guide",
    language: "en",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "aadhaar-loan-english": {
    pixelId: (import.meta.env.VITE_PIXEL_AADHAAR_LOAN_ENGLISH_ID || "").trim(),
    blogId: "aadhaarpe-loan-online-check-eligibility-apply",
    language: "en",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "aadhaar-loan-english-variant-2": {
    pixelId: (
      import.meta.env.VITE_PIXEL_AADHAAR_LOAN_ENGLISH_VARIANT_2_ID || ""
    ).trim(),
    blogId: "aadhaarpe-loan-online-application-process-guide",
    language: "en",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "car-loan-english": {
    pixelId: (import.meta.env.VITE_PIXEL_CAR_LOAN_ENGLISH_ID || "").trim(),
    blogId: "car-loan-explore-financing-next-car",
    language: "en",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "gold-loan-english": {
    pixelId: (import.meta.env.VITE_PIXEL_GOLD_LOAN_ENGLISH_ID || "").trim(),
    blogId: "gold-loan-explore-options-against-gold",
    language: "en",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "student-loan-english": {
    pixelId: (import.meta.env.VITE_PIXEL_STUDENT_LOAN_ENGLISH_ID || "").trim(),
    blogId: "student-loan-explore-education-financing",
    language: "en",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
  "home-loan-english": {
    pixelId: (import.meta.env.VITE_PIXEL_HOME_LOAN_ENGLISH_ID || "").trim(),
    blogId: "home-loan-explore-financing-dream-home",
    language: "en",
    category: "",
    enabled: true,
    events: ["PageView"],
  },
};

export default BLOG_PIXELS;
