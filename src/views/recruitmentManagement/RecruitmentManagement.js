// Updated RecruitmentManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    createTheme,
    Box,
    AppBar,
    Toolbar,
    Button,
    Tabs,
    Tab,
    Container,
    Chip,
} from '@mui/material';

import {
    // Add as AddIcon,
    Psychology as PsychologyIcon,
    Work as WorkIcon,
    Person as PersonIcon,
    EventNote as EventIcon,
    LocalOffer as OfferIcon
} from '@mui/icons-material';

// Import tab components
import JobPostings from './tabs/JobPostings';
import ATS from './tabs/ATS';
import Candidates from './tabs/Candidates';
import Interviews from './tabs/Interviews';
import Offers from './tabs/Offers';
import ReusableModal from './ModalManager';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';

const defaultConfig = {
    background_color: "#f8fafc",
    surface_color: "#ffffff",
    text_color: "#1e293b",
    primary_action_color: "#3b82f6",
    secondary_action_color: "#64748b",
    system_title: "TalentFlow",
    company_name: "Your Company",
    font_family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    font_size: 16
};

const RecruitmentManagement = () => {
    const [currentTab, setCurrentTab] = useState('jobs');
    const [jobs, setJobs] = useState([]);
    const [Ats, setAts] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [offers, setOffers] = useState([]);
    const [config] = useState(defaultConfig);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({});
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
    const [loading, setLoading] = useState(true);

    // Icon colors for different tabs - always colored
    const iconColors = {
        jobs: {
            active: '#3b82f6',
            inactive: '#3b82f6'
        },
        Ats: {
            active: '#023e8a',
            inactive: '#023e8a'
        },
        candidates: {
            active: '#10b981',
            inactive: '#10b981'
        },
        interviews: {
            active: '#f59e0b',
            inactive: '#f59e0b'
        },
        offers: {
            active: '#8b5cf6',
            inactive: '#8b5cf6'
        }
    };

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            await Promise.all([
                fetchJobs(),
                fetchCandidates(),
                fetchInterviews(),
                fetchOffers()
            ]);

        } catch (error) {
            console.error("Failed to initialize app:", error);
            showToast('error', 'Failed to load recruitment data');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        try {

            const response = await apiCalls('get', `recruitmentmanagement/getJobPostingsByOrgId?branchCode=${branchCode}&orgId=${orgId}`);

            if (response.status === true) {
                const jobsData = response.paramObjectsMap.jobPostingsVO.reverse() || [];
                setJobs(jobsData);
            } else {
                console.error('API Error fetching jobs:', response);
                setJobs([]);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs([]);
        }
    };

    const fetchCandidates = async () => {
        try {

            const response = await apiCalls('get', `recruitmentmanagement/getCandidatesByOrgId?branchCode=${branchCode}&orgId=${orgId}`);

            if (response.status === true) {
                const candidatesData = response.paramObjectsMap.candidatesVO || [];
                setCandidates(candidatesData);
            } else {
                console.error('API Error fetching candidates:', response);
                setCandidates([]);
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
            setCandidates([]);
        }
    };

    const fetchInterviews = async () => {
        try {

            setLoading(true);

            const response = await apiCalls('get', `recruitmentmanagement/getSchedulerCandidatesByOrgId?branchCode=${branchCode}&orgId=${orgId}`);

            if (response.status === true) {
                // Handle response structure safely
                const interviewsData =
                    response.paramObjectsMap?.candidatesVO ||
                    [];

                setInterviews(Array.isArray(interviewsData) ? interviewsData : [interviewsData]);
            } else {
                setInterviews([]);
            }
        } catch (error) {
            setInterviews([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        try {

            const response = await apiCalls('get', `recruitmentmanagement/getCreateOfferByOrgIdAndDepartment?orgId=${orgId}&branchCode=${branchCode}&department=ALL&status=ALL`);

            if (response.status === true) {
                const offersData = response.paramObjectsMap.createOfferVO || [];
                setOffers(offersData);
            } else {
                console.error('API Error fetching offers:', response);
                setOffers([]);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            setOffers([]);
        }
    };

    // Refresh data when tab changes to ensure counts are updated
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        // Refresh data for the selected tab
        switch (newValue) {
            case 'jobs':
                fetchJobs();
                break;
            case 'Ats':
                // fetchJobs();
                break;
            case 'candidates':
                fetchCandidates();
                break;
            case 'interviews':
                fetchInterviews();
                break;
            case 'offers':
                fetchOffers();
                break;
            default:
                break;
        }
    };

    // Generic modal handlers
    const openModal = (modalConfig) => {
        setModalConfig(modalConfig);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalConfig({});
    };

    // Helper function to count active items
    const countActiveItems = (items, statusField = 'active') => {
        if (!items || !Array.isArray(items)) return 0;
        return items.filter(item => item[statusField] === true || item[statusField] === 'Active').length;
    };

    // Calculate counts for each tab - FIXED to show total count instead of just active
    const jobCount = jobs.length; // Show total jobs
    // const ATSCount = Ats.length;
    const candidateCount = candidates.length; // Show total candidates
    const interviewCount = interviews.length; // Show total interviews
    const offerCount = offers.length; // Show total offers

    // Tab icons with colors - always colored
    const tabIcons = {
        jobs: <WorkIcon sx={{ fontSize: 20, color: iconColors.jobs.inactive }} />,
        Ats: <PsychologyIcon sx={{ fontSize: 20, color: iconColors.Ats.inactive }} />,
        candidates: <PersonIcon sx={{ fontSize: 20, color: iconColors.candidates.inactive }} />,
        interviews: <EventIcon sx={{ fontSize: 20, color: iconColors.interviews.inactive }} />,
        offers: <OfferIcon sx={{ fontSize: 20, color: iconColors.offers.inactive }} />
    };

    // Active tab icons - slightly bolder
    const activeTabIcons = {
        jobs: <WorkIcon sx={{ fontSize: 20, color: iconColors.jobs.active }} />,
        Ats: <PsychologyIcon sx={{ fontSize: 20, color: iconColors.Ats.active }} />,
        candidates: <PersonIcon sx={{ fontSize: 20, color: iconColors.candidates.active }} />,
        interviews: <EventIcon sx={{ fontSize: 20, color: iconColors.interviews.active }} />,
        offers: <OfferIcon sx={{ fontSize: 20, color: iconColors.offers.active }} />
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>

            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e0e0e0',
                }}
            >
                <Toolbar
                    disableGutters
                    sx={{
                        minHeight: 48,
                        px: 2,
                        py:0,
                    }}
                >
                    <Container
                        maxWidth="xl"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        {/* Tabs Section */}
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            sx={{
                                minHeight: 30,
                                '& .MuiTab-root': {
                                    minHeight: 30,
                                    px: 2,
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: config.primary_action_color,
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                            }}
                        >
                            {/* Jobs Tab */}
                            <Tab
                                icon={currentTab === 'jobs' ? activeTabIcons.jobs : tabIcons.jobs}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Job Postings</span>
                                        <Chip
                                            label={jobCount}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.75rem',
                                                backgroundColor: currentTab === 'jobs' ? iconColors.jobs.active : 'grey.300',
                                                color: currentTab === 'jobs' ? 'white' : 'grey.700',
                                            }}
                                        />
                                    </Box>
                                }
                                value="jobs"
                            />
                            {/* Ats Tab */}
                            <Tab
                                icon={currentTab === 'Ats' ? activeTabIcons.Ats : tabIcons.Ats}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>ATS</span>
                                        {/* <Chip
                                            label={ATSCount}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.75rem',
                                                backgroundColor: currentTab === 'Ats' ? iconColors.Ats.active : 'grey.300',
                                                color: currentTab === 'Ats' ? 'white' : 'grey.700',
                                            }}
                                        /> */}
                                    </Box>
                                }
                                value="Ats"
                            />

                            {/* Candidates Tab */}
                            <Tab
                                icon={currentTab === 'candidates' ? activeTabIcons.candidates : tabIcons.candidates}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Candidates</span>
                                        <Chip
                                            label={candidateCount}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.75rem',
                                                backgroundColor: currentTab === 'candidates' ? iconColors.candidates.active : 'grey.300',
                                                color: currentTab === 'candidates' ? 'white' : 'grey.700',
                                            }}
                                        />
                                    </Box>
                                }
                                value="candidates"
                            />

                            {/* Interviews Tab */}
                            <Tab
                                icon={currentTab === 'interviews' ? activeTabIcons.interviews : tabIcons.interviews}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Interviews</span>
                                        <Chip
                                            label={interviewCount}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.75rem',
                                                backgroundColor: currentTab === 'interviews' ? iconColors.interviews.active : 'grey.300',
                                                color: currentTab === 'interviews' ? 'white' : 'grey.700',
                                            }}
                                        />
                                    </Box>
                                }
                                value="interviews"
                            />

                            {/* Offers Tab */}
                            <Tab
                                icon={currentTab === 'offers' ? activeTabIcons.offers : tabIcons.offers}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Offers</span>
                                        <Chip
                                            label={offerCount}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.75rem',
                                                backgroundColor: currentTab === 'offers' ? iconColors.offers.active : 'grey.300',
                                                color: currentTab === 'offers' ? 'white' : 'grey.700',
                                            }}
                                        />
                                    </Box>
                                }
                                value="offers"
                            />
                        </Tabs>

                    </Container>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container component="main" sx={{ flexGrow: 1, py: 2 }} maxWidth="xl">
                {currentTab === 'jobs' && (
                    <JobPostings
                        jobs={jobs}
                        setJobs={setJobs}
                        onOpenModal={openModal}
                        onCloseModal={closeModal}
                        config={config}
                        onRefresh={fetchJobs}
                    />
                )}
                {currentTab === 'Ats' && (
                    <ATS
                        candidates={candidates}
                        onOpenModal={openModal}
                        onCloseModal={closeModal}
                        config={config}
                    // onRefresh={fetchCandidates}
                    />
                )}
                {currentTab === 'candidates' && (
                    <Candidates
                        candidates={candidates}
                        setCandidates={setCandidates}
                        onOpenModal={openModal}
                        onCloseModal={closeModal}
                        config={config}
                        onRefresh={fetchCandidates}
                    />
                )}

                {currentTab === 'interviews' && (
                    <Interviews
                        interviews={interviews}
                        onOpenModal={openModal}
                        setInterviews={setInterviews}
                        onCloseModal={closeModal}
                        config={config}
                        onRefresh={fetchInterviews}
                    />
                )}

                {currentTab === 'offers' && (
                    <Offers
                        offers={offers}
                        onOpenModal={openModal}
                        onCloseModal={closeModal}
                        config={config}
                        onRefresh={fetchOffers}
                    />
                )}
            </Container>

            {/* Reusable Modal */}
            <ReusableModal
                open={modalOpen}
                onClose={closeModal}
                config={config}
                {...modalConfig}
            />
        </Box>
    );
};

export default RecruitmentManagement;