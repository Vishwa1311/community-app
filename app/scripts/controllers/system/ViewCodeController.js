(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCodeController: function (scope, routeParams, resourceFactory, location, $modal, route) {
            scope.codevalues = [];
            scope.formData = [];
            scope.newcode = {};
            scope.codename = {};
            resourceFactory.codeResources.get({codeId: routeParams.id}, function (data) {
                scope.code = data;
                scope.codename.name = data.name;
            });
            resourceFactory.codeValueResource.getAllCodeValues({codeId: routeParams.id}, function (data) {
                scope.codevalues = data;
            });

            scope.delCode = function () {
                $modal.open({
                    templateUrl: 'deletecode.html',
                    controller: CodeDeleteCtrl
                });
            };
            scope.showEdit = function (id, name, position, cv) {
                scope.formData[id] = {
                    name: name,
                    position: position

                }
                cv.edit = !cv.edit;
            };
            scope.editCodeValue = function (id, cv) {
                resourceFactory.codeValueResource.update({codeId: routeParams.id, codevalueId: id}, this.formData[id], function (data) {
                    cv.edit = !cv.edit;
                    route.reload();
                });
            };
            scope.showEditCode = function () {
                scope.newcode.edit = !scope.newcode.edit;
                scope.codename.name = scope.code.name;
            };
            scope.updateCode = function () {
                resourceFactory.codeResources.update({codeId: routeParams.id}, this.codename, function (data) {
                    route.reload();
                });
            }
            var CodeDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.codeResources.delete({codeId: routeParams.id}, {}, function (data) {
                        location.path('/codes');
                    });
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            var EditCodeValueCtrl = function ($scope, $modalInstance, cid) {
                $scope.edit = function () {

                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.deleteCodeValue = function (id) {
                $modal.open({
                    templateUrl: 'deletecodevalue.html',
                    controller: CodeValueDeleteCtrl,
                    resolve: {
                        cvid: function () {
                            return id;
                        }
                    }
                });
            };
            var CodeValueDeleteCtrl = function ($scope, $modalInstance, cvid) {
                $scope.delete = function () {
                    resourceFactory.codeValueResource.delete({codeId: routeParams.id, codevalueId: cvid}, {}, function (data) {
                        route.reload();
                    });
                    $modalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('ViewCodeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.ViewCodeController]).run(function ($log) {
        $log.info("ViewCodeController initialized");
    });
}(mifosX.controllers || {}));
