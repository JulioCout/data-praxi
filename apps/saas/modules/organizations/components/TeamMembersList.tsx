"use client";
import { useSession } from "@auth/hooks/use-session";
import { useOrganizationMemberRoles } from "@organizations/hooks/member-roles";
import { fullOrganizationQueryKey, useFullOrganizationQuery } from "@organizations/lib/api";
import type { OrganizationMemberRole } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { isOrganizationAdmin } from "@repo/auth/lib/helper";
import { Button } from "@repo/ui/components/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { toastPromise } from "@repo/ui/components/toast";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TrashIcon } from "lucide-react";
import { useState } from "react";

import { OrganizationRoleSelect } from "./OrganizationRoleSelect";

export function TeamMembersList({ organizationId }: { organizationId: string }) {
	const queryClient = useQueryClient();
	const { user } = useSession();
	const { data: organization } = useFullOrganizationQuery(organizationId);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const memberRoles = useOrganizationMemberRoles();

	const userIsOrganizationAdmin = isOrganizationAdmin(organization, user);

	const updateMemberRole = async (memberId: string, role: OrganizationMemberRole) => {
		toastPromise(
			async () => {
				await authClient.organization.updateMemberRole({
					memberId,
					role,
					organizationId,
				});
			},
			{
				loading: "Atualizando cargo...",
				success: () => {
					void queryClient.invalidateQueries({
						queryKey: fullOrganizationQueryKey(organizationId),
					});
					return "Cargo atualizado com sucesso.";
				},
				error: "Erro ao atualizar cargo.",
			},
		);
	};

	const removeMember = async (memberId: string) => {
		toastPromise(
			async () => {
				await authClient.organization.removeMember({
					memberIdOrEmail: memberId,
					organizationId,
				});
			},
			{
				loading: "Removendo membro...",
				success: () => {
					void queryClient.invalidateQueries({
						queryKey: fullOrganizationQueryKey(organizationId),
					});
					return "Membro removido com sucesso.";
				},
				error: "Erro ao remover membro.",
			},
		);
	};

	const columns: ColumnDef<NonNullable<typeof organization>["members"][number]>[] = [
		{
			accessorKey: "user",
			header: "Usuário",
			accessorFn: (row) => row.user,
			cell: ({ row }) =>
				row.original.user ? (
					<div className="gap-3 flex items-center">
						<UserAvatar
							name={row.original.user.name ?? row.original.user.email}
							avatarUrl={row.original.user?.image}
							className="size-10"
						/>
						<div>
							<strong className="block text-sm font-semibold">{row.original.user.name}</strong>
							<small className="text-foreground/60">{row.original.user.email}</small>
						</div>
					</div>
				) : null,
		},
		{
			accessorKey: "phone",
			header: "Telefone",
			cell: () => <span className="text-muted-foreground">-</span>,
		},
		{
			accessorKey: "role",
			header: "Cargo",
			cell: ({ row }) => {
				return (
					<div className="flex items-center">
						{userIsOrganizationAdmin ? (
							<OrganizationRoleSelect
								value={row.original.role}
								onSelect={async (value) => updateMemberRole(row.original.id, value)}
								disabled={!userIsOrganizationAdmin || row.original.role === "owner"}
							/>
						) : (
							<span className="font-medium text-sm text-foreground/60">
								{memberRoles[row.original.role as keyof typeof memberRoles]}
							</span>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "actions",
			header: "Ações",
			cell: ({ row }) => {
				return (
					<div className="flex flex-row justify-end pr-2">
						{userIsOrganizationAdmin && row.original.role !== "owner" && (
							<AlertDialog>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<AlertDialogTrigger asChild>
												<Button 
													size="icon" 
													variant="ghost" 
													className="text-destructive hover:text-destructive hover:bg-destructive/10"
												>
													<TrashIcon className="size-4" />
												</Button>
											</AlertDialogTrigger>
										</TooltipTrigger>
										<TooltipContent>
											<p>Remover Membro</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
										<AlertDialogDescription>
											Esta ação removerá o membro da equipe. Caso queira readmiti-lo no futuro, será necessário enviar um novo convite.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="text-foreground border-foreground/20">Cancelar</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => removeMember(row.original.id)}
											className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
										>
											Remover
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: organization?.members ?? [],
		columns,
		manualPagination: true,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<div className="rounded-2xl border bg-card overflow-hidden">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="hover:bg-transparent bg-muted/40">
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} className="text-muted-foreground font-medium first:pl-6">
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-accent/30">
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className="py-4 first:pl-6">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								Nenhum membro encontrado.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
