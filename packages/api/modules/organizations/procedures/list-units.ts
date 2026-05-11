import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const listUnits = protectedProcedure
	.route({
		method: "GET",
		path: "/organizations/units",
		tags: ["Organizations", "Units"],
		summary: "List units for an organization",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ input: { organizationId }, context }) => {
		const member = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId,
					userId: context.user.id,
				},
			},
		});

		if (!member || !["owner", "admin"].includes(member.role)) {
			throw new ORPCError("FORBIDDEN", {
				message: "Apenas administradores podem listar unidades completas.",
			});
		}

		const units = await db.unit.findMany({
			where: {
				organizationId,
			},
			include: {
				team: true,
			},
			orderBy: {
				name: "asc",
			},
		});

		return units;
	});
