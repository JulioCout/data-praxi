import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const updateUnit = protectedProcedure
	.route({
		method: "PATCH",
		path: "/organizations/units/{unitId}",
		tags: ["Organizations", "Units"],
		summary: "Update an existing unit",
	})
	.input(
		z.object({
			organizationId: z.string(),
			unitId: z.string(),
			name: z.string().optional(),
			teamId: z.string().nullable().optional(),
			street: z.string().nullable().optional(),
			state: z.string().nullable().optional(),
			city: z.string().nullable().optional(),
			neighborhood: z.string().nullable().optional(),
			zipCode: z.string().nullable().optional(),
			number: z.string().nullable().optional(),
			complement: z.string().nullable().optional(),
			contactName: z.string().nullable().optional(),
			contactRole: z.string().nullable().optional(),
			contactPhone: z.string().nullable().optional(),
			contactEmail: z.string().nullable().optional(),
		}),
	)
	.handler(async ({ input }) => {
		const { unitId, organizationId, ...data } = input;
		
		const unit = await db.unit.update({
			where: {
				id: unitId,
				organizationId,
			},
			data,
		});

		return unit;
	});
