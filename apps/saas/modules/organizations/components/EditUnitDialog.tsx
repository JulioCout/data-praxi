"use client";

import { useOrganizationTeamsQuery } from "@organizations/lib/api";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { PencilIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";

const formSchema = z.object({
	name: z.string().min(1, "O nome é obrigatório"),
	teamId: z.string().optional().nullable(),
	street: z.string().optional().nullable(),
	number: z.string().optional().nullable(),
	complement: z.string().optional().nullable(),
	neighborhood: z.string().optional().nullable(),
	city: z.string().optional().nullable(),
	state: z.string().optional().nullable(),
	zipCode: z.string().optional().nullable(),
	contactName: z.string().optional().nullable(),
	contactRole: z.string().optional().nullable(),
	contactPhone: z.string().optional().nullable(),
	contactEmail: z.string().optional().nullable(),
});

type Unit = any; // We'll infer from the query data or pass explicitly

export function EditUnitDialog({ organizationId, unit }: { organizationId: string; unit: Unit }) {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: teams } = useOrganizationTeamsQuery(organizationId);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: unit.name || "",
			teamId: unit.teamId || null,
			street: unit.street || "",
			number: unit.number || "",
			complement: unit.complement || "",
			neighborhood: unit.neighborhood || "",
			city: unit.city || "",
			state: unit.state || "",
			zipCode: unit.zipCode || "",
			contactName: unit.contactName || "",
			contactRole: unit.contactRole || "",
			contactPhone: unit.contactPhone || "",
			contactEmail: unit.contactEmail || "",
		},
	});

	const updateMutation = useMutation({
		...orpc.organizations.updateUnit.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: orpc.organizations.listUnits.queryKey({ input: { organizationId } }),
			});
			setIsOpen(false);
			toastSuccess("Unidade atualizada com sucesso.");
		},
		onError: () => {
			toastError("Ocorreu um erro ao atualizar a unidade.");
		},
	});

	const onSubmit = form.handleSubmit((values) => {
		updateMutation.mutate({
			organizationId,
			unitId: unit.id,
			...values,
		});
	});

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground">
					<PencilIcon className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Editar Unidade</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className="flex flex-col gap-6 mt-4">
						
						{/* Seção: Dados Principais */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium border-b pb-2">Dados Principais</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nome da Unidade *</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="teamId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Equipe Responsável</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value || undefined}
												value={field.value || undefined}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Selecione uma equipe" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{teams?.map((team: any) => (
														<SelectItem key={team.id} value={team.id}>
															{team.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Seção: Contato */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium border-b pb-2">Pessoa Responsável</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="contactName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nome</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="contactRole"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Cargo</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="contactPhone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Telefone</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="contactEmail"
									render={({ field }) => (
										<FormItem>
											<FormLabel>E-mail</FormLabel>
											<FormControl>
												<Input type="email" {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Seção: Endereço */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium border-b pb-2">Endereço</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="zipCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>CEP</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="street"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Rua</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="number"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Número</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="complement"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Complemento</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="neighborhood"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Bairro</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Cidade</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Estado</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="mt-2 flex justify-end gap-2 pt-4 border-t">
							<Button
								variant="outline"
								type="button"
								className="text-foreground border-foreground/20"
								onClick={() => setIsOpen(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" loading={updateMutation.isPending}>
								Salvar Alterações
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
