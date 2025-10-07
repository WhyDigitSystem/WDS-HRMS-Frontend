import { useState } from 'react';
import SampleTable from 'utils/sample-table';

const RolesTab = () => {
  const initialData = [
    // Add more initial data as needed
  ];

  const countryVO = [
    { countryCode: 'USA', countryName: 'United States' },
    { countryCode: 'CAN', countryName: 'Canada' },
    { countryCode: 'IND', countryName: 'India' }
  ];

  //   const columns = [
  //     { accessorKey: 'sno', header: 'Serial Number' },
  //     { accessorKey: 'chequeno', header: 'Cheque No' },
  //     { accessorKey: 'status', header: 'Status' },
  //     { accessorKey: 'cancelled', header: 'Cancelled' }
  //   ];

  const roleData = [
    { roleCode: 1, role: 'Admin' },
    { roleCode: 2, role: 'User' }
    // Add more roles as needed
  ];

  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Employee' },
    { id: 4, name: 'Customer' }
  ];

  const [data, setData] = useState(initialData);

  const [roleDataValue, setRoleDataValue] = useState([]);

  const columns = [
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'startDate', header: 'Start Date' },
    { accessorKey: 'endDate', header: 'End Date' }
    // { accessorKey: 'active', header: 'Active' }
  ];

  const handleEditRow = async (updatedRow) => {
    // Simulate API call to update row
    setData((prevData) => prevData.map((row) => (row.id === updatedRow.id ? updatedRow : row)));
  };

  const handleDeleteRow = async (deletedRow) => {
    // Simulate API call to delete row
    setData((prevData) => prevData.filter((row) => row.id !== deletedRow.id));
  };

  const addCallback = (newData) => {
    console.log('New row added:', newData);
  };

  const handleDataChange = (updatedData) => {
    console.log('Updated table data:', updatedData);
    console.log('state', roleDataValue);
    // Do something with the updated data
  };

  return (
    <div>
      <SampleTable
        data={roleDataValue}
        columns={columns}
        addCallback={addCallback}
        dataCallback={handleDataChange}
        dataToSet={setRoleDataValue}
      />
    </div>
  );
};

export default RolesTab;
