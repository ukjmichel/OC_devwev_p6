const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Directory to save images
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure Multer to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image');

// MIME type check (to allow only images)
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const imageProcessor = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      const error = new Error('Failed to upload image.');
      error.statusCode = 500;
      return next(error); // Pass the error to the next middleware (error handler)
    }

    try {
      // If no image is uploaded, skip the image processing
      if (!req.file) {
        return next(); // Proceed to the next middleware
      }

      // Check if the uploaded file is an allowed image type
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        const error = new Error('Invalid file type. Only images are allowed.');
        error.statusCode = 400;
        return next(error); // Pass the error to the next middleware (error handler)
      }

      // Process the image with Sharp
      const processedImage = await sharp(req.file.buffer)
        .resize({ width: 300 }) // Resize the image to 800px width
        .toFormat('jpeg') // Convert to JPEG format
        .jpeg({ quality: 90 }) // Set JPEG quality to 90%
        .toBuffer();

      // Generate a unique filename
      const filename = `processed_${Date.now()}.jpeg`;
      const filepath = path.join(uploadPath, filename);

      // Save the processed image to disk
      fs.writeFileSync(filepath, processedImage);

      // Attach the processed image info to the request object
      req.processedImage = {
        filename: filename,
        filepath: filepath,
      };

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      const processingError = new Error('Failed to process image.');
      processingError.statusCode = 500;
      next(processingError); // Pass the error to the next middleware (error handler)
    }
  });
};

module.exports = imageProcessor;
