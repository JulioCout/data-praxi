import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const allowedUnitsQueryKey = (organizationId: string) => ["allowedUnits", organizationId] as const;
export const useAllowedUnitsQuery = (organizationId: string) => {
	return useQuery({
		queryKey: allowedUnitsQueryKey(organizationId),
		queryFn: async () => {
			const data = await orpcClient.organizations.listAllowedUnits({ organizationId });
			return data;
		},
		enabled: !!organizationId,
	});
};

export const locationsQueryKey = (unitId: string) => ["locations", unitId] as const;
export const useLocationsQuery = (unitId: string) => {
	return useQuery({
		queryKey: locationsQueryKey(unitId),
		queryFn: async () => {
			const data = await orpcClient.organizations.listLocations({ unitId });
			return data;
		},
		enabled: !!unitId,
	});
};

export const createLocationMutationKey = ["createLocation"] as const;
export const useCreateLocationMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: createLocationMutationKey,
		mutationFn: async ({
			unitId,
			name,
			description,
		}: {
			unitId: string;
			name: string;
			description?: string;
		}) => {
			const data = await orpcClient.organizations.createLocation({ unitId, name, description });
			return data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: locationsQueryKey(variables.unitId) });
		},
	});
};

export const updateLocationMutationKey = ["updateLocation"] as const;
export const useUpdateLocationMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: updateLocationMutationKey,
		mutationFn: async ({
			id,
			name,
			description,
			isActive,
			unitId,
		}: {
			id: string;
			name?: string;
			description?: string;
			isActive?: boolean;
			unitId: string; // Used for cache invalidation
		}) => {
			const data = await orpcClient.organizations.updateLocation({ id, name, description, isActive });
			return data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: locationsQueryKey(variables.unitId) });
		},
	});
};
