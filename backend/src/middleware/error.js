export const errorHandler = (err, req, res, next) => {
  console.error('❌ Xatolik:', err);
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Ma\'lumotlar noto\'g\'ri',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server xatoligi',
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Yo\'nalish topilmadi' });
};