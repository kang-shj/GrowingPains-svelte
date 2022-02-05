const router = require('express').Router();

/**
 * @api {post} /api/family/create 创建家庭
 * @apiGroup Family
 * @apiParam {String} name 家庭名称
 * @apiSuccess {Number} familyId 家庭Id
 */

/**
 * @api {post} /api/family/addmember 添加家庭成员
 * @apiGroup Family
 * @apiParam {Number} [familyId] 家庭Id
 * @apiParam {String} [familyName] 家庭名称
 * @apiParam {Number} [userId] 用户Id
 * @apiParam {String} [userName] 用户名称
 * @apiParam {String="parent","child"} role 角色
 * @apiParam {String} mark 标记
 * @apiSuccess {Number} memberId 成员Id
 */

/**
 * @api {get} /api/family/getmembers 获取家庭成员
 * @apiGroup Family
 * @apiParam {Number} [familyId] 家庭Id
 * @apiParam {String} [familyName] 家庭名称
 * @apiSuccess {Number} memberId 成员Id
 * @apiSuccess {Number} userId 用户Id
 * @apiSuccess {String} userName 用户名称
 * @apiSuccess {String} role 角色
 * @apiSuccess {String} mark 标记
 */
