import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Card, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const ESIReport = () => {
  const [listViewData, setListViewData] = useState([]);
  const [branchName, setBranchName] = useState(localStorage.getItem('branchName'));
  const orgId = localStorage.getItem('orgId');

  const getAllHolidayByOrgId = useCallback(async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);
      const holidays = result?.paramObjectsMap?.holidayVO || [];
      const reversedHolidays = [...holidays];
      setListViewData(reversedHolidays);
      if (reversedHolidays.length > 0 && reversedHolidays[0].branchName) {
        setBranchName(reversedHolidays[0].branchName);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error(`Failed to fetch holiday data: ${err?.message || 'Unknown error'}`);
      setListViewData([]);
    }
  }, [orgId]);

  useEffect(() => {
    getAllHolidayByOrgId();
  }, [getAllHolidayByOrgId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleDownloadPDF = () => {
    if (!listViewData || listViewData.length === 0) {
      toast.error("No holidays available to download.");
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Holiday List", 105, 15, { align: "center" });

      const branch = listViewData[0]?.branchName || branchName;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Branch: ${branch}`, 105, 22, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${formatDate(new Date())}`, 105, 29, { align: "center" });

      const headers = [["S.No", "Date", "Day", "Holidays"]];
      const data = listViewData.map((item, index) => [
        index + 1,
        formatDate(item.holidayDate),
        item.day || "N/A",
        item.festival || "N/A",
      ]);

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 40,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [63, 81, 181], textColor: 255, fontSize: 10, halign: "center" },
        columnStyles: { 0: { cellWidth: 20, halign: "center" } },
      });

      doc.save("holidays_report.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadExcel = () => {
    if (!listViewData || listViewData.length === 0) {
      toast.error("No holidays available to export.");
      return;
    }

    const dataToExport = listViewData.map((item, index) => ({
      "S.No": index + 1,
      "Date": formatDate(item.holidayDate),
      "Day": item.day || "N/A",
      "Holiday Name": item.festival || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Holidays");
    XLSX.writeFile(workbook, "holidays_report.xlsx");
    toast.success("Excel downloaded successfully!");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printableContent = listViewData.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${formatDate(item.holidayDate)}</td>
        <td>${item.day || 'N/A'}</td>
        <td>${item.festival || 'N/A'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Holiday Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-family: Arial; }
            th, td { border: 1px solid #999; padding: 8px; text-align: center; }
            th { background-color: #3f51b5; color: white; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">Holiday List - ${branchName}</h2>
          <table>
            <thead>
              <tr><th>S.No</th><th>Date</th><th>Day</th><th>Holiday</th></tr>
            </thead>
            <tbody>${printableContent}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const listViewColumns = [
    { accessorKey: 'ipNumber', header: 'IP Number', size: 140 },
    { accessorKey: 'ipName', header: 'IP Name', size: 140 },
    { accessorKey: 'daysWorked', header: 'No Of Days Work', size: 140 },
    { accessorKey: 'monthlyWages', header: 'Total Monthly Wages', size: 140 },
    { accessorKey: 'reasonCode', header: 'Reason Code', size: 140 },
    { accessorKey: 'lastWorkingDate', header: 'Last Working Date', size: 140 },
  ];

  return (
    <>
      <Card sx={{ padding: 4, backgroundColor: '#ffffff', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)', borderRadius: 4, maxWidth: '100%', mt: 3 }}>
        <ToastContainer position="top-right" autoClose={5000} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            ESI Report
          </Typography>
          <Box>
            <Tooltip title="Print">
              <IconButton color="primary" onClick={handlePrint}><PrintIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Download PDF">
              <IconButton color="error" onClick={handleDownloadPDF}><PictureAsPdfIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Download Excel">
              <IconButton color="success" onClick={handleDownloadExcel}><GridOnIcon /></IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ mt: 0 }}>
          {listViewData.length > 0 && (
            <Paper sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <CommonListViewTable
                data={listViewData}
                columns={listViewColumns}
                blockEdit
                showActions={false}
                hideActions
              />
            </Paper>
          )}
        </Box>
      </Card>
    </>
  );
};

export default ESIReport;
