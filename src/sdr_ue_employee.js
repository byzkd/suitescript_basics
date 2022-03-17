/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(["N/record"], /**
 *
 * @param {record} record
 */ function (record) {
  return {
    afterSubmit: function (context) {
      log.debug("Hello World");

      var employee = context.newRecord;
      var empCode = employee.getValue("custentity_sdr_employee_code");
      var supervisorName = employee.getText("supervisor");
      var supervisorId = employee.getValue("supervisor");

      //employee.setValue("custentity_sdr_employee_code", EMP002);

      log.debug("Employee Code", empCode);
      log.debug("Supervisor Name", supervisorName);
      log.debug("Supervisor Id", supervisorId);

      if (context.type == context.UserEventType.CREATE) {
        var phoneCall = record.create({
          type: record.Type.PHONE_CALL,
          defaultValues: {
            customForm: -150,
          },
        });

        phoneCall.setValue("title", "Call HR for benefits");
        phoneCall.setValue("assigned", employee.id);
        phoneCall.save();
      }
    },
  };
});
