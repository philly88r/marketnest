// Google AI API authentication handler
const { exec } = require('child_process');
const express = require('express');
const router = express.Router();

/**
 * Get Google Cloud access token for AI API calls
 * This endpoint uses gcloud CLI to generate an access token
 */
router.get('/get-google-access-token', async (req, res) => {
  try {
    // Execute gcloud command to get access token
    exec('gcloud auth print-access-token', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error getting Google access token: ${error.message}`);
        return res.status(500).json({ error: 'Failed to get access token' });
      }
      
      if (stderr) {
        console.error(`gcloud stderr: ${stderr}`);
        return res.status(500).json({ error: 'Error in gcloud command' });
      }
      
      // Return the access token
      const accessToken = stdout.trim();
      return res.json({ accessToken });
    });
  } catch (error) {
    console.error('Error in Google auth handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
