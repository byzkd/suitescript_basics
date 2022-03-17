/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */

/**
 * The script uses NetSuite's Map/Reduce pardigm implementation and uses getInputData, map, and summarize stages. When completed, 
 * the script deletes existing Pricing data for for qualifying items using the following generalized algorithm:
 *   Read the items and price data in getinputdata
 *   In map stage, delete the price data that was passed from getInputData stage
 *   In summery stage, write the audit log regarding uses and descriptive messages 
 *
 * The script can be executed either from UI by executing the script deployment or programmatically via a task as shown below: 
         var mapReduceTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_example1',         //this script id
                deploymentId: 'customdeploy_example1'     //deployment id of this script
            });
            mapReduceTask.submit();
 */
define(["N/search", "N/record"], /**
 * @param search @param record
 */
function (search, record) {
  function getInputData() {
    return search.create({
      type: "item",
      filters: [
        search.createFilter({
          name: "inactive",
          operator: search.Operator.IS,
          values: false,
        }),
      ],
      columns: [
        search.createColumn({ name: "category" }),
        search.createColumn({ name: "internalid", join: "pricing" }),
        search.createColumn({ name: "unitprice", join: "pricing" }),
      ],
    });
  }

  function map(context) {
    try {
      var data = JSON.parse(context.value); //read the data
      var pricingInternalId = data.values["internalid.pricing"]; //price id
      var deletedId = record.delete({ type: "pricing", id: pricingInternalId });
      context.write(data.id, deletedId); //write data
    } catch (ex) {
      log.error({ title: "map: error deleting records", details: ex });
    }
  }

  function summarize(context) {
    var totalItemsProcessed = 0;
    context.output.iterator().each(function (key, value) {
      totalItemsProcessed++;
    });
    var summaryMessage =
      "Usage: " +
      context.usage +
      " Concurrency: " +
      context.concurrency +
      " Number of yields: " +
      context.yields +
      " Total Items Processed: " +
      totalItemsProcessed;
    log.audit({ title: "Summary of usase", details: summaryMessage });
  }

  return {
    getInputData: getInputData,
    map: map,
    summarize: summarize,
  };
});
