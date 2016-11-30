(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateGroupController: function (scope, resourceFactory, location, dateFilter, routeParams, WizardHandler) {
            scope.offices = [];
            scope.staffs = [];
            scope.data = {};
            scope.choice = 0;
            scope.first = {};
            scope.first.submitondate = new Date();
            scope.first.date = new Date();
            scope.restrictDate = new Date();
            scope.addedClients = [];
            scope.available = [];
            scope.added = [];
            scope.formData = {};
            scope.formDat = {};
            scope.formData.clientMembers = [];
            scope.forceOffice = null;
            scope.datatables = [];
            scope.noOfTabs = 1;
            scope.step = '-';
            scope.datatable = {registeredTableName: '', data: {locale:scope.optlang.code, dateFormat: scope.df}};
            scope.formData.datatables = [];
            scope.formDat.datatables = [];
            scope.tf = "HH:mm";

            var requestParams = {orderBy: 'name', sortOrder: 'ASC', staffInSelectedOfficeOnly: true};
            if (routeParams.centerId) {
                requestParams.centerId = routeParams.centerId;
            }
            resourceFactory.groupTemplateResource.get(requestParams, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.clients = data.clientOptions;

                scope.datatables = data.datatables;
                scope.noOfTabs = 1;
                if (!_.isUndefined(scope.datatables) && scope.datatables.length > 0) {
                    scope.noOfTabs += scope.datatables.length;
                    angular.forEach(scope.datatables, function (datatable, index) {
                        scope.colHeaders = datatable.columnHeaderData;
                        scope.formData.datatables[index] = {
                            registeredTableName: datatable.registeredTableName,
                            data: {locale: scope.optlang.code}
                        };
                        angular.forEach(datatable.columnHeaderData, function (colHeader, i) {
                            var colName = datatable.columnHeaderData[0].columnName;
                            if (colName == 'id') {
                                datatable.columnHeaderData.splice(0, 1);
                            }

                            colName = datatable.columnHeaderData[0].columnName;
                            if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                                datatable.columnHeaderData.splice(0, 1);
                            }

                            if (_.isEmpty(scope.formDat.datatables[index])) {
                                scope.formDat.datatables[index] = {data: {}};
                            }

                            if (datatable.columnHeaderData[i].columnDisplayType == 'DATETIME') {
                                scope.formDat.datatables[index].data[datatable.columnHeaderData[i].columnName] = {};
                            }
                        });
                    });
                }

                if(routeParams.officeId) {
                    scope.formData.officeId = routeParams.officeId;
                    for(var i in data.officeOptions) {
                        if(data.officeOptions[i].id == routeParams.officeId) {
                            scope.forceOffice = data.officeOptions[i];
                            break;
                        }
                    }
                }
                if(routeParams.groupId) {
                    if(typeof data.staffId !== "undefined") {
                        scope.formData.staffId = data.staffId;
                    }
                }

            });

            scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.add = function () {
            	if(scope.available != ""){
            		var temp = {};
                    temp.id = scope.available.id;
                    temp.displayName = scope.available.displayName;
                	scope.addedClients.push(temp);
            	}
            };
            scope.sub = function (id) {
            	for (var i = 0; i < scope.addedClients.length; i++) {
                    if (scope.addedClients[i].id == id) {
                        scope.addedClients.splice(i, 1);
                        break;
                    }
                }
            };
            scope.changeOffice = function (officeId) {
                scope.addedClients = [];
                scope.available = [];
                resourceFactory.groupTemplateResource.get({staffInSelectedOfficeOnly: false, officeId: officeId,staffInSelectedOfficeOnly:true
                }, function (data) {
                    scope.staffs = data.staffOptions;
                });
                resourceFactory.groupTemplateResource.get({officeId: officeId}, function (data) {
                    scope.clients = data.clientOptions;
                });
            };
            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };

            if(routeParams.centerId) {
            	scope.cancel = '#/viewcenter/' + routeParams.centerId
            	scope.centerid = routeParams.centerId;
        	}else {
        		scope.cancel = "#/groups"
        	}

            //return input type
            scope.fieldType = function (type) {
                var fieldType = "";
                if (type) {
                    if (type == 'CODELOOKUP' || type == 'CODEVALUE') {
                        fieldType = 'SELECT';
                    } else if (type == 'DATE') {
                        fieldType = 'DATE';
                    } else if (type == 'DATETIME') {
                        fieldType = 'DATETIME';
                    } else if (type == 'BOOLEAN') {
                        fieldType = 'BOOLEAN';
                    } else {
                        fieldType = 'TEXT';
                    }
                }
                return fieldType;
            };

            scope.submit = function () {
                if (WizardHandler.wizard().getCurrentStep() != scope.noOfTabs) {
                    WizardHandler.wizard().next();
                    return;
                }
                for (var i in scope.addedClients) {
                    scope.formData.clientMembers[i] = scope.addedClients[i].id;
                }
                if (this.formData.active) {
                    var reqDate = dateFilter(scope.first.date, scope.df);
                    this.formData.activationDate = reqDate;
                }
                if (routeParams.centerId) {
                    this.formData.centerId = routeParams.centerId;
                }
                if (routeParams.officeId) {
                    this.formData.officeId = routeParams.officeId;
                }
                if (scope.first.submitondate) {
                    reqDat = dateFilter(scope.first.submitondate, scope.df);
                    this.formData.submittedOnDate = reqDat;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.active = this.formData.active || false;
                if (!_.isUndefined(scope.datatables) && scope.datatables.length > 0) {
                    angular.forEach(scope.datatables, function (datatable, index) {
                        scope.columnHeaders = datatable.columnHeaderData;
                        angular.forEach(scope.columnHeaders, function (colHeader, i) {
                            scope.dateFormat = scope.df + " " + scope.tf
                            if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                                if (!_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName])) {
                                    scope.formData.datatables[index].data[scope.columnHeaders[i].columnName] = dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName],
                                        scope.dateFormat);
                                    scope.formData.datatables[index].data.dateFormat = scope.dateFormat;
                                }
                            } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                                if (!_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].date) && !_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].time)) {
                                    scope.formData.datatables[index].data[scope.columnHeaders[i].columnName] = dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].date, scope.df)
                                        + " " + dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].time, scope.tf);
                                    scope.formData.datatables[index].data.dateFormat = scope.dateFormat;
                                }
                            }
                        });
                    });
                } else {
                    delete scope.formData.datatables;
                }
                resourceFactory.groupResource.save(this.formData, function (data) {
                    location.path('/viewgroup/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateGroupController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', 'WizardHandler', mifosX.controllers.CreateGroupController]).run(function ($log) {
        $log.info("CreateGroupController initialized");
    });
}(mifosX.controllers || {}));
