import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jobApi from "../../api/job";
import InputBox from "../core/InputBox";

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState<number | "">("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLng(pos.coords.longitude.toFixed(6));
        setLat(pos.coords.latitude.toFixed(6));
        setGeoLoading(false);
      },
      () => {
        setError("Could not get your location. Please enter coordinates manually.");
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !budget || !lng || !lat) {
      setError("All fields are required.");
      return;
    }
    const lon = parseFloat(lng);
    const la = parseFloat(lat);
    if (isNaN(lon) || isNaN(la) || lon < -180 || lon > 180 || la < -90 || la > 90) {
      setError("Please enter valid coordinates (lat: -90 to 90, lng: -180 to 180).");
      return;
    }
    if (Number(budget) <= 0) {
      setError("Budget must be greater than 0.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await jobApi.create({
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        location: { type: "Point", coordinates: [lon, la] },
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/contractor"), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Back link */}
        <button
          onClick={() => navigate("/dashboard/contractor")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Post a new job</h2>
          <p className="text-sm text-gray-500 mb-6">Fill in the details below to post your job.</p>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Job posted! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Title */}
          <InputBox
            type="text"
            name="title"
            value={title}
            placeholder="e.g. Fix kitchen sink"
            label="Job Title"
            handler={(e) => setTitle(e.target.value)}
          />

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the job in detail — tools needed, hours expected, skill level..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
              rows={4}
            />
          </div>

          {/* Budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 1500"
                min={1}
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Job Location</label>
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={geoLoading}
                className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {geoLoading ? "Getting location..." : "Use my location"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Latitude (28.6139)"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Longitude (77.2090)"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            {lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)) && (
              <p className="mt-1.5 text-xs text-teal-600">
                📍 {parseFloat(lat).toFixed(4)}°N, {parseFloat(lng).toFixed(4)}°E
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="w-full py-3 px-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Posting...
              </span>
            ) : "Post Job"}
          </button>
        </div>
      </div>
    </div>
  );
}