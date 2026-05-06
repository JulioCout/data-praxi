"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { BuildingIcon, MapPinIcon, PhoneIcon, SearchIcon, TrashIcon, UserIcon, UsersIcon } from "lucide-react";
import { CreateUnitDialog } from "./CreateUnitDialog";
import { EditUnitDialog } from "./EditUnitDialog";

export function UnitsList({ organizationId }: { organizationId: string }) {
	const [searchTerm, setSearchTerm] = useState("");
	const queryClient = useQueryClient();

	const { data: units = [], isLoading } = useQuery(
		orpc.organizations.listUnits.queryOptions({ input: { organizationId } })
	);

	const deleteMutation = useMutation({
		...orpc.organizations.deleteUnit.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: orpc.organizations.listUnits.queryKey({ input: { organizationId } }),
			});
			toastSuccess("Unidade removida com sucesso.");
		},
		onError: () => {
			toastError("Erro ao remover a unidade.");
		},
	});

	const filteredUnits = units.filter((unit: any) =>
		unit.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<div className="text-muted-foreground">Carregando unidades...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Barra superior de ações */}
			<div className="flex flex-col sm:flex-row justify-between gap-4">
				<div className="relative w-full sm:max-w-xs">
					<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						placeholder="Buscar unidade pelo nome..."
						className="pl-9"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<CreateUnitDialog organizationId={organizationId} />
			</div>

			{/* Listagem em Grid */}
			{filteredUnits.length === 0 ? (
				<div className="rounded-xl border bg-card p-12 text-center">
					<BuildingIcon className="mx-auto size-12 text-muted-foreground/50 mb-4" />
					<h3 className="text-lg font-semibold">Nenhuma unidade encontrada</h3>
					<p className="text-muted-foreground mt-1">
						{searchTerm
							? "Tente buscar com outro nome."
							: "Você ainda não cadastrou nenhuma unidade nesta organização."}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredUnits.map((unit: any) => (
						<Card key={unit.id} className="relative group overflow-hidden">
							<CardHeader className="pb-3 pr-20">
								<CardTitle className="text-xl flex items-center gap-2">
									<BuildingIcon className="size-5 text-primary" />
									<span className="truncate" title={unit.name}>
										{unit.name}
									</span>
								</CardTitle>
								
								{/* Ações (Editar e Deletar) no canto superior direito */}
								<div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<EditUnitDialog organizationId={organizationId} unit={unit} />
									
									<AlertDialog>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<AlertDialogTrigger asChild>
														<Button
															size="icon"
															variant="ghost"
															className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
														>
															<TrashIcon className="size-4" />
														</Button>
													</AlertDialogTrigger>
												</TooltipTrigger>
												<TooltipContent>
													<p>Remover Unidade</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
												<AlertDialogDescription>
													Esta ação removerá a unidade "{unit.name}" permanentemente.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className="text-foreground border-foreground/20">
													Cancelar
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() =>
														deleteMutation.mutate({
															organizationId,
															unitId: unit.id,
														})
													}
													className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
												>
													Remover
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</CardHeader>

							<CardContent className="space-y-4 text-sm text-muted-foreground">
								{/* Equipe */}
								<div className="flex items-start gap-2">
									<UsersIcon className="size-4 mt-0.5 shrink-0" />
									<div>
										<strong className="block text-foreground">Equipe Responsável:</strong>
										<span>{unit.team?.name || "Nenhuma equipe atribuída"}</span>
									</div>
								</div>

								{/* Contato */}
								{(unit.contactName || unit.contactPhone || unit.contactEmail) && (
									<div className="flex items-start gap-2">
										<UserIcon className="size-4 mt-0.5 shrink-0" />
										<div>
											<strong className="block text-foreground">Contato:</strong>
											<div className="flex flex-col gap-0.5 mt-0.5">
												{unit.contactName && <span>{unit.contactName} {unit.contactRole ? `(${unit.contactRole})` : ""}</span>}
												{unit.contactPhone && (
													<span className="flex items-center gap-1.5"><PhoneIcon className="size-3" />{unit.contactPhone}</span>
												)}
												{unit.contactEmail && (
													<span className="truncate max-w-[200px]" title={unit.contactEmail}>{unit.contactEmail}</span>
												)}
											</div>
										</div>
									</div>
								)}

								{/* Endereço Resumido (Cidade/Estado) */}
								{(unit.city || unit.state || unit.street) && (
									<div className="flex items-start gap-2">
										<MapPinIcon className="size-4 mt-0.5 shrink-0" />
										<div>
											<strong className="block text-foreground">Endereço:</strong>
											<span className="block mt-0.5">
												{unit.city && unit.state 
													? `${unit.city}, ${unit.state}` 
													: (unit.city || unit.state || "Endereço incompleto")}
											</span>
											{unit.street && <span className="block text-xs mt-0.5 truncate" title={unit.street}>{unit.street}{unit.number ? `, ${unit.number}` : ""}</span>}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
