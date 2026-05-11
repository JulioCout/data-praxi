import { ORPCError } from "@orpc/server";
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
	.handler(async ({ input: { teamId }, context }) => {
		const team = await db.team.findUnique({ where: { id: teamId } });
		
		if (!team) {
			throw new ORPCError("NOT_FOUND", { message: "Team not found" });
		}

		const member = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: team.organizationId,
					userId: context.user.id,
				},
			},
		});

		if (!member || !["owner", "admin"].includes(member.role)) {
			throw new ORPCError("FORBIDDEN", {
				message: "Apenas administradores podem listar membros de equipes.",
			});
		}

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
