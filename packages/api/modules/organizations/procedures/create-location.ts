import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const createLocation = protectedProcedure
	.route({
		method: "POST",
		path: "/organizations/locations",
		tags: ["Organizations", "Locations"],
		summary: "Create a new location for a unit",
	})
	.input(
		z.object({
			unitId: z.string(),
			name: z.string().min(1),
			description: z.string().optional(),
		}),
	)
	.handler(async ({ input: { unitId, name, description }, context }) => {
		// Verify unit exists and user has access
		const unit = await db.unit.findUnique({
			where: { id: unitId },
		});

		if (!unit) {
			throw new ORPCError("NOT_FOUND", {
				message: "Unit not found",
			});
		}

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

		// Check for uniqueness
		const existingLocation = await db.location.findFirst({
			where: {
				unitId,
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

		const location = await db.location.create({
			data: {
				unitId,
				name,
				description,
			},
		});

		return location;
	});
