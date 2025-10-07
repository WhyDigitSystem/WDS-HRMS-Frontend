import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField, Button } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { useTheme } from '@mui/material/styles';
import { InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import dayjs from 'dayjs';
import { AddCircleOutline as GenerateIcon } from '@mui/icons-material';

const EmployeeCodeGeneration = () => {
  const [selectedSequence, setSelectedSequence] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFinalCodeVisible, setIsFinalCodeVisible] = useState(false); // Controls Final Code visibility

  const [formData, setFormData] = useState({
    companyName: '',
    branch: '',
    department: '',
    finalCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // const handleSequenceChange = (event) => {
  //   const selectedValue = event.target.value;

  //   setSelectedSequence((prev) => {
  //     // If the item is already in the list, remove it (toggle functionality)
  //     if (prev.includes(selectedValue)) {
  //       return prev.filter((item) => item !== selectedValue);
  //     }
  //     // Otherwise, add the item to maintain the order
  //     return [...prev, selectedValue];
  //   });

  //   // Hide final code when changing sequence
  //   setIsFinalCodeVisible(false);
  // };

  // const handleInputChange = (event) => {
  //   const { name, value } = event.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));

  //   // Hide final code when updating fields
  //   setIsFinalCodeVisible(false);
  // };

  // const handleGenerateCode = () => {
  //   const generatedCode = selectedSequence
  //     .map((field) => formData[field.toLowerCase().replace(' ', '')] || '')
  //     .filter(Boolean) // Remove empty values
  //     .join('-'); // Join with hyphen

  //   setFormData((prev) => ({ ...prev, finalCode: generatedCode }));
  //   setIsFinalCodeVisible(true); // Show final code after button click
  // };

  const handleSequenceChange = (event) => {
    const value = event.target.value;
    setSelectedSequence((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error when user types
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleGenerateCode = () => {
    let errors = {};
    selectedSequence.forEach((field) => {
      let fieldName = field.toLowerCase().replace(" ", "");
      if (!formData[fieldName]) {
        errors[fieldName] = `${field} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Generate final code
    const generatedCode = selectedSequence
      .map((field) => formData[field.toLowerCase().replace(" ", "")])
      .join("-");

    setFormData((prev) => ({ ...prev, finalCode: generatedCode }));
    setIsFinalCodeVisible(true);

    // Show success message
    toast.success(`Your Final Code: ${generatedCode}`, {
      position: "top-center",
      autoClose: 2000,
    });
  };

  const handleClear = () => {
    setFormData({
      sequence: '',
      companyName: '',
      branch: '',
      department: '',
      finalCode: ''
    });
    setSelectedSequence([]);
    setIsFinalCodeVisible(false);
  };

  return (
    <div>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
          {/* <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} /> */}
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton
            title="Save"
            icon={SaveIcon}
            // onClick={handleSave}
            isLoading={isLoading}
            // margin="0 10px 0 10px"
          />
          {selectedSequence.length > 0 && <ActionButton title="Generate Code" icon={GenerateIcon} onClick={handleGenerateCode} />}
        </div>
        <div className="row">
          {/* Dropdown to select sequence */}
          <div className="col-md-3 mb-3">
            <FormControl size="small" variant="outlined" fullWidth>
              <InputLabel id="sequence-label">Choose Sequence</InputLabel>
              <Select labelId="sequence-label" label="Choose Sequence" value="" name="sequence" onChange={handleSequenceChange}>
                <MenuItem value="Company Name">Company Name</MenuItem>
                <MenuItem value="Branch">Branch</MenuItem>
                <MenuItem value="Department">Department</MenuItem>
              </Select>
            </FormControl>
          </div>
          {selectedSequence.map((field) => (
            <div key={field} className="col-md-3 mb-3">
              <TextField
                label={field}
                variant="outlined"
                size="small"
                fullWidth
                name={field.toLowerCase().replace(' ', '')}
                value={formData[field.toLowerCase().replace(' ', '')]}
                onChange={handleInputChange}
                error={!!fieldErrors[field.toLowerCase().replace(' ', '')]}
                helperText={fieldErrors[field.toLowerCase().replace(' ', '')] || ''}
              />
            </div>
          ))}

          {/* Final Code - Visible only after button click */}
          {/* {isFinalCodeVisible && (
            <div className="col-md-3 mb-3">
              <TextField
                label="Final Code"
                variant="outlined"
                size="small"
                fullWidth
                name="finalCode"
                value={formData.finalCode}
                disabled
              />
            </div>
          )} */}
          {/* Final Code Display */}
          {isFinalCodeVisible && (
            <div
              className="final-code-container"
              style={{
                position: "fixed",
                top: "60%",
                left: "50%",
                width: "20%",
                transform: "translate(-50%, -50%)",
                padding: "20px",
                // backgroundColor: "#ffffff",
                background: 'linear-gradient(135deg, #8A2BE2, #4B0082)',
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                textAlign: "center",
                animation: "fadeIn 0.5s ease-in-out",
              }}
            >
              <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#000" }}>Generated Code</h2>
              <div style={{ fontSize: "20px", fontWeight: "500", color: "#fff", marginTop: "10px" }}>
                {formData.finalCode}
              </div>
              <button
                onClick={() => setIsFinalCodeVisible(false)}
                style={{
                  marginTop: "15px",
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCodeGeneration;
