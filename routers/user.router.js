const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const encrypt = require('../encrypt.js');
const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/need-signin.middlware.js');
require('dotenv').config();
const env = process.env;

//⬇⬇⬇⬇회원가입 - Post / signup
router.post('/signup', async (req, res) => {
	try {
		const { email, name, password, confirmPassword } = req.body;
		//필수정보 누락 - 확인!
		if (!email || !name || !password || !confirmPassword) {
			return res
				.status(400)
				.json({ success: false, message: '필수 정보가 누락되었습니다.' });
		}
		//이메일 형식 검사 - 확인!
		const emailValid =
			/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
		const emailCheck = emailValid.test(email);
		if (!emailCheck) {
			return res
				.status(401)
				.json({ success: false, message: '유효한 이메일 형식이 아닙니다.' });
		}
		// 비밀번호 6자 이상 - 확인
		if (password.length < 6) {
			return res
				.status(400)
				.json({ success: false, message: '비밀번호는 6자 이상이어야 합니다.' });
		}
		// confirmPassword 틀림 - 확인
		if (password !== confirmPassword) {
			return res
				.status(401)
				.json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
		}
		//이메일 중복 확인 - 확인
		const existUser = await Users.findOne({ where: { email } });
		if (existUser) {
			return res
				.status(409)
				.json({ success: false, message: '이미 사용중인 이메일입니다.' });
		}
		//비밀번호 hash
		const encryptPassword = encrypt(password);
		await Users.create({ email, name, password: encryptPassword });
		const addedUser = await Users.findOne({ where: { email } });
		return res.status(201).send({
			success: false,
			message: '회원가입에 성공하였습니다.',
			이메일: email,
			이름: name,
			유저ID_NO: addedUser.id,
			가입일자: addedUser.createdAt,
		});
	} catch {
		return res
			.status(500)
			.json({ success: false, message: '회원가입에 실패하였습니다.' });
	}
});

//⬇⬇⬇⬇⬇로그인
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const existUser = await Users.findOne({ where: { email } });
		//칸이 비어있는 경우
		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, message: '아이디나 비밀번호 란이 비어있습니다.' });
		}
		//데이터베이스에 존재하지 않는 이메일
		if (!existUser) {
			return res
				.status(401)
				.json({ success: false, message: '존재하지 않는 이메일입니다.' });
		}
		//암호화된 비밀번호와 입력한 비밀번호가 맞는 경우 로그인 성공 60분짜리 토큰 부여
		const encryptPassword = encrypt(password);
		if (existUser.password === encryptPassword) {
			//토큰 부여 12시간
			const token = jwt.sign(
				{ email, name: existUser.name },
				env.JWT_SECREAT_KEY,
				{ expiresIn: '12h' },
			);
			//cookie로 토큰 할당
			res.cookie('Authorization', `Bearer ${token}`);
			return res.status(200).json({ success: true, message: '로그인 성공' });
		} else {
			return res
				.status(401)
				.json({ success: false, message: '비밀번호가 틀렸습니다.' });
		}
	} catch {
		return res
			.status(500)
			.json({ success: false, message: '로그인에 실패했습니다.' });
	}
});

//⬇⬇⬇⬇⬇비밀번호 수정
router.put('/myinfo', authMiddleware, async (req, res) => {
	try {
		const { email, password, newPassword } = req.body;
		const existUser = await Users.findOne({ where: { email } });
		//필수 정보 누락 - 완료!
		if (!email || !password || !newPassword) {
			return res.status(400).json({
				success: false,
				message: '비밀번호 변경을 위한 필수정보가 누락되었습니다.',
			});
		}
		//비밀번호 hash 매치 - 기존비번
		const encryptPassword = encrypt(password);
		//새 비밀번호 hash
		const encryptNewPassword = encrypt(newPassword);
		//사용중인 비밀번호가 맞을 경우 비밀번호 변경 - 완료
		if (encryptPassword === existUser.password) {
			await existUser.update({ password: encryptNewPassword });
			return res
				.status(200)
				.json({ success: true, message: '비밀번호가 변경되었습니다.' });
		}
		//사용중인 비밀번호가 틀렸을 경우
		else {
			return res
				.status(401)
				.json({ success: false, message: '사용중인 비밀번호가 틀렸습니다.' });
		}
	} catch {
		return res
			.status(400)
			.json({ success: false, message: '비밀번호 변경에 실패하였습니다.' });
	}
});

//⬇⬇⬇⬇⬇회원정보 삭제 - 비번 인증이 필요함
router.delete('/myinfo', authMiddleware, async (req, res) => {
	try {
		const { email, password } = req.body;
		const existUser = await Users.findOne({ where: { email } });
		//필수정보 누락 - 완료
		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, message: '필수 정보가 누락되었습니다.' });
		}
		//존재하지 않는 사용자
		if (email !== existUser) {
			return res
				.status(400)
				.json({ success: false, message: '존재하지 않는 사용자입니다.' });
		}
		const encryptPassword = encrypt(password);
		//비번이 맞으면 삭제
		if (existUser.password === encryptPassword) {
			await existUser.destroy();
			res.clearCookie('Authorization');
			return res
				.status(200)
				.json({ success: false, message: '회원정보가 삭제되었습니다.' });
		} else {
			return res
				.status(401)
				.json({ success: false, message: '비밀번호가 틀렸습니다.' });
		}
	} catch {
		return res
			.status(400)
			.json({ success: false, message: '회원정보 삭제에 실패하였습니다.' });
	}
});

//⬇⬇⬇⬇⬇ 내 정보 조회
router.get('/myinfo', authMiddleware, async (req, res) => {
	try {
		const { email, name, createdAt } = res.locals.user;
		return res
			.status(200)
			.json({ '내 정보': { 이메일: email, 이름: name, 가입일자: createdAt } });
	} catch {
		return res.status(500).json({ message: '내 정보 조회에 실패하였습니다.' });
	}
});

//⬇⬇⬇⬇⬇로그아웃
router.post('/logout', authMiddleware, (req, res) => {
	try {
		res.clearCookie('Authorization');
		return res
			.status(200)
			.json({ success: true, message: '로그아웃되었습니다.' });
	} catch {
		return res.status(500).json({ success: false, message: '서버 오류' });
	}
});

//내보내기
module.exports = router;
