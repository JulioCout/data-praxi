import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const deleteUnit = protectedProcedure
	.route({
		method: "DELETE",
		path: "/organizations/units/{unitId}",
		tags: ["Organizations", "Units"],
		summary: "Delete an existing unit",
	})
	.input(
		z.object({
			organizationId: z.string(),
			unitId: z.string(),
		}),
	)
	.handler(async ({ input: { organizationId, unitId } }) => {
		await db.unit.delete({
			where: {
				id: unitId,
				organizationId,
			},
		});

		return { success: true };
	});
