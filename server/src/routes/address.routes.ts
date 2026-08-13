import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';

const router = Router();

// All address routes require authentication
router.use(authenticate);

router.get('/', addressController.getMyAddresses);
router.get('/:id', validateMongoId('id'), addressController.getAddressById);
router.post('/', addressController.createAddress);
router.put('/:id', validateMongoId('id'), addressController.updateAddress);
router.delete('/:id', validateMongoId('id'), addressController.deleteAddress);
router.patch('/:id/default', validateMongoId('id'), addressController.setDefaultAddress);

export default router;
