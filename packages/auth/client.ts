import { passkeyClient } from "@better-auth/passkey/client";
import {
	adminClient,
	inferAdditionalFields,
	magicLinkClient,
	organizationClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from ".";
import * as permissions from "./permissions";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		magicLinkClient(),
		organizationClient({
			ac: permissions.ac,
			roles: {
				owner: permissions.owner,
				admin: permissions.admin,
				member: permissions.member,
				gerente: permissions.gerente,
				supervisor: permissions.supervisor,
				auxiliar: permissions.auxiliar,
			},
		}),
		adminClient(),
		passkeyClient(),
		twoFactorClient(),
	],
});

export type AuthClientErrorCodes = typeof authClient.$ERROR_CODES & {
	INVALID_INVITATION: string;
};
