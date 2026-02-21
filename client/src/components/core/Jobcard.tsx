import React from 'react';

// Define the shape of the data this component expects
interface JobProps {
  id: number | string;
  title: string;
  budget: number;
  location: string;
  postedDate: string;
}

// Wrap the props in an object and define the type
const JobCard: React.FC<JobProps> = ({ id, title, budget, location, postedDate }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
      <h4 className="font-semibold text-lg">{title}</h4>
      
      <p className="text-sm text-gray-500 mt-1">
        Budget: <span className="font-medium text-gray-800">₹{budget.toLocaleString('en-IN')}</span> 
        &nbsp;— Location: {location}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">Posted {postedDate}</div>
        <button className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
          View Details
        </button>
      </div>
    </div>
  );
};

export default JobCard;