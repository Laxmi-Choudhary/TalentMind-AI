import axios from 'axios';

const BASE = 'http://localhost:8000';
const api = axios.create({ baseURL: BASE, timeout: 10000 });

export const fetchJobs = () => api.get('/jobs/');
export const fetchJob = (id) => api.get(`/jobs/${id}`);
export const parseJob = (id) => api.get(`/jobs/${id}/parse`);
export const analyzeJobDescription = (data) => api.post('/jobs/analyze', data);
export const fetchCandidates = (params = {}) => api.get('/candidates/', { params });
export const fetchCandidate = (id) => api.get(`/candidates/${id}`);
export const fetchSimilarCandidates = (id) => api.get(`/candidates/${id}/similar`);
export const fetchRankings = (jobId, params = {}) => api.get(`/rankings/${jobId}`, { params });
export const fetchCandidateRanking = (jobId, candidateId) => api.get(`/rankings/${jobId}/candidate/${candidateId}`);
export const fetchOverview = () => api.get('/analytics/overview');
export const fetchSkillDistribution = () => api.get('/analytics/skill-distribution');
export const fetchIndustryDistribution = () => api.get('/analytics/industry-distribution');
export const fetchExperienceDistribution = () => api.get('/analytics/experience-distribution');
export const fetchMatchTrend = () => api.get('/analytics/match-score-trend');
export const fetchHiringFunnel = () => api.get('/analytics/hiring-funnel');
export const fetchCandidateSources = () => api.get('/analytics/candidate-sources');
export const fetchEngagementDistribution = () => api.get('/analytics/engagement-distribution');
export const queryAssistant = (query) => api.post('/assistant/query', { query });
export const fetchSuggestions = () => api.get('/assistant/suggestions');
