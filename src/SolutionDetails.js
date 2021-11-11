const fs = require("fs")

const util = require("util")
const core = require("@actions/core")
const readFileDir = util.promisify(fs.readdir)
const codeWrite = util.promisify(fs.writeFile)

// relative to root directory default is root directory
const {SOLUTION_LOCATION} = require("./helper")


function SolutionDetails({id, lang, runtime, memory, code, title_slug}) {
	this.id = id
	this.lang = lang
	this.memory = memory
	this.runtime = runtime
	this.code = code
	this.title_slug = title_slug
	this.fmtData = ""
	this.ext = this._getExtension(this.lang)
}


SolutionDetails.prototype.fmtHdl = async function () {
	this.fmtData += `id = ${this.id} \n`;
	this.fmtData += `lang = ${this.lang} \n`
	this.fmtData += `runtime  = ${this.runtime} \n`
	this.fmtData += `memory = ${this.memory}\n`
	this.fmtData += `title_slug = ${this.title_slug}\n`
	this.fmtData += `code =\n\n ${this.code}`
	await this._fileWriteHdl()
}

SolutionDetails.prototype._fileWriteHdl = async function () {
	try {
		await codeWrite(`${SOLUTION_LOCATION}/${this.id}_${this.title_slug}.${this.ext}`, this.fmtData)
		console.log("file written")
	}
	catch (er) {
		console.log(er.message, er)
	}
}

SolutionDetails.prototype._getExtension = function (lang) {

	switch (lang) {
		case 'cpp': this.ext = "cxx"
			break;
		case 'javascript': this.ext = "js"
			break;
		case 'python3': this.ext = "py"
			break;
		case 'java': this.ext = "java"
			break;
		case 'golang': this.ext = "go"
			break;
		case 'rust': this.ext = "rs"
			break;
		case 'c': this.ext = "c"
			break;
		case 'swift': this.ext = "swift"
			break;
		case 'c#': this.ext = "cs"
			break;
		case 'ruby': this.ext = "rb"
			break;
		case 'scala': this.ext = "sc"
			break;
		case 'kotlin': this.ext = "kt"
			break;
		case 'typescript': this.ext = 'ts'
			break;
		case 'php': this.ext = 'php'
			break;
		case 'erlang': this.ext = 'erl'
			break;
		case 'racket': this.ext = 'rkt'
			break;
		case 'elixir': this.ext = 'ex'
			break;
		default: this.ext = "md"
			break;
	}

	return this.ext
}


module.exports = {
	SolutionDetails,
}
