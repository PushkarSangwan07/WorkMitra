const router = require('express').Router();
const { addFavorite, removeFavorite, getMyFavorites } = require('../controllers/favorite.controller');
const verifyJWT = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');

router.use(verifyJWT, restrictTo('customer'));

router.get('/me', getMyFavorites);
router.post('/:workerId', addFavorite);
router.delete('/:workerId', removeFavorite);

module.exports = router;