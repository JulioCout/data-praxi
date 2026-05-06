import { createLogoUploadUrl } from "./procedures/create-logo-upload-url";
import { generateOrganizationSlug } from "./procedures/generate-organization-slug";
import { listTeamMembers } from "./procedures/list-team-members";

export const organizationsRouter = {
	generateSlug: generateOrganizationSlug,
	createLogoUploadUrl,
	listTeamMembers,
};
