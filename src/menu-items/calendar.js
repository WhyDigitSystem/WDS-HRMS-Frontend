// assets
import { IconCalendar } from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// Build calendar menu only if user has access
const calendarChildren = [
  hasScreenAccess('CL') && {
    id: 'calendarMaster',
    title: 'Calendar',
    type: 'item',
    url: '/calendar',
    icon: IconCalendar
  }
].filter(Boolean);

const calendar =
  calendarChildren.length > 0
    ? {
        id: 'calendar',
        type: 'group',
        children: calendarChildren
      }
    : null;

export default calendar;
