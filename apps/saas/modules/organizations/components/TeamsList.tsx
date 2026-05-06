"use client";

import { useSession } from "@auth/hooks/use-session";
import { fullOrganizationQueryKey, useFullOrganizationQuery } from "@organizations/lib/api";
import { organizationTeamsQueryKey, useOrganizationTeamsQuery, useTeamMembersQuery, teamMembersQueryKey } from "@organizations/lib/api";
import { authClient } from "@repo/auth/client";
import { isOrganizationAdmin } from "@repo/auth/lib/helper";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/components/accordion";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { toastPromise } from "@repo/ui/components/toast";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon, TrashIcon, UsersIcon, Edit2Icon } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";

function TeamMemberManager({ teamId, organizationId }: { teamId: string; organizationId: string }) {
	const queryClient = useQueryClient();
	const { user } = useSession();
	const { data: teamMembers } = useTeamMembersQuery(teamId);
	const { data: organization } = useFullOrganizationQuery(organizationId);

	const userIsOrganizationAdmin = isOrganizationAdmin(organization, user);
	const [selectedUserId, setSelectedUserId] = useState<string>("");

	const getMemberUser = (userId: string) => {
		return organization?.members.find((m) => m.userId === userId)?.user;
	};

	const availableMembers = organization?.members.filter(
		(orgMember) => !teamMembers?.some((tm) => tm.userId === orgMember.userId)
	) ?? [];

	const handleAddMember = async () => {
		if (!selectedUserId) return;
		
		toastPromise(
			async () => {
				await authClient.organization.addTeamMember({
					teamId,
					userId: selectedUserId,
				});
			},
			{
				loading: "Adicionando membro à equipe...",
				success: () => {
					void queryClient.invalidateQueries({ queryKey: teamMembersQueryKey(teamId) });
					setSelectedUserId("");
					return "Membro adicionado com sucesso.";
				},
				error: "Erro ao adicionar membro.",
			}
		);
	};

	const handleRemoveMember = async (userId: string) => {
		toastPromise(
			async () => {
				await authClient.organization.removeTeamMember({
					teamId,
					userId,
				});
			},
			{
				loading: "Removendo membro...",
				success: () => {
					void queryClient.invalidateQueries({ queryKey: teamMembersQueryKey(teamId) });
					return "Membro removido com sucesso.";
				},
				error: "Erro ao remover membro.",
			}
		);
	};

	return (
		<div className="space-y-4">
			{userIsOrganizationAdmin && (
				<div className="flex gap-2 items-end">
					<div className="flex-1 space-y-1">
						<Label>Adicionar Membro</Label>
						<Select value={selectedUserId} onValueChange={setSelectedUserId}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione um membro da organização" />
							</SelectTrigger>
							<SelectContent>
								{availableMembers.map((member) => (
									<SelectItem key={member.user?.id} value={member.user?.id ?? ""}>
										{member.user?.name} ({member.user?.email})
									</SelectItem>
								))}
								{availableMembers.length === 0 && (
									<SelectItem value="empty" disabled>
										Todos os membros já estão nesta equipe.
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>
					<Button onClick={handleAddMember} disabled={!selectedUserId || selectedUserId === "empty"}>
						Adicionar
					</Button>
				</div>
			)}

			<div className="rounded-xl border mt-4">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent bg-muted/40">
							<TableHead className="first:pl-4">Membro</TableHead>
							<TableHead className="text-right pr-4">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{teamMembers?.map((teamMember) => {
							const userObj = getMemberUser(teamMember.userId);
							if (!userObj) return null;
							return (
								<TableRow key={teamMember.id}>
									<TableCell className="first:pl-4">
										<div className="flex items-center gap-3">
											<UserAvatar name={userObj.name} avatarUrl={userObj.image} className="size-8" />
											<div>
												<p className="font-medium text-sm">{userObj.name}</p>
												<p className="text-xs text-muted-foreground">{userObj.email}</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="text-right pr-4">
										{userIsOrganizationAdmin && (
											<Button 
												size="icon" 
												variant="ghost" 
												className="text-destructive hover:bg-destructive/10 hover:text-destructive"
												onClick={() => handleRemoveMember(teamMember.userId)}
											>
												<TrashIcon className="size-4" />
											</Button>
										)}
									</TableCell>
								</TableRow>
							);
						})}
						{teamMembers?.length === 0 && (
							<TableRow>
								<TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
									Nenhum membro nesta equipe.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export function TeamsList({ organizationId }: { organizationId: string }) {
	const queryClient = useQueryClient();
	const { user } = useSession();
	const { data: organization } = useFullOrganizationQuery(organizationId);
	const { data: teams } = useOrganizationTeamsQuery(organizationId);

	const userIsOrganizationAdmin = isOrganizationAdmin(organization, user);

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newTeamName, setNewTeamName] = useState("");

	const handleCreateTeam = async () => {
		if (!newTeamName.trim()) return;

		toastPromise(
			async () => {
				await authClient.organization.createTeam({
					name: newTeamName,
					organizationId,
				});
			},
			{
				loading: "Criando equipe...",
				success: () => {
					void queryClient.invalidateQueries({ queryKey: organizationTeamsQueryKey(organizationId) });
					setIsCreateModalOpen(false);
					setNewTeamName("");
					return "Equipe criada com sucesso.";
				},
				error: "Erro ao criar equipe.",
			}
		);
	};

	const handleUpdateTeam = async (teamId: string, newName: string) => {
		toastPromise(
			async () => {
				await authClient.organization.updateTeam({
					teamId,
					data: {
						name: newName,
					},
				});
			},
			{
				loading: "Renomeando equipe...",
				success: () => {
					void queryClient.invalidateQueries({ queryKey: organizationTeamsQueryKey(organizationId) });
					return "Equipe renomeada com sucesso.";
				},
				error: "Erro ao renomear equipe.",
			}
		);
	};

	const handleDeleteTeam = async (teamId: string) => {
		toastPromise(
			async () => {
				await authClient.organization.removeTeam({
					teamId,
					organizationId,
				});
			},
			{
				loading: "Removendo equipe...",
				success: () => {
					void queryClient.invalidateQueries({ queryKey: organizationTeamsQueryKey(organizationId) });
					return "Equipe removida com sucesso.";
				},
				error: "Erro ao remover equipe.",
			}
		);
	};

	return (
		<div className="space-y-6">
			{userIsOrganizationAdmin && (
				<div className="flex justify-end">
					<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
						<DialogTrigger asChild>
							<Button className="gap-2">
								<PlusIcon className="size-4" />
								Nova Equipe
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Criar Nova Equipe</DialogTitle>
								<DialogDescription>
									Dê um nome para a sua equipe. Você poderá adicionar membros depois.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="team-name">Nome da Equipe</Label>
									<Input 
										id="team-name" 
										placeholder="Ex: Vendas" 
										value={newTeamName} 
										onChange={(e) => setNewTeamName(e.target.value)} 
										onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="text-foreground border-foreground/20">Cancelar</Button>
								<Button onClick={handleCreateTeam} disabled={!newTeamName.trim()}>Criar Equipe</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			)}

			{teams?.length === 0 ? (
				<div className="text-center py-12 text-muted-foreground border rounded-2xl bg-card">
					<UsersIcon className="size-12 mx-auto mb-4 text-muted-foreground/50" />
					<p>Nenhuma equipe criada.</p>
				</div>
			) : (
				<Accordion type="single" collapsible className="w-full bg-card border rounded-2xl p-2 px-4 space-y-2">
					{teams?.map((team) => (
						<AccordionItem value={team.id} key={team.id} className="border-b last:border-b-0">
							<AccordionTrigger className="hover:no-underline hover:bg-accent/30 rounded-lg px-2 transition-colors">
								<div className="flex items-center gap-2">
									<UsersIcon className="size-5 text-muted-foreground" />
									<span className="font-semibold text-base">{team.name}</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pt-4 px-2 space-y-6">
								<div className="flex justify-between items-center bg-accent/40 p-4 rounded-xl">
									<div>
										<p className="font-medium text-sm">Gerenciar Equipe</p>
										<p className="text-xs text-muted-foreground">Renomeie ou exclua esta equipe.</p>
									</div>
									<div className="flex gap-2">
										<Button 
											variant="outline" 
											size="sm" 
											className="gap-2 text-foreground border-foreground/20"
											onClick={() => {
												const newName = prompt("Novo nome da equipe:", team.name);
												if (newName && newName.trim() !== team.name) {
													handleUpdateTeam(team.id, newName.trim());
												}
											}}
										>
											<Edit2Icon className="size-4" />
											Renomear
										</Button>
										<Button 
											variant="destructive" 
											size="sm" 
											className="gap-2"
											onClick={() => {
												if (confirm("Tem certeza que deseja remover esta equipe permanentemente?")) {
													handleDeleteTeam(team.id);
												}
											}}
										>
											<TrashIcon className="size-4" />
											Remover
										</Button>
									</div>
								</div>
								
								<TeamMemberManager teamId={team.id} organizationId={organizationId} />
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}
		</div>
	);
}
