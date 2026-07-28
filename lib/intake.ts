import type { ServiceProduct } from "@/lib/products";

/**
 * Per-service booking intake.
 *
 * The intake form is not one shape. Asking an interview-prep client whether they've
 * received a PIP — or offering a document upload to someone booking a mock interview —
 * costs the lead and tells Karma nothing. So each service declares the questions that
 * are actually useful before *that* session, and `/booking` renders those.
 *
 * Two rules hold everywhere:
 *   1. **Nothing is ever uploaded here.** The site takes payment and books time; it is
 *      not a document intake. Where a document genuinely is the deliverable
 *      (`document-review`), the client is told to reply to the post-payment email
 *      instead — that keeps employment contracts and termination letters out of a
 *      public form and inside an authenticated mailbox.
 *   2. Every field is optional to answer well. Only the one or two questions the
 *      session cannot start without are `required`.
 */

export type IntakeFieldType = "text" | "url" | "date" | "select" | "textarea";

/**
 * Which canonical column an answer lands in.
 *
 * `booking_intakes` has exactly three content columns (`concern`, `urgency`, `message`),
 * and the lead emails, Stripe metadata and Cal.com webhook all read from them. Rather
 * than migrate the table for every new question, each form nominates which of its fields
 * fill those three slots; everything else travels as free-form detail and is folded into
 * `message` on the way to the database.
 */
export type IntakeRole = "concern" | "urgency" | "message";

export type IntakeField = {
  /** Form field name. Unique within a form. */
  id: string;
  label: string;
  type: IntakeFieldType;
  /** Renders half-width from the `sm` breakpoint up. */
  half?: boolean;
  required?: boolean;
  placeholder?: string;
  /** Options for `type: "select"`. The first is the default value. */
  options?: string[];
  /** Small print under the field. */
  help?: string;
  role?: IntakeRole;
};

export type IntakeForm = {
  /**
   * Shown above the fields. Used to set expectations about what happens after payment —
   * especially "don't attach anything here".
   */
  note?: string;
  fields: IntakeField[];
};

/* ------------------------------------------------------------ shared options */

const SITUATIONS = [
  "Performance warning or PIP",
  "Toxic manager or harassment",
  "Contract, severance, or redundancy",
  "Burnout, boundaries, or exit planning",
  "Investigation or grievance",
  "Something else",
];

const TIMING = ["This week", "Next 48 hours", "This month", "Planning ahead"];

const JURISDICTIONS = [
  "United Arab Emirates",
  "Saudi Arabia",
  "Elsewhere in the GCC",
  "Canada",
  "United States",
  "Elsewhere / prefer not to say",
];

/* -------------------------------------------------------------------- forms */

/** Default: one-off advisory sessions where the situation itself is the subject. */
const advisoryForm: IntakeForm = {
  note: "Karma reads this before the call, so the session starts at the substance instead of the background.",
  fields: [
    {
      id: "situation",
      label: "What is this about?",
      type: "select",
      options: SITUATIONS,
      role: "concern",
    },
    {
      id: "timing",
      label: "How soon do you need this?",
      type: "select",
      half: true,
      options: TIMING,
      role: "urgency",
    },
    {
      id: "jurisdiction",
      label: "Where are you employed?",
      type: "select",
      half: true,
      options: JURISDICTIONS,
    },
    {
      id: "message",
      label: "What is happening?",
      type: "textarea",
      role: "message",
      placeholder: "A short version is enough — a few lines is plenty to work from.",
    },
  ],
};

const interviewPrepForm: IntakeForm = {
  note: "No uploads needed. Paste the job posting link and Karma reads it before the call — there is nothing to attach here.",
  fields: [
    {
      id: "role",
      label: "Role you're interviewing for",
      type: "text",
      half: true,
      required: true,
      placeholder: "e.g. Senior Finance Manager",
      role: "concern",
    },
    {
      id: "company",
      label: "Company or industry",
      type: "text",
      half: true,
      placeholder: "e.g. a Dubai investment group",
    },
    {
      id: "stage",
      label: "Interview stage",
      type: "select",
      half: true,
      options: [
        "Not scheduled yet",
        "Recruiter screen",
        "Hiring-manager round",
        "Panel or final round",
        "Case or technical round",
      ],
    },
    {
      id: "interviewDate",
      label: "Interview date (if set)",
      type: "date",
      half: true,
      role: "urgency",
    },
    {
      id: "jobPostingUrl",
      label: "Link to the job posting or JD",
      type: "url",
      placeholder: "https://…",
      help: "Any public link works — LinkedIn, the company careers page, a job board.",
    },
    {
      id: "focus",
      label: "What do you want to get sharper on?",
      type: "textarea",
      role: "message",
      placeholder:
        "e.g. competency answers, salary expectations, explaining a career gap, executive presence.",
    },
  ],
};

const interviewPrepPackageForm: IntakeForm = {
  ...interviewPrepForm,
  note: "No uploads needed — paste the job posting links below. The three sessions are booked one at a time, so only the first interview needs details now.",
  fields: interviewPrepForm.fields.map((field) => {
    if (field.id === "role") {
      return {
        ...field,
        label: "Roles you're interviewing for",
        placeholder: "e.g. Senior Finance Manager, Head of FP&A",
      };
    }
    if (field.id === "company") {
      return { ...field, label: "Companies or industries", placeholder: "e.g. two banks and a family office" };
    }
    if (field.id === "jobPostingUrl") {
      return {
        ...field,
        label: "Link to the first job posting or JD",
        help: "One link is enough to start — send the rest before each later session.",
      };
    }
    if (field.id === "interviewDate") {
      return { ...field, label: "Date of the first interview (if set)" };
    }
    return field;
  }),
};

const documentReviewForm: IntakeForm = {
  note: "Don't attach anything here. As soon as payment clears you'll get an email — reply to it with the document, and the written review comes back to that same thread.",
  fields: [
    {
      id: "documentType",
      label: "What are we reviewing?",
      type: "select",
      required: true,
      options: [
        "Employment contract or offer letter",
        "Termination or dismissal letter",
        "PIP or letter of expectation",
        "Settlement or severance offer",
        "Written warning",
        "A resignation letter I've drafted",
        "Other document",
      ],
      role: "concern",
    },
    {
      id: "deadline",
      label: "Deadline to respond by",
      type: "date",
      half: true,
      role: "urgency",
      help: "If someone has given you a date to sign or reply by, put it here.",
    },
    {
      id: "jurisdiction",
      label: "Where are you employed?",
      type: "select",
      half: true,
      options: JURISDICTIONS,
    },
    {
      id: "question",
      label: "What do you need to know about it?",
      type: "textarea",
      required: true,
      role: "message",
      placeholder:
        "e.g. is this notice period enforceable? Am I giving anything up by signing? What should I push back on?",
    },
  ],
};

const relocationForm: IntakeForm = {
  fields: [
    {
      id: "status",
      label: "Where are you in the move?",
      type: "select",
      required: true,
      half: true,
      options: [
        "Already in the UAE",
        "Moving to the UAE soon",
        "Considering a move",
        "Leaving the UAE",
      ],
      role: "concern",
    },
    {
      id: "visaStatus",
      label: "Your visa or status",
      type: "select",
      half: true,
      options: [
        "Employment visa",
        "Golden visa",
        "Freelance permit",
        "Dependent visa",
        "No UAE visa yet",
        "Not sure",
      ],
    },
    {
      id: "timing",
      label: "How soon do you need answers?",
      type: "select",
      half: true,
      options: TIMING,
      role: "urgency",
    },
    {
      id: "employerType",
      label: "Freezone or mainland?",
      type: "select",
      half: true,
      options: ["Mainland", "Freezone", "DIFC or ADGM", "Not sure yet"],
    },
    {
      id: "questions",
      label: "Your top questions",
      type: "textarea",
      required: true,
      role: "message",
      placeholder: "List up to five — Karma works through them in order.",
    },
  ],
};

const jobSearchForm: IntakeForm = {
  note: "This is a market-orientation call. Bring your CV to the session — nothing needs to be sent in advance.",
  fields: [
    {
      id: "currentRole",
      label: "Your current role or field",
      type: "text",
      half: true,
      required: true,
      placeholder: "e.g. HR Business Partner, banking",
      role: "concern",
    },
    {
      id: "seniority",
      label: "Level",
      type: "select",
      half: true,
      options: [
        "Entry level",
        "Mid level",
        "Senior or manager",
        "Director or head of",
        "C-suite",
      ],
    },
    {
      id: "basedIn",
      label: "Where are you based?",
      type: "select",
      half: true,
      options: [
        "Already in the UAE",
        "Elsewhere in the GCC",
        "Relocating from abroad",
      ],
    },
    {
      id: "timing",
      label: "Where are you in the search?",
      type: "select",
      half: true,
      options: [
        "Actively applying now",
        "Starting in the next month",
        "Exploring and planning ahead",
      ],
      role: "urgency",
    },
    {
      id: "targets",
      label: "Roles or companies you're targeting",
      type: "textarea",
      role: "message",
      placeholder: "Even a rough list helps — it shapes the outreach strategy.",
    },
  ],
};

const retainerForm: IntakeForm = {
  note: "Retainer sessions are booked inside your plan once it starts. This intake is what Karma reads before the first one.",
  fields: [
    {
      id: "situation",
      label: "What is the main situation?",
      type: "select",
      required: true,
      options: SITUATIONS,
      role: "concern",
    },
    {
      id: "duration",
      label: "How long has this been going on?",
      type: "select",
      half: true,
      options: ["Just started", "A few weeks", "A few months", "Over a year"],
    },
    {
      id: "timing",
      label: "How soon do you want the first session?",
      type: "select",
      half: true,
      options: TIMING,
      role: "urgency",
    },
    {
      id: "jurisdiction",
      label: "Where are you employed?",
      type: "select",
      half: true,
      options: JURISDICTIONS,
    },
    {
      id: "message",
      label: "What is happening?",
      type: "textarea",
      role: "message",
      placeholder: "Background helps here — a retainer works best when Karma has the full picture.",
    },
  ],
};

const corporateBase: IntakeField[] = [
  {
    id: "company",
    label: "Company name",
    type: "text",
    half: true,
    required: true,
    role: "concern",
  },
  { id: "jobTitle", label: "Your role", type: "text", half: true, placeholder: "e.g. HR Manager" },
];

const lunchAndLearnForm: IntakeForm = {
  note: "Corporate engagement — invoiced to the company and kept entirely separate from Humanly's employee advisory.",
  fields: [
    ...corporateBase,
    {
      id: "attendees",
      label: "Expected attendees",
      type: "select",
      half: true,
      options: ["Up to 10", "11–20", "More than 20 (we'll quote separately)"],
    },
    {
      id: "timing",
      label: "Preferred timing",
      type: "select",
      half: true,
      options: ["This month", "Next month", "This quarter", "Still planning"],
      role: "urgency",
    },
    {
      id: "topic",
      label: "Focus for the workshop",
      type: "select",
      options: [
        "UAE labour law essentials",
        "Performance management done properly",
        "Investigations and grievances",
        "Restructuring and redundancy",
        "Policy and handbook basics",
        "Something else",
      ],
    },
    {
      id: "brief",
      label: "Anything specific we should cover?",
      type: "textarea",
      role: "message",
      placeholder: "Recent issues, questions the team keeps asking, or a policy you're rolling out.",
    },
  ],
};

const complianceAdvisoryForm: IntakeForm = {
  note: "Employer-side advisory. Humanly does not advise both sides of the same matter — if we already advise one of your employees, we'll say so and decline.",
  fields: [
    ...corporateBase,
    {
      id: "headcount",
      label: "Headcount",
      type: "select",
      half: true,
      options: ["1–10", "11–50", "51–200", "201–500", "500+"],
    },
    {
      id: "setup",
      label: "Entity setup",
      type: "select",
      half: true,
      options: ["Mainland", "Freezone", "DIFC or ADGM", "Multiple entities", "Not sure"],
    },
    {
      id: "topic",
      label: "What do you need advice on?",
      type: "select",
      options: [
        "Contracts and offer letters",
        "Terminations and end-of-service",
        "Freezone vs mainland compliance",
        "Policies and handbooks",
        "Investigations",
        "Something else",
      ],
    },
    {
      id: "timing",
      label: "How urgent is it?",
      type: "select",
      half: true,
      options: TIMING,
      role: "urgency",
    },
    {
      id: "brief",
      label: "Give us the short version",
      type: "textarea",
      role: "message",
      placeholder: "Enough to tell whether this is an hour of advice or a bigger piece of work.",
    },
  ],
};

/* ------------------------------------------------------------------ lookup */

const FORMS_BY_SLUG: Record<string, IntakeForm> = {
  "interview-prep": interviewPrepForm,
  "interview-prep-package": interviewPrepPackageForm,
  "document-review": documentReviewForm,
  "uae-relocation-qa": relocationForm,
  "dubai-job-search": jobSearchForm,
  "lunch-and-learn": lunchAndLearnForm,
  "hr-compliance-advisory": complianceAdvisoryForm,
};

/**
 * The intake form for a service: an explicit per-slug form where one exists, then a
 * sensible per-category default, so a new product is never left without a form.
 */
export function getIntakeForm(product: ServiceProduct): IntakeForm {
  const bySlug = FORMS_BY_SLUG[product.slug];
  if (bySlug) return bySlug;
  if (product.category === "retainer") return retainerForm;
  if (product.category === "corporate") return complianceAdvisoryForm;
  return advisoryForm;
}

/**
 * The detail labels a given service is allowed to submit.
 *
 * The intake posts labelled free text that is emailed straight to the Humanly inbox, so
 * the server checks each label against the selected service's own form. Anything else is
 * dropped rather than forwarded — a booking form should not double as a way to put
 * arbitrary content in front of Karma.
 */
export function allowedDetailLabels(form: IntakeForm) {
  return new Set(form.fields.filter((field) => !field.role).map((field) => field.label));
}

/**
 * Split raw form answers into the three canonical slots plus labelled extras.
 *
 * Runs on the client, which posts the result. The checkout route does not trust that
 * split blindly — it re-reads the same form definition and drops any detail whose label
 * isn't a real field on the selected service (see `allowedDetailLabels`).
 */
export function splitAnswers(form: IntakeForm, answers: Record<string, string>) {
  let concern: string | undefined;
  let urgency: string | undefined;
  let message: string | undefined;
  const details: { label: string; value: string }[] = [];

  for (const field of form.fields) {
    const value = (answers[field.id] ?? "").trim();
    if (!value) continue;

    if (field.role === "concern") concern = value;
    else if (field.role === "urgency") urgency = value;
    else if (field.role === "message") message = value;
    else details.push({ label: field.label, value });
  }

  return { concern, urgency, message, details };
}

/**
 * The text persisted to `booking_intakes.message`.
 *
 * Details are folded in here so that the later funnel emails — the paid notification
 * and the Cal.com booked notification, both of which rebuild themselves from the
 * database rather than the form — still carry every answer.
 */
export function composeStoredMessage(
  message: string | undefined,
  details: { label: string; value: string }[],
) {
  const parts = [
    ...(message ? [message] : []),
    ...details.map((detail) => `${detail.label}: ${detail.value}`),
  ];
  return parts.length ? parts.join("\n") : undefined;
}
