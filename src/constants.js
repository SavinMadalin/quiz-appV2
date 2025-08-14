import {
  CodeBracketIcon, // Import necessary icons if defining categories locally
  ComputerDesktopIcon,
  ServerStackIcon,
  CloudIcon,
  CircleStackIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export const mainCategories = [
  {
    value: "core-languages",
    label: "Core Languages",
    icon: CodeBracketIcon,
    subcategories: [
      "java",
      "python",
      "javascript",
      "typescript",
      "sql",
      "go",
      "csharp",
    ],
  },
  {
    value: "frontend",
    label: "Frontend",
    icon: ComputerDesktopIcon,
    subcategories: ["react", "angular", "vue", "html-css"],
  },
  {
    value: "backend",
    label: "Backend",
    icon: ServerStackIcon,
    subcategories: ["nodejs", "spring", "django-flask", "api-rest"],
  },
  {
    value: "devops",
    label: "DevOps",
    icon: CloudIcon,
    subcategories: [], // No subcategories
  },
  {
    value: "cloud-engineer",
    label: "Cloud Engineer",
    icon: CloudIcon,
    subcategories: ["GCP", "AWS", "Azure"], // No subcategories
  },
  {
    value: "databases",
    label: "Databases",
    icon: CircleStackIcon,
    subcategories: [], // No subcategories
  },
  {
    value: "ai-ml",
    label: "AI/Machine Learning",
    icon: AcademicCapIcon,
    subcategories: ["ml-concepts", "python-ml", "deep-learning"],
  },
  {
    value: "mobile-development",
    label: "Mobile Development",
    icon: DevicePhoneMobileIcon,
    subcategories: ["kotlin", "swift", "flutter"],
  },
  {
    value: "qa-frameworks",
    label: "QA Frameworks",
    icon: CogIcon,
    subcategories: ["selenium", "cucumber", "testNG"],
  },
];

export const MOCK_INTERVIEW_QUESTIONS = 15;
export const CUSTOM_QUIZ_QUESTIONS = 10;
export const MOCK_INTERVIEW_TIME_SECONDS = 1200; // 20 minutes
