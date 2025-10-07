// assets

import { IconPasswordUser } from '@tabler/icons-react';

// constant
const icons = {
  IconPasswordUser
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const RolesAndResponsibilities = {
  id: 'rolesAndResponsibilities',
  title: 'Roles Management',
  // caption: 'Company',
  type: 'group',
  children: [
    {
      id: 'rolesAndResponsibilities',
      title: 'Roles And Responsibilities',
      type: 'collapse',
      icon: icons.IconPasswordUser,

      children: [
        {
          id: 'rolesAndResponsibilities',
          title: 'Roles And Responsibilities',
          type: 'item',
          url: '/basicMaster/roles'
          // target: true
        },
        {
          id: 'screenNames',
          title: 'Screen Names',
          type: 'item',
          url: '/basicMaster/ScreenNames'
        }
      ]
    }
  ]
};

export default RolesAndResponsibilities;
