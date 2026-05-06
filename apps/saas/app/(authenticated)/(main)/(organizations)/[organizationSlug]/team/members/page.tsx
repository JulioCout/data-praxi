import { getOrganizationBySlug } from "@repo/database";
import { notFound } from "next/navigation";
import { InviteMemberForm } from "@organizations/components/InviteMemberForm";
import { TeamMembersList } from "@organizations/components/TeamMembersList";
import { PageHeader } from "@shared/components/PageHeader";

export default async function TeamMembersPage({
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
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<PageHeader
					title="Pessoas"
					subtitle="Gerencie os membros da organização, envie convites e defina seus cargos."
				/>
				<InviteMemberForm organizationId={organization.id} />
			</div>
			<div className="mt-8">
				<TeamMembersList organizationId={organization.id} />
			</div>
		</div>
	);
}
