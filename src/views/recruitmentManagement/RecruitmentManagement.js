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
    Add as AddIcon,
    Work as WorkIcon,
    Person as PersonIcon,
    EventNote as EventIcon,
    LocalOffer as OfferIcon
} from '@mui/icons-material';

// Import tab components
import JobPostings from './tabs/JobPostings';
import Candidates from './tabs/Candidates';
import Interviews from './tabs/Interviews';
import Offers from './tabs/Offers';
import ReusableModal from './ModalManager';
import { showToast } from 'utils/toast-component';

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
    const [records, setRecords] = useState([]);
    const [config] = useState(defaultConfig);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({});

    // Icon colors for different tabs - always colored
    const iconColors = {
        jobs: {
            active: '#3b82f6', // Blue
            inactive: '#3b82f6' // Same blue but with opacity
        },
        candidates: {
            active: '#10b981', // Green
            inactive: '#10b981' // Same green
        },
        interviews: {
            active: '#f59e0b', // Amber
            inactive: '#f59e0b' // Same amber
        },
        offers: {
            active: '#8b5cf6', // Violet
            inactive: '#8b5cf6' // Same violet
        }
    };

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            const initialData = [
                {
                    id: '1',
                    type: 'job',
                    job_title: 'Senior Frontend Developer',
                    department: 'Engineering',
                    location: 'Bengaluru, India',
                    status: 'Active',
                    created_at: new Date().toISOString(),
                    applications: 24,
                    salary: '₹120,000 - ₹150,000'
                },
                {
                    id: '2',
                    type: 'job',
                    job_title: 'Product Manager',
                    department: 'Product',
                    location: 'Chennai, India',
                    status: 'Active',
                    created_at: new Date().toISOString(),
                    applications: 18,
                    salary: '₹130,000 - ₹160,000'
                },
                {
                    id: '3',
                    type: 'candidate',
                    candidate_name: 'Sarah Johnson',
                    candidate_email: 'sarah.j@example.com',
                    position: 'Senior Frontend Developer',
                    resume_score: 85,
                    status: 'Screening',
                    created_at: new Date().toISOString(),
                },
                {
                    id: '4',
                    type: 'candidate',
                    candidate_name: 'Michael Chen',
                    candidate_email: 'michael.c@example.com',
                    position: 'Product Manager',
                    resume_score: 92,
                    status: 'Interview',
                    created_at: new Date().toISOString(),
                }
            ];
            setRecords(initialData);
        } catch (error) {
            console.error("Failed to initialize app:", error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const openModal = (modalType, record = null) => {
        const modalConfigs = {
            addJob: {
                title: 'Create Job Posting',
                fields: [
                    { name: 'job_title', label: 'Job Title', placeholder: 'e.g., Senior Frontend Developer', required: true },
                    { name: 'department', label: 'Department', placeholder: 'e.g., Engineering', required: true },
                    { name: 'location', label: 'Location', placeholder: 'e.g., San Francisco, CA', required: true }
                ],
                onSubmit: createJob,
                submitLabel: 'Create Job'
            },
            viewJob: {
                title: 'Job Details',
                fields: [
                    { name: 'job_title', label: 'Job Title' },
                    { name: 'department', label: 'Department' },
                    { name: 'location', label: 'Location' },
                    { name: 'status', label: 'Status' },
                    { name: 'applications', label: 'Applications' },
                    { name: 'salary', label: 'Salary Range' }
                ],
                initialData: record,
                mode: 'view'
            },
            addCandidate: {
                title: 'Add Candidate',
                fields: [
                    { name: 'candidate_name', label: 'Full Name', required: true },
                    { name: 'candidate_email', label: 'Email', type: 'email', required: true },
                    { name: 'position', label: 'Position Applied', required: true },
                    { name: 'resume_score', label: 'Resume Score', type: 'number', required: true }
                ],
                onSubmit: createCandidate,
                submitLabel: 'Add Candidate'
            },
            scheduleInterview: {
                title: 'Schedule Interview',
                fields: [
                    { name: 'candidate_name', label: 'Candidate', disabled: true },
                    { name: 'position', label: 'Position', disabled: true },
                    { name: 'interview_date', label: 'Interview Date', type: 'date', required: true },
                    { name: 'interview_time', label: 'Interview Time', type: 'time', required: true },
                    { name: 'interviewer', label: 'Interviewer', required: true },
                    {
                        name: 'interview_type', label: 'Interview Type', type: 'select', options: [
                            { value: 'Technical', label: 'Technical' },
                            { value: 'Behavioral', label: 'Behavioral' },
                            { value: 'Cultural', label: 'Cultural' }
                        ], required: true
                    }
                ],
                initialData: record,
                onSubmit: createInterview,
                submitLabel: 'Schedule Interview'
            },
            addFeedback: {
                title: 'Interview Feedback',
                fields: [
                    { name: 'candidate_name', label: 'Candidate', disabled: true },
                    { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
                    { name: 'feedback', label: 'Feedback', multiline: true, rows: 4, required: true }
                ],
                initialData: record,
                onSubmit: updateInterview,
                submitLabel: 'Submit Feedback'
            },
            createOffer: {
                title: 'Create Offer Letter',
                fields: [
                    { name: 'candidate_name', label: 'Candidate Name', required: true },
                    { name: 'candidate_email', label: 'Email', type: 'email', required: true },
                    { name: 'position', label: 'Position', required: true },
                    { name: 'department', label: 'Department', required: true },
                    { name: 'location', label: 'Location', required: true },
                    { name: 'salary', label: 'Salary Offer', required: true }
                ],
                onSubmit: createOffer,
                submitLabel: 'Create Offer'
            },
            viewOffer: {
                title: 'Offer Details',
                fields: [
                    { name: 'candidate_name', label: 'Candidate' },
                    { name: 'position', label: 'Position' },
                    { name: 'department', label: 'Department' },
                    { name: 'location', label: 'Location' },
                    { name: 'salary', label: 'Salary' },
                    { name: 'status', label: 'Status' }
                ],
                initialData: record,
                mode: 'view'
            }
        };

        setModalConfig(modalConfigs[modalType] || {});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalConfig({});
    };

    const createJob = async (formData) => {
        const newRecord = {
            id: Date.now().toString(),
            type: 'job',
            status: 'Active',
            created_at: new Date().toISOString(),
            applications: 0,
            ...formData
        };

        try {
            setRecords(prev => [...prev, newRecord]);
            showToast('success', 'Job created successfully!');
            return true; // Return true only after successful operation
        } catch (error) {
            showToast('error', 'Failed to create job. Please try again.');
            return false; // Return false on error
        }
    };

    const createCandidate = async (formData) => {
        const newRecord = {
            id: Date.now().toString(),
            type: 'candidate',
            status: 'Screening',
            created_at: new Date().toISOString(),
            ...formData,
            resume_score: parseInt(formData.resume_score)
        };

        try {
            setRecords(prev => [...prev, newRecord]);
            showToast('success', 'Candidate added successfully!');
            return true;
        } catch (error) {
            showToast('error', 'Failed to add candidate. Please try again.');
            return false;
        }
    };

    const createInterview = async (formData) => {
        const newRecord = {
            id: Date.now().toString(),
            type: 'interview',
            status: 'Scheduled',
            created_at: new Date().toISOString(),
            ...formData
        };

        try {
            setRecords(prev => [...prev, newRecord]);
            showToast('success', 'Interview scheduled successfully!');
            return true;
        } catch (error) {
            showToast('error', 'Failed to schedule interview. Please try again.');
            return false;
        }
    };

    const updateInterview = async (formData) => {
        try {
            setRecords(prev => prev.map(record =>
                record.id === formData.id ? { ...record, ...formData, status: 'Completed' } : record
            ));
            showToast('success', 'Feedback submitted successfully!');
            return true;
        } catch (error) {
            showToast('error', 'Failed to submit feedback. Please try again.');
            return false;
        }
    };

    const createOffer = async (formData) => {
        const newRecord = {
            id: Date.now().toString(),
            type: 'offer',
            status: 'Pending',
            created_at: new Date().toISOString(),
            ...formData
        };

        try {
            setRecords(prev => [...prev, newRecord]);
            showToast('success', 'Offer created successfully!');
            return true;
        } catch (error) {
            showToast('error', 'Failed to create offer. Please try again.');
            return false;
        }
    };

    // Filter records by type
    const jobs = records.filter(r => r.type === 'job');
    const candidates = records.filter(r => r.type === 'candidate');
    const interviews = records.filter(r => r.type === 'interview');
    const offers = records.filter(r => r.type === 'offer');

    // Tab icons with colors - always colored
    const tabIcons = {
        jobs: <WorkIcon sx={{ fontSize: 20, color: iconColors.jobs.inactive }} />,
        candidates: <PersonIcon sx={{ fontSize: 20, color: iconColors.candidates.inactive }} />,
        interviews: <EventIcon sx={{ fontSize: 20, color: iconColors.interviews.inactive }} />,
        offers: <OfferIcon sx={{ fontSize: 20, color: iconColors.offers.inactive }} />
    };

    // Active tab icons - slightly bolder
    const activeTabIcons = {
        jobs: <WorkIcon sx={{ fontSize: 20, color: iconColors.jobs.active }} />,
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
                            <Tab
                                icon={currentTab === 'jobs' ? activeTabIcons.jobs : tabIcons.jobs}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Job Postings</span>
                                        {jobs.length > 0 && (
                                            <Chip
                                                label={jobs.length}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                    backgroundColor: currentTab === 'jobs' ? iconColors.jobs.active : 'grey.300',
                                                    color: currentTab === 'jobs' ? 'white' : 'grey.700',
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                value="jobs"
                            />

                            {/* Other Tabs */}
                            <Tab
                                icon={currentTab === 'candidates' ? activeTabIcons.candidates : tabIcons.candidates}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Candidates</span>
                                        {candidates.length > 0 && (
                                            <Chip
                                                label={candidates.length}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                    backgroundColor: currentTab === 'candidates' ? iconColors.candidates.active : 'grey.300',
                                                    color: currentTab === 'candidates' ? 'white' : 'grey.700',
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                value="candidates"
                            />

                            <Tab
                                icon={currentTab === 'interviews' ? activeTabIcons.interviews : tabIcons.interviews}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Interviews</span>
                                        {interviews.length > 0 && (
                                            <Chip
                                                label={interviews.length}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                    backgroundColor: currentTab === 'interviews' ? iconColors.interviews.active : 'grey.300',
                                                    color: currentTab === 'interviews' ? 'white' : 'grey.700',
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                value="interviews"
                            />

                            <Tab
                                icon={currentTab === 'offers' ? activeTabIcons.offers : tabIcons.offers}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Offers</span>
                                        {offers.length > 0 && (
                                            <Chip
                                                label={offers.length}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.75rem',
                                                    backgroundColor: currentTab === 'offers' ? iconColors.offers.active : 'grey.300',
                                                    color: currentTab === 'offers' ? 'white' : 'grey.700',
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                value="offers"
                            />
                        </Tabs>

                        {/* Button Section */}
                        {
                            currentTab === 'jobs' ? (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => openModal('addJob')}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                    }}
                                >
                                    New Job
                                </Button>) : ('')
                        }
                    </Container>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container component="main" sx={{ flexGrow: 1, py: 2 }} maxWidth="xl">
                {currentTab === 'jobs' && (
                    <JobPostings
                        jobs={jobs}
                        onViewJob={(job) => openModal('viewJob', job)}
                        onAddJob={() => openModal('addJob')}
                        config={config}
                    />
                )}

                {currentTab === 'candidates' && (
                    <Candidates
                        candidates={candidates}
                        onAddCandidate={() => openModal('addCandidate')}
                        onScheduleInterview={(candidate) => openModal('scheduleInterview', candidate)}
                        config={config}
                    />
                )}

                {currentTab === 'interviews' && (
                    <Interviews
                        interviews={interviews}
                        onAddFeedback={(interview) => openModal('addFeedback', interview)}
                        config={config}
                    />
                )}

                {currentTab === 'offers' && (
                    <Offers
                        offers={offers}
                        onCreateOffer={() => openModal('createOffer')}
                        onViewOffer={(offer) => openModal('viewOffer', offer)}
                        config={config}
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