const router = require('express').Router();
const userController = require('../controller/userController')

router.route('/login').post(userController.login)
router.route('/signup').post(userController.signup)

router.get('/getMe',userController.protect,userController.home);
router.post('/updateProfile',userController.protect,userController.uploadUserProfile,userController.resizeUserProfile,userController.editAccount)
router.get('/logout',userController.logout)


module.exports = router;