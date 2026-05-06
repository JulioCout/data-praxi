import { PageHeader } from "@shared/components/PageHeader";
import { getOrganizationBySlug } from "@repo/database";
import { notFound } from "next/navigation";
import { UnitsList } from "@organizations/components/UnitsList";

export default async function UnitsPage({
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
				title="Unidades"
				subtitle="Gerencie as unidades da organização e as equipes responsáveis por elas."
			/>
			<div className="mt-8">
				<UnitsList organizationId={organization.id} />
			</div>
		</div>
	);
}
