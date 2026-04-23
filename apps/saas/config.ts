import type { SaasConfig } from "./types";

export const config = {
	appName: "Data Praxi",
	docsUrl: process.env.NEXT_PUBLIC_DOCS_URL as string | undefined,
	marketingUrl: process.env.NEXT_PUBLIC_MARKETING_URL as string | undefined,
	enabledThemes: ["light"],
	defaultTheme: "light",
	redirectAfterSignIn: "/",
	redirectAfterLogout: "/login",
} as const satisfies SaasConfig;
