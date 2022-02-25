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
    SELECT id, scoring
    FROM gp_scoring
    WHERE memberId=${memberId} AND nextId=0
  `);
  var lastId = 0;
  var scoring = 0;
  if (scoringSet.length > 0) {
    lastId = scoringSet[0].id;
    scoring = scoringSet[0].scoring;
  }

  var now = new Date();
  var insertOut = await sqlHelper.query(`
    INSERT INTO gp_scoring (memberId, addTime, operatorId, ruleId, scoring, prevId, nextId)
    VALUES (${memberId}, '${now.toLocaleDateString()} ${now.toTimeString().substr(0, 8)}', ${user.userId}, ${ruleId}, ${scoring + ruleScoring}, ${lastId}, 0);
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
 * @api {get} /api/scoring/get_scoring 获取当前分数
 * @apiGroup Scoring
 * @apiParam {Number} [memberId] 成员id
 * @apiSuccess {Number} [scoring] 当前分数
 */
router.get("/get_scoring", async function(req, res) {
  var memberId = req.query.memberId;

  sqlHelper.query(`
    SELECT scoring
    FROM gp_scoring
    WHERE memberId=${memberId} AND nextId=0
  `).then(outSet => {
    res.json({
      data: outSet[0]
    });
  });

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
  `).then(outSet => {
    res.json({
      data: outSet
    });
  });
});

module.exports = router;