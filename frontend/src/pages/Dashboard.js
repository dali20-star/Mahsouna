import React, { useEffect, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import Card from '../components/Card';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { data: stats, loading: statsLoading } = useFetch('/dashboard/stats/');
  const { data: activity, loading: activityLoading } = useFetch('/dashboard/recent_activity/');

  if (statsLoading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        {stats?.total_content !== null && (
          <Card className="stat-card">
            <div className="stat-value">{stats?.total_content || 0}</div>
            <div className="stat-label">Total Content</div>
          </Card>
        )}
        
        {stats?.draft_content !== null && (
          <Card className="stat-card">
            <div className="stat-value">{stats?.draft_content || 0}</div>
            <div className="stat-label">Drafts</div>
          </Card>
        )}
        
        <Card className="stat-card">
          <div className="stat-value">{stats?.pending_approvals || 0}</div>
          <div className="stat-label">Pending Approvals</div>
        </Card>
        
        {stats?.published_content !== null && (
          <Card className="stat-card">
            <div className="stat-value">{stats?.published_content || 0}</div>
            <div className="stat-label">Published</div>
          </Card>
        )}
        
        {stats?.scheduled_publications !== null && (
          <Card className="stat-card">
            <div className="stat-value">{stats?.scheduled_publications || 0}</div>
            <div className="stat-label">Scheduled</div>
          </Card>
        )}
      </div>
      
      <div className="dashboard-row">
        <Card className="recent-activity">
          <h2>Recent Publications</h2>
          {activityLoading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              {activity?.recent_publications?.map(item => (
                <li key={item.id}>
                  <div className="activity-item">
                    <span className="activity-title">{item.content_detail?.title}</span>
                    <span className="activity-platform">
                      {item.platform_detail?.account_name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
