import multer from 'multer';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Not found.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Your CV is larger than 5 MB. Please upload a smaller PDF.'
        : 'The upload could not be processed. Please attach a single PDF file.';
    return res.status(400).json({ success: false, message, errors: { cv: message } });
  }
  if (err.code === 'INVALID_FILE_TYPE') {
    return res
      .status(400)
      .json({ success: false, message: err.message, errors: { cv: err.message } });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'The request is too large.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'The request could not be read.' });
  }
  if (err.message === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({ success: false, message: 'This origin is not allowed.' });
  }

  console.error('[server] unexpected error:', err.name, err.code || '');
  return res
    .status(500)
    .json({ success: false, message: 'Something went wrong on our side. Please try again later.' });
}
