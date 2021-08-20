const path = require("path")

require("dotenv").config()

const axios = require("axios").default

const fs = require("fs")

const util = require("util")

const INTERVAL = 3000;
const {Worker , workerData } = require("worker_threads")

const URL = "https://leetcode.com/api/submissions/"
const PROBLEM_URL = "https://leetcode.com/api/problems/all"

const all_problems = require("./problemstat.json");

const cookieVal = process.env.COOKIE_SECRET ;

if(cookieVal === null || cookieVal === undefined || cookieVal.length === 0)
{
	throw 'Set COOKIE_SECRET in repo secrets'
}


const {SolutionDetails} = require("./SolutionDetails.js")

const readFileDir = util.promisify(fs.readdir)

let aldyPresentSol = {}

function mapFileWithId(){
	return new Promise( async (resolve , reject ) => {
		const subPresent = await readFileDir("../../") ;
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

const worker = new Worker('./worker.js' )


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
				//console.log(res.data)
				console.log(res, "reaching herre")
				worker.postMessage({workerData : res.data} )
				resolve()
		})
		.catch(err => {
			console.log("err",err.message)
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
		process.exit(err) ;
	}
}

async function DailyFetch (){
	console.log("is it running")
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
		console.log("reachign here")
		process.exit()
	} catch (err)
	{
		console.log(err.message )
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
					console.log("running")
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
