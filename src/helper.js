const core = require("@actions/core")

const solution_location = core.getInput('solution_location')

exports.SOLUTION_LOCATION = process.cwd() + solution_location


exports.INTERVAL = 3000;


exports.URL = "https://leetcode.com/api/submissions/"

exports.PROBLEMS_URL = "https://leetcode.com/api/problems/all"


exports.COOKIE_VAL = core.getInput('cookieVal')
