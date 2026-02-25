import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import jobApi, { Job, JobStatus } from "../../api/job";
import reviewApi, { JobReview } from "../../api/review";
import { UserContext } from "../../context/UserContext";
import MapView from "../core/MapView";

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className={`text-sm ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
        ))}
    </div>
);

const SkeletonCard = () => (
    <div className="p-4 border border-gray-100 rounded-xl bg-white animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-20" />
    </div>
);

const WorkerDashboard: React.FC = () => {
    const { user, updateStatus } = useContext(UserContext)!;

    const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
    const [activeJobs, setActiveJobs] = useState<Job[]>([]);
    const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [availableLoading, setAvailableLoading] = useState(false);

    // Track which jobs this worker has requested
    const [requestedJobIds, setRequestedJobIds] = useState<Set<string>>(new Set());
    const [requestingId, setRequestingId] = useState<string | null>(null);

    const [reviews, setReviews] = useState<JobReview[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [totalReviews, setTotalReviews] = useState(0);

    const [togglingStatus, setTogglingStatus] = useState(false);
    const [activeTab, setActiveTab] = useState<"active" | "browse" | "completed" | "reviews">("active");

    const isAvailable = user?.isAvailable ?? false;

    const handleToggleStatus = async () => {
        setTogglingStatus(true);
        try { await updateStatus(); } catch { }
        finally { setTogglingStatus(false); }
    };

    const loadAssignedJobs = async () => {
        setJobsLoading(true);
        try {
            const resp = await jobApi.getAssignedJobs();
            const all: Job[] = resp.allJobs || resp.data || [];
            setActiveJobs(all.filter(j => j.status === JobStatus.ACCEPTED || j.status === JobStatus.IN_PROGRESS));
            setCompletedJobs(all.filter(j => j.status === JobStatus.COMPLETED));
        } catch {
            setActiveJobs([]);
            setCompletedJobs([]);
        } finally {
            setJobsLoading(false);
        }
    };

    const loadAvailableJobs = async () => {
        setAvailableLoading(true);
        try {
            const resp = await jobApi.getAvailableJobs();
            setAvailableJobs(resp.jobs || []);
        } catch {
            setAvailableJobs([]);
        } finally {
            setAvailableLoading(false);
        }
    };

    const loadReviews = async () => {
        if (!user?._id) return;
        setReviewsLoading(true);
        try {
            const resp = await reviewApi.getUserReviews(user._id, 1, 20);
            setReviews(resp.reviews || []);
            setTotalReviews(resp.total || 0);
        } catch {
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        loadAssignedJobs();
        loadReviews();
    }, [user?._id]);

    useEffect(() => {
        if (activeTab === "browse") loadAvailableJobs();
    }, [activeTab]);

    const handleRequest = async (jobId: string) => {
        const alreadyRequested = requestedJobIds.has(jobId);
        setRequestingId(jobId);
        try {
            if (alreadyRequested) {
                await jobApi.cancelRequest(jobId);
                setRequestedJobIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
            } else {
                await jobApi.requestJob(jobId);
                setRequestedJobIds(prev => new Set(prev).add(jobId));
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to send request");
        } finally {
            setRequestingId(null);
        }
    };

    const tabs = [
        { key: "active", label: "Active Jobs", count: activeJobs.length },
        { key: "browse", label: "Browse Jobs", count: availableJobs.length },
        { key: "completed", label: "Completed", count: completedJobs.length },
        { key: "reviews", label: "My Reviews", count: totalReviews },
    ] as const;

    const AssignedJobCard = ({ job }: { job: Job }) => (
        <Link to={`/jobs/${job._id}`}
            className="flex items-start justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-teal-300 hover:shadow-sm transition-all group"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm group-hover:text-teal-700 transition-colors truncate">{job.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${job.status === JobStatus.COMPLETED ? "bg-green-100 text-green-700" :
                            job.status === JobStatus.IN_PROGRESS ? "bg-orange-100 text-orange-700" :
                                "bg-blue-100 text-blue-700"}`}>
                        {job.status.replace("_", " ")}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{(job.contractor as any)?.name && `By ${(job.contractor as any).name}`}</p>
                <p className="text-xs text-gray-400">{new Date(job.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <div className="ml-3 text-right shrink-0">
                <p className="font-bold text-teal-700">₹{job.budget.toLocaleString("en-IN")}</p>
                <p className="text-xs text-gray-400 mt-0.5">View →</p>
            </div>
        </Link>
    );

    const AvailableJobCard = ({ job }: { job: Job }) => {
        const requested = requestedJobIds.has(job._id);
        const isLoading = requestingId === job._id;
        return (
            <div className="p-4 bg-white border border-gray-100 rounded-xl hover:border-teal-200 transition-all">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{job.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {job.location?.coordinates?.[1]?.toFixed(3)}°N, {job.location?.coordinates?.[0]?.toFixed(3)}°E
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {(job.contractor as any)?.name || "Contractor"}
                            </span>
                            <span>{new Date(job.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        </div>
                    </div>
                    <div className="shrink-0 text-right flex flex-col items-end gap-2">
                        <p className="font-bold text-teal-700 text-base">₹{job.budget.toLocaleString("en-IN")}</p>
                        <div className="flex gap-1.5">
                            <Link to={`/jobs/${job._id}`}
                                className="text-xs px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                Details
                            </Link>
                            <button
                                onClick={() => handleRequest(job._id)}
                                disabled={isLoading}
                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50 ${requested
                                        ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                        : "bg-teal-600 text-white hover:bg-teal-700"
                                    }`}
                            >
                                {isLoading ? "..." : requested ? "Withdraw" : "Request Job"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const EmptyState = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">{desc}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Welcome back, <span className="font-medium text-gray-700">{user?.name}</span></p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className="text-sm font-medium text-gray-700">{isAvailable ? "Available for work" : "Not available"}</span>
                        <button onClick={handleToggleStatus} disabled={togglingStatus}
                            className={`relative ml-1 w-11 h-6 rounded-full transition-colors duration-200 ${isAvailable ? "bg-teal-500" : "bg-gray-300"} ${togglingStatus ? "opacity-50" : ""}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isAvailable ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Active Jobs", value: activeJobs.length, color: "bg-orange-50 text-orange-700" },
                        { label: "Completed", value: completedJobs.length, color: "bg-green-50 text-green-700" },
                        { label: "Rating", value: user?.rating ? `${user.rating}★` : "—", color: "bg-yellow-50 text-yellow-700" },
                        { label: "Reviews", value: totalReviews, color: "bg-blue-50 text-blue-700" },
                    ].map(s => (
                        <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">

                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4 overflow-x-auto">
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-teal-100 text-teal-700" : "bg-gray-200 text-gray-600"}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Active Jobs */}
                        {activeTab === "active" && (
                            jobsLoading ? <div className="space-y-3">{[1, 2].map(i => <SkeletonCard key={i} />)}</div> :
                                activeJobs.length === 0
                                    ? <EmptyState icon="📋" title="No active jobs" desc="Jobs assigned to you will appear here. Make sure your availability is turned on." />
                                    : <div className="space-y-3">{activeJobs.map(j => <AssignedJobCard key={j._id} job={j} />)}</div>
                        )}

                        {/* Browse Available Jobs */}
                        {activeTab === "browse" && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-gray-500">{availableJobs.length} job{availableJobs.length !== 1 ? "s" : ""} available</p>
                                    <button onClick={loadAvailableJobs} disabled={availableLoading}
                                        className="text-xs text-teal-600 hover:underline flex items-center gap-1 disabled:opacity-50">
                                        <svg className={`w-3 h-3 ${availableLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh
                                    </button>
                                </div>
                                {availableLoading
                                    ? <div className="space-y-3">{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
                                    : availableJobs.length === 0
                                        ? <EmptyState icon="🔍" title="No jobs available" desc="There are no pending jobs right now. Check back soon or make sure your availability is on." />
                                        : <div className="space-y-3">{availableJobs.map(j => <AvailableJobCard key={j._id} job={j} />)}</div>
                                }
                            </div>
                        )}

                        {/* Completed Jobs */}
                        {activeTab === "completed" && (
                            jobsLoading ? <div className="space-y-3">{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div> :
                                completedJobs.length === 0
                                    ? <EmptyState icon="✅" title="No completed jobs yet" desc="Finished jobs will appear here once you complete your first assignment." />
                                    : <div className="space-y-3">{completedJobs.map(j => <AssignedJobCard key={j._id} job={j} />)}</div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === "reviews" && (
                            reviewsLoading
                                ? <div className="space-y-3">{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
                                : reviews.length === 0
                                    ? <EmptyState icon="⭐" title="No reviews yet" desc="Complete jobs to receive reviews from contractors." />
                                    : (
                                        <div className="space-y-3">
                                            {user?.rating && (
                                                <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl mb-2">
                                                    <div className="text-center">
                                                        <p className="text-3xl font-bold text-gray-900">{user.rating}</p>
                                                        <StarDisplay rating={user.rating} />
                                                        <p className="text-xs text-gray-500 mt-0.5">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        {[5, 4, 3, 2, 1].map(star => {
                                                            const count = reviews.filter(r => r.rating === star).length;
                                                            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                                                            return (
                                                                <div key={star} className="flex items-center gap-2 text-xs">
                                                                    <span className="text-gray-500 w-3">{star}</span>
                                                                    <span className="text-yellow-400">★</span>
                                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                    <span className="text-gray-400 w-4 text-right">{count}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            {reviews.map(r => (
                                                <div key={r._id} className="p-4 bg-white border border-gray-100 rounded-xl">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                                                {(r.reviewer?.name || "A").charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800">{r.reviewer?.name || "Anonymous"}</p>
                                                                <p className="text-xs text-gray-400">{new Date(r.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                                            </div>
                                                        </div>
                                                        <StarDisplay rating={r.rating} />
                                                    </div>
                                                    {r.comment && <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-2 mt-2">{r.comment}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-50">
                                <h2 className="font-semibold text-gray-800 text-sm">Your Location</h2>
                            </div>
                            {user?.location?.coordinates
                                ? <MapView coordinates={user.location.coordinates} />
                                : <div className="p-6 text-center text-sm text-gray-500 z-0">
                                    <p>No location set.</p>
                                    <Link to="/profile" className="text-teal-600 hover:underline mt-1 block">Update in profile →</Link>
                                </div>
                            }
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm z-10">
                            <h2 className="font-semibold text-gray-800 text-sm mb-3">Profile</h2>
                            <div className="flex items-center gap-3 mb-3">
                                {user?.profileImage
                                    ? <img src={user.profileImage} alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
                                    : <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0)}</div>
                                }
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                            {user?.skills && user.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {user.skills.map((s: string) => (
                                        <span
                                            key={s}
                                            className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <Link to="/profile" className="block text-center text-sm text-teal-600 hover:underline">Edit profile →</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;