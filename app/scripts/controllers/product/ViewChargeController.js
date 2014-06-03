(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewChargeController: function (scope, routeParams, resourceFactory, location, $modal) {
            scope.charge = [];
            scope.choice = 0;
            scope.paymentTypeCharges = [];
            scope.paymentTypes = [];
            scope.paymentTypeOptions = [];
            scope.chargeCalculationTypeOptions = [];
            resourceFactory.chargeResource.get({chargeId: routeParams.id}, function (data) {
                scope.charge = data;
            });

            resourceFactory.chargeResource.getCharge({chargeId: routeParams.id, template: true}, function (data) {
                scope.template = data;
                scope.paymentTypeCharges = data.paymentTypeCharges;
                scope.paymentTypeOptions = data.paymentTypeOptions;
                scope.chargeCalculationType = data.chargeCalculationType;
                scope.chargeCalculationTypeOptions = data.savingsChargeCalculationTypeOptions;
                scope.populatePaymentTypes = function () {
                    _.each(scope.paymentTypeCharges, function (paymentTypeCharge) {
                        scope.paymentTypes.push({
                            id: paymentTypeCharge.paymentTypeId,
                            chargeCalculationType: paymentTypeCharge.chargeCalculationType.value,
                            amount: paymentTypeCharge.amount
                        });
                    });
                }
                scope.populatePaymentTypes();
            });

            scope.deleteCharge = function () {
                $modal.open({
                    templateUrl: 'deletech.html',
                    controller: ChDeleteCtrl
                });
            };
            var ChDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.chargeResource.delete({chargeId: routeParams.id}, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/charges');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }
    });
    mifosX.ng.application.controller('ViewChargeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewChargeController]).run(function ($log) {
        $log.info("ViewChargeController initialized");
    });
}(mifosX.controllers || {}));
