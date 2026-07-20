"use server";

import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const cookieStore = await cookies();
  const authActions = createAuthActions({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: cookieStore,
  });

  await authActions.signOut();
  redirect("/login");
}

export async function loginWithOAuthAction(provider: "google" | "github") {
  const cookieStore = await cookies();

  const authActions = createAuthActions({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: cookieStore,
  });

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/callback`;

  const { data, error } = await authActions.signInWithOAuth(provider, {
    redirectTo,
    ...(provider === "google"
      ? { additionalParams: { prompt: "select_account" } }
      : {}),
  });

  if (error) {
    return { error: error.message };
  }

  // Persist code verifier in a secure HTTP-only cookie for server-side callback retrieval
  if (data?.codeVerifier) {
    cookieStore.set("pkce_code_verifier", data.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 minutes
    });
  }

  // Return the OAuth provider's redirect URL (e.g., Google's login screen URL)
  return { url: data?.url };
}

export async function exchangeOAuthCodeAction(code: string) {
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("pkce_code_verifier")?.value;

  const authActions = createAuthActions({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: cookieStore,
  });

  const { data, error } = await authActions.exchangeOAuthCode(code, codeVerifier);
  
  // Clean up the temporary PKCE verifier cookie
  if (codeVerifier) {
    cookieStore.delete("pkce_code_verifier");
  }
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}

export async function checkAuthAction() {
  const cookieStore = await cookies();
  const client = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: cookieStore,
  });

  const { data } = await client.auth.getCurrentUser();
  return !!data?.user;
}