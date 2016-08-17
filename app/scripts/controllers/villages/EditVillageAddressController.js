/**
 * Created by jagadeeshakn on 8/12/2016.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        EditVillageAddressController: function (scope, routeParams, location, resourceFactory) {
            scope.addressId = routeParams.addressId;
            scope.villageId = routeParams.id;
            scope.countries = [];
            scope.states = [];
            scope.districts = [];
            scope.formData = {};
            scope.entityType="villages";

            resourceFactory.entityAddressResource.getAddress({entityType: scope.entityType, entityId: scope.villageId, addressId: scope.addressId}, function (data) {
                
                if(data.taluka){
                    scope.formData.taluka =  data.taluka;
                }
                if(data.postalCode){
                    scope.formData.postalCode =  data.postalCode;
                }
                if(data.districtData && data.districtData.districtId){
                    scope.formData.districtId =  data.districtData.districtId;
                }
                if(data.stateData && data.stateData.stateId){
                    scope.formData.stateId =  data.stateData.stateId;
                }
                if(data.countryData.countryId){
                    scope.formData.countryId =  data.countryData.countryId;
                }
            });



            resourceFactory.addressTemplateResource.get({},function (data) {
                scope.countries = data.countryDatas;
                scope.setDefaultGISConfig();
            });
            scope.setDefaultGISConfig = function () {
                if(scope.responseDefaultGisData && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address){
                    if(scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName) {

                        var countryName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.countryName;
                        scope.defaultCountry = _.filter(scope.countries, function (country) {
                            return country.countryName === countryName;

                        });
                        scope.formData.countryId = scope.defaultCountry[0].countryId;
                        scope.states = scope.defaultCountry[0].statesDatas;
                    }

                    if(scope.states && scope.states.length > 0 && scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName) {
                        var stateName = scope.responseDefaultGisData.uiDisplayConfigurations.defaultGISConfig.address.stateName;
                        scope.defaultState = _.filter(scope.states, function (state) {
                            return state.stateName === stateName;

                        });
                        scope.formData.stateId =  scope.defaultState[0].stateId;
                        scope.districts = scope.defaultState[0].districtDatas;
                    }
                }
            };

            scope.changeCountry = function (countryId) {
                if (countryId !=null) {
                    scope.selectCountry = _.filter(scope.countries, function (country) {
                        return country.countryId == countryId;
                    })
                    if(scope.formData.stateId){
                        delete scope.formData.stateId;
                    }
                    if(scope.formData.districtId){
                        delete scope.formData.districtId;
                    }
                    scope.states = scope.selectCountry[0].statesDatas;


                }
            }

            scope.changeState = function (stateId) {
                if (stateId != null) {
                    scope.selectState = _.filter(scope.states, function (state) {
                        return state.stateId == stateId;
                    })
                    if(scope.formData.districtId){
                        delete scope.formData.districtId;
                    }
                    scope.districts = scope.selectState[0].districtDatas;
                }
            }

            scope.submit = function () {

                scope.formData.entityId = scope.villageId;
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;
                scope.formData.addressId = scope.addressId;

                if (scope.formData.countryId == null || scope.formData.countryId == ""){
                    delete scope.formData.countryId;
                }
                if (scope.formData.stateId == null || scope.formData.stateId == ""){
                    delete scope.formData.stateId;
                }
                if (scope.formData.districtId == null || scope.formData.districtId == ""){
                    delete scope.formData.districtId;
                }

                resourceFactory.entityAddressResource.update({entityType:scope.entityType,entityId :scope.villageId,addressId :scope.addressId }, scope.formData, function (data) {

                    location.path('/viewvillage/' + scope.villageId);
                });
            };
        }

    });
    mifosX.ng.application.controller('EditVillageAddressController', ['$scope', '$routeParams', '$location', 'ResourceFactory',mifosX.controllers.EditVillageAddressController]).run(function ($log) {
        $log.info("EditVillageAddressController initialized");
    });
}(mifosX.controllers || {}));