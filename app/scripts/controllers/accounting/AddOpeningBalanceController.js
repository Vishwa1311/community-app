(function (module) {
    mifosX.controllers = _.extend(module, {
        AddOpeningBalanceController: function (scope, resourceFactory, location, dateFilter) {

            scope.formData = {};
            scope.formData.crAccounts = [];
            scope.formData.dbAccounts = [];
            scope.first = {};
            scope.errorcreditevent = false;
            scope.errordebitevent = false;
            scope.creditaccounttemplate = false;
            scope.debitaccounttemplate = false;
            scope.restrictDate = new Date();
            scope.showPaymentDetails = false;
            resourceFactory.accountCoaResource.getAllAccountCoas({manualEntriesAllowed: true, usage: 1, disabled: false}, function (data) {
                scope.glAccounts = data;
            });

            resourceFactory.codeValueResource.getAllCodeValues({codeId: 12}, function (data) {
                if (data.length > 0) {
                    scope.formData.paymentTypeId = data[0].id;
                }
                scope.paymentTypes = data;
            });

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.formData.officeId = scope.offices[0].id;
            });

            scope.submit = function () {
                var jeTransaction = new Object();
                var reqDate = dateFilter(scope.first.date, scope.df);
                jeTransaction.locale = scope.optlang.code;
                jeTransaction.dateFormat = scope.df;
                jeTransaction.officeId = this.formData.officeId;
                // jeTransaction.transactionDate = reqDate;
                // jeTransaction.referenceNumber = this.formData.referenceNumber;
                jeTransaction.comments = this.formData.comments;
                // jeTransaction.currencyCode = this.formData.currencyCode;
                // jeTransaction.paymentTypeId = this.formData.paymentTypeId;
                jeTransaction.accountNumber = this.formData.accountNumber;
                jeTransaction.checkNumber = this.formData.checkNumber;
                jeTransaction.routingCode = this.formData.routingCode;
                jeTransaction.receiptNumber = this.formData.receiptNumber;
                jeTransaction.bankNumber = this.formData.bankNumber;

                //Construct credits array
                jeTransaction.credits = [];
                for (var i = 0; i < this.formData.crAccounts.length; i++) {
                    var temp = new Object();
                    temp.glAccountId = this.formData.crAccounts[i].crGlAccountId;
                    temp.amount = this.formData.crAccounts[i].crAmount;
                    jeTransaction.credits.push(temp);
                }

                //construct debits array
                jeTransaction.debits = [];
                for (var i = 0; i < this.formData.dbAccounts.length; i++) {
                    var temp = new Object();
                    temp.glAccountId = this.formData.dbAccounts[i].debitGlAccountId;
                    temp.amount = this.formData.dbAccounts[i].debitAmount;
                    jeTransaction.debits.push(temp);
                }

                resourceFactory.journalEntriesResource.save(jeTransaction, function (data) {
                    location.path('/viewtransactions/' + data.transactionId);
                });
            }
        }
    });
    mifosX.ng.application.controller('AddOpeningBalanceController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.AddOpeningBalanceController]).run(function ($log) {
        $log.info("AddOpeningBalanceController initialized");
    });
}(mifosX.controllers || {}));