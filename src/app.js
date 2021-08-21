const path = require("path")

require("dotenv").config()

const axios = require("axios").default
const fs = require("fs")
const util = require("util")
const {Worker , workerData } = require("worker_threads")
const core = require("@actions/core")


const {SolutionDetails} = require(`${path.join(__dirname,'SolutionDetails.js')}`)
const worker = new Worker(`${path.join(__dirname, 'worker.js')}`)

const INTERVAL = 3000;

const URL = "https://leetcode.com/api/submissions/"

const all_problems = require(`${path.join(__dirname, 'copy.json')}`);

const cookieVal = core.getInput('cookieVal')
const SOLUTION_LOCATION = core.getInput('solution_location')

if(cookieVal === null || cookieVal === undefined || cookieVal.length === 0)
{
	throw 'Set COOKIE_SECRET in repo secrets'
}

const readFileDir = util.promisify(fs.readdir)

let aldyPresentSol = {}

function mapFileWithId(){
	return new Promise( async (resolve , reject ) => {
		const subPresent = await readFileDir(`${SOLUTION_LOCATION}`) ;
		subPresent.map(val => {
			if(val.indexOf("_") >= 0)
			{
				let f = val.split("_")[0]
				aldyPresentSol[f] = 1
			}
		})
		return resolve();
	})
}

SolutionDetails.prototype.IsPresent = function(){
	if(aldyPresentSol[this.id] === 1 )
	{
		return true;
	}
	else
	{
		return false;
	}
}


worker.on('message', ()=>{
	console.log("done writing")
})

worker.on('messageerror' , (err)=>[
	console.log("messageerror ", err)
])

worker.on('error', (err)=>{
	console.log(err ," messsage ")
})

worker.on('exit', ()=>{
	console.log("done this Work")
})

let solutionPromise = (question) => new Promise((resolve, reject) => {
		axios({
			method : 'GET',
			baseURL : `${URL}${question.question__title_slug}`,
			headers : {
				cookie : cookieVal
			}
		})
		.then(async (res)=>{
				worker.postMessage({workerData : res.data} )
				resolve()
		})
		.catch(err => {
			console.log("err",err.message)
			core.error('there is something wrong in here!')
		})
		.then(()=>{
			clearTimeout(sleep)
			resolve()
		})
})

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function OneTimeFetch(){
	try {
	for(let i = 0 ; i < all_problems.stat_status_pairs.length ; i++ )
	{
		const question = all_problems.stat_status_pairs[i]
		await solutionPromise(question.stat)
		await sleep(INTERVAL )
	}
	worker.postMessage({workerData : 'EXIT'}  )
	}
	catch(err)
	{
		core.error("there was something that goes wrong!")
		process.exit(err) ;
	}
}

async function DailyFetch (){
	try {
		const r_recentSubmittedSols = await axios({
			method : 'GET',
			baseURL : URL,
			headers : {
				cookie : cookieVal
			}
		})

		const bVal = r_recentSubmittedSols.data.submissions_dump;
		await FileWriteHdl(bVal)
		process.exit()
	} catch (err)
	{
		console.log(err.message )
		core.error("there was something that goes wrong!")
		process.exit(err);
	}
}

const FileWriteHdl = async bVal => {

		for(let i = 0 ; i  < bVal.length ; i++ )
		{
			if(bVal[i].status_display === 'Accepted')
			{
				const sol_obj = new SolutionDetails(bVal[i]);
				if(!sol_obj.IsPresent())
				{
					await sol_obj.fmtHdl()
					aldyPresentSol[this.id] = 1 ;
				}
			}
		}
}

;(async ()=>{
	console.time()
	await mapFileWithId()
	if(Object.keys(aldyPresentSol).length >= 1)
	{
		DailyFetch()
	}
	else
	{
		OneTimeFetch()
	}
})()

process.on('exit', (err)=>{
	console.timeEnd()
	if(err)
	{
		console.log("err", err.message)
	}
	else
	{
		console.log("exited peacefully!!")
	}
})
