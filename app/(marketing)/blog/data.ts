export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-build-a-daily-discipleship-rhythm",
    title: "How To Build a Daily Discipleship Rhythm",
    excerpt:
      "A practical framework for creating consistent spiritual habits without burnout.",
    content:
      "Daily discipleship is less about intensity and more about consistency. Start with one small non-negotiable: 15 minutes of scripture, reflection, and prayer. Add structure by pairing it with a fixed trigger in your routine, such as after breakfast or before sleep. Track weekly, not daily, to reduce guilt and focus on direction over perfection.",
    author: "Church Planting Movement Team",
    date: "2026-03-10",
    category: "Growth",
    readTime: "5 min read",
  },
  {
    slug: "leading-small-groups-with-better-engagement",
    title: "Leading Small Groups With Better Engagement",
    excerpt:
      "Simple facilitation strategies that help every member participate meaningfully.",
    content:
      "Engagement improves when leaders ask better questions and shorten monologues. Use a 3-part flow: open with a story, discuss with guided prompts, and close with one concrete action. Keep groups between 6 and 12 participants, rotate speaking order, and create safety by normalizing honest questions.",
    author: "Pastor Daniel Cruz",
    date: "2026-02-27",
    category: "Leadership",
    readTime: "7 min read",
  },
  {
    slug: "measuring-learning-progress-in-online-ministry",
    title: "Measuring Learning Progress in Online Ministry",
    excerpt:
      "What to track beyond completions: retention, discussion quality, and applied outcomes.",
    content:
      "Completion rate alone can hide weak learning outcomes. Track a balanced scorecard: lesson completion, assessment confidence, meaningful discussion participation, and practical application reports. Review trends monthly and adjust content pacing based on drop-off points.",
    author: "Anna Reyes",
    date: "2026-02-15",
    category: "Analytics",
    readTime: "6 min read",
  },
];
