import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import reviewApi, { JobReview } from "../../api/review";

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`text-base ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
    ))}
  </div>
);

const ReviewsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [reviews, setReviews] = useState<JobReview[]>([]);
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadReviews = async (p = 1) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await reviewApi.getUserReviews(userId, p, 10);
      const list: JobReview[] = resp.reviews || [];
      setReviews(list);
      setTotal(resp.total || list.length);
      setPages(resp.pages || 1);
      setPage(p);
      if (list.length > 0) {
        const avg = list.reduce((acc, r) => acc + r.rating, 0) / list.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(1); }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Worker Reviews</h1>
        </div>

        {/* Summary card */}
        {!loading && reviews.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6 flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{avgRating}</p>
              <StarDisplay rating={Math.round(avgRating)} />
              <p className="text-xs text-gray-500 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-4 text-right">{star}</span>
                    <span className="text-yellow-400">★</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-400 w-5">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 bg-white border border-gray-100 rounded-2xl animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        )}

        {!loading && reviews.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">★</span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">No reviews yet</h3>
            <p className="text-sm text-gray-500">This worker hasn't received any reviews.</p>
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                    {(r.reviewer?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.reviewer?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <StarDisplay rating={r.rating} />
              </div>
              {r.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2 border-t border-gray-50 pt-2">{r.comment}</p>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => loadReviews(page - 1)}
              disabled={page <= 1 || loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {pages}
            </span>
            <button
              onClick={() => loadReviews(page + 1)}
              disabled={page >= pages || loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;