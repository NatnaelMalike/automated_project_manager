export default function RecentIssuesTable({ issues, onViewDetails }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700/30">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="bg-gray-50/70 dark:bg-gray-800/70">
            <th className="px-6 py-3.5 text-left text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Key</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Summary</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Status</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Priority</th>
            <th className="px-6 py-3.5 text-left text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Assignee</th>
            <th className="px-6 py-3.5 text-right text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white/10 divide-y divide-gray-200 dark:divide-gray-700">
          {issues.map((issue) => (
            <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-gray-300 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--primary-600)' }}>{issue.key}</td>
              <td className="px-6 py-4 text-sm" style={{ color: 'var(--neutral-900)' }}><div className="truncate max-w-xs">{issue.fields.summary}</div></td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`badge ${
                  issue.fields.status.name === 'To Do' ? 'badge-todo' : 
                  issue.fields.status.name === 'In Progress' ? 'badge-progress' : 
                  issue.fields.status.name === 'Review' ? 'badge-review' : 
                  'badge-done'
                }`}>
                  {issue.fields.status.name}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`badge ${
                  issue.fields.priority.name === 'High' ? 'badge-high' : 
                  issue.fields.priority.name === 'Medium' ? 'badge-medium' : 
                  'badge-low'
                }`}>
                  {issue.fields.priority.name}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--neutral-700)' }}>{issue.fields.assignee?.displayName || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button 
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gray-900/70 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition-colors duration-150"
                  onClick={() => onViewDetails(issue)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
