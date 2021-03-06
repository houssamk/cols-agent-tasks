import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import fs = require('fs');

let rootDir = path.join(__dirname, '../../Tasks', 'ReplaceTokens');
let taskPath = path.join(rootDir, 'replaceTokens.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// set up a tmp file for the test
var workingFolder = path.join(__dirname, "working");
if (!fs.existsSync(workingFolder)) {
  fs.mkdirSync(workingFolder);
}
var tmpFile = path.join(workingFolder, "appsettings.config");

// provide answers for task mock
let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "checkPath": {
        "working": true
    },
    "findMatch": {
        "appsettings.json" : [ tmpFile ]
    }
};
tmr.setAnswers(a);

fs.writeFile(tmpFile, `
{
  "ConnectionStrings": {
    "DefaultConnection": "__ConnectionStrings.DefaultConnection__"
  },
  "Tricky": {
    "Gollum": "__Tricky.Gollum__",
    "Hobbit": "__Tricky.Hobbit__"
  },
  "Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "Debug",
      "System": "Information",
      "Microsoft": "Information"
    }
  }
}
`,
  (err) => {

  // set inputs
  tmr.setInput('sourcePath', "working");
  tmr.setInput('filePattern', 'appsettings.json');
  tmr.setInput('tokenRegex', '__(\\w+[\\.\\w+]*\\[?\\]?)__'); 

  // set variables
  process.env["CONNECTIONSTRINGS_DEFAULTCONNECTION"] = "testing";
  process.env["TRICKY_GOLLUM"] = "Gollum2";
  process.env["TRICKY_HOBBIT"] = "Sam";

  tmr.run();

  // validate the replacement
  let actual = fs.readFileSync(tmpFile).toString();

  var expected = `
{
  "ConnectionStrings": {
    "DefaultConnection": "testing"
  },
  "Tricky": {
    "Gollum": "Gollum2",
    "Hobbit": "Sam"
  },
  "Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "Debug",
      "System": "Information",
      "Microsoft": "Information"
    }
  }
}
  `;

  if (actual.trim() !== expected.trim()) {
    console.log(actual);
    console.error("Replacement failed.");
  } else {
    console.log("Replacement succeeded!")
  }
});