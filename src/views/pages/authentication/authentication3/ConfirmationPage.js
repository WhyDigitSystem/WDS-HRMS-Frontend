import { Card, Result, Modal, Input, Form } from 'antd';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import apiCalls from 'apicall';
import emailjs from '@emailjs/browser';
import dayjs from 'dayjs';

const API_URL = process.env.REACT_APP_API_URL;

const extractApiError = (error) =>
  error?.response?.data?.paramObjectsMap?.errorMessage ||
  error?.response?.data?.paramObjectsMap?.message ||
  error?.response?.data?.message ||
  'An unexpected error occurred. Please try again.';

const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action'); // 'APPROVED' or 'REJECTED'
  const actionId = searchParams.get('id');
  const employeeCode = searchParams.get('employeeCode');
  const employeeEmail = searchParams.get('email');
  const loginUserName = searchParams.get('actionBy');
  const notifyCode = searchParams.get('notifyCode');
  const notify = searchParams.get('notify');
  const orgId = searchParams.get('orgId');
  const screenName = searchParams.get('screenName');
  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');

  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [approveStatus, setApproveStatus] = useState('');

  // State for reason modal (only for REJECTED)
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState('');
  const [modalAction, setModalAction] = useState(null); // 'APPROVED' or 'REJECTED'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isApprove = action === 'APPROVED';

  useEffect(() => {
    // Only show reason modal for REJECTED action
    if (action === 'REJECTED') {
      setIsReasonModalOpen(true);
      setModalAction(action);
      setIsLoading(false);
    } else {
      // For APPROVED, directly process without reason
      getApprovalData(null);
    }
  }, []);

  const handleReasonConfirm = () => {
    if (!reasonText.trim()) {
      Modal.error({
        title: 'Error',
        content: 'Please provide a reason for rejection.'
      });
      return;
    }
    setIsReasonModalOpen(false);
    getApprovalData(reasonText);
  };

  const handleReasonCancel = () => {
    setIsReasonModalOpen(false);
    setErrorMessage('Rejection cancelled');
    setIsLoading(false);
  };

  const getApprovalData = async (reason = null) => {
    try {
      const screenName = searchParams.get('screenName');

      const [leaveResult, permissionResult, compoOffResult, checkOutResult, checkInOutResult, wfhResult] = await Promise.all([
        apiCalls(
          'get',
          `leaveprocess/getLeaveRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${notifyCode}&branchCode=${branchCode}`
        ),
        apiCalls(
          'get',
          `employeemaster/getPendingPermissionRequest?orgId=${orgId}&reportingPersonCode=${notifyCode}&branchCode=${branchCode}`
        ),
        apiCalls(
          'get',
          `leaveprocess/getCompoffRequestForDashBoard?orgId=${orgId}&reportingPersonCode=${notifyCode}&branchCode=${branchCode}`
        ),
        apiCalls('get', `basicmaster/getRequestCheckOutByOrgId?orgId=${orgId}&reportingPersoncode=${notifyCode}&branch=${branch}`),
        apiCalls('get', `basicmaster/getRequestCheckInOutByOrgId?orgId=${orgId}&reportingPersoncode=${notifyCode}&branch=${branch}`),
        apiCalls('get', `leaveprocess/getPendingWorkFromHomeForDashBoard?orgId=${orgId}&reportingPersonCode=${notifyCode}&branchCode=${branchCode}`),
      ]);

      // Always try to find the matched request in corresponding list
      const leaveRequests = Array.isArray(leaveResult?.paramObjectsMap?.leaveRequestVO)
        ? leaveResult.paramObjectsMap.leaveRequestVO
        : [leaveResult?.paramObjectsMap?.leaveRequestVO].filter(Boolean);

      const permissionRequests = Array.isArray(permissionResult?.paramObjectsMap?.permissionRequestVO)
        ? permissionResult.paramObjectsMap.permissionRequestVO
        : [permissionResult?.paramObjectsMap?.permissionRequestVO].filter(Boolean);

      const compoOffRequests = Array.isArray(compoOffResult?.paramObjectsMap?.compensatoryOffVO)
        ? compoOffResult.paramObjectsMap.compensatoryOffVO
        : [compoOffResult?.paramObjectsMap?.compensatoryOffVO].filter(Boolean);

      const checkOutRequests = (
        Array.isArray(checkOutResult?.paramObjectsMap?.checkInVO)
          ? checkOutResult.paramObjectsMap.checkInVO
          : [checkOutResult?.paramObjectsMap?.checkInVO].filter(Boolean)
      ).map((item) => ({
        ...item,
        employeeEmail: item.email || item.employeeEmail || ''
      }));

      const checkInOutRequests = (
        Array.isArray(checkInOutResult?.paramObjectsMap?.checkInOutAdjustmentVO)
          ? checkInOutResult.paramObjectsMap.checkInOutAdjustmentVO
          : [checkInOutResult?.paramObjectsMap?.checkInOutAdjustmentVO].filter(Boolean)
      ).map((item) => ({
        ...item,
        employeeEmail: item.email || item.employeeEmail || ''
      }));

      const wfhRequests = (
        Array.isArray(wfhResult?.paramObjectsMap?.workFromHomeVO)
          ? wfhResult.paramObjectsMap.workFromHomeVO
          : [wfhResult?.paramObjectsMap?.workFromHomeVO].filter(Boolean)
      ).map((item) => ({
        ...item,
        employeeEmail: item.email || item.employeeEmail || ''
      }));

      // Prioritize screenName logic
      switch (screenName) {
        case 'LEAVE REQUEST': {
          const leaveMatch = leaveRequests.find((req) => String(req.id) === String(actionId));
          await handleApprove(leaveMatch || { id: actionId }, reason);
          break;
        }
        case 'PERMISSION REQUEST': {
          const permissionMatch = permissionRequests.find((req) => String(req.permissionRequestId) === String(actionId));
          await handlePermissionApprove(permissionMatch || { id: actionId }, reason);
          break;
        }
        case 'COMPENSATORY OFF': {
          const compoOffMatch = compoOffRequests.find((req) => String(req.id) === String(actionId));
          await handleCompoOffApprove(compoOffMatch || { id: actionId }, reason);
          break;
        }
        case 'CHECKINOUT': {
          const checkOutMatch = checkOutRequests.find((req) => String(req.id) === String(actionId));
          await handleCheckOutApprove(checkOutMatch || { id: actionId }, reason);
          break;
        }
        case 'CHECKINOUTADJUSTMENT': {
          const checkInOutMatch = checkInOutRequests.find((req) => String(req.id) === String(actionId));
          await handleCheckInOutApprove(checkInOutMatch || { id: actionId }, reason);
          break;
        }
        case 'WORKFROMHOME': {
          const wfhMatch = wfhRequests.find((req) => String(req.id) === String(actionId));
          await handleWFHApprove(wfhMatch || { id: actionId }, reason);
          break;
        }
        default: {
          setErrorMessage('Invalid screen name type.');
          setIsSuccess(false);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching approval data:', error);
      setErrorMessage(extractApiError(error));
      setIsSuccess(false);
      setIsLoading(false);
    }
  };

  const handleApprove = async (matchedRequest = {}, reason = null) => {
    try {
      // Build URL with reason (only for rejection)
      let url = `${API_URL}/api/leaveprocess/createApprovalLeave?action=${action}&actionBy=${loginUserName}&employeeCode=${employeeCode}&id=${actionId}&orgId=${orgId}&notifyCode=${notifyCode}&notify=${notify}&screenName=${screenName}&email=${employeeEmail}`;

      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }

      const response = await axios.put(url);

      const isSuccess = response.data.status === true;
      const backendData = response?.data?.paramObjectsMap?.leaveRequestVO;
      const backendStatus = backendData?.approveStatus || '';

      setApproveStatus(backendStatus);

      if (!isSuccess) {
        setErrorMessage(response?.data?.paramObjectsMap?.errorMessage || 'Leave request could not be processed.');
        return;
      }

      const templateParams = {
        name: matchedRequest?.employeeName || backendData?.employeeName || 'Employee',
        from_name: notify,
        leave_type: matchedRequest?.leaveType || backendData?.leaveType || '',
        start_date: dayjs(matchedRequest?.startDate || backendData?.startDate).format('DD-MM-YYYY'),
        end_date: dayjs(matchedRequest?.endDate || backendData?.endDate).format('DD-MM-YYYY'),
        total_days: matchedRequest?.totalDays || backendData?.totalDays || '',
        status: backendStatus,
        status_message: backendStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        status_class: backendStatus === 'APPROVED' ? 'status-approved' : 'status-rejected',
        remarks: reason || matchedRequest?.remarks || backendData?.remarks || 'N/A',
        email: backendData?.email || ''
      };

      await emailjs.send('service_hff8dd7', 'template_0pmh0cu', templateParams, 'G6cKiPBXzCvlFaOuo');

      setIsSuccess(true);
      setErrorMessage(response?.data?.paramObjectsMap?.message || 'Leave action completed.');
    } catch (error) {
      console.error('Error approving request:', error);
      setErrorMessage(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionApprove = async (matchedRequest = {}, reason = null) => {
    try {
      let url = `${API_URL}/api/employeemaster/createApprovalPermissionRequest?action=${action}&actionBy=${loginUserName}&employeeCode=${employeeCode}&id=${actionId}&orgId=${orgId}&notifyCode=${notifyCode}&notify=${notify}&screenName=${screenName}`;

      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }

      const response = await axios.put(url);

      const isSuccess = response.data.status === true;
      const backendData = response?.data?.paramObjectsMap?.permissionRequestVO;
      const backendStatus = backendData?.approveStatus || '';

      setApproveStatus(backendStatus);

      if (!isSuccess) {
        setErrorMessage(response?.data?.paramObjectsMap?.errorMessage || 'Permission request could not be processed.');
        return;
      }

      const templateParams = {
        name: matchedRequest.employeeName || backendData?.employeeName || 'Employee',
        from_name: notify,
        start_date: dayjs(matchedRequest.date || backendData?.date).format('DD-MM-YYYY'),
        from_time: matchedRequest.fromTime,
        to_time: matchedRequest.toTime,
        total_hours: matchedRequest.totalHours,
        status: backendStatus,
        status_message: backendStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        status_class: backendStatus === 'APPROVED' ? 'status-approved' : 'status-rejected',
        remarks: reason || matchedRequest.remarks || backendData?.remarks || 'N/A',
        email: matchedRequest.employeeEmail || backendData?.employeeEmail || ''
      };

      await emailjs.send('service_9ucz1v3', 'template_om3wfui', templateParams, 'Opp4e1xb0JkW0bocB');

      setIsSuccess(true);
      setErrorMessage(response?.data?.paramObjectsMap?.message || 'Permission action completed.');
    } catch (error) {
      console.error('Error approving request:', error);
      setErrorMessage(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompoOffApprove = async (matchedRequest = {}, reason = null) => {
    try {
      let url = `${API_URL}/api/leaveprocess/createApprovalCompOff?action=${action}&actionBy=${loginUserName}&employeeCode=${employeeCode}&id=${actionId}&orgId=${orgId}&notifyCode=${notifyCode}&notify=${notify}&screenName=${screenName}`;

      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }

      const response = await axios.put(url);

      const isSuccess = response.data.status === true;
      const backendData = response?.data?.paramObjectsMap?.compensatoryOffVO;
      const backendStatus = backendData?.approvalStatus || '';

      setApproveStatus(backendStatus);

      if (!isSuccess) {
        setErrorMessage(response?.data?.paramObjectsMap?.errorMessage || 'Compo Off request could not be processed.');
        return;
      }

      const templateParams = {
        name: matchedRequest.employeeName || backendData?.employeeName || 'Employee',
        from_name: notify,
        date: dayjs(matchedRequest.compOffDate || backendData?.compOffDate).format('DD-MM-YYYY'),
        status: backendStatus,
        status_message: backendStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        status_class: backendStatus === 'APPROVED' ? 'status-approved' : 'status-rejected',
        remarks: reason || matchedRequest.reason || backendData?.reason || 'N/A',
        email: matchedRequest.employeeEmail || backendData?.employeeEmail || ''
      };

      await emailjs.send('service_y4jqb7q', 'template_qf406wl', templateParams, '4wxbCMaMoQh0TD6tx');

      setIsSuccess(true);
      setErrorMessage(response?.data?.paramObjectsMap?.message || 'Compo Off action completed.');
    } catch (error) {
      console.error('Error approving request:', error);
      setErrorMessage(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOutApprove = async (matchedRequest = {}, reason = null) => {
    try {
      let url = `${API_URL}/api/basicmaster/createApprovalCheckOut?action=${action}&actionBy=${loginUserName}&employeeCode=${employeeCode}&id=${actionId}&orgId=${orgId}&notifyCode=${notifyCode}&notify=${notify}&screenName=${screenName}&checkOutDate=${checkInDate}`;

      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }

      const response = await axios.put(url);

      const isSuccess = response.data.status === true;
      const backendData = response?.data?.paramObjectsMap?.checkInVO;
      const backendStatus = backendData?.approvalStatus || '';

      setApproveStatus(backendStatus);

      if (!isSuccess) {
        setErrorMessage(response?.data?.paramObjectsMap?.errorMessage || 'Check Out request could not be processed.');
        return;
      }

      const templateParams = {
        name: matchedRequest.employeeName || backendData?.empName || 'Employee',
        from_name: notify,
        checkInDate: dayjs(matchedRequest.checkInDate || backendData?.checkInDate).format('DD-MM-YYYY'),
        entryTime: matchedRequest.entryTime || backendData?.entryTime || '',
        status: backendStatus,
        status_message: backendStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        status_class: backendStatus === 'APPROVED' ? 'status-approved' : 'status-rejected',
        remarks: reason || '',
        email: matchedRequest.employeeEmail || backendData?.employeeEmail || backendData?.email || ''
      };

      await emailjs.send('service_d3c7xso', 'template_tf8a8po', templateParams, 'uMcVJdror6W86lK6z');

      setIsSuccess(true);
      setErrorMessage(response?.data?.paramObjectsMap?.message || 'Check Out action completed.');
    } catch (error) {
      console.error('Error approving request:', error);
      setErrorMessage(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInOutApprove = async (matchedRequest = {}, reason = null) => {
    try {
      let url = `${API_URL}/api/basicmaster/createApprovalCheckInOutAdjustment?action=${action}&actionBy=${notify}&employeeCode=${employeeCode}&id=${actionId}&orgId=${orgId}&notifyCode=${notifyCode}&notify=${notify}&screenName=${screenName}&checkOutDate=${checkOutDate}`;

      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }

      const response = await axios.put(url);

      const isSuccess = response.data.status === true;

      const backendDataList = response?.data?.paramObjectsMap?.checkInOutAdjustmentVO || [];
      const backendData = backendDataList[0] || {};

      const inEntry = backendDataList.find(item => item.status === 'IN');
      const outEntry = backendDataList.find(item => item.status === 'OUT');

      const backendStatus = backendData?.approvalStatus || '';
      setApproveStatus(backendStatus);

      if (!isSuccess) {
        setErrorMessage(response?.data?.paramObjectsMap?.errorMessage || 'Check In/Out request could not be processed.');
        return;
      }

      const templateParams = {
        name: matchedRequest.empName || backendData?.empName || 'Employee',
        from_name: notify,
        checkInDate: dayjs(matchedRequest.checkInDate || backendData?.checkInDate).format('DD-MM-YYYY'),
        entryTime: inEntry?.entryTime || '',
        exitTime: outEntry?.entryTime || '',
        status: backendStatus,
        status_message: backendStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        status_class: backendStatus === 'APPROVED' ? 'status-approved' : 'status-rejected',
        remarks: reason || '',
        email: matchedRequest.employeeEmail || backendData?.employeeEmail || backendData?.email || ''
      };

      if (!templateParams.email) {
        setErrorMessage("Recipient email not found. Email not sent.");
        return;
      }

      await emailjs.send('service_q42xewl', 'template_i87in0m', templateParams, 'yPqDOZm63k5U6JbRJ');

      setIsSuccess(true);
      setErrorMessage(response?.data?.paramObjectsMap?.message || 'Check In/Out action completed.');
    } catch (error) {
      console.error('Error approving request:', error);
      setErrorMessage(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWFHApprove = async (matchedRequest = {}, reason = null) => {
    try {
      let url = `${API_URL}/api/leaveprocess/createApprovalWorkFromHome?action=${action}&actionBy=${loginUserName}&employeeCode=${employeeCode}&id=${actionId}&orgId=${orgId}&notifyCode=${notifyCode}&notify=${notify}&screenName=${screenName}`;

      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }

      const response = await axios.put(url);

      const isSuccess = response.data.status === true;
      const backendData = response?.data?.paramObjectsMap?.workFromHomeVO || {};
      const backendStatus = backendData?.approveStatus || '';
      setApproveStatus(backendStatus);

      if (!isSuccess) {
        setErrorMessage(
          response?.data?.paramObjectsMap?.errorMessage || 'WFH request could not be processed.'
        );
        return;
      }

      const templateParams = {
        name: matchedRequest.employeeName || backendData?.employeeName || 'Employee',
        from_name: notify,
        date: dayjs(matchedRequest.wfhDate || backendData?.wfhDate).format('DD-MM-YYYY'),
        work_Accomplished: matchedRequest.workAccomplished || backendData?.workAccomplished || '',
        reason: matchedRequest.reason || backendData?.reason || '',
        status: backendStatus,
        status_message: backendStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        status_class: backendStatus === 'APPROVED' ? 'status-approved' : 'status-rejected',
        remarks: reason || '',
        email: matchedRequest.employeeEmail || backendData?.employeeEmail || backendData?.email || ''
      };

      await emailjs.send(
        'service_ywei7br',
        'template_cb2ljdh',
        templateParams,
        '-y3NVuC6et9lUpj0-'
      );

      setIsSuccess(true);
      setErrorMessage(response?.data?.paramObjectsMap?.message || 'WFH action completed.');
    } catch (error) {
      console.error('Error approving WFH request:', error);
      setErrorMessage(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const button = document.getElementById('celebrateBtn');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }
  };

  useEffect(() => {
    if (isSuccess && approveStatus === 'APPROVED') {
      handleCelebrate();
    }
  }, [isSuccess, approveStatus]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '95vh',
          background: 'linear-gradient(135deg, #7b2ff7 0%, #f107a3 100%)'
        }}
      >
        <div>Redirecting...</div>
      </div>
    );
  }

  // Custom styles for the reason modal (only for rejection)
  const reasonModalStyles = {
    content: {
      borderRadius: '12px',
      padding: '24px',
    },
    header: {
      borderBottom: '1px solid #f0f0f0',
      paddingBottom: '16px',
      marginBottom: '20px',
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ff4d4f',
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '95vh',
          background: '#ffffff'
        }}
      >
        <Card
          style={{
            maxWidth: 420,
            textAlign: 'center',
            borderRadius: '15px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
            maxHeight: 550
          }}
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} />

          {isSuccess ? (
            <Result
              status={approveStatus === 'REJECTED' ? 'error' : 'success'}
              title={
                <motion.h4
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  style={{ color: approveStatus === 'REJECTED' ? 'red' : 'green' }}
                >
                  {errorMessage ||
                    (approveStatus === 'REJECTED' ? 'Request has been rejected.' : 'Request approved successfully.')}
                </motion.h4>
              }
              subTitle={
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
                  {approveStatus === 'REJECTED' ? 'You have rejected the request.' : 'You have approved the request.'}
                </motion.p>
              }
            />
          ) : (
            <Result
              status="error"
              title={
                <motion.h4
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  style={{ color: 'red' }}
                >
                  {errorMessage}
                </motion.h4>
              }
            />
          )}
        </Card>
      </div>

      {/* Styled Reason Modal - Only for Rejection */}
      <Modal
        title={
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px',
              color: '#ff4d4f'
            }}>
              ✗
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              Reject Request
            </div>
          </div>
        }
        open={isReasonModalOpen}
        onOk={handleReasonConfirm}
        onCancel={handleReasonCancel}
        okText="Confirm Rejection"
        cancelText="Cancel"
        confirmLoading={isSubmitting}
        width={480}
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px' }}
        okButtonProps={{
          style: {
            backgroundColor: '#ff4d4f',
            borderColor: '#ff4d4f',
          }
        }}
      >
        <Form layout="vertical">
          <Form.Item
            label={
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                Rejection Reason
              </span>
            }
            name="reason"
            rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="Please enter the reason for rejecting this request..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              style={{
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ff4d4f';
                e.target.style.boxShadow = '0 0 0 2px rgba(255, 77, 79, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d9d9d9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </Form.Item>

          {/* Info message */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fff2f0',
            borderRadius: '8px',
            borderLeft: '4px solid #ff4d4f',
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>ℹ️</span>
              <span>
                Please specify the reason for rejection. This will be shared with the employee.
              </span>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ConfirmationPage;