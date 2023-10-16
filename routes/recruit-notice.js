const router = require("express").Router();
const pool = require("../database/postgresql");
const validator = require("../modules/validator");
const CONSTRAINT = require("../modules/constraint");
const { RECRUIT_NOTICE } = require("../modules/global");
const { BadRequestException } = require("../modules/customError");

// 채용 공고 등록 api
router.post("/", async (req, res, next) => {
    const { companyId, position, reward, content, skills } = req.body;
    const result = {
        message: "",
        data: {}
    };

    try {
        validator(companyId, "companyId").checkInput().isNumber();
        validator(position, "position").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_POSITION_LENGTH);
        validator(reward, "reward").checkInput().isNumber();
        validator(content, "content").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_CONTENT_LENGTH);
        validator(skills, "skills").checkInput().checkLength(1, RECRUIT_NOTICE.MAX_SKILLS_LENGTH);

        const insertNoticeSql = `INSERT INTO
                                        recruit_notice_tb (company_id, position, reward, content, skills)
                                    VALUES
                                        ($1, $2, $3, $4, $5)
                                    RETURNING
                                        id`;
        const isnertNoticeParam = [
            companyId,
            position,
            reward,
            content,
            skills
        ];
        const insertNoticeResult = await pool.query(insertNoticeSql, isnertNoticeParam);
        const createdNoticeId = insertNoticeResult.rows[0].id;
        result.message = "채용 공고 등록 성공";
        result.data = {
            noticeId: createdNoticeId
        };

    } catch (error) {
        if (error.constriant === CONSTRAINT.FK_COMPANY_TO_RECRUIT_TB) {
            throw new BadRequestException("해당하는 회사가 존재하지 않습니다.");
        }
        return next(error);
    }
    res.send(result);
});

module.exports = router;
