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
    slug: "hr-is-kind-of-the-villain",
    title: "Yes, HR Is Kind of the Villain in Your Story. Let Me Explain.",
    excerpt:
      "HR is sometimes the punchline for a reason. Karma Harb explains what internal HR can influence, what it cannot control, and why Humanly exists to give employees an independent voice in their corner.",
    category: "HR & Workplace",
    author: "Karma Harb",
    authorRole: "Founder of Humanly",
    publishedAt: "2026-09-22",
    readingMinutes: 6,
    keywords: [
      "HR advice",
      "independent HR advice",
      "employee support",
      "workplace conflict",
      "HR trust",
      "confidential HR advice",
    ],
    lead:
      "Yes, HR is kind of the villain in your story — sometimes. But the person across the desk may genuinely be on your side and still be constrained by budgets, rules and decisions made elsewhere. Here is what the memes leave out, and why independent HR advice fills the gap.",
    blocks: [
      {
        type: "p",
        text: "There are reels and TikToks going around — you've definitely seen them, or one of their hundred cousins. HR walks in and the room goes quiet. HR sends a “can we have a quick chat?” and your stomach drops. HR says “we're a family here” right before doing something no actual family would ever do.",
      },
      {
        type: "p",
        text: "So here's my confession: I work in HR, I watched them, and I laughed. Because honestly, a lot of it is true. That's the bit none of us really want to say out loud. Sometimes we ARE the punchline.",
      },
      {
        type: "p",
        text: "So before I stand up for my people, let me just hand you a few for free. Yes, “let's take this offline” sometimes means “please stop talking.” Yes, the open-door policy has a weird number of closed doors. And yes, “we'll look into it” comes in about five different levels of conviction, and you can usually tell which one you just got.",
      },
      {
        type: "p",
        text: "Fine. Guilty. But now let me tell you the part the reels, memes and TikToks leave out, because it's the part that actually matters to me.",
      },

      { type: "h2", text: "The Thing Nobody Films" },
      {
        type: "p",
        text: "Most of the time, by the point someone finally comes to HR, they've been sitting on it for a while. And they turn up with a completely fair ask. Fix my manager. Change this policy. Get me the raise I clearly deserve. Make this unfair thing un-happen.",
      },
      {
        type: "p",
        text: "And here's the honest, slightly deflating truth: a lot of the time I want to help you, and I CAN'T. Not won't. Can't. There's a difference, and it matters.",
      },
      {
        type: "p",
        text: "Because what the reel never shows you is this: it's not that I have no say. At my level, I'm in the budget conversations. I give input. I argue for people all the time. But there's a difference between having a voice in the room and holding the final pen. I don't sign the number off by myself, and I'm usually not the one making the final call on the exact thing that's wrecking your week. A lot of it gets decided a few floors up, on numbers and priorities that were set long before you and I sat down.",
      },
      {
        type: "p",
        text: "Do I push? Yes. More than you'd think, and usually in places you'll never see. And sometimes it genuinely works. I HAVE changed leadership's minds before, talked a decision into a better shape, turned a flat no into a let-me-think-about-it. So no, I'm not powerless, and I don't want to pretend I am.",
      },
      {
        type: "p",
        text: "But it doesn't land every time, and that's the honest bit. Pushing and controlling the outcome are two different jobs, and I only ever got given one of them. I can make the case as hard as anyone in that room. I just can't promise you they'll buy it.",
      },
      {
        type: "p",
        text: "The way I think about it: you want the ship to turn, so you come to me because I'm standing closest to the wheel. What you can't see is that the wheel is bolted to something much bigger, and other people — whose names aren't anywhere in this conversation — decided where we're heading long before you and I sat down. I can lean on it with everything I've got. I still can't spin it.",
      },

      { type: "h2", text: "What I Actually Want You to Walk Away With" },
      {
        type: "p",
        text: "So laugh at the reels. I do. Some of them are genuinely too close to the bone.",
      },
      {
        type: "p",
        text: "But next time you're deciding whether HR is the villain, try the more boring theory: that the person across the desk might actually be on your side, might really want to help, and might still be stuck inside a set of rules they didn't write and can't magic away for you.",
      },
      {
        type: "p",
        text: "We're not the whole system. We're just the part of it you can actually talk to. And most of us would so much rather you talked to us, even on the days we can't give you what you walked in for.",
      },

      { type: "h2", text: "Why I Built Humanly" },
      {
        type: "p",
        text: "Because this is the bit I couldn't get past. Every single constraint I just described is real, and none of it is going anywhere. Internal HR, however much they want to help you, is always going to be sitting inside the company's constraints, budgets and reporting lines. That's the job. It's also the gap.",
      },
      {
        type: "p",
        text: "Humanly is HR advice with none of those strings on it. When you talk to me here, there's no wallet I'm quietly protecting, no decision three floors up I'm trying to manage around, and no side to be on except yours. Same experience, same straight answers, minus the handcuffs.",
      },
      {
        type: "callout",
        text: "If you've ever left an HR meeting wishing you had someone in your corner who had nothing to lose by being honest with you, that person is the entire point of Humanly. Book a call and let's actually talk it through. That's the one thing I can always help you with.",
      },
    ],
  },
  {
    slug: "the-ladder-i-was-told-to-climb",
    title: "The Ladder I Was Told to Climb",
    excerpt:
      "After nearly twenty years in HR, Karma Harb is questioning the CHRO path she spent a career climbing — and whether redefining ambition is failure or finally choosing for yourself.",
    category: "Careers & Managers",
    author: "Karma Harb",
    authorRole: "Founder of Humanly",
    publishedAt: "2026-09-22",
    readingMinutes: 6,
    keywords: [
      "career change",
      "mid-career",
      "burnout",
      "CHRO",
      "ambition",
      "arrival fallacy",
      "resign or stay",
      "career advice",
    ],
    lead:
      "Questioning the career ladder does not mean you failed to climb it. After nearly twenty years in HR and years spent aiming for CHRO, I am asking whether that destination was ever mine — and what success looks like when ambition gives way to reevaluation.",
    blocks: [
      {
        type: "p",
        text: "I have spent close to twenty years in HR. I've designed executive pay structures, built people functions from nothing, sat in rooms where careers were decided, and helped hundreds of people navigate the hardest moments of their working lives. For most of that time, I knew exactly where I was going. I was going to be a Chief Human Resources Officer (CHRO).",
      },
      {
        type: "p",
        text: "Lately, I've been sitting with a question I never expected to ask: why?",
      },

      { type: "h2", text: "The Script We Were Handed" },
      {
        type: "p",
        text: "If you're somewhere in your late thirties or forties, you probably know the script. Get a good education. Get a good job. Climb as fast as you can. Every promotion was proof you were doing life correctly, and the next title was always the one that would finally make it feel worth it.",
      },
      {
        type: "p",
        text: "We followed that script through a remarkable run of events. Many of us were starting out when 2008 hit. We built careers through years of economic uncertainty, then lived through a pandemic, then inflation, then constant instability in the world around us. Each one was described as once in a lifetime. They just kept coming.",
      },
      {
        type: "p",
        text: "In the last few weeks, I've had several conversations with people in my cohort who all said some version of the same thing: I'm done. Not done with work entirely, but done with running a race they're no longer sure they signed up for.",
      },
      {
        type: "p",
        text: "I recognized myself in every one of those conversations.",
      },

      { type: "h2", text: "My Own Question" },
      {
        type: "p",
        text: "When I picture the next fifteen years of my career, I don't feel ambition. I feel tired. And that has forced me to look honestly at what the CHRO goal was really about.",
      },
      {
        type: "p",
        text: "Was it the influence? The money? The prestige of the title? The approval of the people who raised me to aim high? Probably some mix of all of them. What I can't find, when I look closely, is a clear picture of a life at the top that I actually want to live.",
      },
      {
        type: "p",
        text: "I don't think I'm alone in this, and I don't think it's a failure. Psychologists talk about the “arrival fallacy,” the belief that reaching the next milestone will bring lasting satisfaction. Many of us arrived at milestones and found the satisfaction didn't last. The natural next question is whether the destination was ever ours to begin with.",
      },

      { type: "h2", text: "Burnout or Reevaluation?" },
      {
        type: "p",
        text: "Burnout is real. The World Health Organization describes it as the result of chronic workplace stress that hasn't been managed, and it shows up as exhaustion, cynicism about work, and a sense that you're no longer effective. If that's where you are, it deserves real attention.",
      },
      {
        type: "p",
        text: "But I'd suggest that much of what our generation is feeling is also something else: a long-overdue reevaluation. We were taught one definition of success, and we're now old enough, experienced enough, and worn down enough to question it. That questioning can feel like a crisis. It can also be the beginning of building a career on your own terms.",
      },

      { type: "h2", text: "Questions Worth Sitting With" },
      {
        type: "p",
        text: "If any of this sounds familiar, here are the questions I've been asking myself. They're harder than they look.",
      },
      {
        type: "list",
        items: [
          "When you imagine your next promotion, what specifically do you feel: excitement, relief, or obligation?",
          "Whose voice do you hear when you think about “falling behind” — yours, a parent's, or your peers'?",
          "If the title and pay stayed exactly as they are, what would you change about your work tomorrow?",
          "Is it the work itself that drains you, or the organization, the role, or the pace?",
          "What would success look like if nobody else ever saw it?",
        ],
      },
      {
        type: "p",
        text: "The answers don't have to lead to a dramatic exit. For some people, they point to a different organization. For others, a lateral move, a reduced scope, a sabbatical, a portfolio career, or simply renegotiating what they give to work. Sometimes the answer is to stay and climb, but this time by choice rather than momentum.",
      },

      { type: "h2", text: "Where Humanly Fits" },
      {
        type: "p",
        text: "I started Humanly because I kept seeing talented people make huge career decisions alone, often at their most exhausted, without anyone on their side who understood how organizations really work.",
      },
      {
        type: "p",
        text: "Humanly isn't therapy, and it doesn't replace it. If you're struggling to function day to day, not sleeping, or feeling hopeless, please speak to a doctor or mental health professional first. That support matters.",
      },
      {
        type: "p",
        text: "What Humanly offers is the career side of the conversation. Together we can separate what you want from what you were told to want, look honestly at whether the problem is your role, your employer, or the path itself, map realistic options you may not have considered, and plan how to act on your decision in a way that protects your finances, your reputation, and your energy.",
      },
      {
        type: "p",
        text: "If you're asking yourself whether to leave or stay, start with the free [Resign or Stay Framework](/resources/resign-or-stay). It's a structured way to get your thinking out of your head and onto the page. And if you want someone to think it through with you, [book a consultation](/booking).",
      },
      {
        type: "p",
        text: "I'm still working through my own answer. But I've stopped believing that questioning the ladder means I've failed at climbing it. It might just mean I'm finally ready to decide where I want to go.",
      },
    ],
    source: "World Health Organization, ICD-11: Burn-out as an occupational phenomenon.",
  },
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
        text: "That's the gap I think about most in my work now. Not every workplace situation needs HR intervention or a formal complaint. Most of them just need someone to help you think clearly early enough that you still have real options, including the option to stay and actually get what you came for. That is exactly what a [confidential advisory session](/booking?service=full-support) is for — and if you're already weighing the exit, [Resign or Stay?](/resources/resign-or-stay) will structure the decision before the call.",
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
