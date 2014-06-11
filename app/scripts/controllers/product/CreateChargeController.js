(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateChargeController: function (scope, resourceFactory, location, dateFilter) {
            scope.template = [];
            scope.formData = {};
            scope.first = {};
            scope.isCollapsed = true;
            scope.showdatefield = false;
            scope.repeatEvery = false;
            scope.first.date = new Date();
            scope.showOrHideValue = "show";
            scope.paymentTypes = [];
            scope.paymentType= '';
            scope.showApplicableToAllProducts = false;
            scope.showPaymentType = false;

            resourceFactory.chargeTemplateResource.get(function (data) {
                scope.product = data;
                scope.template = data;
                scope.showChargePaymentByField = true;
                scope.chargeCalculationTypeOptions = data.chargeCalculationTypeOptions;
                scope.chargeTimeTypeOptions = data.chargeTimeTypeOptions;
                scope.paymentTypeOptions = data.paymentTypeOptions;
            });

            scope.chargeAppliesToSelected = function (chargeAppliesId) {
                if (chargeAppliesId == 1) {
                    scope.showChargePaymentByField = true;
                    scope.chargeCalculationTypeOptions = scope.template.loanChargeCalculationTypeOptions;
                    scope.chargeTimeTypeOptions = scope.template.loanChargeTimeTypeOptions;
                    scope.showFrequencyOptions = true;
                    scope.showApplicableToAllProducts = false;
                } else {
                    scope.showChargePaymentByField = false;
                    scope.chargeCalculationTypeOptions = scope.template.savingsChargeCalculationTypeOptions;
                    scope.chargeTimeTypeOptions = scope.template.savingsChargeTimeTypeOptions;
                    scope.showFrequencyOptions = false;
                    scope.addfeefrequency = false;
                }
            }
            //when chargeAppliesTo is savings, below logic is
            //to display 'Due date' field, if chargeTimeType is
            //'annual fee' or 'monthly fee'
            scope.chargeTimeChange = function (chargeTimeType) {
                if (scope.showChargePaymentByField === false) {
                    for (var i in scope.chargeTimeTypeOptions) {
                        if (chargeTimeType === scope.chargeTimeTypeOptions[i].id) {
                            if (scope.chargeTimeTypeOptions[i].value == "Annual Fee" || scope.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                scope.showdatefield = true;
                                //to show 'repeats every' field for monthly fee
                                if (scope.chargeTimeTypeOptions[i].value == "Monthly Fee") {
                                    scope.repeatEvery = true;
                                } else {
                                    scope.repeatEvery = false;
                                }
                            } else {
                                scope.showdatefield = false;
                            }
                            if (scope.chargeTimeTypeOptions[i].value == "Withdrawal Fee" || scope.chargeTimeTypeOptions[i].value == "Deposit Fee") {
                                scope.showPaymentType = true;
                                scope.repeatEvery = false;
                            }
                            else {
                                scope.showPaymentType = false;
                            }
                        }
                    }
                }
            }

            scope.showOrHideApplicableToAllSavings = function() {
                if (scope.formData.chargeAppliesTo === 2 && !(scope.paymentType === '' || _.isNull(scope.paymentType) || _.isUndefined(scope.paymentType))) {
                        scope.showApplicableToAllProducts = true;
                    }
                else {
                    scope.showApplicableToAllProducts = false;
                }
            }

            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };

            scope.submit = function () {
                //when chargeTimeType is 'annual' or 'monthly fee' then feeOnMonthDay added to
                //the formData
                if (scope.showChargePaymentByField === false) {
                    if (scope.showdatefield === true) {
                        var reqDate = dateFilter(scope.first.date, 'dd MMMM');
                        this.formData.monthDayFormat = 'dd MMM';
                        this.formData.feeOnMonthDay = reqDate;
                    }
                }

                if(scope.formData.chargeAppliesTo === 1 && scope.addfeefrequency == 'false'){
                    scope.formData.feeFrequency = null;
                    scope.formData.feeInterval = null;
                }

                if (!scope.showChargePaymentByField) {
                    delete this.formData.chargePaymentMode;
                }
                this.formData.active = this.formData.active || false;
                this.formData.locale = scope.optlang.code;
                this.formData.monthDayFormat = 'dd MMM';
                delete scope.formData.paymentTypes;

                if (scope.formData.chargeAppliesTo === 2 && (scope.formData.chargeTimeType === 5 || scope.formData.chargeTimeType === 11)) {
                    if (!(scope.paymentType === '' || _.isNull(scope.paymentType) || _.isUndefined(scope.paymentType))) {
                        scope.paymentTypes = [];
                        scope.formData.paymentTypes = [];
                        scope.paymentTypes.push({
                            id: scope.paymentType,
                            chargeCalculationType: scope.formData.chargeCalculationType,
                            amount: scope.formData.amount
                        });
                        this.formData.paymentTypes = scope.paymentTypes;
                    }
                }
                resourceFactory.chargeResource.save(this.formData, function (data) {
                    location.path('/viewcharge/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateChargeController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateChargeController]).run(function ($log) {
        $log.info("CreateChargeController initialized");
    });
}(mifosX.controllers || {}));
