const router = require('express').Router();
const adminController = require('../controller/adminController')

router.route('/editUser/:id')
    .get(adminController.protect,adminController.getEditUser)
    .post(adminController.protect,adminController.uploadUserProfile,
        adminController.resizeUserProfile,adminController.editUser)
router.route('/login')
    .post(adminController.login)
router.route('/')
    .get(adminController.protect,adminController.getAllUsers);
router.route('/deleteUser/:id')
    .delete(adminController.protect,adminController.deleteUser)
router.route('/createUser')
    .post(adminController.createUser)

router.route('/logout')
    .get(adminController.logout)


    


module.exports = router;
