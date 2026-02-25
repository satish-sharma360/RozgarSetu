import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

export default function ProfilePage() {
  const { user, updateProfile } = useContext(UserContext)!;
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [lat, setLat] = useState(user?.location?.coordinates?.[1]?.toString() || "");
  const [lng, setLng] = useState(user?.location?.coordinates?.[0]?.toString() || "");
  const [geoLoading, setGeoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills(prev => [...prev, s]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));

  const handleGeolocate = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLng(pos.coords.longitude.toFixed(6));
        setLat(pos.coords.latitude.toFixed(6));
        setGeoLoading(false);
      },
      () => { setError("Could not get location."); setGeoLoading(false); }
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload: any = {};
      if (name.trim()) payload.name = name.trim();
      if (phone.trim()) payload.phone = phone.trim();
      if (user?.role === 'worker') payload.skills = skills;
      if (lat && lng) {
        const la = parseFloat(lat);
        const lo = parseFloat(lng);
        if (!isNaN(la) && !isNaN(lo)) {
          payload.location = { type: "Point", coordinates: [lo, la] };
        }
      }
      await updateProfile(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7 space-y-6">

          {/* Avatar */}
          <div className="flex items-center gap-4">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Basic info */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Skills (worker only) */}
          {user?.role === 'worker' && (
            <>
              <div className="space-y-3">
                <h2 className="font-semibold text-gray-800">Skills</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    placeholder="e.g. Plumbing, Electrical..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="flex items-center gap-1 text-sm px-3 py-1 bg-teal-50 text-teal-700 rounded-full">
                        {s}
                        <button onClick={() => handleRemoveSkill(s)} className="text-teal-400 hover:text-teal-600 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <hr className="border-gray-100" />
            </>
          )}

          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Your Location</h2>
              <button
                onClick={handleGeolocate}
                disabled={geoLoading}
                className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {geoLoading ? "Detecting..." : "Use current location"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                <input
                  type="text"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  placeholder="28.6139"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                <input
                  type="text"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  placeholder="77.2090"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            {lat && lng && (
              <p className="text-xs text-teal-600">📍 {parseFloat(lat).toFixed(4)}°N, {parseFloat(lng).toFixed(4)}°E</p>
            )}
          </div>

          {/* Feedback */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Profile saved successfully!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}