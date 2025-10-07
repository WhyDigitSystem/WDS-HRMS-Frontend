import React from 'react';

const LeaveBalance = () => {
  // Example data, replace with your actual data
  const leaveData = [
    { type: 'Annual Leave', allocated: 20, balance: 15 },
    { type: 'Sick Leave', allocated: 10, balance: 5 },
    { type: 'Casual Leave', allocated: 5, balance: 2 },
  ];

  // Inline styles for design
  const styles = {
    container: {
      fontFamily: "'Roboto', sans-serif",  // Roboto for body text
      margin: '0px auto',
      padding: '10px',
      backgroundColor: '#fff',
      borderRadius: '15px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      maxWidth: '650px',
      transition: 'transform 0.3s ease-in-out',
      position: 'relative',
    },
    containerHover: {
      transform: 'scale(1.02)',
    },
    header: {
      fontSize: '32px',  // Slightly larger header
      fontWeight: '700',  // Bolder header text
      color: '#2C3E50',
      marginBottom: '20px',
      textAlign: 'center',
      fontFamily: "'Lora', serif",  // Lora for elegant header
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: '#f4f6f9',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    th: {
      backgroundColor: '#5e35b1',
      color: '#fff',
      padding: '15px',
      textAlign: 'left',
      fontSize: '15px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontFamily: "'Roboto', sans-serif",  // Roboto for table headers
    },
    td: {
      padding: '15px',
      textAlign: 'left',
      fontSize: '16px',
      borderBottom: '1px solid #ddd',
      fontFamily: "'Roboto', sans-serif",  // Consistent font for table cells
    },
    trEven: {
      backgroundColor: '#ecf0f1',
    },
    trHover: {
      backgroundColor: '#f39c12',
      color: '#fff',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
  };

  return (
    <div
      style={{
        ...styles.container,
        ':hover': styles.containerHover,
      }}
    >
      <h2 style={styles.header}>Leave Balance</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>LEAVE TYPE</th>
            <th style={styles.th}>LEAVE ALLOCATED</th>
            <th style={styles.th}>LEAVE BALANCE</th>
          </tr>
        </thead>
        <tbody>
          {leaveData.map((leave, index) => (
            <tr
              key={index}
              style={{
                ...(index % 2 === 0 ? styles.trEven : {}),
                ':hover': styles.trHover,
              }}
            >
              <td style={styles.td}>{leave.type}</td>
              <td style={styles.td}>{leave.allocated}</td>
              <td style={styles.td}>{leave.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>
        {`
          /* Mobile view fixed position */
          @media (max-width: 768px) {
            .container {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              z-index: 1000;
              width: 100%;
              height: 60vh; /* Adjust height for mobile */
              padding: 15px;
              box-shadow: none; /* Remove shadow on mobile */
              border-radius: 0; /* Remove rounded corners */
            }

            .table {
              overflow-x: auto; /* Make the table scrollable */
            }

            .th, .td {
              font-size: 14px; /* Reduce font size for mobile */
              padding: 10px;
            }

            .header {
              font-size: 24px; /* Reduce header size for mobile */
            }
          }
        `}
      </style>
    </div>
  );
};

export default LeaveBalance;
