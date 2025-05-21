const express = require('express');
const router = express.Router();
const BookInstanceService = require('../services/bookInstance.service');
const authenticateToken = require('../middleware/auth.middleware');

// Apply auth middleware
router.use(authenticateToken);

// Get all instances for a terminal
router.get('/terminal/:terminalId', async (req, res) => {
  try {
    const terminalId = parseInt(req.params.terminalId);
    
    if (isNaN(terminalId)) {
      return res.status(400).json({ message: 'Invalid terminal ID' });
    }
    
    const instances = await BookInstanceService.getAllBookInstances(terminalId);
    return res.json(instances);
  } catch (error) {
    console.error('Error fetching book instances by terminal:', error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;