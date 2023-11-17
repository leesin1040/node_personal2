const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { Products, Users, Sequelize, sequelize } = require('../models');
const encrypt = require('../encrypt.js');
const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/auth-middleware.js');
require('dotenv').config();

//상품 등록 - 로그인 해야 가능
router.post('/products', authMiddleware, async (req, res) => {
	try {
		const { title, content } = req.body;
		//빈칸이 있을 경우
		if (!title || !content) {
			return res
				.status(400)
				.json({ message: '등록하고자 하는 상품의 정보를 입력해주세요.' });
		}
		//로그인한 유저 아이디 가져오기
		await Products.create({
			userId: res.locals.user.id,
			title,
			content,
			status: 'FOR_SALE',
		});
		return res.status(200).json({ message: '상품이 등록되었습니다.' });
	} catch {
		return res.status(400).json({ message: '상품 등록에 실패하였습니다.' });
	}
});

//전체 상품 조회
router.get('/products', async (req, res) => {
	try {
		const sort = req.query.sort === 'ASC' ? 'ASC' : 'DESC';
		const products = await Products.findAll({
			attributes: ['id', 'title', 'content', 'status', 'userId', 'createdAt'],
			include: [
				{
					model: Users,
					attributes: ['name'],
				},
			],
			order: [['createdAt', sort]],
		});
		return res.status(200).json({
			data: products,
		});
	} catch {
		return res.status(400).json({ message: '상품 조회에 실패하였습니다.' });
	}
});

//상세조회
router.get('/products/:productId', async (req, res) => {
	try {
		const productId = req.params.productId;
		const product = await Products.findOne({
			where: { id: productId },
			attributes: [
				'id',
				'title',
				'content',
				'status',
				'createdAt',
				'updatedAt',
				'userId',
			],
			include: [
				{
					model: Users,
					attributes: ['name'],
				},
			],
		});
		if (product) {
			return res.status(200).json({ data: product });
		}
		//조회된 상품이 없는 경우
		else {
			return res.status(401).json({
				message: '해당 ID를 가진 상품이 존재하지 않습니다.',
			});
		}
	} catch {
		return res.status(400).json({ message: '상품 조회에 실패하였습니다.' });
	}
});

//상세조회에서 상품정보 수정 -완료
router.put('/products/:productId', authMiddleware, async (req, res) => {
	try {
		const productId = req.params.productId;
		const localsUserId = res.locals.user.id;
		const { title, content, status } = req.body;
		const product = await Products.findOne({
			where: { id: productId },
		});
		if (!product) {
			return res.status(401).json({
				message: '상품 조회에 실패하였습니다.',
			});
		}
		//제품은 있는데 내꺼 아님
		if (product && localsUserId !== product.userId) {
			return res.status(401).json({
				message: '등록하신 상품이 아닙니다.',
			});
		}
		//제품이 존재하고 본인 제품이 맞음 - 수정가능
		if (product && localsUserId === product.userId) {
			const productUpdate = await product.update(
				{ title, content, status },
				{ where: { id: productId } },
			);
			return res
				.status(200)
				.json({ message: '제품 정보가 수정되었습니다.', product });
		}
	} catch {
		return res.status(500).json({ message: '서버 오류' });
	}
});

//상세조회에서 상품정보 삭제
router.delete('/products/:productId', authMiddleware, async (req, res) => {
	try {
		const productId = req.params.productId;
		const localsUserId = res.locals.user.id;
		const product = await Products.findOne({
			where: { id: productId },
		});
		//해당 상품이 존재하지 않음
		if (!product) {
			return res.status(401).json({ message: '존재하지 않는 상품입니다.' });
		}
		//상품은 있는데 작성자가 아님
		if (product && localsUserId !== product.userId) {
			return res.status(401).json({
				message: '등록하신 상품이 아닙니다.',
			});
		}
		//상품이 존재하고 작성자가 로그인한 본인임
		if (product && localsUserId === product.userId) {
			const productUpdate = await product.destroy();
			return res
				.status(200)
				.json({ message: '제품 정보가 삭제되었습니다.', product });
		}
	} catch {
		return res.status(500).json({ message: '서버 오류' });
	}
});

module.exports = router;
