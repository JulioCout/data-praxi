"use client";
import { useSession } from "@auth/hooks/use-session";
import { useFullOrganizationQuery } from "@organizations/lib/api";
import { isOrganizationAdmin } from "@repo/auth/lib/helper";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { InviteMemberForm } from "./InviteMemberForm";
import { TeamMembersList } from "./TeamMembersList";
import { TeamsList } from "./TeamsList";

export function TeamManagementBlock({ organizationId }: { organizationId: string }) {
	const [activeTab, setActiveTab] = useState("members");
	const { user } = useSession();
	const { data: organization } = useFullOrganizationQuery(organizationId);

	const userIsOrganizationAdmin = isOrganizationAdmin(organization, user);
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

	return (
		<div className="w-full space-y-6">
			<Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab)}>
				<div className="flex flex-row justify-between items-center mb-6">
					<TabsList>
						<TabsTrigger value="members">Pessoas</TabsTrigger>
						<TabsTrigger value="teams">Equipes</TabsTrigger>
					</TabsList>
					
					{userIsOrganizationAdmin && activeTab === "members" && (
						<Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
							<DialogTrigger asChild>
								<Button className="gap-2">
									<PlusIcon className="size-4" />
									Convidar Membro
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Convidar Membro</DialogTitle>
								</DialogHeader>
								<div className="pt-4">
									<InviteMemberForm organizationId={organizationId} />
								</div>
							</DialogContent>
						</Dialog>
					)}
				</div>
				<TabsContent value="members" className="mt-0">
					<TeamMembersList organizationId={organizationId} />
				</TabsContent>
				<TabsContent value="teams" className="mt-0">
					<TeamsList organizationId={organizationId} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
