import type { OrganizationMemberRole } from "@repo/auth";
import { useTranslations } from "next-intl";

export function useOrganizationMemberRoles() {
	const t = useTranslations();

	return {
		owner: "Administrador",
		admin: "Coordenador",
		supervisor: "Supervisor",
		member: "Técnico",
		auxiliar: "Auxiliar"
	} satisfies Record<OrganizationMemberRole, string>;
}
