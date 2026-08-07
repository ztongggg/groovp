// Default skill suggestions — the union of every list that used to be
// hardcoded separately in signup, Edit Profile, Create Project, Recruiting
// Settings, Start a New Group, and Filter Panel. Used as the instant-paint
// fallback before the real (and growing) skill_catalog table loads, and as
// the server-side fallback if that table read ever fails.
export const DEFAULT_SKILLS = [
  "Python", "React", "TypeScript", "JavaScript", "Node.js", "SQL",
  "Figma", "UI/UX", "Java", "C++", "TensorFlow", "AWS", "Docker",
  "Research", "Product", "Design", "Business", "AI/ML", "FastAPI", "PyTorch",
];
