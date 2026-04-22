/**
 * ROUTES: Teacher Routes
 * Endpoints para dashboard do professor (facilitador)
 */
import express from 'express';
import TeacherController from '../controllers/TeacherController.js';

const router = express.Router();

/**
 * GET /api/teachers/dashboard
 * Dashboard principal do professor
 */
router.get('/dashboard', TeacherController.getDashboard);

/**
 * GET /api/teachers/student/:studentId
 * Perfil detalhado de um aluno
 */
router.get('/student/:studentId', TeacherController.getStudentProfile);

/**
 * GET /api/teachers/class-report
 * Relatório de classe
 */
router.get('/class-report', TeacherController.getClassReport);

/**
 * GET /api/teachers/export
 * Exportar relatório em CSV
 */
router.get('/export', TeacherController.exportClassReportCSV);

export default router;
