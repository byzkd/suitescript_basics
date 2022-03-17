/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */

/**
 * The script uses NetSuite's Map/Reduce pardigm implementation and uses getInputData, map, reduce and summarize stages. When completed, 
 * the script deletes existing Pricing data for for qualifying items using the following generalized algorithm:
 *  Read the items and price data in getinputdata
 *  In map stage, create a data structure for where key is itemid and value is pricedata.  
 *  The shuffle stage would reduce the key:value to create a data structure where key is item id and value 
 *      is list of pircedata for that item
 *  In reduce stage, item: [pricedata] is received. 
 *      For Each Item: 
 *          Delete Price Effective Date for Item
 *          For each PriceData:
                Create Price Effective Date
In summery stage, write the audit log regarding uses and descriptive messages 
 * The script can be executed either from UI by executing the script deployment or programmatically via a task as shown below: 
         var mapReduceTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_example2',         //this script id
                deploymentId: 'customdeploy_example2'     //deployment id of this script
            });
            mapReduceTask.submit();
 */

define(["N/search", "N/record", "N/format"], /**
 * @param search
 * @param record
 * @param format
 */ function (search, record, format) {
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

  /**
   * Creates a RevenueForecastPriceData for further processing.
   * @param {number} price unit price
   * @param {number} category
   * @param {number} item Id of the item record
   */
  function ItemPriceData(price, category, item) {
    this.price = price;
    this.category = category;
    this.item = item;
  }
  //https://www.codeproject.com/Articles/1272296/Map-Reduce-script-in-NetSuite-with-SuiteScript-2-0

  function map(context) {
    try {
      var data = JSON.parse(context.value);
      var price = new ItemPriceData(
        data.values["unitprice.pricing"], //price
        data.values["category"].value, //pricing category
        data.id //item
      );
      context.write(data.id, price);
    } catch (ex) {
      log.error({ title: "map: error mapping data", details: ex });
    }
  }

  /**
   * Function creates Price Effective Date (PED)
   * @param {Object} priceData
   * @param {Date} effectiveDate
   */
  function createPed(priceData, effectiveDate) {
    try {
      var newPrice = Math.round(priceData.price * (1 + 0.02));
      var newPed = record.create({ type: "priceeffectivedate" });
      newPed.setValue({ fieldId: "item", value: priceData.item });
      newPed.setValue({ fieldId: "price", value: newPrice });
      newPed.setValue({ fieldId: "effectivedate", value: effectiveDate });
      newPed.save();
    } catch (ex) {
      log.error({
        title: "createPed: error creating Price Effective Date record",
        details: JSON.stringify(priceData) + "\n" + ex,
      });
    }
  }
  /**
   * Deletes all the Price Effective Date records for itemId whose effective date
   * is on or after the passed effectiveDate.
   * @param {number} itemId
   * @param {Date} effectiveDate
   */
  function deletePed(itemId, effectiveDate) {
    var objSearch, searchResults;
    if (!itemId || !effectiveDate) {
      return null;
    }
    try {
      var objSearch = search.create({
        type: "priceeffectivedate",
        filters: [
          search.createFilter({
            name: "item",
            operator: search.Operator.IS,
            values: itemId,
          }),
          search.createFilter({
            name: "isinactive",
            operator: search.Operator.IS,
            values: false,
          }),
          search.createFilter({
            name: "effectivedate",
            operator: search.Operator.ONORAFTER,
            values: format.format({
              value: effectiveDate,
              type: format.Type.DATE,
            }),
          }),
        ],
        columns: [
          search.createColumn({
            name: "internalid",
          }),
        ],
      });
      searchResults = objSearch.run();
      searchResults.forEach(function (searchResult) {
        record.delete({
          type: "priceeffectivedate",
          id: searchResult.id,
        });
      });
    } catch (ex) {
      log.error({ title: "Error Deleting", details: ex });
    }
  }

  function reduce(context) {
    try {
      var priceData, effectiveDate;
      priceData = context.values;
      effectiveDate = new Date(2019, 1, 1);
      deletePed(context.key, effectiveDate);
      priceData.forEach(function (pd) {
        createPed(JSON.parse(pd), effectiveDate);
      });
      context.write(context.key, true);
    } catch (ex) {
      log.error({
        title: "Error in item: " + context.key,
        details: JSON.stringify(context.values) + ex,
      });
    }
  }

  function summarize(context) {
    var totalItemsProcessed = 0;
    context.output.iterator().each(function () {
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
    reduce: reduce,
    summarize: summarize,
  };
});
