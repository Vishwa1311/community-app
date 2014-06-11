(function (module) {
    mifosX.controllers = _.extend(module, {
        EditChargeController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.template = [];
            scope.showdatefield = false;
            scope.repeatEvery = false;
            scope.first = {};
            scope.flag = false;
            scope.showOrHideValue = "hide";
            scope.paymentTypeCharges = [];
            scope.paymentTypes = [];
            scope.paymentTypeOptions = [];
            scope.chargeCalculationTypeOptions = [];
            scope.showApplicableToAllProducts = false;
            resourceFactory.chargeResource.getCharge({chargeId: routeParams.id, template: true}, function (data) {
                scope.template = data;
                scope.paymentTypeCharges = data.paymentTypeCharges;
                scope.paymentTypeOptions = data.paymentTypeOptions;
                if (data.chargeAppliesTo.value === "Loan") {
                    scope.chargeTimeTypeOptions = data.loanChargeTimeTypeOptions;
                    scope.flag = false;
                    scope.showFrequencyOptions = true;
                    scope.chargeCalculationTypeOptions = scope.template.loanChargeCalculationTypeOptions;
                } else if (data.chargeAppliesTo.value === "Savings") {
                    scope.chargeTimeTypeOptions = data.savingsChargeTimeTypeOptions;
                    scope.flag = true;
                    scope.showFrequencyOptions = false;
                    scope.chargeCalculationTypeOptions = data.savingsChargeCalculationTypeOptions;
                }

                scope.formData = {
                    name: data.name,
                    active: data.active,
                    penalty: data.penalty,
                    currencyCode: data.currency.code,
                    chargeAppliesTo: data.chargeAppliesTo.id,
                    chargeTimeType: data.chargeTimeType.id,
                    chargeCalculationType: data.chargeCalculationType.id,
                    amount: data.amount,
                    applicableToAllProducts:data.applicableToAllProducts
                };

                if(data.feeFrequency){
                    scope.addfeefrequency = 'true';
                    scope.formData.feeFrequency = data.feeFrequency.id;
                    scope.formData.feeInterval = data.feeInterval;
                }

                //when chargeAppliesTo is savings, below logic is
                //to display 'Due date' field, if chargeTimeType is
                // 'annual fee' or 'monthly fee'
                if (scope.formData.chargeAppliesTo === 2) {
                    if (data.chargeTimeType.value === "Annual Fee" || data.chargeTimeType.value === "Monthly Fee") {
                        scope.showdatefield = true;
                        if (data.feeOnMonthDay) {
                            data.feeOnMonthDay.push(2013);
                            var actDate = dateFilter(data.feeOnMonthDay, 'dd MMMM');
                            scope.first.date = new Date(actDate);
                            //to display "Repeats Every" field ,if chargeTimeType is
                            // 'monthly fee'
                            if (data.chargeTimeType.value === "Monthly Fee") {
                                scope.repeatEvery = true;
                                scope.formData.feeInterval = data.feeInterval;
                            } else {
                                scope.repeatEvery = false;
                            }
                        }
                    } else {
                        scope.showdatefield = false;
                    }
                } else {
                    scope.formData.chargePaymentMode = data.chargePaymentMode.id;
                }
                if (data.chargeTimeType.value == "Withdrawal Fee" || data.chargeTimeType.value == "Deposit Fee") {
                    scope.showPaymentType = true;
                    scope.repeatEvery = false;
                }
                else {
                    scope.showPaymentType = false;
                }
                scope.populatePaymentTypes();
                scope.showOrHideApplicableToAllSavings();
            });

            scope.populatePaymentTypes = function () {

                _.each(scope.paymentTypeCharges, function (paymentTypeCharge) {
                    scope.paymentType =  paymentTypeCharge.paymentType.id;
                });

            }
            //when chargeAppliesTo is savings, below logic is
            //to display 'Due date' field, if chargeTimeType is
            // 'annual fee' or 'monthly fee'
            scope.chargeTimeChange = function (chargeTimeType) {
                if (scope.formData.chargeAppliesTo === 2) {
                    for (var i in scope.template.chargeTimeTypeOptions) {
                        if (chargeTimeType === scope.template.chargeTimeTypeOptions[i].id) {
                            if (scope.template.chargeTimeTypeOptions[i].value == "Annual Fee" || scope.template.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                scope.showdatefield = true;
                                //to show 'repeats every' field for monthly fee
                                if (scope.template.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                    scope.repeatEvery = true;
                                } else {
                                    scope.repeatEvery = false;
                                }
                            } else {
                                scope.showdatefield = false;
                            }
                            if (scope.template.chargeTimeTypeOptions[i].value == "Withdrawal Fee" || scope.template.chargeTimeTypeOptions[i].value == "Deposit Fee") {
                                scope.showPaymentType = true;
                                scope.repeatEvery = false;
                            }
                            else {
                                scope.showPaymentType = false;
                            }
                        }
                    }
                }
            };

            scope.showOrHideApplicableToAllSavings = function() {
                if (scope.formData.chargeAppliesTo === 2 && !(scope.paymentType === '' || _.isNull(scope.paymentType) || _.isUndefined(scope.paymentType))) {
                    scope.showApplicableToAllProducts = true;
                }
                else {
                    scope.showApplicableToAllProducts = false;
                    scope.formData.applicableToAllProducts = false;
                }
            };

            scope.submit = function () {
                if (scope.formData.chargeAppliesTo.value === 'Savings') {
                    if (scope.showdatefield === true) {
                        var reqDate = dateFilter(scope.first.date, 'dd MMMM');
                        this.formData.monthDayFormat = 'dd MMM';
                        this.formData.feeOnMonthDay = reqDate;
                    }
                    this.formData.paymentTypes = scope.paymentType;
                }else if(scope.addfeefrequency == 'false'){
                    scope.formData.feeFrequency = null;
                    scope.formData.feeInterval = null;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.active = this.formData.active || false;
                this.formData.applicableToAllProducts = this.formData.applicableToAllProducts || false;
                this.formData.penalty = this.formData.penalty || false;
                if (scope.formData.chargeAppliesTo === 2) {
                    if (!(scope.paymentType === '' || _.isNull(scope.paymentType) || _.isUndefined(scope.paymentType))) {
                        scope.paymentTypes = [];
                        scope.formData.paymentTypes = [];
                        scope.paymentTypes.push({
                            id: scope.paymentType,
                            chargeCalculationType: scope.formData.chargeCalculationType,
                            amount: scope.formData.amount,
                            locale: scope.formData.locale
                        });
                        this.formData.paymentTypes = scope.paymentTypes;
                    }
                }
                resourceFactory.chargeResource.update({chargeId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewcharge/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditChargeController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditChargeController]).run(function ($log) {
        $log.info("EditChargeController initialized");
    });
}(mifosX.controllers || {}));
