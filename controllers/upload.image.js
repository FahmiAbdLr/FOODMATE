const multer = require('multer');
const path = require('path');

/** storage configuration */
const storage = multer.diskStorage({
    /** define storage folder */
    destination: (req, file, cb) => {
        cb(null, './images');
    },

    /** define filename for upload file */
    filename: (req, file, cb) => {
        cb(null, `cover-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    /** storage configuration */
    storage: storage,

    /** filter uploaded file */
    fileFilter: (req, file, cb) => {
        /** filter type of file */
        const acceptedTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        if (!acceptedTypes.includes(file.mimetype)) {
            return cb(new Error(`Invalid file type (${file.mimetype})`), false); /** refuse upload */
        }

        cb(null, true); /** accept upload */
    },

    /** handle file size limit */
    limits: { fileSize: 10 * 1024 * 1024 } /** max: 10MB */
});

module.exports = upload;