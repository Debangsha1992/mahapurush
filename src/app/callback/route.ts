import { handleAuth } from "@workos-inc/authkit-nextjs";
import { AUTH_RETURN_HOME } from "@/lib/auth/routes";

export const GET = handleAuth({
  returnPathname: AUTH_RETURN_HOME,
});
