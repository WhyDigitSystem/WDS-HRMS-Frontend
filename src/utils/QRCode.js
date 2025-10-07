import { QRCodeCanvas } from 'qrcode.react'; // Import the named export

const QRCodeComponent = ({ text }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '0px' }}>
      <div>
        <QRCodeCanvas
          value={text || 'Default QR Text'}
          size={100} // Size of the QR code
          bgColor="#ffffff" // Background color
          fgColor="#000000" // Foreground color
          level="H" // Error correction level (L, M, Q, H)
        />
      </div>
    </div>
  );
};

export default QRCodeComponent;
