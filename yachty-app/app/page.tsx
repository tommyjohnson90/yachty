import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      {/* Mobile-first header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Yacht Management</h1>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {/* Quick stats - Mobile optimized grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Active Work Items</div>
            <div className="text-3xl font-bold text-blue-600">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Pending Invoices</div>
            <div className="text-3xl font-bold text-green-600">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">This Week's Hours</div>
            <div className="text-3xl font-bold text-purple-600">0.0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total Clients</div>
            <div className="text-3xl font-bold text-indigo-600">0</div>
          </div>
        </div>

        {/* Quick actions - Mobile-first buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/chat"
              className="bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
            >
              New Chat
            </Link>
            <Link
              href="/clients"
              className="bg-white text-gray-700 py-3 px-4 rounded-lg font-medium text-center border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Manage Clients
            </Link>
            <Link
              href="/invoices/new"
              className="bg-white text-gray-700 py-3 px-4 rounded-lg font-medium text-center border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Create Invoice
            </Link>
            <Link
              href="/schedule"
              className="bg-white text-gray-700 py-3 px-4 rounded-lg font-medium text-center border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              View Schedule
            </Link>
          </div>
        </div>

        {/* Recent activity placeholder */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-8 text-center text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm mt-2">Start by adding a client or creating a chat</p>
          </div>
        </div>
      </main>

      {/* Mobile navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden">
        <div className="grid grid-cols-4 gap-1">
          <Link
            href="/"
            className="flex flex-col items-center py-3 text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/chat"
            className="flex flex-col items-center py-3 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs mt-1">Chat</span>
          </Link>
          <Link
            href="/clients"
            className="flex flex-col items-center py-3 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs mt-1">Clients</span>
          </Link>
          <Link
            href="/invoices"
            className="flex flex-col items-center py-3 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs mt-1">Invoices</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
