import DownloadIcon from '@mui/icons-material/Download';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import QRCodeComponent from './QRCode';

const GeneratePdfTemp = ({ row, callBackFunction }) => {
  const [open, setOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  const styles = {
    container: {
      textAlign: 'center',
      margin: '20px 0',
      position: 'relative',
      fontFamily: 'Arial, sans-serif'
    },
    beforeAfter: {
      content: '""',
      position: 'absolute',
      top: '50%',
      width: '40%',
      height: '2px',
      backgroundColor: '#333'
    },
    before: {
      left: '0'
    },
    after: {
      right: '0'
    },
    text: {
      display: 'inline-block',
      padding: '0 15px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      borderRadius: '5px'
    }
  };

  const styles1 = {
    container: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      columnGap: '20px',
      fontSize: '12px'
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px'
    },
    label: {
      fontWeight: 'bold'
    },
    value: {
      marginLeft: '10px'
    }
  };

  const styles2 = {
    container: {
      fontSize: '12px',
      margin: '20px 0'
    },
    heading: {
      marginBottom: '10px',
      textDecoration: 'underline',
      fontSize: '14px'
    },
    item: {
      margin: '5px 0'
    },
    label: {
      fontWeight: 'bold'
    }
  };

  // Function to open the dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // Function to close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Function to generate and download the PDF
  const handleDownloadPdf = async () => {
    const input = document.getElementById('pdf-content');
    if (input) {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save(`Tax-Invoice_${row.docId}.pdf`);

      handleClose();
    } else {
      console.error("Element not found: 'pdf-content'");
    }
  };

  // Automatically open the dialog when the component is rendered
  useEffect(() => {
    if (row) {
      handleOpen();
    }
    console.log('RowData =>', row);

    // Call the callback function to pass handleDownloadPdf if needed
    if (callBackFunction) {
      callBackFunction(handleDownloadPdf);
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB'); // Format date as DD/MM/YYYY
    const formattedTime = now.toLocaleTimeString('en-GB'); // Format time as HH:MM:SS
    setCurrentDateTime(`${formattedDate} ${formattedTime}`);
  }, [row, callBackFunction]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      onEntered={handleDownloadPdf} // Ensure content is fully rendered before generating PDF
    >
      <DialogTitle>PDF Preview</DialogTitle>
      <DialogContent>
        <div
          id="pdf-content"
          style={{
            padding: '20px',
            backgroundColor: '#f9f9f9',
            width: '210mm',
            height: 'auto',
            margin: 'auto',
            fontFamily: 'Roboto, Arial, sans-serif',
            position: 'relative'
          }}
        >
          {/* <!-- Header Section --> */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '16px',
              marginBottom: '20px',
              borderBottom: '2px solid #000000',
              paddingBottom: '10px',
              color: '#333'
            }}
          >
            <div>EFit Finance</div>
            <div>Tax Invoice</div>
            <div>{localStorage.getItem('branch')}</div>
          </div>

          {/* <!-- Details Section --> */}
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#555'
            }}
          >
            <div>
              <div>
                <strong>Invoice No:</strong>
                {row.invoiceNo}
              </div>
              <div>
                <strong>Invoice Date: </strong>
                {row.invoiceDate ? dayjs(row.invoiceDate).format('DD-MM-YYYY') : 'N/A'}
              </div>
              <div>
                <strong>ACK No: </strong>
                {row.invoiceDate ? dayjs(row.invoiceDate).format('DD-MM-YYYY') : 'N/A'}
              </div>
              <div>
                <strong>IRN No: </strong>
                {row.invoiceDate ? dayjs(row.invoiceDate).format('DD-MM-YYYY') : 'N/A'}
              </div>
            </div>
            {/* <div style={{ textAlign: 'left' }}>
              <div>
                <strong>Client:</strong> {row.client}
              </div>
              <div>
                <strong>GRN No:</strong> {row.grnNo}
              </div>
              <div>
                <strong>GRN Date:</strong> {row.grnDate}
              </div>
            </div> */}
            <QRCodeComponent text={'1234567'} />
          </div>
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#555'
            }}
          >
            <div>
              <div>
                <strong>Bill To</strong>
              </div>
              <div>{row.partyName}</div>
              <div>
                <strong>GSTIN:</strong> {row.recipientGSTIN}
              </div>
              <div>{row.address}</div>
              <div>
                <strong>Place of address:</strong> {row.placeOfSupply}
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div>
                <strong>Due date:</strong> {row.dueDate}
              </div>
              <div>
                <strong>Place Of Supply:</strong> {row.placeOfSupply}
              </div>
              {/* <div>
                <strong>GRN Date:</strong> {row.grnDate}
              </div> */}
            </div>
          </div>

          <div style={styles.container}>
            <div style={{ ...styles.beforeAfter, ...styles.before }} />
            <span style={styles.text}>{row.gstType === 'INTRA' ? 'Intra State GST' : 'Inter State GST'}</span>

            <div style={{ ...styles.beforeAfter, ...styles.after }} />
          </div>

          {/* <div style={styles1.container}>
            <div>
              <div style={styles1.row}>
                <span style={styles1.label}>Job Number / Dt. :</span>
                <span style={styles1.value}>AHM24SOJ00030</span>
                <span style={styles1.value}>16/10/2024</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Master No / Dt. :</span>
                <span style={styles1.value}>MAEU245530351</span>
                <span style={styles1.value}>22/10/2024</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Currency :</span>
                <span style={styles1.value}>INR</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Ex. Rate :</span>
                <span style={styles1.value}>1</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Volume / Container No :</span>
                <span style={styles1.value}>3 X 20ft, PONU20921210, MSKU5519587, TCKU1124408</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>IGM NO & Date :</span>
                <span style={styles1.value}></span>
              </div>
            </div>

            <div>
              <div style={styles1.row}>
                <span style={styles1.label}>House No / Dt. :</span>
                <span style={styles1.value}>AHM24HS00016</span>
                <span style={styles1.value}>16/10/2024</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Flight No./Vessel Name :</span>
                <span style={styles1.value}>CAP SAN VINCENT 442W</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>ETD / ETA :</span>
                <span style={styles1.value}>22-OCT-24 / 22-NOV-24</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Assessable Value :</span>
                <span style={styles1.value}></span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Pkgs/Ch.Wt/Gr.Wt (Kgs.):</span>
                <span style={styles1.value}>71 / 0 / 73769</span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Bill of Entry/ S B No :</span>
                <span style={styles1.value}></span>
              </div>
              <div style={styles1.row}>
                <span style={styles1.label}>Goods Desc :</span>
                <span style={styles1.value}></span>
              </div>
            </div>
          </div> */}

          {/* <!-- Table Section --> */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '20px',
              fontSize: '12px',
              border: '1px solid #000000'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#673ab7', color: '#fff' }}>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>SAC.</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Details</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Cur</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Ex.Rt</th>
                {/* <th style={{ border: '1px solid #000000', padding: '10px' }}>Apply On</th> */}
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Qty</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Rate</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>FC Amount</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>GST</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {row.taxInvoiceDetailsVO?.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #000000' }}>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.govChargeCode}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.chargeName}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.currency}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.exRate || ''}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.qty}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.rate}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.fcAmount}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.gstpercent}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.lcAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* <!-- Total Section --> */}
          <div
            style={{
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333'
            }}
          >
            Total: {row.totalInvAmountLc}
          </div>

          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#555'
            }}
          >
            <div>
              <strong>Remarks :</strong> {row.recipientGSTIN}
            </div>
            <div>
              <strong>Shipment Ref No :</strong> {row.recipientGSTIN}
            </div>
          </div>

          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              fontSize: '14px',
              color: '#555'
            }}
          >
            <div>
              {' '}
              <strong>Shipper Inv No :</strong> {row.recipientGSTIN}
            </div>
            &nbsp;&nbsp;&nbsp;
            <div>
              {' '}
              <strong>Date :</strong> {row.recipientGSTIN}
            </div>
          </div>
          <div>
            <strong>Other Information :</strong>
          </div>
          <br></br>

          <div style={{ fontSize: '12px' }}>
            <strong>Terms And Conditions :</strong>
            <ol style={{ lineHeight: '1.6' }}>
              <li>
                OUR LIABILITY IS RESTRICTED AND LIMITED TO STANDARD TRADING CONDITIONS OF FEDERATIONS OF FREIGHT FORWARDERS ASSOCIATIONS IN
                INDIA OF WHICH WE ARE MEMBERS, COPIES OF STANDARD TRADING CONDITIONS ARE AVAILABLE ON REQUEST.
              </li>
              <li>INTEREST WILL BE CHARGED @ 16% PER ANNUM FOR ALL PAYMENT RECEIVED ON OR AFTER DUE DATE AS MENTIONED ABOVE.</li>
              <li>CHEQUE / DD SHOULD BE IN FAVOUR OF UNIWORLD LOGISTICS PRIVATE LIMITED.</li>
            </ol>
          </div>

          <div style={styles2.container}>
            <h6 style={styles2.heading}>Bank Details:</h6>
            <p style={styles2.item}>
              <span style={styles2.label}>BANK NAME:</span> HDFC BANK LIMITED
            </p>
            <p style={styles2.item}>
              <span style={styles2.label}>ACCOUNT CODE:</span> UWLIND
            </p>
            <p style={styles2.item}>
              <span style={styles2.label}>BENEFICIARY NAME:</span> UNIWORLD LOGISTICS PVT LTD
            </p>
            <p style={styles2.item}>
              <span style={styles2.label}>BRANCH:</span> KORAMANGALA, BENGALURU
            </p>
            <p style={styles2.item}>
              <span style={styles2.label}>IFSC:</span> HDFC0000053
            </p>
            <p style={styles2.item}>
              <span style={styles2.label}>ACCOUNT NO.:</span> 00530330000072
            </p>
            <p style={styles2.item}>
              <span style={styles2.label}>ACCOUNT TYPE:</span> CURRENT ACCOUNT
            </p>
          </div>

          <div
            style={{
              textAlign: 'Left',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333',
              marginTop: '10%'
            }}
          >
            Authorised Signatory
          </div>

          {/* <!-- Footer Section --> */}
          <div
            style={{
              borderTop: '2px solid #000000',
              paddingTop: '10px',
              fontSize: '12px',
              color: '#777',
              textAlign: 'center',
              // position: 'absolute',
              bottom: '0',
              width: '100%',
              marginTop: '5%'
            }}
          >
            {/* <!-- Footer Section --> */}
            <div
              style={{
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '12px',
                color: '#777'
              }}
            >
              <div>{currentDateTime}</div>
              <div>Printed By: {localStorage.getItem('userName')}</div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownloadPdf} color="primary" variant="contained" startIcon={<DownloadIcon />}>
          PDF
        </Button>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeneratePdfTemp;
