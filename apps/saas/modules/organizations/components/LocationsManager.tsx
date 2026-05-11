"use client";

import { useAllowedUnitsQuery } from "@organizations/lib/locations-api";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { useEffect, useState } from "react";
import { LocationsList } from "./LocationsList";
import { BuildingIcon } from "lucide-react";

export function LocationsManager({ organizationId }: { organizationId: string }) {
	const { data: allowedUnits = [], isLoading } = useAllowedUnitsQuery(organizationId);
	const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(undefined);

	// Auto-select the first unit if none is selected and units are available
	useEffect(() => {
		if (allowedUnits.length > 0 && !selectedUnitId) {
			setSelectedUnitId(allowedUnits[0].id);
		} else if (allowedUnits.length === 0 && selectedUnitId) {
			setSelectedUnitId(undefined);
		}
	}, [allowedUnits, selectedUnitId]);

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<div className="text-muted-foreground">Carregando unidades...</div>
			</div>
		);
	}

	if (allowedUnits.length === 0) {
		return (
			<div className="rounded-xl border bg-card p-12 text-center">
				<BuildingIcon className="mx-auto size-12 text-muted-foreground/50 mb-4" />
				<h3 className="text-lg font-semibold">Acesso Restrito</h3>
				<p className="text-muted-foreground mt-1">
					Você não tem acesso a nenhuma unidade nesta organização.
				</p>
			</div>
		);
	}

	// If the user only has access to one unit, we can just show it directly or show the select disabled
	const isSingleUnit = allowedUnits.length === 1;

	return (
		<div className="space-y-8">
			<div className="flex flex-col space-y-2">
				<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					Selecione a Unidade
				</label>
				<Select
					value={selectedUnitId}
					onValueChange={setSelectedUnitId}
					disabled={isSingleUnit}
				>
					<SelectTrigger className="w-full sm:max-w-md">
						<SelectValue placeholder="Selecione uma unidade" />
					</SelectTrigger>
					<SelectContent>
						{allowedUnits.map((unit: any) => (
							<SelectItem key={unit.id} value={unit.id}>
								{unit.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{isSingleUnit && (
					<p className="text-xs text-muted-foreground">
						Você está atribuído a apenas uma unidade.
					</p>
				)}
			</div>

			{selectedUnitId && (
				<div className="pt-4 border-t">
					<LocationsList unitId={selectedUnitId} />
				</div>
			)}
		</div>
	);
}
