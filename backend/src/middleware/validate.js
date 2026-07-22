function validate(requiredFields) {
  return (req, res, next) => {
    for (const field of requiredFields) {
      const value = req.body[field];
      if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    next();
  };
}

module.exports = validate;
