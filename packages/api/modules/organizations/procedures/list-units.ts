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
	.handler(async ({ input: { organizationId } }) => {
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
