import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  BarChart3
} from 'lucide-react';

const BACKEND_URL = 'https://backend-production-cd9f.up.railway.app';

const ScrapingDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateJob, setShowCreateJob] = useState(false);

  // New job form
  const [newJob, setNewJob] = useState({
    job_name: '',
    tool: 'all',
    max_videos_per_term: 50,
    min_quality_score: 60
  });

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, statsRes, schedulesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/jobs/jobs?limit=20`),
        fetch(`${BACKEND_URL}/api/jobs/dashboard/stats`),
        fetch(`${BACKEND_URL}/api/jobs/schedules`)
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData.schedules || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const createJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/jobs/jobs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });

      if (response.ok) {
        await fetchDashboardData();
        setShowCreateJob(false);
        setNewJob({
          job_name: '',
          tool: 'all',
          max_videos_per_term: 50,
          min_quality_score: 60
        });
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setLoading(false);
    }
  };

  const startJob = async (jobId) => {
    try {
      await fetch(`${BACKEND_URL}/api/jobs/jobs/${jobId}/start`, {
        method: 'POST'
      });
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to start job:', error);
    }
  };

  const pauseJob = async (jobId) => {
    try {
      await fetch(`${BACKEND_URL}/api/jobs/jobs/${jobId}/pause`, {
        method: 'POST'
      });
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to pause job:', error);
    }
  };

  const cancelJob = async (jobId) => {
    try {
      await fetch(`${BACKEND_URL}/api/jobs/jobs/${jobId}/cancel`, {
        method: 'POST'
      });
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const toggleSchedule = async (scheduleId) => {
    try {
      await fetch(`${BACKEND_URL}/api/jobs/schedules/${scheduleId}/toggle`, {
        method: 'PATCH'
      });
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <Square className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <BarChart3 className="w-10 h-10 mr-3 text-cyan-400" />
            Scraping Dashboard
          </h1>
          <p className="text-gray-400">Monitor and control video scraping jobs</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Running Jobs</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.running_jobs || 0}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-400">{stats.completed_jobs || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Failed</p>
                  <p className="text-3xl font-bold text-red-400">{stats.failed_jobs || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Videos Scraped</p>
                  <p className="text-3xl font-bold text-cyan-400">{stats.total_videos_scraped || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-cyan-500" />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowCreateJob(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Scraping Job</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Create Job Modal */}
        {showCreateJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Scraping Job</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Job Name</label>
                  <input
                    type="text"
                    value={newJob.job_name}
                    onChange={(e) => setNewJob({ ...newJob, job_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g., Daily scrape for Zapier"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Tool</label>
                  <select
                    value={newJob.tool}
                    onChange={(e) => setNewJob({ ...newJob, tool: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Tools</option>
                    <option value="zapier">Zapier</option>
                    <option value="n8n">n8n</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Max Videos Per Term</label>
                  <input
                    type="number"
                    value={newJob.max_videos_per_term}
                    onChange={(e) => setNewJob({ ...newJob, max_videos_per_term: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                    min="10"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Min Quality Score</label>
                  <input
                    type="number"
                    value={newJob.min_quality_score}
                    onChange={(e) => setNewJob({ ...newJob, min_quality_score: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={createJob}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Job'}
                </button>
                <button
                  onClick={() => setShowCreateJob(false)}
                  className="flex-1 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Jobs</h2>
          
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No scraping jobs yet. Create one to get started!</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-400/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(job.status)}
                        <h3 className="text-lg font-semibold text-white">{job.job_name || `Job #${job.id}`}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-3">
                        <div>
                          <span className="text-gray-500">Tool:</span> {job.tool || 'all'}
                        </div>
                        <div>
                          <span className="text-gray-500">Found:</span> {job.total_videos_found || 0}
                        </div>
                        <div>
                          <span className="text-gray-500">Saved:</span> {job.total_videos_saved || 0}
                        </div>
                        <div>
                          <span className="text-gray-500">Progress:</span> {job.completed_search_terms || 0}/{job.total_search_terms || 0}
                        </div>
                      </div>

                      {job.status === 'running' && job.current_search_term && (
                        <div className="mb-2">
                          <p className="text-sm text-cyan-400">Currently: {job.current_search_term}</p>
                          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${(job.completed_search_terms / job.total_search_terms) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {job.status === 'pending' && (
                        <button
                          onClick={() => startJob(job.id)}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                          title="Start"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      )}

                      {job.status === 'running' && (
                        <button
                          onClick={() => pauseJob(job.id)}
                          className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"
                          title="Pause"
                        >
                          <Pause className="w-5 h-5" />
                        </button>
                      )}

                      {job.status === 'paused' && (
                        <button
                          onClick={() => startJob(job.id)}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                          title="Resume"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      )}

                      {(job.status === 'running' || job.status === 'paused' || job.status === 'pending') && (
                        <button
                          onClick={() => cancelJob(job.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          title="Cancel"
                        >
                          <Square className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Schedules */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-cyan-400" />
            Automated Schedules
          </h2>

          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{schedule.schedule_name}</h3>
                  <p className="text-sm text-gray-400">Cron: {schedule.cron_expression} | Tool: {schedule.tool}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total runs: {schedule.total_runs} | Success: {schedule.successful_runs} | Failed: {schedule.failed_runs}
                  </p>
                </div>

                <button
                  onClick={() => toggleSchedule(schedule.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    schedule.is_active
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {schedule.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapingDashboard;

