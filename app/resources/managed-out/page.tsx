"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, RotateCcw } from "lucide-react";

type Answer = "yes" | "no" | null;

const questions = [
  "Have your responsibilities been reduced or quietly reassigned without explanation?",
  "Are you being excluded from meetings, decisions, or communications you'd previously have been part of?",
  "Has your manager's communication with you become noticeably shorter, cooler, or more formal?",
  "Have you recently been placed on a PIP or received formal written feedback for the first time?",
  "Do you feel your work is being scrutinised more heavily than your peers'?",
  "Has the positive recognition you used to receive slowed down or stopped?",
  "Have you been given vague or impossible targets with little support to meet them?",
  "Has a conversation about 'fit', 'culture', or 'expectations' felt ambiguous or unsettling?",
  "Have you sensed a shift in how colleagues treat you — less inclusion, less warmth, awkward silences?",
  "In your gut, does something feel wrong — even if you can't fully articulate it yet?",
];

const meanings: { yes: string; no: string }[] = [
  { yes: "Role erosion is one of the earliest, most reliable signals a managed-out process has begun. Scope removed without explanation often means leadership is shrinking your footprint before a formal conversation.", no: "No unexplained role changes is a good sign. Natural workload shifts happen — deliberate, unexplained removal of scope is different in texture." },
  { yes: "Exclusion from meetings and decisions is professional sidelining. It limits your visibility and can later be used to justify 'performance' concerns.", no: "Staying included suggests you're still seen as a valued contributor in the room." },
  { yes: "A manager who has emotionally disengaged has often already made — or been directed toward — a decision. The tone shift frequently precedes formal action.", no: "Consistent, warm communication is genuinely positive. Relationship quality matters enormously in how these situations unfold." },
  { yes: "PIPs are frequently documentation tools rather than genuine development. Receiving one — especially if it feels sudden — warrants close attention to your rights and the process.", no: "Not being on a PIP is an important baseline. If that changes, watch the timing, content, and your right to respond." },
  { yes: "Disproportionate scrutiny creates a paper trail and a hostile environment. It can reflect someone looking for a justifiable reason to act, rather than a real performance gap.", no: "Being held to the same standard as peers is a fair, healthy sign." },
  { yes: "Recognition tends to go quiet when a manager has mentally moved on. If praise stopped abruptly without a change in your work, that silence is telling.", no: "Ongoing recognition suggests your contributions are still acknowledged and valued." },
  { yes: "Unachievable or vague targets with no support can be a setup — failure by design creates grounds to act without technically being unfair.", no: "Clear, realistic targets with adequate support is how a fair performance environment should work." },
  { yes: "Conversations about 'culture' or 'fit' are often the verbal signal before the written one. If it felt rehearsed or vague, trust that — and start keeping notes.", no: "Not having these ambiguous conversations is good. If you do in future, document it the same day." },
  { yes: "Social dynamics often shift before formal processes begin. Colleagues may have heard things you haven't, or may be managing their own uncertainty.", no: "Stable, warm relationships suggest your standing in the team hasn't visibly shifted." },
  { yes: "Your instincts are data — the result of thousands of small observations you can't yet articulate. In an environment you know well, unease is worth taking seriously.", no: "Feeling settled is worth something. If a quiet sense of unease starts to grow, pay attention to it." },
];

export default function ManagedOutQuiz() {
  const [answers, setAnswers] = useState<Answer[]>(Array(10).fill(null));
  const [current, setCurrent] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const answered = answers.filter((a) => a !== null).length;
  const progress = showResult ? 100 : (answered / 10) * 100;
  const yesCount = answers.filter((a) => a === "yes").length;

  const result = useMemo(() => {
    if (yesCount >= 7)
      return {
        band: "High Concern",
        tone: "text-coral",
        bar: "bg-coral",
        width: "85%",
        title: "The signs are significant.",
        body: "You answered yes to 7 or more questions. This combination isn't something to dismiss. Whether or not a formal process has started, the environment you describe has real implications for your wellbeing and your employment. You deserve clear information and a plan.",
      };
    if (yesCount >= 4)
      return {
        band: "Worth Watching",
        tone: "text-accent-orange",
        bar: "bg-accent-orange",
        width: "55%",
        title: "Something has shifted — and you know it.",
        body: "You answered yes to 4–6 questions. You may not be in crisis, but there are enough signals to take seriously. Now is the time to get informed, protect yourself, and think clearly about your options — before the situation accelerates.",
      };
    return {
      band: "Low Concern",
      tone: "text-primary-violet",
      bar: "bg-primary-violet",
      width: "22%",
      title: "Things look relatively stable for now.",
      body: "You answered yes to 3 or fewer questions. That's reassuring. Whatever brought you here, your answers suggest the situation isn't critical. Still — trust your instincts. If something changes, come back.",
    };
  }, [yesCount]);

  function answer(val: Answer) {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = val;
      return next;
    });
  }

  function nextQuestion() {
    if (answers[current] === null) return;
    if (current < 9) setCurrent((c) => c + 1);
    else setShowResult(true);
  }

  function restart() {
    setAnswers(Array(10).fill(null));
    setCurrent(0);
    setShowResult(false);
  }

  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-32 md:px-margin-desktop md:pt-40">
      <div className="mx-auto max-w-2xl">
        <Link href="/resources" className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2 text-sm font-bold text-primary-dark transition-colors hover:bg-violet-tint">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to resources
        </Link>

        <div className="rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-7 shadow-pop sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-violet-tint px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark">
            <LockKeyhole size={12} /> Free &amp; confidential · no sign-up
          </p>
          <h1 className="text-h1 mt-5 font-display font-extrabold leading-tight tracking-tight text-primary-dark">
            Are You Being Managed Out?
          </h1>
          <p className="mt-3 text-neutral-500">
            10 questions. Honest answers. A clearer picture of what might be happening — and what you can do about it.
          </p>

          <div className="mt-7 h-2 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary-violet transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {!showResult ? (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-violet">
                Question {current + 1} of 10
              </p>
              <p className="mt-2 text-xl font-semibold leading-snug text-primary-dark">{questions[current]}</p>

              <div className="mt-6 flex gap-3">
                {(["yes", "no"] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => answer(val)}
                    className={`flex-1 rounded-2xl border-2 px-4 py-3.5 text-[15px] font-semibold capitalize transition-colors ${
                      answers[current] === val
                        ? val === "yes"
                          ? "border-primary-dark bg-violet-tint text-primary-dark"
                          : "border-primary-dark bg-surface-container text-neutral-500"
                        : "border-neutral-300 bg-neutral-100 text-primary-dark hover:border-primary-dark hover:bg-violet-tint"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              {answers[current] && (
                <div className="mt-6 rounded-2xl border-l-4 border-primary-violet bg-violet-tint p-4 text-sm leading-relaxed text-primary-dark">
                  {meanings[current][answers[current] as "yes" | "no"]}
                </div>
              )}

              <button
                onClick={nextQuestion}
                disabled={answers[current] === null}
                className="btn-pop mt-7 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-7 py-3.5 text-[15px] font-bold text-primary-dark shadow-pop-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {current === 9 ? "See my result" : "Next"}
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <p className={`text-xs font-bold uppercase tracking-[0.16em] ${result.tone}`}>{result.band}</p>
              <h2 className="text-h3 mt-2 font-display font-extrabold text-primary-dark">{result.title}</h2>
              <div className="my-5 h-2.5 overflow-hidden rounded-full bg-surface-container">
                <div className={`h-full rounded-full ${result.bar}`} style={{ width: result.width }} />
              </div>
              <p className="leading-relaxed text-neutral-500">{result.body}</p>

              <div className="mt-7 flex flex-col gap-3">
                <Link href="/booking" className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-6 py-3.5 text-[15px] font-bold text-primary-dark shadow-pop-sm">
                  Book a confidential consultation
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
                <Link href="/resources/resign-or-stay" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-violet-tint px-6 py-3.5 text-[15px] font-bold text-primary-dark">
                  Try the Resign or Stay framework
                </Link>
              </div>
              <button onClick={restart} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400 underline hover:text-primary-dark">
                <RotateCcw size={14} /> Start over
              </button>
            </div>
          )}
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-neutral-400">
          This quiz is for information only and does not constitute legal or HR advice. For personalised guidance, book a confidential consultation.
        </p>
      </div>
    </div>
  );
}
