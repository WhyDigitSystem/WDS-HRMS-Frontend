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
    Grid,
    Autocomplete
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
    }, [open, initialData]);

    const handleInputChange = (fieldName) => (event, value) => {
        // For Autocomplete, value is the selected option object
        // For regular inputs, event.target.value is used
        const newValue = value ? value.value : event.target.value;
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: newValue
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

    // Helper function to get the current value for Autocomplete
    const getAutocompleteValue = (field) => {
        const currentValue = formData[field.name];
        if (!currentValue) return null;
        
        // Find the option that matches the current value
        return field.options?.find(option => option.value === currentValue) || null;
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
                    width: '400px',
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
                            fontSize: '1.1rem'
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
                    sx={{ p: 2 }}
                >
                    <Grid container spacing={2}>
                        {fields.map((field) => (
                            <Grid item xs={12} key={field.name}>
                                {mode === 'view' ? (
                                    <Box sx={{ mb: 1 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                mb: 0.25,
                                                color: '#64748b',
                                                fontSize: '0.8rem',
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
                                                fontSize: '0.9rem',
                                                minHeight: '20px'
                                            }}
                                        >
                                            {formData[field.name] || 'N/A'}
                                        </Typography>
                                    </Box>
                                ) : field.type === 'autocomplete' ? (
                                    <Autocomplete
                                        options={field.options || []}
                                        getOptionLabel={(option) => option.label || ''}
                                        value={getAutocompleteValue(field)}
                                        onChange={handleInputChange(field.name)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={field.label}
                                                placeholder={field.placeholder}
                                                error={!!errors[field.name]}
                                                helperText={errors[field.name]}
                                                required={field.required}
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 1,
                                                        backgroundColor: '#ffffff',
                                                        fontSize: '0.875rem',
                                                        '&:hover fieldset': {
                                                            borderColor: config.primary_action_color || '#3b82f6',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: config.primary_action_color || '#3b82f6',
                                                            borderWidth: 1,
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontWeight: 500,
                                                        fontSize: '0.875rem',
                                                    },
                                                    '& .MuiFormHelperText-root': {
                                                        fontSize: '0.75rem',
                                                        marginTop: '4px',
                                                    }
                                                }}
                                            />
                                        )}
                                        sx={{
                                            '& .MuiAutocomplete-inputRoot': {
                                                padding: '2px 8px !important',
                                            }
                                        }}
                                    />
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
                                        rows={field.rows || 3}
                                        required={field.required}
                                        disabled={field.disabled}
                                        select={field.type === 'select'}
                                        SelectProps={field.type === 'select' ? {
                                            native: true,
                                        } : {}}
                                        InputLabelProps={{
                                            shrink: field.type === 'date' || field.type === 'datetime-local' ? true : undefined,
                                        }}
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1,
                                                backgroundColor: '#ffffff',
                                                fontSize: '0.875rem',
                                                '&:hover fieldset': {
                                                    borderColor: config.primary_action_color || '#3b82f6',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: config.primary_action_color || '#3b82f6',
                                                    borderWidth: 1,
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontWeight: 500,
                                                fontSize: '0.875rem',
                                            },
                                            '& .MuiInputBase-input': {
                                                padding: '8px 12px',
                                                fontSize: '0.875rem',
                                                height: field.multiline ? 'auto' : '20px',
                                            },
                                            '& .MuiInputBase-multiline': {
                                                padding: '8px 12px',
                                            },
                                            '& .MuiFormHelperText-root': {
                                                fontSize: '0.75rem',
                                                marginTop: '4px',
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
                        p: 2,
                        pt: 1.5,
                        borderTop: '1px solid #e0e0e0',
                        gap: 1
                    }}
                >
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        size="small"
                        sx={{
                            borderRadius: 1,
                            px: 2,
                            py: 0.75,
                            borderColor: config.secondary_action_color || '#64748b',
                            color: config.secondary_action_color || '#64748b',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            minWidth: '70px',
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
                        size="small"
                        sx={{
                            borderRadius: 1,
                            px: 2,
                            py: 0.75,
                            background: `linear-gradient(135deg, ${config.primary_action_color || '#3b82f6'} 0%, #2563eb 100%)`,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            minWidth: '70px',
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
                        p: 2,
                        pt: 1.5,
                        borderTop: '1px solid #e0e0e0',
                    }}
                >
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        size="small"
                        sx={{
                            borderRadius: 1,
                            px: 2,
                            py: 0.75,
                            background: `linear-gradient(135deg, ${config.primary_action_color || '#3b82f6'} 0%, #2563eb 100%)`,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            minWidth: '70px',
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