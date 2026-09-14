const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (id && !Number.isInteger(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

module.exports = validateId;
