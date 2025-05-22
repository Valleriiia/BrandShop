const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.get('/', departmentController.getAllDepartments);
router.get('/slug/:slug', departmentController.getDepartmentBySlug);
router.get('/:id', departmentController.getDepartmentById);


module.exports = router;
