import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import jobApi, { Job, JobStatus } from "../../api/job";
import { UserContext } from "../../context/UserContext";

// Page where workers browse all available jobs and apply

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-16" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
    <div className="h-3 bg-gray-100 rounded w-3/4 mb-4" />
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-200 rounded w-20" />
      <div className="h-8 bg-gray-200 rounded-xl w-24" />
    </div>
  </div>
);

const WorkerJobBoard: React.FC = () => {
  const { user } = useContext(UserContext)!;
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track apply state per job
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [search, setSearch] = useState("");

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await jobApi.getAvailableJobs();
      setJobs(resp.jobs || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const handleApply = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation(); // don't navigate to job detail
    if (pendingId) return;

    const alreadyApplied = appliedIds.has(jobId);
    setPendingId(jobId);
    try {
      if (alreadyApplied) {
        await jobApi.cancelRequest(jobId);
        setAppliedIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
        showToast("Application withdrawn.", "success");
      } else {
        await jobApi.requestJob(jobId);
        setAppliedIds(prev => new Set(prev).add(jobId));
        showToast("Applied! The contractor will review your application.", "success");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setPendingId(null);
    }
  };

  const filtered = search.trim()
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.description?.toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success"
            ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Apply to jobs that match your skills. Contractors will assign you once they review applications.
          </p>
        </div>

        {/* Search + refresh */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
          <button onClick={loadJobs} disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Summary */}
        {!loading && !error && (
          <p className="text-xs text-gray-400 mb-4">
            {filtered.length} job{filtered.length !== 1 ? "s" : ""} available
            {appliedIds.size > 0 && ` · You applied to ${appliedIds.size}`}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 mb-4">
            {error}
            <button onClick={loadJobs} className="ml-auto underline">Retry</button>
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-700 mb-1">
              {search ? "No jobs match your search" : "No jobs available right now"}
            </h3>
            <p className="text-sm text-gray-500">
              {search ? "Try different keywords." : "Check back later — new jobs are posted regularly."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(job => {
              const applied = appliedIds.has(job._id);
              const isPending = pendingId === job._id;
              const contractorName = (job.contractor as any)?.name;

              return (
                <div key={job._id}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-base leading-snug">{job.title}</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                        Open
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{job.description}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
                      {contractorName && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {contractorName}
                        </span>
                      )}
                      {job.location?.coordinates && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.location.coordinates[1]?.toFixed(3)}°N, {job.location.coordinates[0]?.toFixed(3)}°E
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(job.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold text-teal-700">₹{job.budget.toLocaleString("en-IN")}</p>
                      </div>
                      <button
                        onClick={e => handleApply(e, job._id)}
                        disabled={isPending}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
                          applied
                            ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200"
                            : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                        }`}
                      >
                        {isPending ? (
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : applied ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Applied
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Apply Now
                          </>
                        )}
                      </button>
                    </div>

                    {/* Applied confirmation strip */}
                    {applied && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 rounded-lg px-3 py-2">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Application sent — waiting for contractor to assign you. Click "Applied" to withdraw.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerJobBoard;