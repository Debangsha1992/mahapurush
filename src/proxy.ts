import { authkitProxy } from "@workos-inc/authkit-nextjs";

/**
 * Session management for AuthKit. Routes stay public by default;
 * protect specific pages with `withAuth({ ensureSignedIn: true })`.
 */
export default authkitProxy();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
