const router = require('express').Router();
const userController = require('../controller/userController')

router.route('/login').post(userController.login)

router.route('/signup').post(userController.signup)

router.use(userController.protect);
router.get('/',userController.home);
router.post('/updateProfile',userController.uploadUserProfile,userController.resizeUserProfile,userController.editAccount)



module.exports = router;