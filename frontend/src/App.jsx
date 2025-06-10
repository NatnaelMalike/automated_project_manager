import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import './App.css'
import StatusPieChart from './components/StatusPieChart';
import PriorityBarChart from './components/PriorityBarChart';
import RecentIssuesTable from './components/RecentIssuesTable';
import IssueDetailsModal from './components/IssueDetailsModal';
import NotificationPanel from './components/NotificationPanel';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const queryClient = new QueryClient()

function DashboardApp() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [notificationCount, setNotificationCount] = useState(0)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [realNotifications, setRealNotifications] = useState([])
  const notificationPanelRef = useRef(null);

  const formatJiraNotifications = (jiraChanges) => {
    return jiraChanges.map((change, index) => ({
      id: `jira-${Date.now()}-${index}`,
      type: 'update',
      message: `${change.key}: ${change.summary} - ${change.changes}`,
      time: new Date(change.updated).toLocaleString(),
      read: false,
      jiraData: change
    }));
  }

  const { data: jiraNotifications, isLoading: isLoadingNotifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['jira-notifications'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/projects/notifications');
        const formattedNotifications = formatJiraNotifications(response.data || []);
        setRealNotifications(formattedNotifications);
        
        if (formattedNotifications.length > 0) {
          setNotificationCount(formattedNotifications.filter(n => !n.read).length);
        }
        
        return formattedNotifications;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 30, // Poll every 30 seconds
  });

  const notifications = realNotifications;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const response = await axios.get('/api/projects')
      return response.data.issues || []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  })
  const issues = data || []

  const filteredIssues = issues.filter(issue => {
    if (activeFilter === 'all') return true;
    return issue.fields?.status?.name === activeFilter;
  });

  const statusCounts = issues.reduce((acc, issue) => {
    const status = issue.fields?.status?.name || 'Unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const priorityCounts = issues.reduce((acc, issue) => {
    const priority = issue.fields?.priority?.name || 'Unknown'
    acc[priority] = (acc[priority] || 0) + 1
    return acc
  }, {})
// Notification toast
  const showToast = () => {
    setShowNotificationPanel(!showNotificationPanel);

    if (!showNotificationPanel) {
      setShowNotifications(true);
      
      if (realNotifications.length > 0) {
        setRealNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
      
      setNotificationCount(0);
      setTimeout(() => setShowNotifications(false), 3000);
      
      setTimeout(() => refetchNotifications(), 3500);
    }
  }

  const closeNotificationPanel = () => {
    setShowNotificationPanel(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="Show notifications"]')) {
        setShowNotificationPanel(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // View issue details
  const viewIssueDetails = (issue) => {
    setSelectedIssue(issue);
    setShowIssueModal(true);
  };

  // Close issue modal
  const closeIssueModal = () => {
    setShowIssueModal(false);
    setTimeout(() => setSelectedIssue(null), 300); // Short delay for animation
  };

  // Gradient helpers for Chart.js
  function getGradient(ctx, area, colors) {
    const gradient = ctx.createLinearGradient(area.left, area.top, area.right, area.bottom);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    return gradient;
  }

  // Detailed Pie chart options
  const detailedStatusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'var(--neutral-900)',
        bodyColor: 'var(--neutral-800)',
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        padding: 12,
        borderColor: 'var(--neutral-200)',
        borderWidth: 1,
        displayColors: true,
        boxPadding: 4
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: { weight: 'bold', size: 15 },
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return `${label}: ${value}`;
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1200,
      easing: 'easeInOutQuart'
    },
  };

  // Detailed Bar chart options
  const detailedPriorityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'var(--neutral-900)',
        bodyColor: 'var(--neutral-800)',
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        padding: 12,
        borderColor: 'var(--neutral-200)',
        borderWidth: 1,
        displayColors: true,
        boxPadding: 4
      },
      datalabels: {
        display: true,
        color: '#222',
        font: { weight: 'bold', size: 15 },
        anchor: 'end',
        align: 'top',
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return `${label}: ${value}`;
        },
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart'
    },
  };

  // Status color mapping for Pie chart
  const statusColorMap = {
    'To Do': 'var(--neutral-300)',
    'In Progress': 'var(--accent-warning)',
    'Review': 'var(--accent-info)',
    'Done': 'var(--accent-success)',
    'Unknown': 'var(--neutral-400)',
  };
  const statusBorderColorMap = {
    'To Do': 'var(--neutral-400)',
    'In Progress': '#d4b58c',
    'Review': '#7da0be',
    'Done': '#6ca380',
    'Unknown': 'var(--neutral-500)',
  };

  // Chart.js configuration with refined color palette (dynamic)
  const statusChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map(
          status => statusColorMap[status] || 'var(--neutral-300)'
        ),
        borderColor: Object.keys(statusCounts).map(
          status => statusBorderColorMap[status] || 'var(--neutral-400)'
        ),
        borderWidth: 1,
      },
    ],
  }

  const priorityChartData = {
    labels: Object.keys(priorityCounts),
    datasets: [
      {
        label: 'Issues by Priority',
        data: Object.values(priorityCounts),
        backgroundColor: [
          'var(--accent-error)',    // High
          'var(--accent-warning)',  // Medium
          'var(--accent-info)',     // Low
        ],
        borderColor: [
          '#c77764',
          '#d4b58c',
          '#7da0be',
        ],
        borderWidth: 1,
      },
    ],
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-neutral-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--primary-500)' }}></div>
        <p className="mt-4 text-sm text-neutral-600">Loading dashboard data...</p>
      </div>
    </div>
  )

  if (isError) return (
    <div className="flex items-center justify-center h-screen bg-neutral-50">
      <div className="p-6 rounded-lg border max-w-md" style={{ 
        backgroundColor: 'rgb(250, 240, 240)', 
        borderColor: 'var(--accent-error)',
        borderWidth: '1px' 
      }}>
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--neutral-900)' }}>Unable to load dashboard</h3>
            <p className="mt-1 text-xs" style={{ color: 'var(--neutral-800)' }}>{error?.message || 'Failed to fetch issues'}</p>
            <button 
              className="mt-3 text-xs px-3 py-1.5 rounded-md" 
              style={{ backgroundColor: 'var(--accent-error)', color: 'white', opacity: 0.9 }}
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--neutral-50)' }}>
      {/* MINIMALIST NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Simple Logo */}
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary-700 tracking-tight">Dashboard</span>
            </div>
        
            {/* Notification Bell & Avatar */}
            <div className="flex items-center gap-4">
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
                onClick={showToast}
                aria-label="Show notifications"
              >
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{notificationCount}</span>
                )}
              </button>
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-base border border-primary-200">N</div>
            </div>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {showNotifications && notifications.length > 0 && (
          <div className="bg-white/90 dark:bg-slate-800/90 border border-primary-100 dark:border-primary-700/30 rounded-xl shadow-2xl px-5 py-3 min-w-[320px] flex items-start gap-3 animate-pulse-soft pointer-events-auto transform translate-y-0 opacity-100 transition-all duration-500" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
            <div className="flex-shrink-0 mt-0.5 bg-primary-100 dark:bg-primary-900/30 w-9 h-9 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-500 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {notifications[0].message}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notifications[0].time}</div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      <NotificationPanel notifications={notifications} show={showNotificationPanel} onClose={closeNotificationPanel} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium" style={{ color: 'var(--neutral-900)' }}>Project Overview</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--neutral-600)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeFilter === 'all' ? 'text-white' : ''}`}
            style={{ 
              backgroundColor: activeFilter === 'all' ? 'var(--primary-600)' : 'white',
              color: activeFilter === 'all' ? 'white' : 'var(--neutral-700)',
              border: '1px solid var(--neutral-200)'
            }}
            onClick={() => setActiveFilter('all')}
          >
            All Issues
          </button>
          {Object.keys(statusCounts).map(status => (
            <button 
              key={status}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeFilter === status ? 'text-white' : ''}`}
              style={{ 
                backgroundColor: activeFilter === status ? 
                  status === 'To Do' ? 'var(--neutral-700)' : 
                  status === 'In Progress' ? 'var(--accent-warning)' : 
                  status === 'Done' ? 'var(--accent-success)' : 
                  'var(--accent-info)' : 'white',
                color: activeFilter === status ? 'white' : 'var(--neutral-700)',
                border: '1px solid var(--neutral-200)'
              }}
              onClick={() => setActiveFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="card transition-all duration-200 hover:shadow-md">
            <h3 className="text-sm font-medium" style={{ color: 'var(--neutral-600)' }}>Total Issues</h3>
            <p className="text-3xl font-medium mt-2" style={{ color: 'var(--neutral-900)' }}>{issues.length}</p>
            <div className="mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: 'var(--primary-200)' }}></div>
          </div>
          
          <div className="card transition-all duration-200 hover:shadow-md">
            <h3 className="text-sm font-medium" style={{ color: 'var(--neutral-600)' }}>To Do</h3>
            <p className="text-3xl font-medium mt-2" style={{ color: 'var(--neutral-900)' }}>{statusCounts['To Do'] || 0}</p>
            <div className="mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: 'var(--neutral-300)' }}></div>
          </div>
          
          <div className="card transition-all duration-200 hover:shadow-md">
            <h3 className="text-sm font-medium" style={{ color: 'var(--neutral-600)' }}>In Progress</h3>
            <p className="text-3xl font-medium mt-2" style={{ color: 'var(--neutral-900)' }}>{statusCounts['In Progress'] || 0}</p>
            <div className="mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: 'var(--accent-warning)' }}></div>
          </div>
          
          <div className="card transition-all duration-200 hover:shadow-md">
            <h3 className="text-sm font-medium" style={{ color: 'var(--neutral-600)' }}>Done</h3>
            <p className="text-3xl font-medium mt-2" style={{ color: 'var(--neutral-900)' }}>{statusCounts['Done'] || 0}</p>
            <div className="mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: 'var(--accent-success)' }}></div>
          </div>
        </div>
        
        {/* Charts - Glassmorphism Containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-primary-100 shadow-xl relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-400 rounded-full opacity-30 blur-2xl"/>
            <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
              Issues by Status
            </h3>
            <div className="h-80">
              <StatusPieChart data={statusChartData} options={detailedStatusChartOptions} />
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-primary-100 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-primary-100 to-primary-400 rounded-full opacity-30 blur-2xl"/>
            <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M8 16v-4m4 4v-8m4 8v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Issues by Priority
            </h3>
            <div className="h-80">
              <PriorityBarChart data={priorityChartData} options={detailedPriorityChartOptions} />
            </div>
          </div>
        </div>
        
        {/* Recent Issues Table */}
        <RecentIssuesTable issues={filteredIssues.slice(0, 10)} onViewDetails={viewIssueDetails} />
      </main>
      
      <footer className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-xs text-center" style={{ color: 'var(--neutral-500)' }}>
          &copy; {new Date().getFullYear()} AI Project Manager • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </footer>

      {/* Issue Details Modal */}
      <IssueDetailsModal issue={selectedIssue} show={showIssueModal} onClose={closeIssueModal} />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardApp />
    </QueryClientProvider>
  )
}
