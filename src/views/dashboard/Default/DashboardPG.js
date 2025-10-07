import apiCalls from 'apicall';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const DashboardPG = () => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSubDepartment, setSelectedSubDepartment] = useState(null);
  const [employeeType, setEmployeeType] = useState('Employee');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  // Ref for PDF generation
  const componentRef = useRef();

  const getAttendance = async (date) => {
    try {
      setLoading(true);

      // Using your existing apiCalls method
      const result = await apiCalls(
        'get',
        'AttendanceLogController/getAttendance',
        {},
        {
          startDate: date,
          endDate: date
        }
      );
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      setApiData({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data from API
  const fetchData = async (date, empType) => {
    try {
      setLoading(true);

      // Using your existing apiCalls method
      const result = await apiCalls(
        'get',
        'AttendanceLogController/dashboard',
        {},
        {
          date: date,
          empType: empType
        }
      );

      console.log('Dashboard API Result:', result); // Optional: for debugging

      if (result.status && result.paramObjectsMap && result.paramObjectsMap.dashBoard) {
        setApiData(result.paramObjectsMap.dashBoard);
        setShowDatePicker(false);
      } else {
        // If no data found, set apiData to empty object
        setApiData({});
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      setApiData({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee data from API
  const fetchEmployeeData = async (date, department, empType, status, missPunch = null) => {
    try {
      setEmployeeLoading(true);

      // Determine missPunch based on status
      const actualMissPunch = missPunch !== null ? missPunch : status === 'Present' || status === 'Absent' ? 'ALL' : 'Yes';

      const result = await apiCalls(
        'get',
        'AttendanceLogController/getEmployeeAttendanceDashboard',
        {},
        {
          date: date,
          department: department,
          employeeType: empType,
          mainDepartment: empType === 'Contract' ? selectedDepartment : null,
          missPunch: actualMissPunch,
          status: actualMissPunch === 'Yes' ? 'ALL' : status
        }
      );

      console.log('Employee API Result:', result);

      if (result.status && result.paramObjectsMap && result.paramObjectsMap.attendanceLogVO) {
        const employees = result.paramObjectsMap.attendanceLogVO.map((employee) => ({
          code: employee.employeeCode,
          name: employee.employeeName,
          designation: employee.desigation,
          status: status,
          inTime: employee.inTime,
          outTime: employee.outTime,
          department: employee.department
        }));

        setSelectedEmployees(employees);
      } else {
        setSelectedEmployees([]);
      }
      setShowEmployeeModal(true);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setSelectedEmployees([]);
      setShowEmployeeModal(true);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleStatusClick = async (subDept, status, count) => {
    if (count > 0) {
      setSelectedStatus(status);

      const date = formatDateForAPI(selectedDate);
      let apiStatus;
      let missPunch;

      // Map internal status to API parameters
      switch (status) {
        case 'present':
          apiStatus = 'Present';
          missPunch = 'ALL';
          break;
        case 'absent':
          apiStatus = 'Absent';
          missPunch = 'ALL';
          break;
        case 'missingPunch':
          apiStatus = 'ALL'; // Assuming missing punch employees are considered present
          missPunch = 'Yes';
          break;
        default:
          apiStatus = 'Present';
          missPunch = 'ALL';
      }

      await fetchEmployeeData(date, subDept, employeeType, apiStatus, missPunch);
    }
  };

  // Format date for API
  const formatDateForAPI = (dateType) => {
    const today = new Date();
    let date = new Date();

    switch (dateType) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'yesterday':
        date.setDate(today.getDate() - 1);
        return date.toISOString().split('T')[0];
      case 'custom':
        if (customDate) {
          return customDate;
        }
        return today.toISOString().split('T')[0];
      default:
        return today.toISOString().split('T')[0];
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Attendance_Report_${formatDateForAPI(selectedDate)}`,
    onBeforeGetContent: () => {
      // Set a small timeout to ensure the component is rendered before printing
      return new Promise((resolve) => setTimeout(resolve, 100));
    }
  });

  const downloadPDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Format date for display
    const formatDateForDisplay = () => {
      const date = formatDateForAPI(selectedDate);
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Generate HTML content for the PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Daily Manpower Report</title>
  <style>
    :root {
      --primary-color: #4361ee;
      --secondary-color: #3f37c9;
      --accent-color: #4895ef;
      --light-color: #f8f9fa;
      --dark-color: #212529;
      --success-color: #4cc9f0;
      --border-radius: 8px;
      --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 30px; 
      background-color: #f5f7fb;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eaeaea;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    .subtitle {
      color: #6c757d;
      font-size: 16px;
    }
    
    .header-info {
      display: flex;
      justify-content: space-between;
      background: var(--light-color);
      padding: 15px 20px;
      border-radius: var(--border-radius);
      margin-bottom: 25px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 12px;
      color: #6c757d;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-weight: 600;
      color: var(--dark-color);
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-color);
      margin: 25px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--accent-color);
    }
    
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 30px;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    th {
      background-color: var(--primary-color);
      color: white;
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
    }
    
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #eaeaea;
    }
    
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    tr:hover {
      background-color: #f1f6ff;
    }
    
    .percentage-cell {
      font-weight: 600;
    }
    
    .progress-container {
      width: 100px;
      height: 8px;
      background-color: #e9ecef;
      border-radius: 4px;
      display: inline-block;
      margin-right: 10px;
      vertical-align: middle;
    }
    
    .progress-bar {
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
    }
    
    .footer {
      text-align: right;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eaeaea;
      color: #6c757d;
      font-size: 14px;
    }
    
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .logo-placeholder {
      font-size: 24px;
      font-weight: bold;
      color: var(--primary-color);
      display: inline-block;
      padding: 10px 20px;
      border: 2px solid var(--primary-color);
      border-radius: var(--border-radius);
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .container {
        box-shadow: none;
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
  
    
    <div class="header">
      <h1>Daily Manpower Report</h1>
   
    </div>
    
    <div class="header-info">
      <div class="info-item">
        <span class="info-label">DATE</span>
        <span class="info-value">${formatDateForDisplay()}</span>
      </div>
      <div class="info-item">
        <span class="info-label">EMPLOYEE</span>
        <span class="info-value">${employeeType}</span>
      </div>
      <div class="info-item">
        <span class="info-label">REPORT GENERATED</span>
        <span class="info-value">${new Date().toLocaleDateString()}</span>
      </div>
    </div>
    
    <div class="section-title">Department Attendance Summary</div>
    
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>DEPARTMENT</th>
          <th>REGISTERED WORKERS</th>
          <th>PRESENT WORKERS</th>
          <th>% AGE OF PRESENCE</th>
        </tr>
      </thead>
      <tbody>
        ${
          apiData
            ? Object.keys(apiData)
                .map((dept, index) => {
                  const deptData = apiData[dept];
                  const totalEmployees = deptData.present + deptData.absent;
                  const presentPercent = totalEmployees > 0 ? Math.round((deptData.present / totalEmployees) * 100) : 0;

                  return `
            <tr>
              <td>${index + 1}</td>
              <td>${dept}</td>
              <td>${totalEmployees}</td>
              <td>${deptData.present}</td>
              <td class="percentage-cell">
                <div class="progress-container">
                  <div class="progress-bar" style="width: ${presentPercent}%"></div>
                </div>
                ${presentPercent}%
              </td>
            </tr>
          `;
                })
                .join('')
            : '<tr><td colspan="5" style="text-align: center;">No data available</td></tr>'
        }
      </tbody>
    </table>
    
    <div class="footer">
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
  </div>
  
  <script>
    // Automatically print when the window loads
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `;

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Fetch data when component mounts or when date/employee type changes
  useEffect(() => {
    const fetchDataSequentially = async () => {
      const date = formatDateForAPI(selectedDate);

      try {
        // Wait for getAttendance to complete
        await getAttendance(date);

        // Then call fetchData
        await fetchData(date, employeeType);
      } catch (error) {
        console.error('Error in sequential fetching:', error);
      }
    };

    fetchDataSequentially();
  }, [selectedDate, employeeType, customDate]);

  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
    setCurrentView('sub');
  };

  const handleSubDepartmentClick = (subDept) => {
    setSelectedSubDepartment(subDept);
    setCurrentView('sub');
  };

  const handleBackClick = () => {
    if (currentView === 'detail') {
      setCurrentView('sub');
    } else {
      setCurrentView('main');
      setSelectedDepartment(null);
    }
  };

  const handleEmployeeTypeChange = (type) => {
    setEmployeeType(type);
    setCurrentView('main');
    setSelectedDepartment(null);
    setSelectedSubDepartment(null);
  };

  const handleDateChange = (dateType) => {
    setSelectedDate(dateType);
    setShowDatePicker(false);
  };

  const handleCustomDateChange = (e) => {
    setCustomDate(e.target.value);
    setSelectedDate('custom');
  };

  // Define a palette of colors
  const colors = [
    { bg: 'bg-purple', text: 'text-purple' },
    { bg: 'bg-primary', text: 'text-primary' },
    { bg: 'bg-teal', text: 'text-teal' },
    { bg: 'bg-success', text: 'text-success' },
    { bg: 'bg-warning', text: 'text-warning' },
    { bg: 'bg-danger', text: 'text-danger' },
    { bg: 'bg-info', text: 'text-info' }
  ];

  // Store assigned colors for consistency
  const assignedColors = {};

  function getDeptColor(dept) {
    if (!dept) return { bg: 'bg-secondary', text: 'text-secondary' };

    // If already assigned, return same color (to keep it consistent)
    if (assignedColors[dept]) return assignedColors[dept];

    // Pick a color randomly (or sequentially)
    const randomIndex = Object.keys(assignedColors).length % colors.length;
    const color = colors[randomIndex];

    // Assign to department
    assignedColors[dept] = color;

    return color;
  }

  const getDateDisplayText = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (selectedDate) {
      case 'today':
        return `Today (${today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`;
      case 'yesterday':
        return `Yesterday (${yesterday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`;
      case 'custom':
        if (customDate) {
          const custom = new Date(customDate);
          return `Custom (${custom.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`;
        }
        return 'Select Date';
      default:
        return 'Select Date';
    }
  };

  // Component for PDF export
  const ComponentToPrint = React.forwardRef((props, ref) => {
    const formatDateForDisplay = () => {
      const date = formatDateForAPI(props.selectedDate);
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return (
      <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 className="text-center mb-4">Daily Manpower Report</h1>
        <div className="d-flex justify-content-between mb-4">
          <div>
            <strong>Date:</strong> {formatDateForDisplay()}
          </div>
          <div>
            <strong>Employee:</strong> {props.employeeType}
          </div>
        </div>

        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>SL NO</th>
              <th>DEPARTMENT</th>
              <th>REGISTERED WORKERS</th>
              <th>PRESENT WORKERS</th>
              <th>% AGE OF PRESENCE</th>
            </tr>
          </thead>
          <tbody>
            {props.apiData &&
              Object.keys(props.apiData).map((dept, index) => {
                const deptData = props.apiData[dept];
                const totalEmployees = deptData.present + deptData.absent;
                const presentPercent = totalEmployees > 0 ? Math.round((deptData.present / totalEmployees) * 100) : 0;

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{dept}</td>
                    <td>{totalEmployees}</td>
                    <td>{deptData.present}</td>
                    <td>{presentPercent}%</td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div className="mt-4">
          <h5>Contractors</h5>
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>SL NO</th>
                <th>CONTRACTOR NAME</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>DORA & KERU</td>
              </tr>
              <tr>
                <td>2</td>
                <td>BUENDRA SINCH</td>
              </tr>
              <tr>
                <td>3</td>
                <td>ILIVASH</td>
              </tr>
              <tr>
                <td>4</td>
                <td>NARASINGH MAJIK</td>
              </tr>
              <tr>
                <td>5</td>
                <td>ASHOK VERMA</td>
              </tr>
              <tr>
                <td>6</td>
                <td>BAURI</td>
              </tr>
              <tr>
                <td>7</td>
                <td>SALAN</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-end">
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  });

  const renderMainDepartments = () => {
    if (!apiData || Object.keys(apiData).length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="bi bi-calendar-x" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
          </div>
          <h4 className="text-muted">No records found for selected day</h4>
          <p className="text-muted">Try selecting a different date or employee type.</p>
        </div>
      );
    }

    return (
      <div className="row">
        {Object.keys(apiData).map((dept) => {
          const deptData = apiData[dept];
          const totalEmployees = deptData.present + deptData.absent;
          const presentPercent = totalEmployees > 0 ? Math.round((deptData.present / totalEmployees) * 100) : 0;
          // Default color if department not in colorMap
          const deptColor = getDeptColor(dept);

          return (
            <div key={dept} className="col-md-4 mb-4">
              <div
                className="card h-100 shadow-sm department-card"
                onClick={() => handleDepartmentClick(dept)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`card-header ${deptColor.bg} text-white py-2`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{dept}</h5>
                    <div>
                      <span className="badge bg-light text-dark me-1">{presentPercent}%</span>
                      <span className="badge bg-light text-dark">{totalEmployees} total</span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="me-4" style={{ width: '70px', height: '70px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Present', value: deptData.present },
                              { name: 'Absent', value: deptData.absent },
                              { name: 'Missing Punch', value: deptData.missingPunch }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={35}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            <Cell fill="#28a745" />
                            <Cell fill="#dc3545" />
                            <Cell fill="#ffc107" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <span className="small fw-medium">{presentPercent}%</span>
                      </div>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <div className="d-flex align-items-center">
                          <span className="status-dot bg-success me-2"></span>
                          <span className="small">Present</span>
                        </div>
                        <span className="small fw-medium">{deptData.present}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-1">
                        <div className="d-flex align-items-center">
                          <span className="status-dot bg-danger me-2"></span>
                          <span className="small">Absent</span>
                        </div>
                        <span className="small fw-medium">{deptData.absent}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          <span className="status-dot bg-warning me-2"></span>
                          <span className="small">Missing Punch</span>
                        </div>
                        <span className="small fw-medium">{deptData.missingPunch}</span>
                      </div>

                      <div className="progress mb-2" style={{ height: '6px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${presentPercent}%` }}
                          aria-valuenow={presentPercent}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>

                      <div className="small text-muted">{Object.keys(deptData.subDepartments || {}).length} sub-departments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSubDepartments = () => {
    if (!selectedDepartment || !apiData || !apiData[selectedDepartment]) return null;
    const deptData = apiData[selectedDepartment];

    return (
      <div>
        <button onClick={handleBackClick} className="btn btn-link text-decoration-none p-0 mb-3 d-flex align-items-center">
          <i className="bi bi-arrow-left me-2"></i> All Departments
        </button>

        <h2 className="mb-4">{selectedDepartment}</h2>

        <div className="row">
          {Object.keys(deptData.subDepartments || {}).map((subDept) => {
            const subData = deptData.subDepartments[subDept];
            const total = subData.present + subData.absent;
            const presentPercent = total > 0 ? Math.round((subData.present / total) * 100) : 0;

            return (
              <div key={subDept} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100 subdept-card" onClick={() => handleSubDepartmentClick(subDept)} style={{ cursor: 'pointer' }}>
                  <div className="card-body">
                    <h6 className="card-title">{subDept}</h6>

                    <div className="mb-2">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Attendance</span>
                        <span className="fw-medium">{presentPercent}%</span>
                      </div>

                      <div className="progress mb-2" style={{ height: '5px' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${presentPercent}%`, background: 'linear-gradient(to right, #0d6efd, #0a58ca)' }}
                          aria-valuenow={presentPercent}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span
                        className="small text-success clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(subDept, 'present', subData.present);
                        }}
                      >
                        <span className="status-dot bg-success me-1"></span>
                        {subData.present} present
                      </span>

                      <span
                        className="small text-danger clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(subDept, 'absent', subData.absent);
                        }}
                      >
                        <span className="status-dot bg-danger me-1"></span>
                        {subData.absent} absent
                      </span>

                      <span
                        className="small text-warning clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(subDept, 'missingPunch', subData.missingPunch);
                        }}
                      >
                        <span className="status-dot bg-warning me-1"></span>
                        {subData.missingPunch} missing
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEmployeeModal = () => {
    if (!showEmployeeModal) return null;

    const statusColors = {
      present: 'bg-success',
      absent: 'bg-danger',
      missingPunch: 'bg-warning'
    };

    const statusText = {
      present: 'Present',
      absent: 'Absent',
      missingPunch: 'Missing Punch'
    };

    return (
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Employees - {statusText[selectedStatus]}</h5>
              <button type="button" className="btn-close" onClick={() => setShowEmployeeModal(false)}></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {employeeLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading employee data...</p>
                </div>
              ) : selectedEmployees.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-people" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                  <h5 className="mt-2 text-muted">No employees found</h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>In Time</th>
                        <th>Out Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmployees.map((employee, index) => (
                        <tr key={index}>
                          <td className="fw-medium">{employee.code}</td>
                          <td>{employee.name}</td>
                          <td>{employee.designation}</td>
                          <td>{employee.inTime}</td>
                          <td>{employee.outTime}</td>
                          <td>
                            <span className={`badge ${statusColors[selectedStatus]}`}>{employee.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <div className="text-muted">Total: {selectedEmployees.length} employees</div>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEmployeeModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            Error loading data: {error}
          </div>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="container">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <h1 className="h3 mb-2">Attendance Dashboard</h1>

              <div className="d-flex align-items-center flex-wrap">
                {/* Download PDF button */}
                <button
                  className="btn btn-success me-2 mb-2 d-flex align-items-center"
                  onClick={downloadPDF}
                  disabled={!apiData || Object.keys(apiData).length === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-download me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                  </svg>
                  Download
                </button>

                {/* Date filter dropdown */}
                <div className="dropdown me-2 mb-2">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    <i className="bi bi-calendar3 me-2"></i>
                    {getDateDisplayText()}
                  </button>

                  {showDatePicker && (
                    <div className="dropdown-menu show p-3" style={{ width: '300px' }}>
                      <div className="mb-2">
                        <label className="form-label">Quick Select</label>
                        <div className="d-grid gap-2">
                          <button
                            className={`btn ${selectedDate === 'today' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => handleDateChange('today')}
                          >
                            Today
                          </button>
                          <button
                            className={`btn ${selectedDate === 'yesterday' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => handleDateChange('yesterday')}
                          >
                            Yesterday
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Custom Date</label>
                        <input type="date" className="form-control form-control-sm" value={customDate} onChange={handleCustomDateChange} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="btn-group mb-2" role="group">
                  <button
                    type="button"
                    className={`btn ${employeeType === 'Employee' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleEmployeeTypeChange('Employee')}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    className={`btn ${employeeType === 'Contract' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => handleEmployeeTypeChange('Contract')}
                  >
                    Contract
                  </button>
                </div>
              </div>
            </div>

            {currentView === 'main' && renderMainDepartments()}
            {currentView === 'sub' && renderSubDepartments()}
          </div>
        </div>
      </div>

      {/* Hidden component for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ComponentToPrint ref={componentRef} apiData={apiData} selectedDate={selectedDate} employeeType={employeeType} />
      </div>

      {showEmployeeModal && renderEmployeeModal()}

      <style>{`
        .bg-purple {
          background-color: #6f42c1 !important;
        }
        .text-purple {
          color: #6f42c1 !important;
        }
        .bg-teal {
          background-color: #20c997 !important;
        }
        .text-teal {
          color: #20c997 !important;
        }
        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .department-card:hover, .subdept-card:hover {
          transform: translateY(-2px);
          transition: transform 0.2s;
        }
        .clickable {
          cursor: pointer;
        }
        .clickable:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default DashboardPG;
