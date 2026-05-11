import { getActiveOrganization } from "@auth/lib/server";
import { isOrganizationAdmin } from "@repo/auth/lib/helper";
import { notFound, redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function TeamLayout({
	children,
	params,
}: PropsWithChildren<{
	params: Promise<{
		organizationSlug: string;
	}>;
}>) {
	const { organizationSlug } = await params;
	const organization = await getActiveOrganization(organizationSlug);

	if (!organization) {
		return notFound();
	}

	// Only allow owner and admin to access team settings (members, teams, units)
	// We need the currently logged in user to check permissions.
	// Since getActiveOrganization doesn't easily return the current user's details without more queries,
	// let's fetch the session.
	// Actually `getActiveOrganization` inside Next.js server gets the session, but we can just import getSession
	const { getSession } = await import("@auth/lib/server");
	const session = await getSession();

	if (!session?.user || !isOrganizationAdmin(organization, session.user)) {
		redirect(`/${organizationSlug}`);
	}

	return <>{children}</>;
}
