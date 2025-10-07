import React, { useState, useEffect, useCallback } from 'react';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { Box, Button, Card, Typography, Paper, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';
// import DownloadIcon from '@mui/icons-material/Download';
import 'react-toastify/dist/ReactToastify.css';
// import * as XLSX from 'xlsx';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const HolidayReport = () => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [listViewData, setListViewData] = useState([]);
  const [branchName, setBranchName] = useState(localStorage.getItem('branchName'));
  const [loading, setLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');

  useEffect(() => {
    getAllHolidayByOrgId();
  }, []);

  const getAllHolidayByOrgId = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}`);

      console.log('API Response:', result); // Debug log

      if (result && result.paramObjectsMap && result.paramObjectsMap.holidayVO) {
        const holidays = result.paramObjectsMap.holidayVO;

        const reversedHolidays = [...holidays].reverse();
        setListViewData(reversedHolidays);

        if (reversedHolidays.length > 0 && reversedHolidays[0].branchName) {
          setBranchName(reversedHolidays[0].branchName);
        } else {
          setBranchName(localStorage.getItem('branchName') || 'No branch available');
        }
      } else {
        console.error('Unexpected API response structure:', result);
        toast.error('Failed to fetch holiday data: Unexpected response format');
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error(`Failed to fetch holiday data: ${err?.message || 'Unknown error'}`);
      setListViewData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleDownloadPDF = ({ logo }) => {
    if (!listViewData || listViewData.length === 0) {
      toast.error('No holidays available to download.');
      return;
    }

    try {
      const doc = new jsPDF({
         orientation: 'landscape',
    });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
    // ==== Title with Background ====
  const title = 'Holiday Report';
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const titleWidth = doc.getTextWidth(title);
  const titlePaddingX = 6;
  const titlePaddingY = 4;
  const titleHeight = 10;
  const titleX = (pageW - (titleWidth + titlePaddingX * 2)) / 2;
  const titleY = 15;
   doc.setFillColor(220, 240, 255); // Light blue
  doc.roundedRect(
    titleX,
    titleY - titlePaddingY,
    titleWidth + titlePaddingX * 2,
    titleHeight,
    4,
    4,
    'F'
  );
   doc.setTextColor(40, 40, 40);
  doc.text(title, pageW / 2, titleY + 3, { align: 'center' });
      //
     if (logo) {
    doc.addImage(logo, 'PNG', 5, 0, 40, 30); // X, Y, width, height
  }
   const filterY = 25;
   const labelValuePairs = [
    { label: 'Branch:', value: listViewData.length > 0 ? listViewData[0].branchName : branchName },
  ];
  doc.setFontSize(10);
 const padding = 3;
  let totalTextWidth = 0;
  labelValuePairs.forEach((pair, idx) => {
    doc.setFont('helvetica', 'bold');
    const labelW = doc.getTextWidth(pair.label + ' ');
    doc.setFont('helvetica', 'normal');
    const valueW = doc.getTextWidth(pair.value + (idx < labelValuePairs.length - 1 ? ' | ' : ''));
    totalTextWidth += labelW + valueW;
  });
const pageWidth = doc.internal.pageSize.getWidth();
const rectX = (pageWidth - (totalTextWidth + padding * 2)) / 2;
const rectY = filterY;
const rectW = totalTextWidth + padding * 2;
const rectH = 8;
const borderRadius = 5;
doc.setFillColor(220, 240, 255);
doc.roundedRect(rectX, rectY, rectW, rectH, borderRadius, borderRadius, 'F');
let cursorX = rectX + padding;
labelValuePairs.forEach((pair, idx) => {
  // Bold label
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(pair.label, cursorX, rectY + 6);
  const labelW = doc.getTextWidth(pair.label + ' ');
  cursorX += labelW;

  // Normal value
  doc.setFont('helvetica', 'normal');
  const valueText = pair.value + (idx < labelValuePairs.length - 1 ? ' | ' : '');
  doc.text(valueText, cursorX, rectY + 6);
  const valueW = doc.getTextWidth(valueText);
  cursorX += valueW;
});

 doc.autoTable({
  startY: rectY + rectH + 5,
  head:[['Date', 'Day', 'Holidays']],
  body: listViewData.map((row) => {
  const formatValue = (val) => (val === 0 || val === null || val === '' ? '-' : val);
  return [
    formatValue(dayjs(row.holidayDate).format('DD-MM-YYYY')),
    formatValue(row.day),
    formatValue(row.festival),
  ]
}),

   styles: { fontSize: 8, cellPadding: 2,
  lineColor: [200, 200, 200],
  lineWidth: 0.1  },
  headStyles: { fillColor: [42, 75, 77], textColor: 255, halign: 'center' },
  margin: { left: 14, right: 14 },
   columnStyles: {
    0: { halign: 'left' }, 
    1: { halign: 'left' }, 
    2: { halign: 'left' },  
  },

     didDrawPage: (data) => {
  const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8).setTextColor('#555555');
      doc.text(
        `Print On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`,
        pageW - 15,
        pageH - 10,
        { align: 'right' }
      );
      doc.text(
      `Holiday Report - ${currentPage}`,
       pageW / 2,
      pageH - 10,
    { align: 'center' }
    );
      doc.text(
        `Printed By: ${loginUserName}`,
        15,
        pageH - 10,
        { align: 'left' }
      );
    }
  });
      doc.save('Holiday_Report.pdf');
      // toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleDownloadExcel = async ({ logo }) => {
    if (!listViewData || listViewData.length === 0) {
      toast.error('No holidays available to download.');
      return;
    }

    //
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Holiday List');
    // logo
    sheet.mergeCells('A1:B4');
    if (logo) {
      try {
        const base64Data = logo.split(',')[1] || logo;
        if (base64Data.length >= 100) {
          const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
          const imageId = workbook.addImage({
            base64: base64Data,
            extension
          });
          sheet.addImage(imageId, {
            tl: { col: 0, row: 0 }, // A1
            ext: { width: 140, height: 100 }
          });
        }
      } catch (err) {
        console.error('Error adding logo:', err);
      }
    }

    // 
 const allBorders = {
  top:    { style: 'thin' },
  left:   { style: 'thin' },
  bottom: { style: 'thin' },
  right:  { style: 'thin' }
};
    const titleRow = sheet.getRow(2);
    sheet.mergeCells('C2:H3'); 
    const titleCell = sheet.getCell('C2');
    titleCell.value = 'Holiday Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    // 
     const metaRow = sheet.getRow(5);
    metaRow.getCell(1).value = `Branch: ${branchName}`;
    metaRow.getCell(2).value = `Print On: ${dayjs().format('DD-MM-YYYY HH:mm')} `;
    metaRow.getCell(3).value = `Printed By: ${loginUserName || 'Admin'}`;
   for (let i = 1; i <= 3; i++) {
  const cell = metaRow.getCell(i);
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF593C8F'} 
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  cell.border = allBorders;
}
    const headers = ['Date', 'Day', 'Holidays'];
    const columnWidths = headers.map(() => ({ width: 20 }));
    sheet.columns = headers.map((header, i) => ({
      key: header,
      ...columnWidths[i]
    }));
    const headerRow = sheet.getRow(6);
    headerRow.height = 20;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3F51B5' }
      };
         cell.border = allBorders;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    const formatValue = (val) => (val === 0 || val === null || val === ''? '-' : val);
    listViewData.forEach((row) => {
      const rowData = [];
      rowData.push(
         formatValue(dayjs(row.holidayDate).format('DD-MM-YYYY')),
         formatValue(row.day),
         formatValue(row.festival)
      )

      const dataRow = sheet.addRow(rowData);
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F3F3F3' }
        };
        cell.border = allBorders;
        if (cell.value === '-') {
      cell.alignment = {
        horizontal: 'right',
        indent: 1
      };
    } else {
      cell.alignment = {
        indent: 1
      };
    }
      });
    });
    sheet.views = [{ state: 'frozen', ySplit: 6 }];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `Holiday_Report.xlsx`);
    // toast.success('Excel file downloaded successfully!');
  };

  const listViewColumns = [
    { accessorKey: 'holidayDate',
      header:'Date',
      size: 140, 
      Cell: ({ cell }) => formatDate(cell.getValue()) },
    { accessorKey: 'day', header: 'Day', size: 140 },
    { accessorKey: 'festival', header: 'Holidays', size: 140 }
  ];

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/company/${orgId}`);
      setCompanyDetails(response.paramObjectsMap.companyVO);
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast('Error fetching company details', 'error');
    }
  };

  useEffect(() => {
    getCompanyDetails();
  }, []);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            Holiday Report - {branchName}
          </Typography>
          <Box className="d-flex justify-end">
            <Tooltip title="Download PDF">
              {/* <ActionButton title="Download PDF" icon={DownloadIcon} onClick={handleDownloadPDF} margin="0 10px 0 0" /> */}
              <IconButton onClick={() => handleDownloadPDF({ logo: companyDetails[0]?.companyLogo })}>
                <PictureAsPdfIcon color="error" />
              </IconButton>
            </Tooltip>
            {/* <ActionButton title="Download Excel" icon={CloudDownloadIcon} onClick={handleDownloadExcel} margin="0 10px 0 0" /> */}
            <Tooltip title="Download Excel">
              <IconButton onClick={() => handleDownloadExcel({ logo: companyDetails[0]?.companyLogo })}>
                <DownloadIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ mt: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress sx={{ mr: 2 }} />
              <Typography variant="h6">Loading holiday data...</Typography>
            </Box>
          ) : listViewData.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px" bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" color="textSecondary">
                No holiday data available
              </Typography>
            </Box>
          ) : (
            <Paper sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit showActions={false} hideActions />
            </Paper>
          )}
        </Box>
      </Card>
    </>
  );
};

export default HolidayReport;
