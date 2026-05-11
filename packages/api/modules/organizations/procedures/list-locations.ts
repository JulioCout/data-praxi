import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const listLocations = protectedProcedure
	.route({
		method: "GET",
		path: "/organizations/locations",
		tags: ["Organizations", "Locations"],
		summary: "List locations for a unit",
	})
	.input(
		z.object({
			unitId: z.string(),
		}),
	)
	.handler(async ({ input: { unitId } }) => {
		const locations = await db.location.findMany({
			where: {
				unitId,
			},
			orderBy: {
				name: "asc",
			},
		});

		return locations;
	});
