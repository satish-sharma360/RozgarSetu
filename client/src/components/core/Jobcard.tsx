import React from 'react';
import { useNavigate } from 'react-router-dom';

export type JobStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface JobProps {
  id: number | string;
  title: string;
  budget: number;
  location: string | [number, number];
  postedDate: string;
  status?: JobStatus;
  workerName?: string;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  accepted:    { label: 'Accepted',    className: 'bg-blue-100 text-blue-800 border border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-orange-100 text-orange-800 border border-orange-200' },
  completed:   { label: 'Completed',   className: 'bg-green-100 text-green-800 border border-green-200' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-100 text-red-800 border border-red-200' },
};

function formatLocation(loc: string | [number, number]): string {
  if (Array.isArray(loc)) {
    const [lng, lat] = loc;
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  }
  return loc || 'Location not set';
}

const JobCard: React.FC<JobProps> = ({ id, title, budget, location, postedDate, status, workerName }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/jobs/${id}`)}
      className="group p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 bg-white cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-teal-700 transition-colors">
          {title}
        </h4>
        {status && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusConfig[status]?.className ?? ''}`}>
            {statusConfig[status]?.label ?? status}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{formatLocation(location)}</span>
      </div>

      {workerName && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Worker: {workerName}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-teal-700">₹{budget.toLocaleString('en-IN')}</span>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{postedDate}</span>
          <span className="text-teal-600 font-medium group-hover:underline">View →</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;