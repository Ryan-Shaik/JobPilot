import { NextResponse } from "next/server";
import { exchangeOAuthCodeAction } from "@/app/actions/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  // Standard OAuth providers append "?code=...", but we check for both just in case
  const code = requestUrl.searchParams.get("code") || requestUrl.searchParams.get("insforge_code");

  if (!code) {
    console.error("Missing authorization code from provider");
    return NextResponse.redirect(`${requestUrl.origin}/login?error=missing_code`);
  }

  // Execute the server action to exchange the code for session tokens
  const result = await exchangeOAuthCodeAction(code);

  if (!result.success || result.error) {
    console.error("OAuth Exchange Error:", result.error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=pkce_failed`);
  }

  // Authentication successful! Redirect directly to your dashboard
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}