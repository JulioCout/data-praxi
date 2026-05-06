import { db } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const listTeamMembers = protectedProcedure
	.route({
		method: "GET",
		path: "/organizations/teams/members",
		tags: ["Organizations"],
		summary: "List team members for organization admins",
		description: "List all members of a specific team",
	})
	.input(
		z.object({
			teamId: z.string(),
		}),
	)
	.handler(async ({ input: { teamId } }) => {
		const teamMembers = await db.teamMember.findMany({
			where: {
				teamId,
			},
			include: {
				user: true,
			},
		});

		return teamMembers;
	});
