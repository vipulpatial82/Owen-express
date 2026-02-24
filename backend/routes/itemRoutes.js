const express = require('express');
const { getItems, createItem, deleteItem, updateItem } = require('../controllers/itemController');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', getItems);
router.post('/', upload.single('image'), createItem);
router.put('/:id', upload.single('image'), updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
