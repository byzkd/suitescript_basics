/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
// function scheduleCSVCurrencyUpdate(csvLine) {
//   //csvLine represents a line of comma separated values of price information

//   var mappingFileId = "CUSTIMPORT_rate_trx_csv"; // this references a saved CSV import map with header info below

//   // add a header to the import
//   var primaryFileAsString =
//     "Base Currency,Currency,Exchange Rate,Effective Date\n" + csvLine;

//   nlapiLogExecution("DEBUG", "scheduleCSVCurrencyUpdate", csvLine);

//   // create the CSV import job with a description that leverages the date
//   var job = nlapiCreateCSVImport();
//   job.setMapping(mappingFileId);
//   job.setPrimaryFile(primaryFileAsString);
//   job.setOption("jobName", "MY_CURRENCY_UPDATE: " + new Date());

//   nlapiSubmitCSVImport(job);
//   nlapiLogExecution("DEBUG", "scheduleCSVCurrencyUpdate", "Job submited!");
// }

function getRequest(url, callback) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", "https://www.tcmb.gov.tr/kurlar/today.xml", true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(null, xhr.responseText);
    } else {
      callback("Error: " + xhr.status);
    }
  };

  xhr.send();
}

function csvImportFunc() {
  var customerCSVImport = nlapiCreateCSVImport();

  customerCSVImport.setMapping("1");

  // setMapping(id) – id (parameter): Internal ID of the Field Map created Step 1.

  // Navigate to: Setup > Import/Export > Saved CSV Imports.

  customerCSVImport.setPrimaryFile(nlapiLoadFile(60));

  /*
  
  setPrimaryFile(file) – file {string} (parameter):
  
   
  
  The internal ID, as shown in the file cabinet, of the CSV file containing data to be imported, referenced by nlapiLoadFile. For example: setPrimaryFile(nlapiLoadFile(73)
  
  Or 
  
  Raw string of the data to be imported. For Example
  
   
  
  fileString = "company name, isperson, subsidiary, externalid\ncompanytest001, FALSE, Parent Company, companytest001";
  
  setPrimaryFile(fileString);
  
  */

  customerCSVImport.setOption("jobName", "job1Import");

  nlapiSubmitCSVImport(customerCSVImport);
}

function convertToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr);

  return array
    .map((it) => {
      return Object.values(it).toString();
    })
    .join("\n");
}

console.log(
  convertToCSV([
    {
      id: 1,
      name: "Foo",
      timestamp: new Date(),
    },
    {
      id: 2,
      name: "Bar",
      timestamp: new Date(),
    },
    {
      id: 3,
      name: "Baz",
      timestamp: new Date(),
    },
  ])
);
