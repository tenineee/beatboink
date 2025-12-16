import { Router } from 'express';
import * as trackController from '../controllers/trackController';
import { authorization } from '../middleware/authorization';
import { uploadTrackWithCover } from '../middleware/uploadMiddleware';

const router = Router();

router.post(
    '/upload',
    authorization,
    uploadTrackWithCover,
    trackController.uploadTrack
);

router.get('/', trackController.getTracks);

router.get('/:id', trackController.getTrackById);

router.get('/:id/stream', trackController.streamTrack);

router.delete('/:id', authorization, trackController.deleteTrack);

export default router;
