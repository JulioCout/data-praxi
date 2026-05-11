"use client";

import { useLocationsQuery, useUpdateLocationMutation } from "@organizations/lib/locations-api";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { MapPinIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { CreateLocationDialog } from "./CreateLocationDialog";
import { EditLocationDialog } from "./EditLocationDialog";

export function LocationsList({ unitId }: { unitId: string }) {
	const [searchTerm, setSearchTerm] = useState("");

	const { data: locations = [], isLoading } = useLocationsQuery(unitId);

	const updateMutation = useUpdateLocationMutation();

	const handleToggleActive = async (location: any) => {
		try {
			await updateMutation.mutateAsync({
				id: location.id,
				unitId: location.unitId,
				isActive: !location.isActive,
			});
			toastSuccess(`Local marcado como ${!location.isActive ? "ativo" : "inativo"}.`);
		} catch (error) {
			toastError("Erro ao alterar o status do local.");
		}
	};

	const filteredLocations = locations.filter((loc: any) =>
		loc.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<div className="text-muted-foreground">Carregando locais...</div>
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
						placeholder="Buscar local pelo nome..."
						className="pl-9"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<CreateLocationDialog unitId={unitId} />
			</div>

			{/* Listagem em Grid */}
			{filteredLocations.length === 0 ? (
				<div className="rounded-xl border bg-card p-12 text-center">
					<MapPinIcon className="mx-auto size-12 text-muted-foreground/50 mb-4" />
					<h3 className="text-lg font-semibold">Nenhum local encontrado</h3>
					<p className="text-muted-foreground mt-1">
						{searchTerm
							? "Tente buscar com outro nome."
							: "Você ainda não cadastrou nenhum local nesta unidade."}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredLocations.map((location: any) => (
						<Card key={location.id} className={`relative group overflow-hidden ${!location.isActive ? 'opacity-60 grayscale-[50%]' : ''}`}>
							<CardHeader className="pb-3 pr-20">
								<CardTitle className="text-xl flex items-center gap-2">
									<MapPinIcon className="size-5 text-primary" />
									<span className="truncate" title={location.name}>
										{location.name}
									</span>
								</CardTitle>
								
								{/* Ações (Editar e Desativar) no canto superior direito */}
								<div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<EditLocationDialog location={location} />
									
									<Button
										size="sm"
										variant={location.isActive ? "secondary" : "default"}
										onClick={() => handleToggleActive(location)}
									>
										{location.isActive ? "Desativar" : "Ativar"}
									</Button>
								</div>
							</CardHeader>

							<CardContent className="space-y-4 text-sm text-muted-foreground">
								<div className="flex items-center justify-between">
									<Badge variant={location.isActive ? "default" : "secondary"}>
										{location.isActive ? "Ativo" : "Inativo"}
									</Badge>
								</div>
								{location.description && (
									<div>
										<strong className="block text-foreground">Descrição:</strong>
										<span className="block mt-0.5">{location.description}</span>
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
