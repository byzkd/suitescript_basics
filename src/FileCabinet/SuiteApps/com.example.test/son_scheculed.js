/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define([
  "N/record",
  "N/xml",
  "N/currentRecord",
  "N/log",
  "N/https",
  "N/file",
  "N/compress",
  "N/encode",
], function (record, xml, currentRecord, log, https, file, compress, encode) {
  function execute(context) {
    var url = "https://www.tcmb.gov.tr/kurlar/today.xml";
    var postStr = "";

    var header = "";
    //header['Username'] = 'HiZj7219';
    //header['Password'] = 'Y&DZ9gKf';
    var response = https.post({
      url: url,
      body: postStr,
      headers: header,
    });

    var xmlDocument = xml.Parser.fromString({ text: response.body });
    // x = xmlDocument.getElementsByTagName("User")[0];

    var xmlNode = xmlDocument.getElementsByTagName("Currency");
    for (var i = 0; i < xmlNode.length; i++) {
      var newCurrency = record.create({
        // Creating a new SO
        type: "customrecord_custom_currency_exchange",
        isDynamic: true, // Important: Dynamic Mode
      });

      log.debug({
        title: "Isim",
        details: xmlNode[i].getElementsByTagName({ tagName: "Isim" })[0]
          .textContent,
      });

      newCurrency.setValue({
        fieldId: "name",
        value: xmlNode[i].getElementsByTagName({ tagName: "Isim" })[0]
          .textContent,
      });

      log.debug({
        title: "Unit",
        details: xmlNode[i].getElementsByTagName({ tagName: "Unit" })[0]
          .textContent,
      });

      newCurrency.setValue({
        fieldId: "custrecord_unit",
        value: xmlNode[i].getElementsByTagName({ tagName: "Unit" })[0]
          .textContent,
      });

      log.debug({
        title: "CurrencyName",
        details: xmlNode[i].getElementsByTagName({ tagName: "CurrencyName" })[0]
          .textContent,
      });
      newCurrency.setValue({
        fieldId: "name",
        value: xmlNode[i].getElementsByTagName({ tagName: "CurrencyName" })[0]
          .textContent,
      });
      log.debug({
        title: "ForexBuying",
        details: xmlNode[i].getElementsByTagName({ tagName: "ForexBuying" })[0]
          .textContent,
      });
      newCurrency.setValue({
        fieldId: "custrecord_forex_buying",
        value: xmlNode[i].getElementsByTagName({ tagName: "ForexBuying" })[0]
          .textContent,
      });

      //   newCurrency.setValue({
      //     fieldId: "custrecord_delta_efat_firstcrea_time",
      //     value: convertFromStringToDate(
      //       dateNode[0].getElementsByTagName({ tagName: "Tarih_Date" })[0]
      //         .textContent
      //     ),
      //   });

      log.debug({
        title: "ForexSelling",
        details: xmlNode[i].getElementsByTagName({ tagName: "ForexSelling" })[0]
          .textContent,
      });

      newCurrency.setValue({
        fieldId: "custrecord_forex_selling",
        value: xmlNode[i].getElementsByTagName({ tagName: "ForexSelling" })[0]
          .textContent,
      });

      log.debug({
        title: "BanknoteBuying",
        details: xmlNode[i].getElementsByTagName({
          tagName: "BanknoteBuying",
        })[0].textContent,
      });

      newCurrency.setValue({
        fieldId: "custrecord_banknote_buying",
        value: xmlNode[i].getElementsByTagName({ tagName: "BanknoteBuying" })[0]
          .textContent,
      });

      log.debug({
        title: "BanknoteSelling",
        details: xmlNode[i].getElementsByTagName({
          tagName: "BanknoteSelling",
        })[0].textContent,
      });

      newCurrency.setValue({
        fieldId: "custrecord_banknote_selling",
        value: xmlNode[i].getElementsByTagName({
          tagName: "BanknoteSelling",
        })[0].textContent,
      });

      //   log.debug({
      //     title: "CrossRateUSD",
      //     details: xmlNode[i].getElementsByTagName({ tagName: "CrossRateUSD" })[0]
      //       .textContent,
      //   });

      //   newCurrency.setValue({
      //     fieldId: "custrecord_delta_efat_alias_creatime",
      //     value: xmlNode[i].getElementsByTagName({ tagName: "CrossRateUSD" })[0]
      //       .textContent,
      //   });

      //   log.debug({
      //     title: "CrossRateOther",
      //     details: xmlNode[i].getElementsByTagName({
      //       tagName: "CrossRateOther",
      //     })[0].textContent,
      //   });

      //   newCurrency.setValue({
      //     fieldId: "custrecord_delta_efat_alias_creatime",
      //     value: xmlNode[i].getElementsByTagName({ tagName: "CrossRateOther" })[0]
      //       .textContent,
      //   });

      try {
        var newCurrrencyID = newCurrency.save(); // Attempting to save the record
        log.debug("New currency ID", newCurrrencyID);
      } catch (e) {
        log.error("Not able to save new Currency - " + e.name, e.message);
      }
    }

    log.debug({ title: "response", details: response });
  }

  return {
    execute: execute,
  };
});
