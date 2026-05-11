"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLocationMutation } from "@organizations/lib/locations-api";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(1, "O nome do local é obrigatório"),
	description: z.string().optional(),
});

export function CreateLocationDialog({ unitId }: { unitId: string }) {
	const [open, setOpen] = useState(false);
	const createMutation = useCreateLocationMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		try {
			await createMutation.mutateAsync({
				unitId,
				name: values.name,
				description: values.description,
			});
			toastSuccess("Local criado com sucesso.");
			setOpen(false);
			form.reset();
		} catch (error: any) {
			toastError(error?.message || "Erro ao criar o local.");
		}
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-full sm:w-auto">
					<PlusIcon className="mr-2 size-4" />
					Novo Local
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Criar Novo Local</DialogTitle>
					<DialogDescription>
						Adicione um novo local a esta unidade. O nome deve ser único na unidade.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome do Local</FormLabel>
									<FormControl>
										<Input placeholder="Ex: Sala 101, Auditório, etc." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descrição (Opcional)</FormLabel>
									<FormControl>
										<Input placeholder="Breve descrição do local" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="mt-4">
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								Cancelar
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? "Criando..." : "Criar Local"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
