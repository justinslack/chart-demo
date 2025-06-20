import React from "react";
import ActivityChart from "../components/ActivityChart";

export default function ActivityPage() {
	return (
		<div className="max-w-6xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-8">Activity chart</h1>
			<ActivityChart />
		</div>
	);
}
