import DrillDownChart from "../components/DrillDownChart";

export default function Home() {
	return (
		<div className="max-w-4xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-8">New Chart Demo</h1>
			<DrillDownChart />
		</div>
	);
}
