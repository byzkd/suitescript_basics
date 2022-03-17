/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define([], function fieldChanged(context) {
  var employee = context.currentRecord;

  if (context.fieldId == "phone") {
    var fax = employee.getValue("fax");

    if (!fax) {
      var phone = employee.getValue("phone");
      employee.setValue("fax", phone);
    }
  }

  return {
    fieldChanged: fieldChanged,
    valideField: valideField,
    saveRecord: saveRecord,
  };
});
