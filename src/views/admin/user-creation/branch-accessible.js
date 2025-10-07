import { useState } from 'react';
import SampleTable from 'utils/sample-table';

const BranchAccessible = () => {
  const initialData = [
    { id: 1, branch: 'Chennai', active: true },
    { id: 2, branch: 'Delhi', active: false }
    // Add more initial data as needed
  ];

  const countryVO = ['USA', 'Canada', 'India']; // Example country data
  const roleData = [
    { id: 1, role: 'Admin' },
    { id: 2, role: 'User' }
    // Add more roles as needed
  ];

  const [data, setData] = useState(initialData);
  const [branchDataValue, setBranchDataValue] = useState([]);

  const addCallback = (newData) => {
    console.log('New row added:', newData);
  };

  const handleDataChange = (updatedData) => {
    console.log('Updated table data:', updatedData);
    // Do something with the updated data
  };

  const columns = [{ accessorKey: 'branch', header: 'Branch' }];

  const handleAddRow = async (newRow) => {
    // Simulate API call to add row
    const addedRow = { id: data.length + 1, ...newRow };
    setData((prevData) => [...prevData, addedRow]);
  };

  const handleEditRow = async (updatedRow) => {
    // Simulate API call to update row
    setData((prevData) => prevData.map((row) => (row.id === updatedRow.id ? updatedRow : row)));
  };

  const handleDeleteRow = async (deletedRow) => {
    // Simulate API call to delete row
    setData((prevData) => prevData.filter((row) => row.id !== deletedRow.id));
  };

  return (
    <div>
      <SampleTable data={data} columns={columns} addCallback={addCallback} dataCallback={handleDataChange} dataToSet={setBranchDataValue} />
    </div>
  );
};

export default BranchAccessible;
