// ==============================|| ASSETS ||============================== //
import {
  IconDatabaseStar,
  IconFileDollar,
  IconCalendarTime,
  IconFileText
} from '@tabler/icons-react';

// ==============================|| ICON COLLECTION ||============================== //
const icons = {
  IconFileDollar,
  IconCalendarTime,
  IconFileText
};

const icons0 = {
  IconDatabaseStar
};

// ==============================|| PERMISSION CHECK FUNCTION ||============================== //
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// ==============================|| CHILDREN ITEMS WITH PERMISSIONS ||============================== //
const manageTaxChildren = [
  hasScreenAccess('MT') && {
    id: 'manageTaxPage',
    title: 'Manage Tax',
    type: 'item',
    url: '/ManageTax/manageTax',
    icon: icons.IconFileDollar
  },

  hasScreenAccess('DD') && {
    id: 'DeclarationDate',
    title: 'Declaration Date',
    type: 'item',
    url: '/ManageTax/DeclarationDate',
    icon: icons.IconCalendarTime
  },

  hasScreenAccess('DI') && {
    id: 'DeclarationInput',
    title: 'Declaration Input',
    type: 'item',
    url: '/ManageTax/DeclarationInput',
    icon: icons.IconFileText
  }
].filter(Boolean);

// ==============================|| FINAL MENU EXPORT ||============================== //
const manageTax =
  manageTaxChildren.length > 0
    ? {
        id: 'manageTax',
        type: 'group',
        children: [
          {
            id: 'manageTaxCollapse',
            title: 'Manage Tax',
            type: 'collapse',
            icon: icons0.IconDatabaseStar,
            children: manageTaxChildren
          }
        ]
      }
    : null;

export default manageTax;
