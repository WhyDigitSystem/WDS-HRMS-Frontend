import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReusableTabs from 'utils/tab-component';
import BranchAccessible from './branch-accessible';
import RolesTab from './roles';

const UserCreationTabs = () => {

    
  const tabContent = [
    {
      label: 'Roles',
      component: <RolesTab  />
    },
    {
      label: 'Branch Accessible',
      component: <BranchAccessible />
    }
  ];

  return (
    <div>
      <ReusableTabs tabs={tabContent}  />
      <ToastContainer />
    </div>
  );
};

export default UserCreationTabs;
