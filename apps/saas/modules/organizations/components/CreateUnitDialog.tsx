"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { PlusIcon } from "lucide-react";

const formSchema = z.object({
	name: z.string().min(1, "O nome é obrigatório"),
});

export function CreateUnitDialog({ organizationId }: { organizationId: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "" },
	});

	const createMutation = useMutation({
		...orpc.organizations.createUnit.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: orpc.organizations.listUnits.queryKey({ input: { organizationId } }),
			});
			setIsOpen(false);
			form.reset();
			toastSuccess("Unidade criada com sucesso.");
		},
		onError: () => {
			toastError("Ocorreu um erro ao criar a unidade.");
		},
	});

	const onSubmit = form.handleSubmit((values) => {
		createMutation.mutate({ organizationId, name: values.name });
	});

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon className="mr-2 size-4" />
					Adicionar Unidade
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nova Unidade</DialogTitle>
					<DialogDescription>Dê um nome para a nova unidade da organização.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className="flex flex-col gap-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome da Unidade</FormLabel>
									<FormControl>
										<Input placeholder="Ex: Matriz, Filial Norte..." {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="mt-2 flex justify-end gap-2">
							<Button
								variant="outline"
								type="button"
								className="text-foreground border-foreground/20"
								onClick={() => setIsOpen(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" loading={createMutation.isPending}>
								Criar Unidade
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
