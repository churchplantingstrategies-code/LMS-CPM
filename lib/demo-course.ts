import { db } from "./db";

export const DEMO_COURSE_SLUG = "foundations-of-everyday-discipleship";

type QuizAttachment = {
  type: "quiz";
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

type ResourceAttachment = {
  type: "resource";
  name: string;
  url: string;
};

type LessonSeed = {
  title: string;
  slug: string;
  description: string;
  content: string;
  duration: number;
  isFree?: boolean;
  attachments?: Array<QuizAttachment | ResourceAttachment>;
  assignment?: {
    title: string;
    description: string;
  };
};

const heroImage = `/course-art/${DEMO_COURSE_SLUG}?scene=hero`;

function lessonImage(scene: string) {
  return `/course-art/${DEMO_COURSE_SLUG}?scene=${scene}`;
}

const modules: Array<{ title: string; description: string; lessons: LessonSeed[] }> = [
  {
    title: "Start With The Call",
    description: "Anchor discipleship in the way of Jesus and a repeatable weekly rhythm.",
    lessons: [
      {
        title: "Why Discipleship Still Matters",
        slug: "why-discipleship-still-matters",
        duration: 12,
        isFree: true,
        description: "A practical introduction to discipleship as a lifestyle, not a classroom event.",
        content: `
          <p>Discipleship is not information transfer alone. It is a daily pattern of becoming with Jesus, being formed by Scripture, and helping other people take a faithful next step.</p>
          <img src="${lessonImage("calling")}" alt="Discipleship pathway illustration" style="width:100%;border-radius:18px;margin:20px 0;" />
          <p>In this course, students move through a simple framework: encounter Christ, practice the way, and multiply through everyday leadership. Each lesson is short enough to finish in one sitting and practical enough to apply immediately.</p>
        `,
        attachments: [
          {
            type: "resource",
            name: "Weekly Discipleship Rhythm",
            url: lessonImage("resource-rhythm"),
          },
          {
            type: "quiz",
            question: "What is the core aim of discipleship in this course?",
            options: [
              "Collecting theological facts",
              "Becoming like Jesus and guiding others forward",
              "Finishing content as quickly as possible",
              "Memorizing a leadership script",
            ],
            answerIndex: 1,
            explanation: "The course frames discipleship as formation and multiplication, not just information retention.",
          },
        ],
      },
      {
        title: "Build A Sustainable Weekly Rhythm",
        slug: "build-a-sustainable-weekly-rhythm",
        duration: 14,
        description: "Design a simple rhythm of Scripture, prayer, reflection, and action.",
        content: `
          <p>A sustainable rhythm is better than an ambitious rhythm that collapses after one week. Build around repeatable actions: one Scripture reading plan, one prayer block, one conversation, and one act of service.</p>
          <img src="${lessonImage("rhythm")}" alt="Weekly rhythm board" style="width:100%;border-radius:18px;margin:20px 0;" />
          <p>Write your rhythm down. If it does not fit your calendar, it will not survive your calendar.</p>
        `,
        attachments: [
          {
            type: "quiz",
            question: "Which rhythm is most sustainable?",
            options: [
              "A detailed 4-hour plan you cannot repeat",
              "A repeatable weekly pattern you can keep",
              "No plan at all",
              "Only reacting to urgent ministry needs",
            ],
            answerIndex: 1,
            explanation: "Sustainability comes from repeatable habits that fit real life.",
          },
        ],
        assignment: {
          title: "Map Your Week",
          description: "Draft a one-week discipleship rhythm and identify one habit you will protect for the next 30 days.",
        },
      },
    ],
  },
  {
    title: "Lead With Scripture And Care",
    description: "Use Scripture, prayer, and pastoral attentiveness in every learning environment.",
    lessons: [
      {
        title: "Open Scripture For Real Change",
        slug: "open-scripture-for-real-change",
        duration: 16,
        description: "Guide learners from observation to obedience using short Scripture conversations.",
        content: `
          <p>Good Bible facilitation moves people from seeing the text clearly to obeying it concretely. Ask: What do you notice? What does this reveal about God? What will you do this week?</p>
          <img src="${lessonImage("scripture")}" alt="Open Bible with notes" style="width:100%;border-radius:18px;margin:20px 0;" />
          <p>Discipleship leaders do not need to dominate the room. They need to surface the truth, clarify the next response, and make space for accountability.</p>
        `,
        attachments: [
          {
            type: "resource",
            name: "Scripture Conversation Guide",
            url: lessonImage("resource-scripture"),
          },
          {
            type: "quiz",
            question: "What question best moves a student toward obedience?",
            options: [
              "What translation are you using?",
              "Which commentary sounds smartest?",
              "What will you do this week because of this text?",
              "How long did this passage take to write?",
            ],
            answerIndex: 2,
            explanation: "The best discipleship questions create action and accountability.",
          },
        ],
      },
      {
        title: "Pastoral Care In Small Moments",
        slug: "pastoral-care-in-small-moments",
        duration: 13,
        description: "Recognize common student needs and respond with care, prayer, and wise follow-up.",
        content: `
          <p>Pastoral care often happens in short moments: a hallway conversation, a check-in after class, or a prayer request that reveals deeper strain.</p>
          <img src="${lessonImage("care")}" alt="Pastoral care conversation" style="width:100%;border-radius:18px;margin:20px 0;" />
          <p>Listen carefully, reflect back what you heard, pray simply, and know when to escalate to a pastor or counselor.</p>
        `,
        attachments: [
          {
            type: "quiz",
            question: "What is the healthiest first response when a student shares a struggle?",
            options: [
              "Interrupt with your own story",
              "Listen, clarify, and pray with them",
              "Promise to solve it immediately",
              "Avoid the topic and move on",
            ],
            answerIndex: 1,
            explanation: "The goal is presence, clarity, prayer, and wise next steps.",
          },
        ],
      },
    ],
  },
  {
    title: "Multiply Through Action",
    description: "Turn insight into habits, mentoring, and measurable ministry follow-through.",
    lessons: [
      {
        title: "Turn Insight Into Practice",
        slug: "turn-insight-into-practice",
        duration: 15,
        description: "Use weekly commitments and reflection prompts to help learning stick.",
        content: `
          <p>Every lesson should end with a practical next step. Students remember what they practice, not what they almost intended to do.</p>
          <img src="${lessonImage("practice")}" alt="Practice plan board" style="width:100%;border-radius:18px;margin:20px 0;" />
          <p>Ask for one visible action, one person they will involve, and one date they will follow through.</p>
        `,
        attachments: [
          {
            type: "quiz",
            question: "What makes a next step useful?",
            options: [
              "It is concrete, scheduled, and visible",
              "It stays abstract and inspirational",
              "It depends on perfect motivation",
              "It avoids accountability",
            ],
            answerIndex: 0,
            explanation: "Application works best when it is specific enough to act on.",
          },
        ],
      },
      {
        title: "Commission Your First Disciplemaking Plan",
        slug: "commission-your-first-disciplemaking-plan",
        duration: 18,
        description: "Finish the course by building a 30-day disciplemaking plan you can actually lead.",
        content: `
          <p>Your final step is to convert everything you learned into a real 30-day plan. Choose a small group, a student, or a ministry team. Decide what rhythm you will lead, what outcomes you will watch, and how you will follow up.</p>
          <img src="${lessonImage("commission")}" alt="Commission plan illustration" style="width:100%;border-radius:18px;margin:20px 0;" />
          <p>Momentum grows when leaders move from content consumption to intentional care and multiplication.</p>
        `,
        attachments: [
          {
            type: "resource",
            name: "30-Day Disciplemaking Plan Template",
            url: lessonImage("resource-plan"),
          },
          {
            type: "quiz",
            question: "What is the final output of this demo course?",
            options: [
              "A private notebook only",
              "A 30-day disciplemaking plan you can lead",
              "A random list of ideas",
              "A finished payment receipt",
            ],
            answerIndex: 1,
            explanation: "The course ends with a concrete ministry plan, not just reflection.",
          },
        ],
        assignment: {
          title: "Final Ministry Plan",
          description: "Create your 30-day disciplemaking plan with one weekly rhythm, one measurable outcome, and one accountability partner.",
        },
      },
    ],
  },
];

export async function ensureDemoCourse() {
  const existing = await db.course.findUnique({
    where: { slug: DEMO_COURSE_SLUG },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  });

  if (existing) {
    return existing;
  }

  return db.course.create({
    data: {
      title: "Foundations of Everyday Discipleship",
      slug: DEMO_COURSE_SLUG,
      description:
        "A free demo course that walks students through a practical discipleship framework with visual lesson content, interactive quizzes, and trackable progress.",
      shortDesc: "Free demo course with images, quizzes, and measurable learning progress.",
      thumbnail: heroImage,
      price: 0,
      isPublished: true,
      isFeatured: true,
      level: "BEGINNER",
      language: "English",
      category: "Discipleship",
      tags: ["discipleship", "leadership", "spiritual-growth", "demo-course"],
      duration: modules.reduce((sum, module) => sum + module.lessons.reduce((inner, lesson) => inner + lesson.duration, 0), 0),
      metadata: {
        spotlight: "Student demo course",
        outcomes: [
          "Understand a weekly discipleship rhythm",
          "Practice Scripture-centered facilitation",
          "Build a 30-day disciplemaking plan",
        ],
      },
      modules: {
        create: modules.map((module, moduleIndex) => ({
          title: module.title,
          description: module.description,
          order: moduleIndex + 1,
          isPublished: true,
          lessons: {
            create: module.lessons.map((lesson, lessonIndex) => ({
              title: lesson.title,
              slug: lesson.slug,
              description: lesson.description,
              content: lesson.content,
              duration: lesson.duration,
              order: lessonIndex + 1,
              isPublished: true,
              isFree: lesson.isFree ?? false,
              attachments: lesson.attachments ?? [],
              assignments: lesson.assignment
                ? {
                    create: {
                      title: lesson.assignment.title,
                      description: lesson.assignment.description,
                    },
                  }
                : undefined,
            })),
          },
        })),
      },
    },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  });
}