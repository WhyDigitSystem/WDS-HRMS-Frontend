import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { Autocomplete, Checkbox, FormControlLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';
import UploadIcon from '@mui/icons-material/Upload';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import sampleFileDownload from '../../../src/assets/sample-files/sampleExitQuestions.xlsx';

const ExitInterview = () => {
    const [data, setData] = useState([]);
    const [value, setValue] = useState(0);
    const [showForm, setShowForm] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [branchName, setBranchName] = useState(localStorage.getItem('branch'));
    const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
    const [editId, setEditId] = useState('');
    const [designationDetails, setDesignationDetails] = useState([]);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [formData, setFormData] = useState({
        active: true,
        designationId: '',
        designationCode: '',
        designationName: ''
    });

    const [fieldErrors, setFieldErrors] = useState({
        designationId: false,
        designationCode: false
    });

    const [questionsData, setQuestionsData] = useState([
        {
            id: '',
            question: ''
        }
    ]);

    const [questionsErrors, setQuestionsErrors] = useState([
        {
            question: ''
        }
    ]);

    useEffect(() => {
        getAllDesignation();
        getAllExitQuestions();
    }, []);

    const getAllDesignation = async () => {
        try {
            const result = await apiCalls('get', `commonmaster/getDesignationByOrgId?orgid=${orgId}`);
            if (result && result.paramObjectsMap.designationVO) {
                setDesignationDetails(result.paramObjectsMap.designationVO.reverse());
            }
        } catch (err) {
            console.log('error', err);
        }
    };

    const getAllExitQuestions = async () => {
        try {
            const result = await apiCalls('get', `/employeseparation/getExitInterviewDepartmentVOByOrgId?orgId=${orgId}&branchCode=${branchCode}`);
            if (result) {
                setData(result.paramObjectsMap.exitInterviewDepartmentVO.reverse());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSave = async () => {
        const errors = {};

        if (!formData.designationId) {
            errors.designationId = 'Designation is required';
        }

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);

            const payload = {
                ...(editId && { id: editId }),
                active: true,
                branch: branchName,
                branchCode: branchCode,
                designationCode: formData.designationCode,
                designation: formData.designationName,
                orgId: Number(orgId),
                createdBy: loginUserName,
                questionDTO: questionsData.map((item) => ({
                    id: item.id,
                    question: item.question
                }))
            };

            console.log('DATA TO SAVE', payload);

            try {
                const response = await apiCalls('put', `/employeseparation/createUpdateExitInterviewQuestion`, payload);
                if (response.status === true) {
                    showToast('success', editId ? 'Exit questions updated successfully' : 'Exit questions created successfully');
                    getAllExitQuestions();
                    handleClear();
                } else {
                    showToast('error', editId ? 'Exit questions updation failed' : 'Exit questions creation failed');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            console.log('Validation Errors:', errors);
            setFieldErrors(errors);
        }
    };

    const handleClear = () => {
        setFormData({
            designationId: '',
            designationCode: '',
            designationName: ''
        });

        setFieldErrors({
            designationId: false,
            designationCode: false
        });

        setEditId('');
        setEditMode(false);

        setQuestionsData([{ id: Date.now(), question: '' }]);

        setQuestionsErrors([{ question: '' }]);
    };

    const handleListView = () => {
        setShowForm(!showForm);
        handleClear();
        setFieldErrors({
            designationId: false,
            designationCode: false
        });
    };

    const listViewColumns = [
        { accessorKey: 'designation', header: 'Designation Name', size: 200 },
        { accessorKey: 'designationCode', header: 'Designation Code', size: 150 }
    ];

    const getExitQuestionsById = async (row) => {
        console.log('Editing:', row.original.id);
        setEditId(row.original.id);
        setShowForm(true);

        try {
            const result = await apiCalls('get', `/employeseparation/getExitInterviewDepartmentById?id=${row.original.id}`);

            const exitQuestions = result?.paramObjectsMap?.exitInterviewDepartmentVO;

            if (exitQuestions) {
                setEditMode(true);

                const selectedDesignation = allDesignations.find(
                    (d) =>
                        d.designationName?.toLowerCase().trim() ===
                        exitQuestions.designation?.toLowerCase().trim()
                );

                setFormData({
                    designationId: selectedDesignation?.id || '',
                    designationCode: exitQuestions.designationCode || '',
                    designationName: exitQuestions.designation || ''
                });

                setQuestionsData(
                    exitQuestions.questionVO.map((detail) => ({
                        id: detail.id,
                        question: detail.question || ''
                    }))
                );
            } else {
                console.warn('No data found for this ID');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleQuestionChange = (e, index) => {
        const { value } = e.target;

        // Update question value
        setQuestionsData((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, question: value } : item
            )
        );

        // Clear error immediately when user starts typing
        setQuestionsErrors((prevErrors) =>
            prevErrors.map((err, i) =>
                i === index
                    ? { ...err, question: value ? '' : 'Question is required' }
                    : err
            )
        );
    };

    const handleBulkUploadOpen = () => {
        setUploadOpen(true);
    };

    const handleBulkUploadClose = () => {
        setUploadOpen(false);
    };

    const handleSubmit = async () => {
        console.log('Submit clicked');
        handleBulkUploadClose();
        getAllExitQuestions();
    };

    const handleFilesUpload = (event) => {
        console.log(event.target.files[0]);
    };

    const handleAddRow = () => {
        if (isLastRowEmpty(questionsData)) {
            displayRowError(questionsData);
            return;
        }
        const newRow = {
            id: Date.now(),
            question: '',
            activeCheck: true
        };
        setQuestionsData([...questionsData, newRow]);
        setQuestionsErrors([
            ...questionsErrors,
            {
                question: ''
            }
        ]);
    };

    const isLastRowEmpty = (table) => {
        const lastRow = table[table.length - 1];
        if (!lastRow) return false;

        if (table === questionsData) {
            return !lastRow.question;
        }
        return false;
    };

    const displayRowError = (table) => {
        if (table === questionsData) {
            setQuestionsErrors((prevErrors) => {
                const newErrors = [...prevErrors];
                newErrors[table.length - 1] = {
                    ...newErrors[table.length - 1],
                    question: !table[table.length - 1].question ? 'Question is required' : ''
                };
                return newErrors;
            });
        }
    };

    const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
        if (!Array.isArray(table) || !Array.isArray(errorTable)) {
            console.error('Invalid table or errorTable:', { table, errorTable });
            return;
        }

        const rowIndex = table.findIndex((row) => row.id === id);
        if (rowIndex !== -1) {
            const updatedData = table.filter((row) => row.id !== id);
            const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);

            setTable(updatedData.length > 0 ? updatedData : [{ id: Date.now(), question: '' }]);
            setErrorTable(updatedErrors.length > 0 ? updatedErrors : [{ question: '' }]);
        }
    };

    const allDesignations = [
        { id: "GENERAL", designationName: "GENERAL", designationCode: "GL" },
        ...designationDetails
    ];

    return (
        <>
            <div>
                <ToastContainer />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                    {!showForm && <ActionButton title="New Entry" icon={AddIcon} onClick={handleListView} />}
                    {showForm && (
                        <>
                            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleListView} />
                            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                            <ActionButton title="Upload" icon={UploadIcon} onClick={handleBulkUploadOpen} margin="0 10px 0 10px" />
                            {uploadOpen && (
                                <CommonBulkUpload
                                    open={uploadOpen}
                                    handleClose={handleBulkUploadClose}
                                    dialogTitle="Upload Files"
                                    uploadText="Upload File"
                                    onSubmit={handleSubmit}
                                    sampleFileDownload={sampleFileDownload}
                                    fileName="Sample_Questions"
                                    downloadText="Download File"
                                    handleFileUpload={handleFilesUpload}
                                    apiUrl="/employeseparation/uploadExitInterviewExcel"
                                    screen="ExitInterview"
                                    loginUser={loginUserName}
                                    orgId={orgId}
                                    branch={branchName}
                                    branchCode={branchCode}
                                />
                            )}
                        </>
                    )}
                </div>

                {showForm ? (
                    <>
                        <div className="row d-flex">
                            {/* Designation Selection */}

                            <div className="col-md-4 mb-3">
                                <Autocomplete
                                    options={allDesignations}
                                    getOptionLabel={(option) => option.designationName || ""}
                                    value={allDesignations.find((d) => d.id === formData.designationId) || null}
                                    onChange={(event, newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            designationId: newValue ? newValue.id : "",
                                            designationCode: newValue ? newValue.designationCode : "",
                                            designationName: newValue ? newValue.designationName : ""
                                        }));

                                        setFieldErrors((prev) => ({
                                            ...prev,
                                            designationId: ""
                                        }));
                                    }}
                                    size="small"
                                    sx={{
                                        width: "100%",
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: "#fff"
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Designation"
                                            error={Boolean(fieldErrors.designationId)}
                                            helperText={fieldErrors.designationId || ""}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{ fontWeight: 500 }}>
                                                    {option.designationName}
                                                </span>
                                            </div>
                                        </li>
                                    )}
                                />
                            </div>

                            {/* Designation Code - Auto-filled */}
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth variant="filled">
                                    <TextField
                                        id="designationCode"
                                        label="Designation Code"
                                        size="small"
                                        name="designationCode"
                                        value={formData.designationCode}
                                        disabled
                                        sx={{ backgroundColor: '#f5f5f5' }}
                                    />
                                </FormControl>
                            </div>
                        </div>

                        <div className="row mt-2">
                            <Box sx={{ width: '100%' }}>
                                <Tabs
                                    value={value}
                                    onChange={(event, newValue) => setValue(newValue)}
                                    textColor="secondary"
                                    indicatorColor="secondary"
                                    aria-label="secondary tabs example"
                                >
                                    <Tab value={0} label="Exit Interview Questions" />
                                </Tabs>
                            </Box>
                            <Box sx={{ padding: 2 }}>
                                {value === 0 && (
                                    <>
                                        <div className="row d-flex ml">
                                            <div className="mb-1">
                                                <ActionButton title="Add Question" icon={AddIcon} onClick={handleAddRow} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered table-responsive">
                                                            <thead>
                                                                <tr style={{
                                                                    background: 'linear-gradient(193deg, #3a6b6d 30%, #2a4b4d 90%)',
                                                                    color: 'white'
                                                                }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '80px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '60px' }}>
                                                                        Sl. No.
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '70%' }}>
                                                                        Question
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {questionsData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton
                                                                                title="Delete"
                                                                                icon={DeleteIcon}
                                                                                onClick={() =>
                                                                                    handleDeleteRow(row.id, questionsData, setQuestionsData, questionsErrors, setQuestionsErrors)
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <div className="pt-2">{index + 1}</div>
                                                                        </td>
                                                                        <td className="border px-2 py-2">
                                                                            <input
                                                                                type="text"
                                                                                value={questionsData[index]?.question || ''}
                                                                                onChange={(e) => handleQuestionChange(e, index)}
                                                                                className={questionsErrors[index]?.question ? 'error form-control' : 'form-control'}
                                                                                placeholder="Enter exit interview question"
                                                                                style={{ width: '100%', padding: '8px' }}
                                                                            />
                                                                            {questionsErrors[index]?.question && (
                                                                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                    {questionsErrors[index].question}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Box>
                        </div>
                    </>
                ) : (
                    <CommonListViewTable
                        columns={listViewColumns}
                        data={data}
                        blockEdit={true}
                        toEdit={getExitQuestionsById}
                        enableEditing={true}
                    />
                )}
            </div>
        </>
    );
};

export default ExitInterview;