const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const ASSETS_PATH = path.join(__dirname, 'assets');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { category_id, product_id } = req.body;
        const dir = path.join(ASSETS_PATH, String(category_id || '1'), String(product_id || 'temp'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || '.png';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}_${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.any(), (req, res) => {
    try {
        const files = req.files || [];
        const uploadedFiles = {};

        files.forEach(file => {
            if (!uploadedFiles[file.fieldname]) {
                uploadedFiles[file.fieldname] = [];
            }
            uploadedFiles[file.fieldname].push(file.filename);
        });

        res.status(200).json({
            success: true,
            message: "Upload thành công!",
            files: uploadedFiles
        });
    } catch (error) {
        console.error("Lỗi upload file:", error);
        res.status(500).json({ success: false, message: "Lỗi upload file!", error: error.message });
    }
});

router.get("/view/:category/:fileName", (req, res) => {
    const { category, fileName } = req.params;
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${category}/${fileName}`;
    res.json({ url: imageUrl });
});

router.post('/delete-files', (req, res) => {
    try {
        const { category_id, product_id, filenames } = req.body;
        if (!category_id || !product_id || !filenames || !Array.isArray(filenames)) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin danh mục, sản phẩm hoặc danh sách tệp tin!" });
        }

        const dir = path.join(ASSETS_PATH, String(category_id), String(product_id));
        const deleted = [];
        const errors = [];

        filenames.forEach(filename => {
            if (!filename) return;
            const filePath = path.join(dir, filename);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    deleted.push(filename);
                } catch (e) {
                    errors.push({ filename, error: e.message });
                }
            }
        });

        console.log(`[Fileserver] Đã xóa vật lý các tệp:`, deleted);
        if (errors.length > 0) {
            console.error(`[Fileserver] Lỗi khi xóa một số tệp:`, errors);
        }

        res.json({ success: true, deleted, errors });
    } catch (error) {
        console.error("Lỗi xóa file vật lý:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi xóa file vật lý", error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        console.log("File server đã sẵn sàng ở cổng 8081!");
        res.send("File server đã sẵn sàng ở cổng 8081!");
    } catch (err) {
        res.status(500).send("Lỗi File server");
    }
});

module.exports = router;