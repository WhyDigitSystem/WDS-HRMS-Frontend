import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import dayjs from 'dayjs';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DailyAttendance = () => {
  const [listViewData, setListViewData] = useState([]);
  const [branchName] = useState(localStorage.getItem('branch'));
  const [orgId] = useState(localStorage.getItem('orgId'));

  const today = dayjs().format('YYYY-MM-DD');

  const getTodayAttendanceReportByOrgId = useCallback(async () => {
    try {
      const response = await apiCalls(
        'get',
        `/basicmaster/getTodayAttendanceReportByOrgId?branch=${branchName}&date=${today}&orgId=${orgId}`
      );

      const attendanceData = response?.paramObjectsMap?.attendanceReport || [];
      setListViewData(attendanceData);
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
    }
  }, [branchName, today, orgId]);

  useEffect(() => {
    getTodayAttendanceReportByOrgId();
  }, [getTodayAttendanceReportByOrgId]);

  const listViewColumns = [
    { accessorKey: 'empname', header: 'Name' },
    { accessorKey: 'empcode', header: 'Code' },
    { accessorKey: 'CheckInTime', header: 'Check-In Time' },
    { accessorKey: 'CheckOutTime', header: 'Check-Out Time' },
    { accessorKey: 'TotalWorkingHours', header: 'Working Hours' },
    { accessorKey: 'entrydate', header: 'Date' }
  ];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(listViewData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Today Attendance');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Today_Attendance_${today}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Today Attendance Report', 14, 14);

    const tableColumn = listViewColumns.map(col => col.header);
    const tableRows = listViewData.map(row => [
      row.empcode,
      row.empname,
      row.CheckInTime,
      row.CheckOutTime,
      row.TotalWorkingHours,
      row.entrydate
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`Today_Attendance_${today}.pdf`);
  };

  return (
    <>
      <Card
        sx={{
          padding: 4,
          backgroundColor: '#ffffff',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
          borderRadius: 4,
          maxWidth: '100%',
          mt: 3
        }}
      >
        <ToastContainer position="top-right" autoClose={5000} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Daily Attendance</Typography>
          {listViewData.length > 0 && (
            <Box>
              <Tooltip title="Download Excel">
                <IconButton onClick={exportToExcel}>
                  <DownloadIcon color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton onClick={exportToPDF}>
                  <PictureAsPdfIcon color="error" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Box>
          {listViewData.length > 0 ? (
            <Paper sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit showActions={false} enableEditing={false} hideActions />
            </Paper>
          ) : (
            <Box
              sx={{
                py: 1,
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: 16,
                fontWeight: 500
              }}
            >
              <SearchOffIcon sx={{ fontSize: 40, mb: 1, color: 'grey.500' }} />
              <div>No data found</div>
            </Box>
          )}
        </Box>
      </Card>
    </>
  );
};

export default DailyAttendance;
