import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const updateLocation = protectedProcedure
	.route({
		method: "PATCH",
		path: "/organizations/locations/{id}",
		tags: ["Organizations", "Locations"],
		summary: "Update an existing location",
	})
	.input(
		z.object({
			id: z.string(),
			name: z.string().min(1).optional(),
			description: z.string().optional(),
			isActive: z.boolean().optional(),
		}),
	)
	.handler(async ({ input: { id, name, description, isActive }, context }) => {
		const location = await db.location.findUnique({
			where: { id },
			include: { unit: true },
		});

		if (!location) {
			throw new ORPCError("NOT_FOUND", {
				message: "Location not found",
			});
		}

		const unit = location.unit;

		const member = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: unit.organizationId,
					userId: context.user.id,
				},
			},
		});

		if (!member) {
			throw new ORPCError("FORBIDDEN", {
				message: "You do not have access to this organization",
			});
		}

		if (!["owner", "admin", "supervisor"].includes(member.role)) {
			if (!unit.teamId) {
				throw new ORPCError("FORBIDDEN", {
					message: "You do not have access to this unit",
				});
			}

			const teamMembership = await db.teamMember.findFirst({
				where: {
					userId: context.user.id,
					teamId: unit.teamId,
				},
			});

			if (!teamMembership) {
				throw new ORPCError("FORBIDDEN", {
					message: "You do not have access to this unit",
				});
			}
		}

		// Check for uniqueness if name is being updated
		if (name && name !== location.name) {
			const existingLocation = await db.location.findFirst({
				where: {
					unitId: location.unitId,
					id: { not: id },
					name: {
						equals: name,
						mode: "insensitive",
					},
				},
			});

			if (existingLocation) {
				throw new ORPCError("CONFLICT", {
					message: "A location with this name already exists in this unit",
				});
			}
		}

		const updatedLocation = await db.location.update({
			where: { id },
			data: {
				name,
				description,
				isActive,
			},
		});

		return updatedLocation;
	});
