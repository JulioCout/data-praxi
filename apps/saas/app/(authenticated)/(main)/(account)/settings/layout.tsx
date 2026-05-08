import { config as paymentsConfig } from "@repo/payments/config";
import { PageHeader } from "@shared/components/PageHeader";
import { TabGroup } from "@shared/components/TabGroup";
import { getTranslations } from "next-intl/server";
import { PropsWithChildren } from "react";

export default async function SettingsLayout({ children }: PropsWithChildren) {
	const t = await getTranslations();

	const tabs = [
		{
			label: t("settings.menu.account.general"),
			href: "/settings/general",
			segment: "general",
		},
		{
			label: t("settings.menu.account.security"),
			href: "/settings/security",
			segment: "security",
		},
		{
			label: t("settings.menu.account.notifications"),
			href: "/settings/notifications",
			segment: "notifications",
		},
		...(paymentsConfig.billingAttachedTo === "user"
			? [
					{
						label: t("settings.menu.account.billing"),
						href: "/settings/billing",
						segment: "billing",
					},
				]
			: []),
	];

	return (
		<>
			<PageHeader title={t("app.menu.accountSettings")} />
			<div className="mb-8">
				<TabGroup items={tabs} />
			</div>
			{children}
		</>
	);
}
