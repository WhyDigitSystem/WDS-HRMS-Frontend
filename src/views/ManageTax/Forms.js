import React from 'react';
import {
  Box,
  Grid,
  Typography,
  MenuItem,
  Button,
  Card,
  CardContent,
  Stack,
  Select,
  Chip,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';

const Forms = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDownload = (formType) => {
    console.log(`Initiating download for ${formType}`);
  };

  return (
    <Box p={{ xs: 2, sm: 4 }} bgcolor="#f4f6f8" minHeight="100vh">
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Tax Documentation
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={4}>
        Access your downloadable tax forms for past and current financial years.
      </Typography>

      <Grid container spacing={4}>
        {/* Form 16 Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, background: "#fff" }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DescriptionOutlinedIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Form 16
                  </Typography>
                  <Chip label="Pending" size="small" color="warning" />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Summarizes your salary, deductions, and tax paid for the financial year. Required for ITR filing.
                </Typography>

                <Divider />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Select size="small" fullWidth defaultValue="2024-2025">
                    <MenuItem value="2024-2025">APR 2024 - MAR 2025</MenuItem>
                    <MenuItem value="2023-2024">APR 2023 - MAR 2024</MenuItem>
                  </Select>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    endIcon={<CloudDownloadOutlinedIcon />}
                    disabled
                    onClick={() => handleDownload("Form 16")}
                  >
                    Download
                  </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary" mt={1}>
                  Admin has not released Form 16 for the selected year yet.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Form 12BB Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, background: "#fff" }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DescriptionOutlinedIcon color="success" />
                  <Typography variant="h6" fontWeight={600}>
                    Form 12BB
                  </Typography>
                  <Chip label="Available" size="small" color="success" />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Contains your declared tax-saving investments & expenses. Submit before due date.
                </Typography>

                <Divider />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Select size="small" fullWidth defaultValue="2025-2026">
                    <MenuItem value="2025-2026">APR 2025 - MAR 2026</MenuItem>
                    <MenuItem value="2024-2025">APR 2024 - MAR 2025</MenuItem>
                  </Select>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    endIcon={<CloudDownloadOutlinedIcon />}
                    onClick={() => handleDownload("Form 12BB")}
                  >
                    Download
                  </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary" mt={1}>
                  Last updated: May 10, 2025 | Submitted to HR.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Forms;
