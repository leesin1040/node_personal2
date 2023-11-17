const jwt = require('jsonwebtoken');
const { Users } = require('../models');

module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? '').split(' ');

  if (authType !== 'Bearer' || !authToken) {
    return res.status(400).json({
      errorMessage: '로그인 후 사용이 가능합니다.',
    });
  }
  try {
    // 복호화 및 검증
    const { email } = jwt.verify(authToken, 'nodejs-personal-assignment2');
    const user = await Users.findOne({ where: { email } });
    res.locals.user = user;
    //데이터베이스의 사용자 정보를 가져와서 다음 미들웨어로 보내기
    next();
  } catch (err) {
    res.status(401).json({
      errorMessage: '로그인 후 사용이 가능합니다.',
    });
    //try-catch를 통해 에러가 날 경우에도 서버가 닿히지 않도록 처리
  }
  return;
};
