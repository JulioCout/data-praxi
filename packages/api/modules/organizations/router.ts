import { createLogoUploadUrl } from "./procedures/create-logo-upload-url";
import { generateOrganizationSlug } from "./procedures/generate-organization-slug";
import { listTeamMembers } from "./procedures/list-team-members";
import { createUnit } from "./procedures/create-unit";
import { updateUnit } from "./procedures/update-unit";
import { deleteUnit } from "./procedures/delete-unit";
import { listUnits } from "./procedures/list-units";
import { listAllowedUnits } from "./procedures/list-allowed-units";
import { listLocations } from "./procedures/list-locations";
import { createLocation } from "./procedures/create-location";
import { updateLocation } from "./procedures/update-location";

export const organizationsRouter = {
	generateSlug: generateOrganizationSlug,
	createLogoUploadUrl,
	listTeamMembers,
	createUnit,
	updateUnit,
	deleteUnit,
	listUnits,
	listAllowedUnits,
	listLocations,
	createLocation,
	updateLocation,
};
