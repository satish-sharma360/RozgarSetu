import React from 'react'
import JobCard from '../core/Jobcard'
import Button from '../core/Button'

export default function Landing() {
  const jobs = [
    { id: 1, title: 'Fix kitchen sink', budget: 1200, location: 'Connaught Place, Delhi', postedDate: '1 day ago' },
    { id: 2, title: 'Electrical wiring check', budget: 800, location: 'Lajpat Nagar, Delhi', postedDate: '2 days ago' },
    { id: 3, title: 'AC service', budget: 1500, location: 'Saket, Delhi', postedDate: '3 days ago' },
    { id: 4, title: 'Garden trimming', budget: 600, location: 'Dwarka, Delhi', postedDate: '5 hours ago' },
    { id: 5, title: 'Paint touch-up', budget: 2000, location: 'Noida Sector 18', postedDate: '4 days ago' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold">RZ</div>
            <div>
              <h1 className="text-lg font-semibold">RozgarSetu</h1>
              <p className="text-xs text-gray-500">Connecting contractors and local workers</p>
            </div>
          </div>

          <div className="space-x-3 flex">
            <Button content="Log in" path="login" active={true} />
            <Button content="Sign up" path="signup" active={false} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900">Find trusted local workers — fast.</h2>
            <p className="mt-4 text-gray-600">Post a job, hire skilled workers nearby, and manage reviews all in one place. Built for local communities and small contractors.</p>

            <div className="mt-6 flex items-center space-x-4">
              <button className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">Post a Job</button>
              <button className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Browse Jobs</button>
            </div>

            <div className="mt-6 text-sm text-gray-500">Example coordinates are accepted when creating jobs and user profiles for location-based matching and routing.</div>
          </div>

          <div className="hidden md:block">
            <div className="w-full h-72 overflow-hidden bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                <img className='w-full h-full' src="https://img.freepik.com/premium-photo/indian-asian-labor-familys-portrait-generative-ai_722401-42057.jpg?w=1480" alt="" />
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h3 className="text-2xl font-bold">Why RozgarSetu?</h3>
          <p className="mt-2 text-gray-600">Everything you need to hire or offer local work — simple, fast and reliable.</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">Local Matches</h4>
              <p className="mt-2 text-sm text-gray-500">Find workers near you using coordinates and proximity search.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">Verified Reviews</h4>
              <p className="mt-2 text-sm text-gray-500">Contractors can leave reviews only after job completion.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">In-app Routing</h4>
              <p className="mt-2 text-sm text-gray-500">Assigned workers can get driving directions to job locations (OSRM).</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">Secure Payments</h4>
              <p className="mt-2 text-sm text-gray-500">(Placeholder) Integrate your preferred payment gateway.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h3 className="text-2xl font-bold">How it works</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">1</div>
              <h4 className="mt-3 font-semibold">Post a job</h4>
              <p className="mt-2 text-sm text-gray-500">Contractors create job with description, budget and coordinates.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">2</div>
              <h4 className="mt-3 font-semibold">Assign a worker</h4>
              <p className="mt-2 text-sm text-gray-500">Select a worker and assign. Worker can view distance and route.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">3</div>
              <h4 className="mt-3 font-semibold">Complete & review</h4>
              <p className="mt-2 text-sm text-gray-500">After completion, leave reviews to help others decide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs (mock) */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h3 className="text-2xl font-bold">Recent local jobs</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobs.map(job => (
              <JobCard key={job.id} id={job.id} title={job.title} budget={job.budget} location={job.location} postedDate={job.postedDate} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials & FAQ */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold">Testimonials</h3>
            <div className="mt-4 space-y-4">
              <blockquote className="p-4 bg-white rounded-lg">"Quick and reliable. Found a great worker within hours." — Contractor A</blockquote>
              <blockquote className="p-4 bg-white rounded-lg">"Easy to use and accurate directions for assigned jobs." — Worker B</blockquote>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold">FAQ</h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div>
                <strong>How do coordinates work?</strong>
                <div>Use [lng, lat] in GeoJSON Point format. The app uses these for proximity and routing.</div>
              </div>
              <div>
                <strong>Is routing free?</strong>
                <div>We use a public OSRM demo endpoint for testing. For production, a hosted or self-hosted service is recommended.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-gray-600">© {new Date().getFullYear()} RozgarSetu. All rights reserved.</div>
          <div className="mt-3 md:mt-0 flex items-center space-x-4">
            <a href="#" className="text-sm text-gray-600 hover:underline">Privacy</a>
            <a href="#" className="text-sm text-gray-600 hover:underline">Terms</a>
            <a href="#" className="text-sm text-gray-600 hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
