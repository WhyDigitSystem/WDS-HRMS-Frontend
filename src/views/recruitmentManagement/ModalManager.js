// components/ReusableModal.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Grid
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ReusableModal = ({
    open,
    onClose,
    title,
    fields = [],
    initialData = {},
    onSubmit,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    config = {},
    mode = 'form' // 'form' or 'view'
}) => {
    const [formData, setFormData] = React.useState(initialData);
    const [errors, setErrors] = React.useState({});

    React.useEffect(() => {
        if (open) {
            setFormData(initialData);
            setErrors({});
        }
    }, [open]);

    const handleInputChange = (fieldName) => (event) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: event.target.value
        }));
        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        fields.forEach(field => {
            if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
                newErrors[field.name] = `${field.label} is required`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
            onClose();
        }
    };

    const handleClose = () => {
        setFormData(initialData);
        setErrors({});
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    width: '400px', // Reduced modal width
                    margin: 'auto'
                }
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    p: 2,
                    pb: 1.5,
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: config.text_color || '#1e293b',
                            fontSize: '1.1rem' // Smaller title
                        }}
                    >
                        {title}
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            color: config.secondary_action_color || '#64748b',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ p: 0 }}>
                <Box
                    component="form"
                    id="reusable-modal-form"
                    onSubmit={handleSubmit}
                    sx={{ p: 2 }} // Reduced padding
                >
                    <Grid container spacing={2}> {/* Reduced spacing */}
                        {fields.map((field) => (
                            <Grid item xs={12} key={field.name}>
                                {mode === 'view' ? (
                                    <Box sx={{ mb: 1 }}> {/* Reduced margin */}
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                mb: 0.25, // Reduced margin
                                                color: '#64748b',
                                                fontSize: '0.8rem', // Smaller font
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            {field.label}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#1e293b',
                                                fontSize: '0.9rem', // Smaller font
                                                minHeight: '20px' // Reduced height
                                            }}
                                        >
                                            {formData[field.name] || 'N/A'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label={field.label}
                                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                        value={formData[field.name] || ''}
                                        onChange={handleInputChange(field.name)}
                                        error={!!errors[field.name]}
                                        helperText={errors[field.name]}
                                        type={field.type || 'text'}
                                        multiline={field.multiline}
                                        rows={field.rows || 3} // Default reduced rows for multiline
                                        required={field.required}
                                        disabled={field.disabled}
                                        select={field.type === 'select'}
                                        SelectProps={field.type === 'select' ? {
                                            native: true,
                                        } : {}}
                                        InputLabelProps={{
                                            shrink: field.type === 'date' || field.type === 'datetime-local' ? true : undefined,
                                        }}
                                        size="small" // Using small size for smaller inputs
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1, // Smaller border radius
                                                backgroundColor: '#ffffff',
                                                fontSize: '0.875rem', // Smaller font size
                                                '&:hover fieldset': {
                                                    borderColor: config.primary_action_color || '#3b82f6',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: config.primary_action_color || '#3b82f6',
                                                    borderWidth: 1, // Thinner border
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontWeight: 500,
                                                fontSize: '0.875rem', // Smaller label
                                            },
                                            '& .MuiInputBase-input': {
                                                padding: '8px 12px', // Reduced padding
                                                fontSize: '0.875rem', // Smaller input text
                                                height: field.multiline ? 'auto' : '20px', // Reduced height
                                            },
                                            '& .MuiInputBase-multiline': {
                                                padding: '8px 12px', // Reduced padding for textarea
                                            },
                                            '& .MuiFormHelperText-root': {
                                                fontSize: '0.75rem', // Smaller helper text
                                                marginTop: '4px', // Reduced margin
                                            }
                                        }}
                                    >
                                        {field.options && field.options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </TextField>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </DialogContent>

            {/* Actions */}
            {mode === 'form' && (
                <DialogActions
                    sx={{
                        p: 2, // Reduced padding
                        pt: 1.5,
                        borderTop: '1px solid #e0e0e0',
                        gap: 1 // Reduced gap
                    }}
                >
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        size="small" // Smaller button
                        sx={{
                            borderRadius: 1, // Smaller border radius
                            px: 2, // Reduced horizontal padding
                            py: 0.75, // Reduced vertical padding
                            borderColor: config.secondary_action_color || '#64748b',
                            color: config.secondary_action_color || '#64748b',
                            fontWeight: 600,
                            fontSize: '0.875rem', // Smaller font
                            minWidth: '70px', // Reduced minimum width
                            '&:hover': {
                                borderColor: config.secondary_action_color || '#64748b',
                                backgroundColor: 'rgba(100, 116, 139, 0.04)',
                            }
                        }}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="submit"
                        form="reusable-modal-form"
                        variant="contained"
                        size="small" // Smaller button
                        sx={{
                            borderRadius: 1, // Smaller border radius
                            px: 2, // Reduced horizontal padding
                            py: 0.75, // Reduced vertical padding
                            background: `linear-gradient(135deg, ${config.primary_action_color || '#3b82f6'} 0%, #2563eb 100%)`,
                            fontWeight: 600,
                            fontSize: '0.875rem', // Smaller font
                            minWidth: '70px', // Reduced minimum width
                            boxShadow: '0 1px 4px rgba(59, 130, 246, 0.3)',
                            '&:hover': {
                                background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`,
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                            }
                        }}
                    >
                        {submitLabel}
                    </Button>
                </DialogActions>
            )}

            {mode === 'view' && (
                <DialogActions
                    sx={{
                        p: 2, // Reduced padding
                        pt: 1.5,
                        borderTop: '1px solid #e0e0e0',
                    }}
                >
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        size="small" // Smaller button
                        sx={{
                            borderRadius: 1, // Smaller border radius
                            px: 2, // Reduced horizontal padding
                            py: 0.75, // Reduced vertical padding
                            background: `linear-gradient(135deg, ${config.primary_action_color || '#3b82f6'} 0%, #2563eb 100%)`,
                            fontWeight: 600,
                            fontSize: '0.875rem', // Smaller font
                            minWidth: '70px', // Reduced minimum width
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default ReusableModal;