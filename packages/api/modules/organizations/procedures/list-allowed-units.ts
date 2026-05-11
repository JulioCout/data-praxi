import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const listAllowedUnits = protectedProcedure
	.route({
		method: "GET",
		path: "/organizations/units/allowed",
		tags: ["Organizations", "Units"],
		summary: "List units the user has access to",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ input: { organizationId }, context }) => {
		// Get user's member role in the organization
		const member = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId,
					userId: context.user.id,
				},
			},
		});

		if (!member) {
			return [];
		}

		// Admin and owner have access to all units
		if (["owner", "admin"].includes(member.role)) {
			return await db.unit.findMany({
				where: {
					organizationId,
				},
				orderBy: {
					name: "asc",
				},
			});
		}

		// Non-admin users only have access to units assigned to their teams
		const teamMemberships = await db.teamMember.findMany({
			where: {
				userId: context.user.id,
				team: {
					organizationId,
				},
			},
			select: {
				teamId: true,
			},
		});

		const teamIds = teamMemberships.map((tm) => tm.teamId);

		if (teamIds.length === 0) {
			return [];
		}

		return await db.unit.findMany({
			where: {
				organizationId,
				teamId: {
					in: teamIds,
				},
			},
			orderBy: {
				name: "asc",
			},
		});
	});
