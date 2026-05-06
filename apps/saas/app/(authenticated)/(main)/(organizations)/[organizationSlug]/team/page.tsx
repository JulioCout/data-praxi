import { getActiveOrganization } from "@auth/lib/server";
import { TeamManagementBlock } from "@organizations/components/TeamManagementBlock";
import { PageHeader } from "@shared/components/PageHeader";
import { notFound } from "next/navigation";

export async function generateMetadata() {
	return {
		title: "Gestão da Equipe",
	};
}

export default async function TeamManagementPage({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const organization = await getActiveOrganization(organizationSlug);

	if (!organization) {
		return notFound();
	}

	return (
		<>
			<PageHeader title="Gestão da Equipe" subtitle="Gerencie as pessoas e as equipes da sua organização" />

			<div className="mt-8">
				<TeamManagementBlock organizationId={organization.id} />
			</div>
		</>
	);
}
