/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(["N/currency", "N/xml"], /**
 * @param{currency} currency
 * @param{xml} xml
 */ (currency, xml) => {
  /**
   * Defines the Scheduled script trigger point.
   * @param {Object} scriptContext
   * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
   * @since 2015.2
   */
  const execute = (scriptContext) => {
    //function CSVImport(csv) {
    var mappingFileId = "customrecord_test_exchange_rate";
    // var primaryFile = file.load({
    //     id: 59
    // });

    var job = task.create({
      taskType: task.TaskType.CSV_IMPORT,
      importFile: csv,
      mappingId: "customrecord_test_exchange_rate",
    });

    //job.mappingId = mappingFileId;
    //job.importFile = csv;
    job.name = "jobImport";

    // var scriptTask = task.create({
    //     taskType: task.TaskType.CSV_IMPORT ,
    // });

    //scriptTask.mappingId = "custimport_test_import";
    //var f = file.load("SuiteScripts/test.csv");
    //scriptTask.importFile = f;
    //var csvImportTaskId = scriptTask.submit();

    var jobId = job.submit();
    //}
  };

  function GetXMLData() {
    var url = "https://www.tcmb.gov.tr/kurlar/today.xml";

    var response = nlapiRequestURL(url);
    var responseXML = nlapiStringToXML(response.getBody());
    var resData = nlapiSelectNodes(
      responseXML,
      "/*[local-name()='DataSet'][namespace-uri()='https://www.tcmb.gov.tr/kurlar/']/*[local-name()='Body'][namespace-uri()='https://www.tcmb.gov.tr/kurlar/']/*[local-name()='Cube'][namespace-uri()='https://www.tcmb.gov.tr/kurlar/']/*[local-name()='Rate'][namespace-uri()='https://www.tcmb.gov.tr/kurlar/']"
    );

    resData.forEach(function (entry) {
      var currencyCode = nlapiSelectValue(entry, "@currency");
      var currencyRate = nlapiSelectNode(entry, "text()").textContent;
      var currencyMultiplier = nlapiSelectValue(entry, "@multiplier");
      alert(currencyCode + " " + currencyRate + " " + currencyMultiplier);
    });
  }

  return { pageInit: GetXMLData };
});
