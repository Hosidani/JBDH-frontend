
import React from "react";

interface Job {
	jobId: number;
	title: string;
	company: string;
	location: string;
	description: string;
	postedDate?: string;
	webpageUrl?: string;
}

interface JobCardProps {
	job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => (
	<div className="bg-white rounded shadow p-4 mb-4 border border-gray-200">
		<h3 className="text-lg font-bold mb-1">{job.title}</h3>
		<div className="text-sm text-gray-600 mb-1">{job.company} • {job.location}</div>
		{job.postedDate && (
			<div className="text-xs text-gray-400 mb-2">Posted: {new Date(job.postedDate).toLocaleDateString()}</div>
		)}
		<div className="mt-2 text-gray-700 text-sm">
			{job.description.length > 300 ? job.description.slice(0, 300) + "..." : job.description}
		</div>
		{job.webpageUrl && (
			<a
				href={job.webpageUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-600 underline mt-3 block font-medium"
			>
				View Job
			</a>
		)}
	</div>
);

export default JobCard;
