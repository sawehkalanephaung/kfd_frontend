export default function DashboardPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <span className="text-gray-500">Home</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">Dashboard</span>
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, Admin!
        </h1>
        <p className="text-gray-500 mt-1">
          Here is your KFD command center overview for today.
        </p>
      </div>

      {/* Placeholder for future dashboard content */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* These cards will be filled in later */}
        {['Acres Protected', 'Active Field Projects', 'Indexed Resources', 'Pending Drafts'].map(
          (label) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50"
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
