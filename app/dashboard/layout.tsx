import { MaybeClerkProvider } from "@/components/auth/MaybeClerkProvider";

/**
 * Clerk's React context is scoped to the admin surface.
 *
 * It used to wrap the root layout, which meant every public page shipped Clerk and
 * sat behind `clerkMiddleware` — see the note in `proxy.ts` for why that cost us the
 * search index. Nothing outside `/dashboard` reads auth state, so nothing outside
 * `/dashboard` needs the provider.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <MaybeClerkProvider>{children}</MaybeClerkProvider>;
}
