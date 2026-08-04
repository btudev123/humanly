import type { PortableTextBlock } from "@portabletext/types";
import { absoluteUrl } from "@/lib/site";

/**
 * Body text may carry inline links using markdown's `[label](/href)` form.
 *
 * An article that only links from a "keep going" block at the very bottom is a dead
 * end for most readers and for a crawler weighing the link in context. Writing the
 * link into the sentence that actually needs it — the PIP paragraph pointing at the
 * PIP guide, the "no one to go to" paragraph pointing at the earlier post — is what
 * makes internal linking work. `blocksToPortableText` turns these into real portable
 * text link marks, which `<Prose>` renders through `next/link` when they're internal.
 */
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
    slug: "fifteen-years-then-suddenly-a-problem",
    title: "Fifteen Years, Then Suddenly a Problem",
    excerpt:
      "A PIP is only ever as good as the standard sitting behind it. Karma Harb on the fifteen-year employee whose manager could never say what 'better' looked like — and the questions HR should ask before the countdown starts.",
    category: "Performance & PIPs",
    author: "Karma Harb",
    authorRole: "Founder of Humanly",
    publishedAt: "2026-08-04",
    readingMinutes: 8,
    keywords: [
      "pip",
      "performance improvement plan",
      "managed out",
      "performance management",
      "manager accountability",
      "hr support",
      "termination",
      "letter of expectation",
    ],
    lead:
      "A PIP is only ever as good as the standard sitting behind it. If a manager cannot say, in concrete and observable terms, what “better” looks like, the employee has been handed a test with no answer key and told to pass it. That isn't a performance plan — it's a setup. This is the story of someone who gave an organisation fifteen years and then, seemingly overnight, stopped being good at his job, and of the questions nobody asked until it was too late.",
    blocks: [
      {
        type: "p",
        text: "Let me tell you about someone. We'll call him Daniel, though that isn't his name, and I've changed enough of the details to keep confidentiality. The situation itself is real, and I suspect it will feel familiar to a lot of people who have spent time in HR.",
      },

      { type: "h2", text: "Fifteen Years, Then a Phone Call" },
      {
        type: "p",
        text: "Daniel had been with the company for fifteen years. Over that time he moved around: different teams, different functions, the kind of internal journey you only get when an organization values you enough to keep finding you a home. Then he landed in a new area, and within a few months I got the call.",
      },
      {
        type: "p",
        text: "It was his new manager. Daniel was underperforming, she told me, and she wanted to put him on a [Performance Improvement Plan](/resources/pip-response-strategy).",
      },
      {
        type: "p",
        text: "So I asked the obvious question: what specifically needs to improve? This is where it got interesting. “He needs to do this better,” she said. Better how? What does better actually look like? How is this “better” measured? She didn't have a clear answer. What came back was a softer, mumbled version of the same thing, a feeling more than a fact.",
      },
      {
        type: "p",
        text: "We moved forward with the PIP anyway. Three months, which is a short runway for turning real performance around. I delivered it to Daniel and walked both of them through what it actually means: not just a countdown for the employee, but an obligation on the manager to provide support, guidance, and any training he needed to succeed.",
      },
      {
        type: "p",
        text: "I checked in with her throughout. Every time, the answer was the same three words: “He's not improving.” Not “here's what we tried.” Not “here's where he's still getting stuck.” Just “he's not improving.”",
      },
      {
        type: "p",
        text: "At the end of the three months we sat down to weigh the options. She, and her seniors, had already reached their conclusion. They felt we needed to let him go.",
      },

      { type: "h2", text: "How Does Someone Stop Being Good at Their Job Overnight?" },
      {
        type: "p",
        text: "And I was left sitting with a question I couldn't shake: how does someone give an organization fifteen years, and then, seemingly overnight, stop being good at their job?",
      },
      {
        type: "p",
        text: "There are honest answers to that. Life happens. Illness, family, grief, the things people carry quietly into work and rarely mention. Sometimes the ground shifts underneath people: technology moves faster than the support around them, and a skills gap opens that nobody ever helped them close. Those explanations are real, and they deserve curiosity and care, not a countdown.",
      },
      {
        type: "p",
        text: "But there is another answer we don't like to say out loud. Sometimes the person doesn't change. The context did.",
      },

      { type: "h2", text: "A PIP Is Only as Good as the Standard Behind It" },
      {
        type: "p",
        text: "A PIP is only ever as good as the standard sitting behind it. If a manager cannot articulate what “better” looks like, then the employee has been handed a test with no answer key and told to pass it. That isn't a performance plan. It's a setup. If you've just been handed one, the [managed-out diagnostic](/resources/managed-out) is a free, ten-question way to work out which of the two you're actually holding.",
      },
      {
        type: "p",
        text: "And the manager's role during those months is not to observe from a distance. It is active work: coaching, clarifying, training, removing obstacles. “He's not improving” is not a status update on the employee. Quite often, it is a description of what the manager didn't do either.",
      },
      {
        type: "p",
        text: "Fifteen years of being good enough to keep, followed by a few months of being apparently impossible to fix, should make us curious before it makes us decisive.",
      },

      { type: "h2", text: "What I Look at First Now" },
      {
        type: "p",
        text: "So, these days, when a PIP lands on my desk, the first thing I examine isn't the employee. It's the expectation. Can you tell me, in concrete and observable terms, what success looks like? Because if you can't describe it, we cannot fairly ask another human being to hit it. And if the honest goal here is an exit rather than an improvement, then we should have the courage to name that, because dressing up a decision as a process protects no one, least of all the person living through it.",
      },
      {
        type: "list",
        items: [
          "Can the manager state, in observable terms, what success looks like at the end of the plan?",
          "Is there a written record of the coaching, training and obstacle-removal the plan obliges the manager to provide?",
          "Has anyone asked what changed — the person, or the context around them?",
          "If the real goal is an exit rather than an improvement, is anyone willing to say so out loud?",
        ],
      },

      { type: "h2", text: "The Conversation That Never Happened" },
      {
        type: "p",
        text: "There is also a conversation I wish we had been able to have, him and me, one that never happened. Before I get to why, I want to be honest about my own part in this, because it would be easy to read this story and decide that HR simply dropped the ball. I did push. I asked the manager, more than once, to tell me exactly what wasn't working, and I stayed close to the plan the whole way through. But I was never sitting in her seat. I couldn't watch the work happen day in and day out, and HR rarely can. We are almost always working from someone else's account of the room, and that account is only ever as good, and as fair, as the person giving it.",
      },
      {
        type: "p",
        text: "And Daniel never came to me. That is the part I keep returning to, because it points to something bigger than one plan or one manager. A PIP is not something an employee has to carry alone and in silence. If he had picked up the phone, I could have helped him think it through: what he could do, what questions he had every right to ask, how to approach the plan on his own terms, whether it was a genuine chance to turn things around or a quieter route to the door. He didn't. And I don't believe that was because the option didn't exist. I think it was because of what HR represents to so many people. I wasn't there to catch him out, but the perception of HR, the quiet assumption that we sit solely on the company's side of the table, is often enough to stop someone reaching for the very support that could have helped them. It's the same isolation I've [written about from the employee's side](/blog/navigate-a-bad-manager).",
      },

      { type: "h2", text: "What That Silence Costs" },
      {
        type: "p",
        text: "That silence carries a cost. Being handed a PIP when you believed you were doing fine is a real blow to your confidence. It makes you second-guess work you were proud of a week earlier. Daniel may well have walked out of that meeting convinced he was already finished, when the truth was that he still had room to move. One honest conversation, the kind that reminds you that you have options, that you have agency, and that someone is in your corner, might have given him back enough footing to advocate for himself. Sometimes that footing is the whole difference between a plan that fails and a plan that quietly works.",
      },
      {
        type: "p",
        text: "I don't know the full story of Daniel's final few months. Maybe he had genuinely checked out. Maybe the role was simply wrong for him. Maybe he was tired in a way that none of us thought to ask about. What I do know is that the hardest questions here were never only about him. They were about whether the standard was ever clear, whether the support was ever real, and whether the people who might have helped him, myself included, ever felt like people he could safely turn to.",
      },
      {
        type: "p",
        text: "And I know that “he's not improving” should always prompt one more question: are we sure this was ever really about him?",
      },
      {
        type: "callout",
        text: "If a PIP or a letter of expectation has just landed on your desk, you do not have to read it alone. Send it to Humanly for a written review, or book a confidential call — nothing goes back to your employer, and you'll leave knowing whether you're holding a real plan or a paper trail.",
      },
    ],
  },
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
        text: "Then I had a health situation and needed time away. When I came back, things didn't improve, they got worse. I was handed a [letter of expectation](/resources/pip-response-strategy) and started to feel watched constantly, every task, every move. I didn't understand what that letter meant for my standing. And I didn't have a single person to ask.",
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
        text: "The real problem was that I had no one to go to. Not a mentor. Not HR. Not even a peer who'd been there longer and could tell me whether a letter of expectation after health leave was normal, or something worth pushing back on. I had to interpret every signal alone, with nothing to measure it against. If you're reading that and recognising it, the [managed-out diagnostic](/resources/managed-out) is the fastest way to check your read against something other than your own nerves.",
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
        text: "That's the gap I think about most in my work now. Not every workplace situation needs HR intervention or a formal complaint. Most of them just need someone to help you think clearly early enough that you still have real options, including the option to stay and actually get what you came for. That is exactly what a [confidential advisory session](/booking?service=individual-advisory) is for — and if you're already weighing the exit, [Resign or Stay?](/resources/resign-or-stay) will structure the decision before the call.",
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

/* ------------------------------------------------------- portable text */

const INLINE_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type LinkDef = { _type: "link"; _key: string; href: string };

/**
 * Split one run of body text into portable-text spans, lifting `[label](/href)` out
 * into link marks. Keys are derived from the block's position rather than a counter,
 * so the same post always produces byte-identical output between builds and between
 * the site and the seed script.
 */
function toSpans(text: string, keyBase: string) {
  const children: Span[] = [];
  const markDefs: LinkDef[] = [];
  let cursor = 0;

  const push = (value: string, marks: string[] = []) => {
    if (!value) return;
    children.push({ _type: "span", _key: `${keyBase}-s${children.length}`, text: value, marks });
  };

  for (const match of text.matchAll(INLINE_LINK)) {
    const [raw, label, href] = match;
    const at = match.index ?? 0;
    push(text.slice(cursor, at));
    const markKey = `${keyBase}-a${markDefs.length}`;
    markDefs.push({ _type: "link", _key: markKey, href });
    push(label, [markKey]);
    cursor = at + raw.length;
  }

  push(text.slice(cursor));
  if (children.length === 0) push("");

  return { children, markDefs };
}

/**
 * Convert the in-code `BlogBlock[]` into portable text.
 *
 * Shared deliberately: `lib/sanity/queries.ts` uses it to render posts that haven't
 * been migrated into Sanity yet, and `scripts/seed-sanity.ts` uses it to write them
 * into the dataset. One implementation means a post reads identically whether it is
 * being served from code or from Studio.
 */
export function blocksToPortableText(blocks: BlogBlock[]): PortableTextBlock[] {
  return blocks.flatMap((block, i): PortableTextBlock[] => {
    const keyBase = `b${i}`;

    if (block.type === "callout") {
      return [
        {
          _type: "callout",
          _key: keyBase,
          text: block.text,
          ctaLabel: "Book a confidential call",
          ctaHref: "/booking",
        } as unknown as PortableTextBlock,
      ];
    }

    if (block.type === "list") {
      return block.items.map((item, j) => {
        const itemKey = `${keyBase}-${j}`;
        const { children, markDefs } = toSpans(item, itemKey);
        return {
          _type: "block",
          _key: itemKey,
          style: "normal",
          listItem: "bullet",
          level: 1,
          markDefs,
          children,
        } as unknown as PortableTextBlock;
      });
    }

    const { children, markDefs } = toSpans(block.text, keyBase);
    return [
      {
        _type: "block",
        _key: keyBase,
        style: block.type === "h2" ? "h2" : "normal",
        markDefs,
        children,
      } as unknown as PortableTextBlock,
    ];
  });
}

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
