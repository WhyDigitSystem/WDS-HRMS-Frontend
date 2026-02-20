import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';

// project imports
import { MENU_OPEN } from 'store/actions';
// import LogoImage from '../../../../src/assets/images/HRMS_Logo.png';
import LogoImage from '../../../../src/assets/images/BIN_BEE.png';
import {useNavigate} from 'react-router-dom';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => {
  const defaultId = useSelector((state) => state.customization.defaultId);
  const dispatch = useDispatch();
  // 
  const navigate = useNavigate();
  return (
    // <ButtonBase disableRipple onClick={() => dispatch({ type: MENU_OPEN, id: defaultId })} component={Link} className="ps-lg-3 ps-0">
    //   {/* <Logo /> */}
    //   <img
    //     src={LogoImage}
    //     alt="logo"
    //     style={{
    //       width: '110px',
    //       // height: '75px'
    //       height: '50px'

    //     }}
    //   />
    // </ButtonBase>
      <ButtonBase onClick={()=>navigate('/dashboard/default')}>
      {/* <Logo /> */}
      <img
        src={LogoImage}
        alt="logo"
        style={{
          width: '110px',
          // height: '75px'
          height: '50px'

        }}
      />
    </ButtonBase>
  );
};

export default LogoSection;
