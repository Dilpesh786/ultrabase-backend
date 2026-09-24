const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFileLocally = (fileBuffer, originalName) => {
    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + originalName;
        const filePath = path.join(uploadDir, filename);

        fs.writeFileSync(filePath, fileBuffer);
        return { success: true, filename: filename, path: filePath };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    saveFileLocally
};
