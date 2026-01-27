
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    // If no "next" param is provided, default to dashboard
    const next = requestUrl.searchParams.get("next") || "/dashboard";

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // Note: In Next.js Route Handlers, we must use the response object
                        // to set cookies, but @supabase/ssr needs this callback structure.
                        // For middleware/route handlers, we usually handle the "set" by
                        // creating a response and copying cookies or using middleware.
                        // However, in a simple GET route, we can just manipulate the store
                        // if we are in a server action or middleware context, but in Route Handlers
                        // specifically for Auth Exchange, we typically need to do it like this:
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${requestUrl.origin}${next}`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`);
}
