import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Avatar,
  Autocomplete,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useForm, Controller } from "react-hook-form";
import apiCalls from "apicall";

const ATS = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      candidateName: "",
      emailAddress: "",
      mobileNumber: "",
      positionApplied: "",
      resumeFile: null,
    },
  });

  const [jobPostings, setJobPostings] = useState([]);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchCode] = useState(localStorage.getItem("branchCode"));
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event, onChange) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        event.target.value = null; // reset file input
        setSelectedFile(null);
        onChange(null);
      } else {
        setSelectedFile(file);
        onChange(file);
      }
    }
  };

  const handleRemoveFile = (onChange) => {
    setSelectedFile(null);
    onChange(null);
    fileInputRef.current.value = null;
  };

  const onSubmit = (data) => {
    console.log(data);
    reset();
    setSelectedFile(null);
  };

  const getJobPostings = async () => {
    try {
      const response = await apiCalls(
        "get",
        `recruitmentmanagement/getJobPostingsByOrgId?branchCode=${branchCode}&orgId=${orgId}`
      );
      if (response.status === true) {
        const jobs = response.paramObjectsMap.jobPostingsVO || [];
        setJobPostings(jobs);
      } else {
        setJobPostings([]);
        console.error("API Error:", response);
      }
    } catch (error) {
      console.error("Error fetching job postings:", error);
      setJobPostings([]);
    }
  };

  useEffect(() => {
    getJobPostings();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb", py: 0, px: { xs: 2, sm: 4 } }}>
      <Typography variant="h3" fontWeight="bold" align="center" color="text.primary" mb={1}>
        ATS Resume Scoring System
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" mb={2}>
        Upload candidate resumes and get instant AI-powered scoring
      </Typography>

      <Grid container  spacing={2} sx={{ maxWidth: 1100, mx: "auto", pl: 0, pr: 2 }}>
        <Grid item xs={12} md={6}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                Upload Resume
              </Typography>

              <Controller
                name="candidateName"
                control={control}
                rules={{
                  required: "Candidate Name is required",
                  minLength: { value: 3, message: "Name must be at least 3 characters" },
                  pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters and spaces are allowed" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Candidate Name *"
                    size="small"
                    fullWidth
                    error={!!errors.candidateName}
                    helperText={errors.candidateName?.message}
                  />
                )}
              />

              <Controller
                name="emailAddress"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address *"
                    size="small"
                    fullWidth
                    error={!!errors.emailAddress}
                    helperText={errors.emailAddress?.message}
                  />
                )}
              />

              <Controller
                name="mobileNumber"
                control={control}
                rules={{
                  required: "Mobile Number is required",
                  pattern: { value: /^[0-9]{10}$/, message: "Invalid Mobile Number format" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mobile Number *"
                    size="small"
                    fullWidth
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber?.message}
                  />
                )}
              />

              <Controller
                name="positionApplied"
                control={control}
                rules={{ required: "Position Applied is required" }}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    options={jobPostings}
                    getOptionLabel={(option) => option.jobTitle || ""}
                    isOptionEqualToValue={(option, value) => option.jobTitle === value}
                    onChange={(event, newValue) => field.onChange(newValue?.jobTitle || "")}
                    value={jobPostings.find((job) => job.jobTitle === field.value) || null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Position Applied *"
                        placeholder="Select Job Title"
                        size="small"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />

             <Controller
       name="resumeFile"
  control={control}
  rules={{ required: "Resume File is required" }}
  render={({ field, fieldState: { error } }) => (
    <Box>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 50 * 1024 * 1024) {
              alert("File size must be less than 50MB");
              e.target.value = null;
              setSelectedFile("");
              field.onChange(null);
            } else {
              setSelectedFile(file.name);
              field.onChange(file);
            }
          }
        }}
      />

      {/* Upload box */}
      <Paper
        variant="outlined"
        sx={{
          borderStyle: "dashed",
          borderColor: error ? "red" : "grey.400",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 2,
          mt:2,
          bgcolor: "#fafafa",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "#e0f0ff",
            borderColor: "primary.main",
            transform: "scale(1.02)",
          },
        }}
        onClick={() => fileInputRef.current.click()}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <CloudUploadIcon sx={{ fontSize: 40, color: "grey.500" }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              {field.value ? field.value.name : "Click to upload or drag and drop"}
            </Typography>
            {field.value ? (
              <Typography variant="caption" color="text.secondary">
                {(field.value.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            ) : (
              <Typography variant="caption" color="text.disabled">
                PDF, DOC, DOCX (Max 50MB)
              </Typography>
            )}
          </Box>
        </Box>

        {/* Cancel/Remove Button */}
        {field.value && (
          <Button
            variant="text"
            color="error"
            onClick={(e) => {
              e.stopPropagation(); 
              setSelectedFile("");
              field.onChange(null);
            }}
          >
            Cancel
          </Button>
        )}
      </Paper>

      {/* Error message */}
      {error && (
        <Typography variant="caption" color="error">
          {error.message}
        </Typography>
      )}
    </Box>
  )}
/>


              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                sx={{ mt: 4.5, textTransform: "none", py: 1.5, borderRadius: 2 }}
              >
                Analyze Resume & Calculate Score
              </Button>
            </Paper>
          </form>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Typography variant="h4" fontWeight="bold" align="left" sx={{ width: "100%" }}>
              Score Preview
            </Typography>
            <Avatar sx={{ bgcolor: "#f3f6fa", color: "text.primary", width: 100, height: 100, fontSize: 28, alignItems: "center" }}>
              --
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Overall ATS Score
            </Typography>
            <Box width="100%" display="flex" flexDirection="column" gap={2}>
              {["Experience Match", "Skills Match", "Education", "Keywords Found"].map((label, index) => (
                <Box key={index}>
                  <Box display="flex" justifyContent="space-between" mb={1} bgcolor="grey.100" p={0.5} borderRadius={1}>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={0} sx={{ height: 10, borderRadius: 2, bgcolor: "#f0f0f0" }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ATS;
