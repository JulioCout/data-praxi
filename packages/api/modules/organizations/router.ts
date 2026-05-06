import { createLogoUploadUrl } from "./procedures/create-logo-upload-url";
import { generateOrganizationSlug } from "./procedures/generate-organization-slug";
import { listTeamMembers } from "./procedures/list-team-members";
import { createUnit } from "./procedures/create-unit";
import { updateUnit } from "./procedures/update-unit";
import { deleteUnit } from "./procedures/delete-unit";
import { listUnits } from "./procedures/list-units";

export const organizationsRouter = {
	generateSlug: generateOrganizationSlug,
	createLogoUploadUrl,
	listTeamMembers,
	createUnit,
	updateUnit,
	deleteUnit,
	listUnits,
};
