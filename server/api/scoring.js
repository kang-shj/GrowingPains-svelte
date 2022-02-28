const router = require('express').Router();
const sqlHelper = require("../dao/sqlHelper");

/**
 * @api {post} /api/scoring/add_scoring 添加计分
 * @apiGroup Scoring
 * @apiParam {Number} [memberId] 成员id
 * @apiParam {Number} [ruleId] 规则id
 * @apiSuccess {Number} scoring 计分id
 */
router.post("/add_scoring", async function(req, res) {
  var user = req.user.name;
  var memberId = req.body.memberId;
  var ruleId = req.body.ruleId;

  var ruleSet = await sqlHelper.query(`
    SELECT scoring
    FROM gp_rule
    WHERE id=${ruleId};
  `);
  var ruleScoring = ruleSet[0].scoring;

  var scoringSet = await sqlHelper.query(`
    SELECT id, score
    FROM gp_scoring
    WHERE memberId=${memberId} AND nextId=0
  `);
  var lastId = 0;
  var score = 0;
  if (scoringSet.length > 0) {
    lastId = scoringSet[0].id;
    score = scoringSet[0].score;
  }

  var now = new Date();
  var insertOut = await sqlHelper.query(`
    INSERT INTO gp_scoring (memberId, addTime, operatorId, ruleId, score, prevId, nextId)
    VALUES (${memberId}, '${now.toLocaleDateString()} ${now.toTimeString().substr(0, 8)}', ${user.id}, ${ruleId}, ${score + ruleScoring}, ${lastId}, 0);
  `);
  var newScoringId = insertOut.insertId;

  if (lastId > 0) {
    await sqlHelper.query(`
      UPDATE gp_scoring
      SET nextId=${newScoringId}
      WHERE id=${lastId}
    `);
  }

  res.json({
    data: {
      id: newScoringId
    }
  });
});

/**
 * @api {get} /api/scoring/get_score 获取当前分数
 * @apiGroup Scoring
 * @apiParam {Number} [familyId] 家庭id
 * @apiSuccess {Object[]} [scores] 家庭所有child成员分数
 * @apiSuccess {String} [scores.name] 成员名称
 * @apiSuccess {Number} [scores.score] 成员当前得分
 * @apiParam {Number} [memberId] 成员id
 * @apiSuccess {Number} [score] 当前得分
 */
router.get("/get_score", async function(req, res) {
  var familyId = req.query.familyId;
  var memberId = req.query.memberId;

  if (familyId !== undefined) {
    sqlHelper.query(`
      SELECT m.id AS memberId, u.name AS name, m.mark AS mark, s.score AS score
      FROM gp_scoring s
      LEFT JOIN gp_member m
      ON m.familyId=${familyId} AND roleId=1
      LEFT JOIN gp_user u
      ON u.id=m.userId
      WHERE s.memberId=m.id AND s.nextId=0
    `).then(outSet => {
      res.json({
        data: outSet
      });
    });
  } else if (memberId !== undefined) {
    sqlHelper.query(`
      SELECT score
      FROM gp_scoring
      WHERE memberId=${memberId} AND nextId=0
    `).then(outSet => {
      res.json({
        data: outSet[0]
      });
    });
  } else {
    res.json({
      error: "no data"
    });
  }

});

/**
 * @api {get} /api/scoring/get_scorings 获取计分列表
 * @apiGroup Scoring
 * @apiParam {Number} [memberId] 成员id
 * @apiSuccess {Object[]} scorings 计分列表
 * @apiSuccess {Number} scorings.id 计分Id
 * @apiSuccess {String} scorings.time 时间
 * @apiSuccess {String} scorings.operator 操作人
 * @apiSuccess {String} scorings.rule 规则
 * @apiSuccess {Number} scorings.scoring 计分
 * @apiSuccess {Number} scorings.score 本次计分后得分
 */
router.get("/get_scorings", async function(req, res) {
  var memberId = req.query.memberId;
  sqlHelper.query(`
    SELECT gp_scoring.id, gp_scoring.addTime AS time, gp_user.name AS operator, gp_rule.description AS rule, gp_rule.scoring AS scoring, gp_scoring.score AS score
    FROM gp_scoring
    LEFT JOIN gp_user ON gp_user.id=gp_scoring.operatorId
    LEFT JOIN gp_rule ON gp_rule.id=gp_scoring.ruleId
    WHERE gp_scoring.memberId=${memberId}
    ORDER BY gp_scoring.id DESC
  `).then(outSet => {
    res.json({
      data: outSet
    });
  });
});

module.exports = router;