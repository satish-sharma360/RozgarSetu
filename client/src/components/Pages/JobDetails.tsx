import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import jobApi, { Job, JobStatus } from "../../api/job";
import reviewApi, { JobReview } from "../../api/review";
import userApi, { User as WorkerUser } from "../../api/user";
import { UserContext } from "../../context/UserContext";
import MapView from "../core/MapView";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-yellow-100 text-yellow-800" },
  accepted:    { label: "Accepted",    className: "bg-blue-100 text-blue-800" },
  in_progress: { label: "In Progress", className: "bg-orange-100 text-orange-800" },
  completed:   { label: "Completed",   className: "bg-green-100 text-green-800" },
  cancelled:   { label: "Cancelled",   className: "bg-red-100 text-red-800" },
};

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1 mt-1">
    {[1,2,3,4,5].map(star => (
      <button key={star} onClick={() => onChange(star)}
        className={`text-2xl transition-colors ${star <= value ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}>★</button>
    ))}
  </div>
);

const StarDisplay: React.FC<{ rating: number; size?: string }> = ({ rating, size = "text-sm" }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`${size} ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
    ))}
  </div>
);

type AssignTab = "requests" | "all";

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useContext(UserContext)!;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assign panel
  const [assignTab, setAssignTab] = useState<AssignTab>("requests");
  const [requestedWorkers, setRequestedWorkers] = useState<WorkerUser[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [allWorkers, setAllWorkers] = useState<WorkerUser[]>([]);
  const [allWorkersLoading, setAllWorkersLoading] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Worker: request this job
  const [hasRequested, setHasRequested] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMsg, setRequestMsg] = useState<string | null>(null);

  // Status update
  const [status, setStatus] = useState<JobStatus | "">("");
  const [statusLoading, setStatusLoading] = useState(false);

  // Route
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Review
  const [review, setReview] = useState<JobReview | null>(null);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadJob = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await jobApi.getById(jobId);
      const j: Job = resp.data || resp;
      setJob(j);
      // populate requests from job data if already populated
      if (j.requests && j.requests.length > 0) {
        setRequestedWorkers(j.requests as any);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Unable to load job");
    } finally {
      setLoading(false);
    }
  };

  const loadReview = async () => {
    if (!jobId) return;
    try {
      const resp = await reviewApi.getJobReview(jobId);
      setReview(resp || null);
    } catch { }
  };

  const loadJobRequests = async () => {
    if (!jobId) return;
    setRequestsLoading(true);
    try {
      const resp = await jobApi.getJobRequests(jobId);
      setRequestedWorkers(resp.requests || []);
    } catch {
      setRequestedWorkers([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadAllWorkers = async () => {
    setAllWorkersLoading(true);
    try {
      const resp = await userApi.getWorkers();
      setAllWorkers(resp.workers || []);
    } catch {
      setAllWorkers([]);
    } finally {
      setAllWorkersLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
    loadReview();
  }, [jobId]);

  // When job loads and user is contractor + pending, load requests + all workers
  useEffect(() => {
    if (!job || !user) return;
    const contractorId = (job.contractor as any)?._id || job.contractor;
    if (user.role === "contractor" && user._id === contractorId && job.status === JobStatus.PENDING) {
      loadJobRequests();
      loadAllWorkers();
    }
    // Check if current worker already requested
    if (user.role === "worker" && job.requests) {
      const alreadyIn = (job.requests as any[]).some((r: any) => {
        const id = typeof r === "string" ? r : r._id;
        return id === user._id;
      });
      setHasRequested(alreadyIn);
    }
  }, [job]);

  const handleAssign = async () => {
    if (!jobId || !selectedWorkerId) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      await jobApi.assignWorker(jobId, selectedWorkerId);
      setAssignSuccess(true);
      setSelectedWorkerId("");
      await loadJob();
    } catch (err: any) {
      setAssignError(err?.response?.data?.message || err.message || "Assign failed");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!jobId || !status) return;
    setStatusLoading(true);
    try {
      await jobApi.updateStatus(jobId, status);
      await loadJob();
      setStatus("");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Status update failed");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleGetRoute = async () => {
    if (!jobId) return;
    setRouteLoading(true);
    setRouteError(null);
    try {
      const data = await jobApi.getRoute(jobId);
      setRouteData(data);
    } catch (err: any) {
      setRouteError(err?.response?.data?.message || "Could not load route.");
    } finally {
      setRouteLoading(false);
    }
  };

  const handleRequestJob = async () => {
    if (!jobId) return;
    setRequestLoading(true);
    setRequestMsg(null);
    try {
      if (hasRequested) {
        await jobApi.cancelRequest(jobId);
        setHasRequested(false);
        setRequestMsg("Request withdrawn.");
      } else {
        await jobApi.requestJob(jobId);
        setHasRequested(true);
        setRequestMsg("Request sent! The contractor will be notified.");
      }
    } catch (err: any) {
      setRequestMsg(err?.response?.data?.message || "Failed.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (ratingInput < 1 || ratingInput > 5) { setReviewError("Please select a rating."); return; }
    setReviewLoading(true);
    setReviewError(null);
    try {
      await reviewApi.createReview(jobId!, { rating: ratingInput, comment: commentInput });
      await loadReview();
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || err.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const WorkerPickerCard = ({ w, source }: { w: WorkerUser; source: "request" | "all" }) => (
    <button
      onClick={() => setSelectedWorkerId(prev => prev === w._id ? "" : w._id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
        selectedWorkerId === w._id ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
      }`}
    >
      {w.profileImage
        ? <img src={w.profileImage} alt={w.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
        : <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {w.name.charAt(0).toUpperCase()}
          </div>
      }
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm text-gray-900">{w.name}</p>
          {source === "request" && (
            <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">Requested</span>
          )}
          {selectedWorkerId === w._id && (
            <span className="text-xs bg-teal-600 text-white px-1.5 py-0.5 rounded-full">✓ Selected</span>
          )}
        </div>
        {w.skills && w.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {w.skills.slice(0, 3).map(s => (
              <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{s}</span>
            ))}
            {w.skills.length > 3 && <span className="text-xs text-gray-400">+{w.skills.length - 3}</span>}
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        {w.rating ? (
          <>
            <div className="flex items-center gap-0.5 justify-end">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-sm font-semibold text-gray-700">{w.rating}</span>
            </div>
            <p className="text-xs text-gray-400">{w.totalReviews} review{w.totalReviews !== 1 ? "s" : ""}</p>
          </>
        ) : <span className="text-xs text-gray-400">No reviews</span>}
      </div>
    </button>
  );

  if (loading) return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-4">
      <div className="h-7 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="h-32 bg-gray-100 rounded-xl" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
    </div>
  );

  if (!job) return <div className="max-w-4xl mx-auto p-6 text-gray-500">No job found.</div>;

  const contractorId = (job.contractor as any)?._id || job.contractor;
  const assignedWorkerId = (job.worker as any)?._id || job.worker;
  const isMyJob = user?._id === contractorId;
  const isAssignedWorker = user?._id === assignedWorkerId;
  const cfg = statusConfig[job.status] ?? { label: job.status, className: "bg-gray-100 text-gray-800" };
  const selectedWorker = [...requestedWorkers, ...allWorkers].find(w => w._id === selectedWorkerId);
  const requestCount = (job.requests as any[])?.length || requestedWorkers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">

        <Link to={user?.role === "contractor" ? "/dashboard/contractor" : "/dashboard/worker"}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Job Header */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${cfg.className}`}>{cfg.label}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{job.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 text-xs mb-0.5">Budget</p>
                  <p className="font-bold text-teal-700 text-lg">₹{job.budget.toLocaleString("en-IN")}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 text-xs mb-0.5">Location</p>
                  <p className="font-medium text-gray-800 text-sm">{job.location?.coordinates?.[1]?.toFixed(4)}°N, {job.location?.coordinates?.[0]?.toFixed(4)}°E</p>
                </div>
              </div>
            </div>

            {/* People */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">People</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {((job.contractor as any)?.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contractor</p>
                    <p className="font-medium text-gray-800 text-sm">{(job.contractor as any)?.name || contractorId}</p>
                  </div>
                </div>
                {job.worker ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                      {((job.worker as any)?.name || "W").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Worker</p>
                      <p className="font-medium text-gray-800 text-sm">{(job.worker as any)?.name || assignedWorkerId}</p>
                      {(job.worker as any)?.rating !== undefined && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <StarDisplay rating={(job.worker as any).rating} />
                          <Link to={`/reviews/user/${assignedWorkerId}`} className="text-xs text-teal-600 hover:underline ml-1">reviews</Link>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Worker</p>
                      <p className="text-sm italic">Not assigned yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── WORKER: Request Job Button (pending jobs only) ── */}
            {user?.role === "worker" && job.status === JobStatus.PENDING && !isAssignedWorker && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-1">Interested in this job?</h2>
                <p className="text-sm text-gray-500 mb-4">Send a request and the contractor will be notified. You can withdraw any time before they assign.</p>
                {requestMsg && (
                  <div className={`mb-3 p-3 rounded-lg text-sm ${hasRequested ? "bg-green-50 border border-green-200 text-green-700" : "bg-gray-50 border border-gray-200 text-gray-700"}`}>
                    {requestMsg}
                  </div>
                )}
                <button
                  onClick={handleRequestJob}
                  disabled={requestLoading}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
                    hasRequested
                      ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {requestLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : hasRequested ? "Withdraw Request" : "Request this Job"}
                </button>
              </div>
            )}

            {/* ── CONTRACTOR: Assign Worker Panel ── */}
            {user?.role === "contractor" && isMyJob && job.status === JobStatus.PENDING && !assignSuccess && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-800">Assign a Worker</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Pick from workers who requested this job, or browse all available workers.</p>
                  </div>
                  {requestCount > 0 && (
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">
                      {requestCount} request{requestCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {assignError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{assignError}</div>
                )}

                {/* Sub-tabs */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4 w-fit">
                  <button onClick={() => setAssignTab("requests")}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      assignTab === "requests" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    Requests
                    {requestCount > 0 && <span className="text-xs bg-teal-100 text-teal-700 px-1 rounded-full">{requestCount}</span>}
                  </button>
                  <button onClick={() => setAssignTab("all")}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                      assignTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    All Workers
                  </button>
                </div>

                {/* Requests sub-tab */}
                {assignTab === "requests" && (
                  requestsLoading
                    ? <div className="space-y-2">{[1,2].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
                    : requestedWorkers.length === 0
                      ? (
                        <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                          <p className="text-sm text-gray-500">No workers have requested this job yet.</p>
                          <button onClick={() => setAssignTab("all")} className="text-xs text-teal-600 hover:underline mt-1">
                            Browse all available workers →
                          </button>
                        </div>
                      )
                      : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {requestedWorkers.map(w => <WorkerPickerCard key={w._id} w={w} source="request" />)}
                        </div>
                      )
                )}

                {/* All workers sub-tab */}
                {assignTab === "all" && (
                  allWorkersLoading
                    ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
                    : allWorkers.length === 0
                      ? (
                        <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                          <p className="text-sm text-gray-500">No available workers found.</p>
                          <p className="text-xs text-gray-400 mt-1">Workers must be registered and have availability turned on.</p>
                        </div>
                      )
                      : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {allWorkers.map(w => <WorkerPickerCard key={w._id} w={w} source="all" />)}
                        </div>
                      )
                )}

                {/* Confirm assign */}
                {selectedWorkerId && selectedWorker && (
                  <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Assigning to: </span>
                      <span className="font-semibold text-gray-800">{selectedWorker.name}</span>
                    </div>
                    <button onClick={handleAssign} disabled={assignLoading}
                      className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors">
                      {assignLoading ? "Assigning..." : "Confirm Assign"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Assign success banner */}
            {assignSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-green-700 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Worker assigned successfully! Job is now accepted.
              </div>
            )}

            {/* ── WORKER: Update Status ── */}
            {user?.role === "worker" && isAssignedWorker &&
              (job.status === JobStatus.ACCEPTED || job.status === JobStatus.IN_PROGRESS) && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-3">Update Job Status</h2>
                <div className="flex gap-2 flex-wrap">
                  {job.status === JobStatus.ACCEPTED && (
                    <button onClick={() => setStatus(JobStatus.IN_PROGRESS)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        status === JobStatus.IN_PROGRESS ? "bg-orange-500 text-white border-orange-500" : "bg-white text-orange-600 border-orange-300 hover:bg-orange-50"}`}>
                      Mark In Progress
                    </button>
                  )}
                  {job.status === JobStatus.IN_PROGRESS && (
                    <button onClick={() => setStatus(JobStatus.COMPLETED)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        status === JobStatus.COMPLETED ? "bg-green-600 text-white border-green-600" : "bg-white text-green-700 border-green-300 hover:bg-green-50"}`}>
                      Mark Completed
                    </button>
                  )}
                  {status && (
                    <button onClick={handleStatusUpdate} disabled={statusLoading}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors">
                      {statusLoading ? "Updating..." : "Confirm Update"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── CONTRACTOR: Review ── */}
            {user?.role === "contractor" && isMyJob && job.status === JobStatus.COMPLETED && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">Review Worker</h2>
                {review ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{review.rating}/5</span>
                    </div>
                    {review.comment && <p className="text-sm text-gray-700 mt-1">{review.comment}</p>}
                    <p className="text-xs text-gray-400 mt-2">Review submitted ✓</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{reviewError}</div>}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <StarRating value={ratingInput} onChange={setRatingInput} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                      <textarea value={commentInput} onChange={e => setCommentInput(e.target.value)}
                        placeholder="Share your experience with this worker..."
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" rows={3}/>
                    </div>
                    <button onClick={handleSubmitReview} disabled={reviewLoading || ratingInput === 0}
                      className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors">
                      {reviewLoading ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {job.location?.coordinates && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm -z-10">
                <div className="px-4 py-3 border-b border-gray-50">
                  <h3 className="font-semibold text-gray-800 text-sm">Job Location</h3>
                </div>
                <MapView coordinates={job.location.coordinates} />
              </div>
            )}

            {user?.role === "worker" && isAssignedWorker && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Directions to Job</h3>
                {routeError && <p className="text-xs text-red-600 mb-2">{routeError}</p>}
                {routeData ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="font-semibold text-sm">{(routeData.distance / 1000).toFixed(1)} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">Est. time</p>
                        <p className="font-semibold text-sm">{Math.round(routeData.duration / 60)} min</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleGetRoute} disabled={routeLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors">
                    {routeLoading
                      ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    }
                    {routeLoading ? "Loading..." : "Get Route"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;