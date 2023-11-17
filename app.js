require('dotenv').config();
const env = process.env;
const express = require('express');
const app = express();
const port = env.DB_PORT;
const cookieParser = require('cookie-parser');
const productRouter = require('./routers/products.router.js');
const userRouter = require('./routers/user.router.js');

app.use(express.json());
app.use(cookieParser());

/*
async function main() {
  // model을 이용해 데이터베이스에 테이블을 삭제 후 생성합니다.
  await sequelize.sync({ force: true });
}
main();
*/

//기본 경로
app.get('/', (req, res) => {
	res.send('Node.js 숙련주차 개인과제에 접속되었습니다.');
});

app.use('/api', [userRouter, productRouter]);

app.listen(port, () => {
	console.log(port, '포트로 서버가 열렸어요!');
});
