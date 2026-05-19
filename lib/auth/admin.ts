import { auth, currentUser } from "@clerk/nextjs/server";

export type AdminState =
  | { ok: true; email: string }
  | { ok: false; status: number; message: string };

function clerkConfigured() {
  return Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminState(): Promise<AdminState> {
  if (!clerkConfigured()) {
    return {
      ok: false,
      status: 503,
      message:
        "Dashboard auth is not configured. Add Clerk keys and ADMIN_EMAILS before using the dashboard.",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, status: 401, message: "Sign in with an admin account to continue." };
  }

  const user = await currentUser();
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ||
    "";

  if (!primaryEmail) {
    return { ok: false, status: 403, message: "No verified email address was found for this Clerk user." };
  }

  const allowed = adminEmails();
  if (!allowed.includes(primaryEmail.toLowerCase())) {
    return { ok: false, status: 403, message: "This account is not in ADMIN_EMAILS." };
  }

  return { ok: true, email: primaryEmail };
}

export async function requireAdminApi() {
  const state = await getAdminState();
  if (!state.ok) {
    return Response.json({ error: state.message }, { status: state.status });
  }
  return null;
}
