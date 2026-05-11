import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const createUnit = protectedProcedure
	.route({
		method: "POST",
		path: "/organizations/units",
		tags: ["Organizations", "Units"],
		summary: "Create a new unit for an organization",
	})
	.input(
		z.object({
			organizationId: z.string(),
			name: z.string().min(1),
		}),
	)
	.handler(async ({ input: { organizationId, name }, context }) => {
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
				message: "Apenas administradores podem criar unidades.",
			});
		}

		const unit = await db.unit.create({
			data: {
				organizationId,
				name,
			},
		});

		return unit;
	});
