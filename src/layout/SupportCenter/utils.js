import { Chip } from '@mui/material';
import { IconCheck, IconClock, IconUser } from '@tabler/icons-react';

export const getStatusChip = (status) => {
  switch (status) {
    case 'Open':
      return <Chip label="Open" icon={<IconClock size={18} />} color="warning" variant="outlined" />;
    case 'Closed':
      return <Chip label="Closed" icon={<IconCheck size={18} />} color="success" variant="outlined" />;
    case 'In Progress':
      return <Chip label="In Progress" icon={<IconUser size={18} />} color="info" variant="outlined" />;
    default:
      return <Chip label="Unknown" variant="outlined" />;
  }
};
