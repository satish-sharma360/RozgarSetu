import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import jobApi, { Job, JobStatus } from "../../api/job";
import userApi, { User as WorkerUser } from "../../api/user";
import { UserContext } from "../../context/UserContext";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="p-5 border border-gray-100 rounded-xl bg-white animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-5 bg-gray-200 rounded-full w-20" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
    <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
    <div className="flex justify-between">
      <div className="h-5 bg-gray-200 rounded w-20" />
      <div className="h-8 bg-gray-200 rounded-xl w-28" />
    </div>
  </div>
);

const statusConfig: Record<string, { label: string; pill: string }> = {
  pending:     { label: "Pending",     pill: "bg-yellow-100 text-yellow-700" },
  accepted:    { label: "Accepted",    pill: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", pill: "bg-orange-100 text-orange-700" },
  completed:   { label: "Completed",   pill: "bg-green-100 text-green-700" },
  cancelled:   { label: "Cancelled",   pill: "bg-red-100 text-red-700" },
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────
interface AssignModalProps {
  job: Job;
  onClose: () => void;
  onAssigned: () => void;
}

const AssignModal: React.FC<AssignModalProps> = ({ job, onClose, onAssigned }) => {
  const [tab, setTab] = useState<"requests" | "all">("requests");
  const [requestWorkers, setRequestWorkers] = useState<WorkerUser[]>([]);
  const [allWorkers, setAllWorkers]         = useState<WorkerUser[]>([]);
  const [loadingReq, setLoadingReq]         = useState(true);
  const [loadingAll, setLoadingAll]         = useState(false);
  const [selectedId, setSelectedId]         = useState("");
  const [assigning, setAssigning]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [search, setSearch]                 = useState("");

  // Always load requests on mount
  useEffect(() => {
    (async () => {
      setLoadingReq(true);
      try {
        const resp = await jobApi.getJobRequests(job._id);
        setRequestWorkers(resp.requests || []);
      } catch {
        setRequestWorkers([]);
      } finally {
        setLoadingReq(false);
      }
    })();
  }, []);

  // Load all workers when switching to that tab
  useEffect(() => {
    if (tab !== "all") return;
    if (allWorkers.length > 0) return; // already loaded
    (async () => {
      setLoadingAll(true);
      try {
        const resp = await userApi.getWorkers();
        setAllWorkers(resp.workers || []);
      } catch {
        setAllWorkers([]);
      } finally {
        setLoadingAll(false);
      }
    })();
  }, [tab]);

  const list    = tab === "requests" ? requestWorkers : allWorkers;
  const loading = tab === "requests" ? loadingReq : loadingAll;

  const filtered = search.trim()
    ? list.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    : list;

  const selectedWorker = list.find(w => w._id === selectedId);

  const handleAssign = async () => {
    if (!selectedId || assigning) return;
    setAssigning(true);
    setError(null);
    try {
      await jobApi.assignWorker(job._id, selectedId);
      onAssigned();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to assign. Try again.");
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-lg">Assign Worker</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">"{job.title}"</p>
          </div>
          <button onClick={onClose} className="ml-4 shrink-0 text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-3 w-fit">
            <button onClick={() => setTab("requests")}
              className={`flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${
                tab === "requests" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Applied
              {!loadingReq && (
                <span className={`text-xs px-1.5 rounded-full ${
                  requestWorkers.length > 0 ? "bg-teal-100 text-teal-700" : "bg-gray-200 text-gray-500"}`}>
                  {requestWorkers.length}
                </span>
              )}
            </button>
            <button onClick={() => setTab("all")}
              className={`flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-medium transition-all ${
                tab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              All Workers
              {!loadingAll && tab === "all" && (
                <span className="text-xs px-1.5 rounded-full bg-gray-200 text-gray-500">{allWorkers.length}</span>
              )}
            </button>
          </div>

          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tab === "requests" ? "Search applicants..." : "Search workers by name or skill..."}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0">
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              {tab === "requests" && requestWorkers.length === 0 ? (
                <div>
                  <p className="text-2xl mb-2">📭</p>
                  <p className="font-semibold text-gray-700 mb-1">No applications yet</p>
                  <p className="text-sm text-gray-500 mb-3">No workers have applied for this job.</p>
                  <button onClick={() => setTab("all")}
                    className="text-sm text-teal-600 font-semibold hover:underline">
                    Browse all available workers →
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {search ? "No workers match your search." : "No available workers found."}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(w => (
                <button key={w._id}
                  onClick={() => setSelectedId(prev => prev === w._id ? "" : w._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedId === w._id
                      ? "border-teal-500 bg-teal-50 shadow-sm"
                      : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                  }`}>
                  {/* Avatar */}
                  {w.profileImage
                    ? <img src={w.profileImage} alt={w.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    : <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                  }
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{w.name}</span>
                      {tab === "requests" && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">Applied ✓</span>
                      )}
                      {selectedId === w._id && (
                        <span className="text-xs bg-teal-600 text-white px-1.5 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    {w.skills && w.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {w.skills.slice(0, 4).map(s => (
                          <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{s}</span>
                        ))}
                        {w.skills.length > 4 && <span className="text-xs text-gray-400">+{w.skills.length - 4}</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No skills listed</span>
                    )}
                  </div>
                  {/* Rating */}
                  <div className="shrink-0 text-right">
                    {w.rating ? (
                      <>
                        <div className="flex items-center gap-0.5 justify-end">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-bold text-gray-700">{w.rating}</span>
                        </div>
                        <p className="text-xs text-gray-400">{w.totalReviews || 0} reviews</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">New</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
          {error && <p className="text-sm text-red-600 mb-3 flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 text-sm text-gray-500">
              {selectedWorker
                ? <>Assigning <span className="font-semibold text-gray-800">{selectedWorker.name}</span></>
                : "Click a worker to select"}
            </div>
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleAssign} disabled={!selectedId || assigning}
              className="px-5 py-2 text-sm font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-40 transition-colors min-w-[110px] text-center">
              {assigning ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Assigning...
                </span>
              ) : "Confirm Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Job Card ─────────────────────────────────────────────────────────────────
interface JobCardItemProps {
  job: Job;
  onAssignClick: (job: Job) => void;
}

const JobCardItem: React.FC<JobCardItemProps> = ({ job, onAssignClick }) => {
  const navigate = useNavigate();
  const cfg = statusConfig[job.status] ?? { label: job.status, pill: "bg-gray-100 text-gray-700" };
  const workerName = (job.worker as any)?.name;
  const requestCount = Array.isArray(job.requests) ? job.requests.length : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col">
      {/* Clickable top area */}
      <div className="p-5 flex-1 cursor-pointer" onClick={() => navigate(`/jobs/${job._id}`)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-bold text-gray-900 leading-snug hover:text-teal-700 transition-colors">{job.title}</h4>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${cfg.pill}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{job.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-teal-700">₹{job.budget.toLocaleString("en-IN")}</span>
          <span className="text-xs text-gray-400">
            {new Date(job.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        {/* Worker or request count */}
        {workerName ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
              {workerName.charAt(0)}
            </div>
            Assigned to {workerName}
          </div>
        ) : requestCount > 0 ? (
          <div className="mt-2 text-xs font-medium text-teal-600">
            🙋 {requestCount} worker{requestCount !== 1 ? "s" : ""} applied
          </div>
        ) : null}
      </div>

      {/* Assign button — only for pending jobs */}
      {job.status === JobStatus.PENDING && (
        <div className="px-5 pb-5">
          <button
            onClick={e => { e.stopPropagation(); onAssignClick(job); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 border rounded-xl text-sm font-semibold transition-all bg-teal-600 text-white hover:bg-teal-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {requestCount > 0 ? `Assign Worker (${requestCount} applied)` : "Assign Worker"}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const statusOrder: JobStatus[] = [
  JobStatus.PENDING, JobStatus.ACCEPTED, JobStatus.IN_PROGRESS, JobStatus.COMPLETED,
];

const ContractorDashboard: React.FC = () => {
  const { user } = useContext(UserContext)!;
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState<JobStatus | "all">("all");
  const [assignJob, setAssignJob] = useState<Job | null>(null);
  const [toast, setToast]         = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await jobApi.getMyJobs();
      setJobs(resp.allJobs || resp.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const handleAssigned = async () => {
    setAssignJob(null);
    showToast("Worker assigned successfully! Job is now accepted.");
    await loadJobs();
  };

  const stats = {
    total:     jobs.length,
    pending:   jobs.filter(j => j.status === JobStatus.PENDING).length,
    active:    jobs.filter(j => j.status === JobStatus.ACCEPTED || j.status === JobStatus.IN_PROGRESS).length,
    completed: jobs.filter(j => j.status === JobStatus.COMPLETED).length,
  };

  const filtered = filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Welcome back, <span className="font-medium text-gray-700">{user?.name}</span>
            </p>
          </div>
          <Link to="/jobs/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total",     value: stats.total,     color: "bg-blue-50 text-blue-700" },
            { label: "Pending",   value: stats.pending,   color: "bg-yellow-50 text-yellow-700" },
            { label: "Active",    value: stats.active,    color: "bg-orange-50 text-orange-700" },
            { label: "Completed", value: stats.completed, color: "bg-green-50 text-green-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", ...statusOrder] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                filter === s ? "bg-teal-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300"
              }`}>
              {s === "all" ? "All Jobs" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            {error}
            <button onClick={loadJobs} className="ml-auto underline">Retry</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No jobs found</h3>
            <p className="text-gray-500 text-sm mb-5">
              {filter === "all" ? "You haven't posted any jobs yet." : `No "${filter.replace("_", " ")}" jobs.`}
            </p>
            {filter === "all" && (
              <Link to="/jobs/create"
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
                Post your first job
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(j => (
              <JobCardItem key={j._id} job={j} onAssignClick={setAssignJob} />
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignJob && (
        <AssignModal job={assignJob} onClose={() => setAssignJob(null)} onAssigned={handleAssigned} />
      )}
    </div>
  );
};

export default ContractorDashboard;
