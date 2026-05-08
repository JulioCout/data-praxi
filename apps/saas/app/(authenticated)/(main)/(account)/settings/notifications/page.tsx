import { getSession } from "@auth/lib/server";
import { NotificationPreferencesForm } from "@settings/components/NotificationPreferencesForm";
import { SettingsList } from "@shared/components/SettingsList";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata() {
	const t = await getTranslations("settings.notificationsPage");

	return {
		title: t("title"),
	};
}

export default async function NotificationSettingsPage() {
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}

	const t = await getTranslations("settings.notificationsPage");

	return (
		<>

			<SettingsList>
				<NotificationPreferencesForm />
			</SettingsList>
		</>
	);
}
