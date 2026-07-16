import { absoluteUrl } from "@/lib/site";

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readingMinutes: number;
  keywords: string[];
  /** Lead paragraph rendered above the article body. */
  lead: string;
  blocks: BlogBlock[];
  /** Optional cited source, shown in small print at the foot of the article. */
  source?: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "navigate-a-bad-manager",
    title: "You Don't Have to Navigate a Bad Manager Alone",
    excerpt:
      "A bad manager rarely ruins a career — isolation does. Karma Harb on the reporting relationship that pushed her out early, and what she'd tell anyone standing where she once stood.",
    category: "Careers & Managers",
    author: "Karma Harb",
    authorRole: "Founder of Humanly",
    publishedAt: "2026-07-16",
    readingMinutes: 6,
    keywords: [
      "bad manager",
      "toxic manager",
      "managed out",
      "letter of expectation",
      "second opinion",
      "workplace advice",
    ],
    lead:
      "A bad manager rarely ruins a career. Isolation does. The real damage in a toxic reporting relationship almost never comes from the manager's behavior alone. It comes from having no one to check your read against while it's happening. That gap is what pushes capable people to quietly leave jobs before they're ready, carrying self-doubt they never actually earned. This is the story of how that happened to me, and what I'd tell anyone standing where I once stood.",
    blocks: [
      { type: "h2", text: "The Story: A First-Time Manager and a Letter I Didn't Understand" },
      {
        type: "p",
        text: "Early in my career, I took a role as a Job Evaluation Consultant. I'd never worked in job evaluation before, and I was genuinely excited. It was a chance to build a skill I didn't have yet.",
      },
      {
        type: "p",
        text: "My manager was a first-time manager, close to retirement. Support was thin from day one. Assignments seemed to flow to a small circle of favorites I wasn't part of. I told myself this was probably just how a new role felt. Give it time.",
      },
      {
        type: "p",
        text: "Then I had a health situation and needed time away. When I came back, things didn't improve, they got worse. I was handed a letter of expectation and started to feel watched constantly, every task, every move. I didn't understand what that letter meant for my standing. And I didn't have a single person to ask.",
      },
      {
        type: "p",
        text: "So I did what a lot of people do. I put my head down, got demotivated, and left the moment something else came up.",
      },
      {
        type: "p",
        text: "That was about ten years ago. I was still early in my HR career, without the tools yet to recognize what was actually happening or how to respond to it. If it happened today, I'd know exactly what to do. Back then, I simply didn't — and that's a big part of why I couldn't solve it alone.",
      },

      { type: "h2", text: "The Real Problem Was Never the Manager" },
      {
        type: "p",
        text: "Looking back, my manager just wasn't equipped to manage well, especially not someone returning from a health situation. But that's not really what made the experience so hard.",
      },
      {
        type: "p",
        text: "The real problem was that I had no one to go to. Not a mentor. Not HR. Not even a peer who'd been there longer and could tell me whether a letter of expectation after health leave was normal, or something worth pushing back on. I had to interpret every signal alone, with nothing to measure it against.",
      },
      {
        type: "p",
        text: "That's a specific kind of hard. It's not just facing a difficult situation, it's facing a difficult situation with no one to help you make sense of it.",
      },

      { type: "h2", text: "What Isolation Actually Costs You" },
      {
        type: "p",
        text: "The cost wasn't dramatic. No one on the outside would have called it a crisis. I didn't lose my job. I wasn't managed out formally. I just left before I was ready to.",
      },
      {
        type: "p",
        text: "What I lost was depth. I went into that role wanting to actually learn job evaluation, and I left having only picked up pieces of it because I got out before I had the chance to go further.",
      },
      {
        type: "p",
        text: "I also left carrying a quiet embarrassment: the sense that I should have been able to handle it myself. That feeling outlasted the job by years.",
      },
      {
        type: "p",
        text: "None of that happened because I made a bad call at that moment. It happened because I was making every call alone, without anyone to think it through with, and without the experience yet to fully trust my own judgment.",
      },

      { type: "h2", text: "Why This Happens to So Many People" },
      {
        type: "p",
        text: "Most people who leave a role early because of a bad manager aren't lacking resilience or good judgment. They're lacking a second, informed opinion at the exact moment they need one.",
      },
      {
        type: "p",
        text: "This isn't just a personal anecdote. It's a well-documented pattern in workplace research. Gallup's landmark State of the American Manager report, based on engagement data from millions of employees across thousands of business units, found that managers account for at least 70% of the variance in team engagement scores. In plain terms: who you report to affects how you experience your job more than almost anything else about the company itself.",
      },
      {
        type: "p",
        text: "When you don't know who to go to for a second read, a few things start happening automatically:",
      },
      {
        type: "list",
        items: [
          "You assume discomfort is just something to push through, because you have nothing to measure it against.",
          "You start doubting your own read of the situation, because there's no one to confirm or challenge it.",
          "You end up making major decisions — stay or go — from a place of isolation instead of information.",
        ],
      },
      {
        type: "p",
        text: "None of that is a personal failing. It's just what happens when there's no one trustworthy in the picture, and you haven't yet had the years to build that judgment on your own.",
      },

      { type: "h2", text: "What I'd Tell Myself Now" },
      {
        type: "p",
        text: "If I could go back, I wouldn't tell myself to be tougher or wait it out longer. I'd tell myself to find someone outside the situation, someone with no stake in protecting the manager or the department — and just talk it through.",
      },
      {
        type: "p",
        text: "Not to file a complaint. Not to escalate. Just to get a second opinion on what I was seeing, so I wasn't the only one carrying that judgment call.",
      },

      { type: "h2", text: "The Fix Isn't a Formal Process. It's a Second Opinion." },
      {
        type: "p",
        text: "That's the gap I think about most in my work now. Not every workplace situation needs HR intervention or a formal complaint. Most of them just need someone to help you think clearly early enough that you still have real options, including the option to stay and actually get what you came for.",
      },
      {
        type: "p",
        text: "You shouldn't have to figure out whether your manager is failing you using nothing but your own uncertain read of the situation — especially before you've had the years of experience to fully trust that read. That's exactly the moment worth reaching out for support, long before things get anywhere near a letter of expectation.",
      },
      {
        type: "callout",
        text: "If any part of this sounds familiar, you don't have to sort it out solo. Book a confidential call with Humanly — no judgment, no report back to your employer, just a real second opinion from someone who's sat on both sides of the table.",
      },
    ],
    source: 'Gallup, "State of the American Manager: Analytics and Advice for Leaders" (2015).',
  },
];

export const blogCategories = [
  "All",
  ...Array.from(new Set(blogPosts.map((post) => post.category))),
];

export function getBlogPost(slug: string | null | undefined) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogUrl(post: BlogPost) {
  return absoluteUrl(`/blog/${post.slug}`);
}

export function formatBlogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
