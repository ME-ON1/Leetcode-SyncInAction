const path = require("path")
const axios = require("axios").default
const fs = require("fs")
const util = require("util")
const core = require("@actions/core")
const {Worker, workerData} = require("worker_threads")


const worker = new Worker(`${path.join(__dirname, 'worker.js')}`)
const {SolutionDetails} = require(`${path.join(__dirname, 'SolutionDetails.js')}`)


const {SOLUTION_LOCATION,
	COOKIE_VAL,
	INTERVAL,
	URL,
	PROBLEMS_URL} = require("./helper")


/*if (COOKIE_VAL === null || COOKIE_VAL === undefined || COOKIE_VAL.length === 0) {
       throw 'Set COOKIE_SECRET in repo secrets'
}*/


const readFileDir = util.promisify(fs.readdir)

//global map so other function can access this
let aldyPresentSol = {}


const mapFileWithId = async (SOLUTION_LOCATION) => {
	console.log(SOLUTION_LOCATION)
	const subPresent = await readFileDir(SOLUTION_LOCATION);
	subPresent.map(val => {
		if (val.indexOf("_") >= 0) {
			// TODO better algo than "_" check
			let f = val.split("_")[0]
			aldyPresentSol[f] = 1
		}
	})
}


SolutionDetails.prototype.IsPresent = function () {
	if (aldyPresentSol[this.id] === 1) {
		return true;
	}
	else {
		return false;
	}
}


worker.on('message', () => {
	console.log("done writing")
})

worker.on('messageerror', (err) => [
	console.log("messageerror ", err)
])

worker.on('error', (err) => {
	console.log(err, " messsage ")
})

worker.on('exit', () => {
	console.log("done this Work")
})

const solutionPromiseToWorkerThrd = (question, COOKIE_VAL) => new Promise((resolve, reject) => {
	axios({
		method: 'GET',
		baseURL: `${URL}${question.question__title_slug}`,
		headers: {
			cookie: COOKIE_VAL
		}
	})
		.then(async (res) => {
			worker.postMessage({workerData: res.data})
			resolve()
		})
		.catch(err => {
			console.log("err", err.message)
			core.error('there is something wrong in here!')
			reject(err)
		})
		.then(() => {
			clearTimeout(sleep)
			resolve()
		})
})

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const prepareProblem = async (PROBLEMS_URL) => {
	const returnProblems = await axios({
		method: 'GET',
		baseURL: PROBLEMS_URL,
		headers: {
			cookie: COOKIE_VAL
		}
	})
	return returnProblems.data
}

async function OneTimeFetch(PROBLEMS_URL, INTERVAL, prepareProblem, COOKIE_VAL) {
	try {
		const all_problems = await prepareProblem(PROBLEMS_URL)
		for (let i = 0; i < all_problems.stat_status_pairs.length; i++) {
			const question = all_problems.stat_status_pairs[i]
			await solutionPromiseToWorkerThrd(question.stat, COOKIE_VAL)
			await sleep(INTERVAL)
		}
		worker.postMessage({workerData: 'EXIT'})
	}
	catch (err) {
		core.error("there was something that goes wrong!")
		process.exit(err);
	}
}

async function DailyFetch(URL, COOKIE_VAL) {
	try {
		const r_recentSubmittedSols = await axios({
			method: 'GET',
			baseURL: URL,
			headers: {
				cookie: COOKIE_VAL
			}
		})

		const bVal = r_recentSubmittedSols.data.submissions_dump;
		await FileWriteHdl(bVal)
		process.exit()
	} catch (err) {
		console.log(err.message)
		core.error("there was something that goes wrong!")
		process.exit(err);
	}
}

const FileWriteHdl = async bVal => {

	for (let i = 0; i < bVal.length; i++) {
		if (bVal[i].status_display === 'Accepted') {
			const sol_obj = new SolutionDetails(bVal[i]);
			if (!sol_obj.IsPresent()) {
				await sol_obj.fmtHdl()
				aldyPresentSol[this.id] = 1;
			}
		}
	}
}

	; (async () => {
		console.time()
		console.log(process.cwd())
		await mapFileWithId(SOLUTION_LOCATION)
		if (Object.keys(aldyPresentSol).length >= 1) {
			DailyFetch(URL, COOKIE_VAL)
		}
		else {
			OneTimeFetch(PROBLEMS_URL, INTERVAL, prepareProblem, COOKIE_VAL)
		}
	})()

process.on('exit', (err) => {
	console.timeEnd()
	if (err) {
		console.log("err", err.message)
	}
	else {
		console.log("exited peacefully!!")
	}
})
