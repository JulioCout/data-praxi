import { PageHeader } from "@shared/components/PageHeader";

export default async function UnitsPage() {
	return (
		<div className="container max-w-6xl py-8">
			<PageHeader
				title="Unidades"
				subtitle="Gerencie as unidades da organização."
			/>
			<div className="mt-8 p-12 text-center border rounded-xl bg-card">
				<p className="text-muted-foreground">Em breve...</p>
			</div>
		</div>
	);
}
