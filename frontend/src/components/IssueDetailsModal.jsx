export default function IssueDetailsModal({ issue, show, onClose }) {
  if (!issue || !show) return null;
  return (
    <div className={`fixed inset-0 backdrop-blur-xs bg-opacity-50 transition-all duration-200 ${show ? 'visible' : 'invisible'}`} onClick={onClose}>
      <div className="max-w-3xl mx-auto mt-12 bg-white rounded-lg shadow-md p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-xs" style={{ color: 'var(--neutral-400)' }} onClick={onClose}>×</button>
        <h2 className="text-lg font-medium" style={{ color: 'var(--neutral-900)' }}>{issue.key}</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--neutral-600)' }}>{issue.fields.summary}</p>
        <div className="mt-4">
          <h3 className="text-sm font-medium" style={{ color: 'var(--neutral-600)' }}>Details</h3>
          <div className="mt-2">
            <p className="text-sm" style={{ color: 'var(--neutral-700)' }}><span className="font-medium">Status:</span> {issue.fields.status.name}</p>
            <p className="text-sm" style={{ color: 'var(--neutral-700)' }}><span className="font-medium">Priority:</span> {issue.fields.priority.name}</p>
            <p className="text-sm" style={{ color: 'var(--neutral-700)' }}><span className="font-medium">Assignee:</span> {issue.fields.assignee?.displayName || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
