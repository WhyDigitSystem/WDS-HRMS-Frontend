import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Modal } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; // Icon for Praise
import { useEffect } from 'react';
import apiCalls from 'apicall';

function Praise() {
  const [isCreatePraiseModalOpen, setIsCreatePraiseModalOpen] = useState(false); // Modal state
  const [praises, setPraises] = useState([]); // List of praises
  const [newPraiseText, setNewPraiseText] = useState(''); // New praise text
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [circularid, setCircularid] = useState(localStorage.getItem('circularid'))
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    GetCountOfPraiseByOrgIdAndCircularId();
  }, [circularid, orgId]);

  const GetCountOfPraiseByOrgIdAndCircularId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/GetCountOfPraiseByOrgIdAndCircularId?circularid=${circularid}&orgId=${orgId}`);
      if (result?.paramObjectsMap?.praiseVO) {
        const praiseList = result.paramObjectsMap.praiseVO.reverse();
        setPraises(praiseList);
        setListViewData(praiseList);
      } else {
        setPraises([]);
        setListViewData([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setPraises([]);
    }
  };

  // Handle creating a new praise
  const handleCreatePraise = () => {
    if (newPraiseText.trim()) {
      const newPraise = {
        text: newPraiseText,
        likes: 0, // Track likes for each praise
      };
      setPraises([...praises, newPraise]);
      setIsCreatePraiseModalOpen(false);
      setNewPraiseText('');
    }
  };

  // Handle liking a praise
  const handleLikePraise = async (index, praiseId) => {
    try {
      await apiCalls('post', `/basicmaster/LikePraise`, { praiseId });
      setPraises((prev) =>
        prev.map((praise, i) => (i === index ? { ...praise, likes: praise.likes + 1 } : praise))
      );
    } catch (err) {
      console.error('Error liking praise:', err);
    }
  };


  return (
    <div>
      <Box sx={{ mt: 2 }}>
        {/* Create Praise Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsCreatePraiseModalOpen(true)}
          >
            Create Praise
          </Button>
        </Box>

        {/* Display Praises */}
        {praises.length > 0 && (
          <Box sx={{ mt: 4 }}>
            {praises.map((praise, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Praise #{index + 1}
                </Typography>
                <Typography>{praise.text}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ThumbUpIcon />}
                    onClick={() => handleLikePraise(index)}
                  >
                    Like ({praise.likes})
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Create Praise Modal */}
      <Modal open={isCreatePraiseModalOpen} onClose={() => setIsCreatePraiseModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '12px',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create a New Praise
          </Typography>
          <TextField
            fullWidth
            label="Praise Text"
            variant="outlined"
            multiline
            rows={4}
            value={newPraiseText}
            onChange={(e) => setNewPraiseText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => setIsCreatePraiseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleCreatePraise}>
              Create Praise
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Praise;