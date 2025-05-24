const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/photos/ipze/product1
router.get('/:folder/:subfolder', (req, res) => {
  const { folder, subfolder } = req.params;
  const directory = path.join(__dirname, '../../frontend/assets/img/', folder, subfolder);

  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('❌ Помилка при читанні папки:', err);
      return res.status(500).json({ error: 'Не вдалося прочитати папку' });
    }

    const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));
    res.json(imageFiles);
  });
});


module.exports = router;
