import { getOrganizationBySlug } from "@repo/database";
import { notFound } from "next/navigation";
import { TeamsList } from "@organizations/components/TeamsList";
import { PageHeader } from "@shared/components/PageHeader";

export default async function TeamsPage({
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
				title="Equipes"
				subtitle="Gerencie as equipes da sua organização e atribua membros a elas."
			/>
			<div className="mt-8">
				<TeamsList organizationId={organization.id} />
			</div>
		</div>
	);
}
