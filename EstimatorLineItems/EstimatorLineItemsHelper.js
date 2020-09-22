({  
    //Maintain global variables
    global:{
        loaderStat: true,
        searchMode: '',
        keys: ['Id', 'Status__c', 'Comments__c', 'Funnel_Stage__c','Competitor__c','Comp_Part_Number__c','Comp_Price__c', 'Device_Family_Sub_Category__c', 'Product_Family__c', 'Catalog_Part_Number__c', 'Target_Price__c', 'QTY_Board__c']
    },

    //Contains initialization actions
    doInit: function(component, event, helper){
        //Identify desktop OR mobile device
        let isMobileMode = $A.get("$Browser.isTablet") || $A.get("$Browser.isPhone");
        component.set("v.isMobileMode", isMobileMode);

        var estimatorInstance = component.get('v.EstimatorInstance'), estimatorInstanceCopy = {};
        if(estimatorInstance.Id){
            var keys = helper.global.keys;
            for(var i=0;i<keys.length;i++){
                estimatorInstanceCopy[keys[i]] =  estimatorInstance[keys[i]];
            }
            component.set('v.EstimatorInstanceCopy', estimatorInstanceCopy);
        }
        //helper.getStatusPicklistValues(component, event, helper);
        //helper.getFunnelStagePicklistValues(component, event, helper);        
        //helper.getCompetitorValues(component, event, helper); 
        helper.checkForQuoteOption(component);   
    },

    //Compares new estimator line item field values to old values
    compareForEstimatorChange: function(component){
        var isChanged = false;
        if(component.get('v.toQuote')){
            var oldVal = component.get('v.EstimatorInstanceCopy');
            var newVal = component.get('v.EstimatorInstance');
            //Get project Id 
            var projectId = component.get("v.projectId");
            //Get current line item index
            var index = component.get("v.Index"); 
            var estimator = component.get("v.EstimatorInstance");       
            var Family = estimator.Device_Family_Sub_Category__c;
            var BasePart = estimator.Product_Family__c;
            var Catalogpart = estimator.Catalog_Part_Number__c; 
            newVal['Device_Family_Sub_Category__c'] = Family;//document.getElementById("deviceFamilySubValues" + index + projectId).value;
            newVal['Product_Family__c'] = BasePart;//document.getElementById("productFamilyValue" + index + projectId).value;
            newVal['Catalog_Part_Number__c'] =Catalogpart;// document.getElementById("productNameValues" + index + projectId).value;

            if(oldVal && oldVal.hasOwnProperty('Id') && oldVal.Id){
                var keys = this.global.keys;
                for(var i=0;i<keys.length;i++){
                    if((!oldVal[keys[i]] && newVal[keys[i]])|| (oldVal[keys[i]] && !newVal[keys[i]]) || (oldVal[keys[i]] && newVal[keys[i]] && oldVal[keys[i]] != newVal[keys[i]])){
                        isChanged = true;
                        break;
                    }
                }
            }
        }
        component.set('v.isEstimatorValChanged', isChanged);
    },

    //This method used to get the status picklist values from the estimators.
    getStatusPicklistValues : function(component, event, helper, elementId) {        
        var optionList = [];        
        var action = component.get("c.getFetchPicklistValues");        
        action.setParams({
            "objectName": component.get("v.picklistEstimator"),
            "fieldName": 'Status__c',
            'nullRequired': false,
			'isSortRequired' : true
        });       
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {                 
                var allValues = response.getReturnValue();                
                if (allValues != undefined && allValues.length > 0) {
                   /*optionList.push({
                        class: "optionClass",
                        label: "--- None ---",
                        value: ""
                    });*/
                    optionList.push('--- None ---');
                }
                for (var i = 0; i < allValues.length; i++) {
                    /*optionList.push({
                        class: "optionClass",
                        label: allValues[i],
                        value: allValues[i]
                    });*/
                    optionList.push(allValues[i]);
                }               
                //var Status = component.find('Status');        
                //Status.set("v.options", optionList); 
                component.set("v.clientStatusPicklistVal", optionList);
                //this.getCompetitorValues(component, event, helper);
            }
        });
        $A.enqueueAction(action);
    },
    
    //This method used to get the status picklist values from the estimators.
    getFunnelStagePicklistValues : function(component, event, helper, elementId) {        
        var optionList = [];        
        var action = component.get("c.getFetchPicklistValues");        
        action.setParams({
            "objectName": component.get("v.picklistEstimator"),
            "fieldName": 'Funnel_Stage__c',
            'nullRequired': false,
			'isSortRequired' : false
        });      
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {                 
                var allValues = response.getReturnValue();                
                if (allValues != undefined && allValues.length > 0) {
                    /*optionList.push({
                        class: "optionClass",
                        label: "--- None ---",
                        value: ""
                    });*/
                    optionList.push("--- None ---");
                }
                for (var i = 0; i < allValues.length; i++) {
                    /*optionList.push({
                        class: "optionClass",
                        label: allValues[i],
                        value: allValues[i]
                    });*/
                    optionList.push(allValues[i]);
                }                
                //var FunnelStage = component.find('FunnelStage');        
                //FunnelStage.set("v.options", optionList); 
                component.set("v.funnelStagePicklistVal", optionList)
            }
        });
        $A.enqueueAction(action);
    },
    
    //Fetch products from salesforce based on the keywords(CPN, Basepart, ProductFamily)
    fetchProducts: function(component, keyword1, keyword2, keyword3, StartValue, mode){            
        var action = component.get("c.getProducts");         
        action.setParams({            
            'Family': keyword1,
            'Basepart': keyword2,
            'Catalogpart': keyword3,
            'StartValue' : StartValue,
            'mode':mode
        });
        var _this = this;
        
        action.setCallback(this, function(response) {           
            var state = response.getState();             
            if (state === "SUCCESS") {
                var products = component.get("v.EstimatorsProductListHandler");
                var storeResponse = response.getReturnValue();
                var loading = component.find("loading"); 
                
                if(StartValue > 0 && products.length > 0 && storeResponse.length > 0){
                    component.set("v.EstimatorsProductListHandler", products.concat(storeResponse)); 
                } else if(storeResponse.length > 0) {
                    component.set("v.EstimatorsProductListHandler", storeResponse);                    
                }else if(StartValue == 0 && storeResponse.length == 0){
                    component.set("v.EstimatorsProductListHandler", []);  
                    _this.global.loaderStat = false;
                }else{
                    _this.global.loaderStat = false;
                }                   
                $A.util.addClass(loading, 'slds-hide');                           
            }  else {
                var loading = component.find("loading");
                $A.util.addClass(loading, 'slds-hide');
            }
            var loading = component.find("loading");
            $A.util.addClass(loading, 'slds-hide');
            
        });
        
        if(_this.global.loaderStat){
            $A.enqueueAction(action);
        }
        else{
            var loading = component.find("loading");
            $A.util.addClass(loading, 'slds-hide');
        }
    },
   
    //Expand additional details row
    setItemExpand : function(component) {        
        component.set("v.CollapseLineItem_child",true);
        component.set("v.IconNameChild",'utility:chevronup');
        component.set("v.toggleClass", 'toggleClass');
        
        // Also auto-open in mobile
        component.set('v.h4mIconToggle', 'utility:chevronup');
        component.set('v.rowClass', 'slds-show');
    },
    
    //Close additional details row
    setItemClose : function(component) {
        component.set("v.CollapseLineItem_child",false);
        component.set("v.IconNameChild",'utility:chevrondown');
        component.set("v.toggleClass", '');
    },

    //This method used for searching product
    showProducts: function(component, event, helper, label){ 
        //Allow to search
        helper.global.loaderStat = true;
        //Reset limit
        var limit = 0; 
        component.set("v.offset", limit); 
        //Get project Id 
        var projectId = component.get("v.projectId");
        //Get current line item index
        var index = component.get("v.Index"); 
        //Get estimator instance
        var estimator = component.get("v.EstimatorInstance");       
        var Family = estimator.Device_Family_Sub_Category__c;
        var BasePart = estimator.Product_Family__c;
        var Catalogpart = estimator.Catalog_Part_Number__c; 

        //Get search keywords
        component.set("v.SearchKeyWord1", Family);//document.getElementById("deviceFamilySubValues" + index + projectId).value);
        component.set("v.SearchKeyWord2", BasePart); //document.getElementById("productFamilyValue" + index + projectId).value);
        component.set("v.SearchKeyWord3", Catalogpart); //document.getElementById("productNameValues" + index + projectId).value);
        //Clear product list
        component.set("v.EstimatorsProductListHandler", []);  
        
        if(label == 'family'){
            component.set("v.SearchKeyWord1", Family);//document.getElementById("deviceFamilySubValues" + index + projectId).value);
            
            if((BasePart == '' || BasePart == undefined) && (Catalogpart == '' || Catalogpart == undefined)){
                //alert('test search 1');
                helper.global.searchMode = 'FAMILY';
                helper.configSearchPopup(component, helper, "", "slds-hide", "slds-hide", "container-size1", "family", "slds-hide");
                helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, 'FAMILY');
            }
            
            else if((Catalogpart !== undefined && Catalogpart !== '')){
                helper.global.searchMode = 'CPN';
                helper.configSearchPopup(component, helper, "", "", "", "container-size2", "base-family", "slds-hide");
                helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, 'CPN');
            }
            else if((BasePart != '' && BasePart != undefined)){
                //alert('test search 2');
                helper.global.searchMode = 'BASEPART';
                helper.configSearchPopup(component, helper, "", "", "slds-hide", "container-size2", "base-family", "");               
                helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, 'BASEPART');
            }
            
        }
        else if(label == 'basepart'){
            component.set("v.SearchKeyWord2", BasePart); //document.getElementById("productFamilyValue" + index + projectId).value);
            if((Family == '' || Family == undefined) && (Catalogpart == '' || Catalogpart == undefined)){
                helper.global.searchMode = 'BASEPART';
                helper.configSearchPopup(component, helper, "", "", "slds-hide", "container-size1", "basepart", "");
                helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, 'BASEPART');
            }
            
            if((Family != '' && Family != undefined) && (Catalogpart == '' || Catalogpart == undefined)){
                helper.global.searchMode = 'BASEPART';
                helper.configSearchPopup(component, helper, "", "", "slds-hide", 'container-size2', "base-family", "");                
                helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, 'BASEPART');
            }
            if((Catalogpart !== undefined && Catalogpart !== '')){
                helper.global.searchMode = 'CPN';
                helper.configSearchPopup(component, helper, "", "", "", "container-size2", "base-family", "slds-hide");                
                helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, 'CPN');
            }
        }
        else if(label == 'catalogpart'){
            component.set("v.SearchKeyWord3", Catalogpart);//document.getElementById("productNameValues" + index + projectId).value);
            helper.global.searchMode = 'CPN';
            helper.configSearchPopup(component, helper, "", "", "", "container-size3", "catalogpart", "slds-hide");
            helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, 'CPN');
        }
        component.set("v.ShowProducts",true);
    },

    //Configure the search popup view
    configSearchPopup: function(component, helper, familycolumn, basepartcolumn, catalogpartcolumn, container, selectedLabel, basepartonlyCol){
        //initializeProductTable - Lightning Datatable for Desktop
        //Set column configuration
        var isMobileMode = component.get("v.isMobileMode");
        if(!isMobileMode)
            helper.initializeProductTable(component, helper.global.searchMode);
        
        component.set("v.ShowProducts",true);
        component.set("v.familycolumn",familycolumn);
        component.set("v.basepartcolumn", basepartcolumn);
        component.set("v.catalogpartcolumn", catalogpartcolumn);
        component.set("v.container", container);
        component.set("v.selectedLabel", selectedLabel); 
        component.set("v.basepartonlycolumn", basepartonlyCol);

    },

    //Check whether the select product has Can_Project flag equal to TRUE
    checkCanProjectProduct : function(component, event, helper, catalogPartNumber) {
        
        var action = component.get("c.checkCanProject");
        action.setParams({
            'Catalogpart': catalogPartNumber,
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS"){
                var returnValue = response.getReturnValue();
                if(returnValue.length == 0){
                    component.find('addToEstimator').set('v.disabled', false);
                    component.set("v.canProject", false);
                }
                if(returnValue.length > 0){
                    component.find('addToEstimator').set('v.disabled', true);
                    component.set("v.canProject", true);
                    component.set("v.canProjectProducts", 'Invalid part. The product cannot be added to the Estimator');
                }
            }
            
        });
        $A.enqueueAction(action);        
    },
    
    //This method used to get the status picklist values from the estimators.
    getCompetitorValues : function(component, event, helper) {        
        var optionList = [];        
        var action = component.get("c.getFetchPicklistValues");        
        action.setParams({
            "objectName": component.get("v.picklistEstimator"),
            "fieldName": 'Competitor__c',
            'nullRequired': false,
			'isSortRequired' : true
        });       
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {                 
                var allValues = response.getReturnValue();                
                if (allValues != undefined && allValues.length > 0) {
                    optionList.push({
                        class: "optionClass",
                        label: "--- None ---",
                        value: ""
                    });
                }
                for (var i = 0; i < allValues.length; i++) {
                    optionList.push({
                        class: "optionClass",
                        label: allValues[i],
                        value: allValues[i]
                    });
                }
                
                component.set("v.competitorOptions", optionList); 
            }
        });
        $A.enqueueAction(action);
    },

    //This method used to get the status picklist values from the estimators.
    populateDeviceFamily : function(component, event, helper, productFamily) { 
        var estimator = component.get("v.EstimatorInstance");
        var index = component.get("v.Index");
        var projectId = component.get("v.projectId");

        var action = component.get("c.populateDeviceFamily");
        action.setParams({
            'Family': productFamily,
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS"){
                //document.getElementById("deviceFamilySubValues" + index + projectId).value = response.getReturnValue();
                estimator.Device_Family_Sub_Category__c = response.getReturnValue();
                component.set("v.EstimatorInstance", estimator);
                if(response.getReturnValue() == false){
                    component.set("v.userPermission",true);                    
                }
                else{
                    component.set("v.userPermission", false);
                }
            }   
        });
        $A.enqueueAction(action); 
    },

    //Check whether the select product has Can_Estimate flag equal to TRUE
    validateCanEstimate: function(component){
        var projectId = component.get("v.projectId");
        var index = component.get("v.Index"); 
        var estimator = component.get("v.EstimatorInstance");
        var cpnVal = estimator.Catalog_Part_Number__c;//document.getElementById("productNameValues" + index + projectId).value;
        
        if(cpnVal){
            var action = component.get("c.validateCanEstimate");
            action.setParams({
                'CPN':  cpnVal
            });
            
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS"){
                var isValid = response.getReturnValue();
                var estimatorVal = component.get('v.EstimatorInstance');
                estimatorVal.isValidToQuote = isValid;
                estimatorVal.toUpdateCPN = true;
                component.set('v.EstimatorInstance', estimatorVal);
                }   
            });
            $A.enqueueAction(action);
        }
    },
    
    //Get product family
    getProductNature: function(component){
        var projectId = component.get("v.projectId");
        var index = component.get("v.Index"); 
        var estimator = component.get("v.EstimatorInstance");
        var cpnVal = estimator.Catalog_Part_Number__c;
        //var cpnVal = document.getElementById("productNameValues" + index + projectId).value;
        var estimatorVal = component.get('v.EstimatorInstance');
        
        if(cpnVal){
            var action = component.get("c.getProductNature");
            action.setParams({
                'CPN':  cpnVal
            });
            
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS"){
                    var productValue = response.getReturnValue();
                    
                    if(productValue && productValue.length > 0)
                        estimatorVal.Product_Nature__c = productValue[0].Product_Nature__c;
                    component.set('v.EstimatorInstance', estimatorVal);
                    component.getEvent("EstimatorItemChange").fire();
                }   
            });
            $A.enqueueAction(action);
        }else{
            estimatorVal.Product_Nature__c = '';
            component.set('v.EstimatorInstance', estimatorVal);
            component.getEvent("EstimatorItemChange").fire();
        }
    },
    //Check whether the selected CPN is eligible for quoting process
    checkForQuoteOption: function(component){
        var estimatorVal = component.get('v.EstimatorInstance'),
        disableQuote = false;

        var projectId = component.get("v.projectId");
        var index = component.get("v.Index"); 
        var estimator = component.get("v.EstimatorInstance");
        var cpnVal = estimator.Catalog_Part_Number__c;
        
        if(estimatorVal){
            if(estimatorVal.toUpdateCPN  && cpnVal){
                estimatorVal['Catalog_Part_Number__c'] = cpnVal;
            }

            var statusCriteria = !estimatorVal.Status__c || estimatorVal.Status__c == 'Rejected',
            funnelCriteria = estimatorVal.Funnel_Stage__c == 'Closed Lost';

            if(estimatorVal.Id){
                var oldVal = component.get('v.EstimatorInstanceCopy');
                var cpnCriteria  = !estimatorVal.Catalog_Part_Number__c || !estimatorVal.Part_Number__c || !estimatorVal.Part_Number__r.Can_Estimate__c || !estimatorVal.List_Price__c;
                var cpnChangedCriteria = estimatorVal.Catalog_Part_Number__c && estimatorVal.Catalog_Part_Number__c != oldVal.Catalog_Part_Number__c;

                if(statusCriteria || funnelCriteria)
                    disableQuote = true;
                else if(cpnChangedCriteria)
                    disableQuote = !estimatorVal.isValidToQuote;
                else if(cpnCriteria)
                    disableQuote = true;

            }else{
                var cpnCriteria  = !estimatorVal.Catalog_Part_Number__c || !estimatorVal.isValidToQuote;
                if(cpnCriteria || statusCriteria || funnelCriteria)
                    disableQuote = true;
            }
        }
        
        component.set('v.disableToQuote', disableQuote);
        if(disableQuote)
            component.set('v.toQuote', false);
    },

    //Initial product lightning datatable
    initializeProductTable: function(component, label){
        var _this = this;
        component.set('v.columns', _this.getColumnDefinitions(component,label));
    },

    //Get column configuration for product lightning datatable
    getColumnDefinitions: function (component,label) {
        var columns = [];
        if(label == 'CPN'){
            columns = [
                {label: 'Product Family', fieldName: 'DeviceFamilySubCategory', type: 'text', sortable: false, initialWidth:150},
                {label: 'Base Part', fieldName: 'Family', type: 'text', sortable: false, initialWidth:125},
                {label: 'Catalog Part Number', fieldName: 'Name', type: 'text', sortable: false, initialWidth:220},
                {label: 'RSMMIN', fieldName: 'RsmMin', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'DC', fieldName: 'DC', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},                
                {label: 'X1_4', fieldName: 'X1_4', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'X5_9', fieldName: 'X5_9', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},                
                {label: 'X10_24', fieldName: 'X10_24', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'X25_49', fieldName: 'X25_49', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'X50_99', fieldName: 'X50_99', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'X100_249', fieldName: 'X100_249', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'X250_499', fieldName: 'X250_499', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'X500_999', fieldName: 'X500_999', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},                
                {label: 'X1k_4999', fieldName: 'X1k_4999', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'X5k_9999', fieldName: 'X5k_9999', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'X10k_UP', fieldName: 'X10k_UP', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false}
            ];
			 component.set('v.keyFieldValue', 'Id');
        }
        else if(label == 'BASEPART'){
            columns = [
                {label: 'Product Family', fieldName: 'DeviceFamilySubCategory', type: 'text', sortable: false, initialWidth:250},
                {label: 'Base Part', fieldName: 'Family', type: 'text', sortable: false, initialWidth:250},
                {label: 'Device Family Max', fieldName: 'DeviceFamilyMax', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false},
                {label: 'Device Family Min', fieldName: 'DeviceFamilyMin', type: 'number', cellAttributes: { alignment: 'left' }, typeAttributes: {maximumFractionDigits: 3}, sortable: false}
            ];
			component.set('v.keyFieldValue', 'Id');
        }
        else if(label == 'FAMILY'){
            columns = [
                {label: 'Product Family', fieldName: 'DeviceFamilySubCategory', type: 'text', sortable: false}                        
            ];
			component.set('v.keyFieldValue', 'DeviceFamilySubCategory');
        }

        return columns;
    },

})