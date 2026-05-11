import { PageHeader } from "@shared/components/PageHeader";
import { getOrganizationBySlug } from "@repo/database";
import { notFound } from "next/navigation";
import { LocationsManager } from "@organizations/components/LocationsManager";

export default async function LocationsPage({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const organization = await getOrganizationBySlug(organizationSlug);

	if (!organization) {
		notFound();
	}

	return (
		<div className="container max-w-6xl py-8">
			<PageHeader
				title="Locais"
				subtitle="Gerencie os locais físicos pertencentes às unidades."
			/>
			<div className="mt-8">
				<LocationsManager organizationId={organization.id} />
			</div>
		</div>
	);
}
