({  
    //Contains initialization actions
    doInit : function(component, event, helper) {
        
        //This method used to get the Status picklist values from the estimator.
        //helper.validateListprice(component, event, helper);
        //helper.validateUserPermission(component, event, helper);
        //This method used to get the Funnel Stage picklist values from the project.
        helper.doInit(component, event, helper);
           
    },

    //Expand additional details row
    ItemExpand : function(component,event, helper) {
        helper.setItemExpand(component);
    },

    //Close additional details row
    ItemClose : function(component,event, helper){
        helper.setItemClose(component);
        
        if($A.get("$Browser.isPhone")) {
            component.set('v.h4mIconToggle', 'utility:chevrondown');
            component.set('v.rowClass', '');
        }
    },

    //Toggle additional details row
    toggle: function(component, event, helper){
        //This method used to get the Competitor picklist values from the project.
        var selected = component.get("v.CollapseLineItem_child");
        if(selected) {
            helper.setItemClose(component);
        } else{
            helper.setItemExpand(component);
        }
    },

    //Load more products on scroll of the product table 
    onScroll: function(component, event, helper){  
        var isMobileMode = component.get("v.isMobileMode");
        if(isMobileMode){
            var projectId = component.get("v.projectId");     
            var element = document.getElementById('resultScroll' + projectId); 
            var limit = component.get("v.offset"); 
            if(element.scrollTop){
                var loading = component.find("loading");     
            }
            if(element.scrollTop){
                if (element.scrollHeight - element.scrollTop <= element.clientHeight && helper.global.loaderStat)
                {           
                    limit = limit + parseInt($A.get("$Label.c.EstimatorSearchQueryLimit"));
                    component.set("v.offset", limit);
                    helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, helper.global.searchMode);                    
                    $A.util.removeClass(loading, 'slds-hide');
                }   
            }
        }
    },

    //Show validation error messages
    showErrorMessage: function(component, event, helper){ 
        var EstimatorInstance = component.get("v.EstimatorInstance");
        var index = component.get("v.Index");
        var QTY = EstimatorInstance.QTY_Board__c;
        var TargetPrice = EstimatorInstance.Target_Price__c;
        var cpn = EstimatorInstance.Catalog_Part_Number__c;
        var basepart = EstimatorInstance.Product_Family__c;
        var ProductFamily = EstimatorInstance.Device_Family_Sub_Category__c;
        var compPrice  = EstimatorInstance.Comp_Price__c;
        var projectId  = component.get("v.projectId");
        var cpnElement = component.find("productNameValues");
        var basepartElement = component.find("productFamilyValue");
        var familyElement = component.find("deviceFamilySubValues");
        
        if(QTY == undefined || QTY == '' || parseInt(QTY) <= 0){
            component.set("v.blankQTY",'no-data'); 
        } else {
            component.set("v.blankQTY",'slds-hide');
        }
        if(TargetPrice == undefined || TargetPrice == '' || TargetPrice <= 0){
            component.set("v.TargetPrice",'no-data'); 
        }else{
            component.set("v.TargetPrice",'slds-hide'); 
        }
        if(compPrice != undefined && compPrice < 0){
            component.set("v.CollapseLineItem_child", true);
            component.set("v.CompPriceValidation",'');
        }             
        else
            component.set("v.CompPriceValidation",'slds-hide');

        if(!(cpn || basepart || ProductFamily)){
            $A.util.addClass(cpnElement, 'b-red');
            $A.util.addClass(basepartElement, 'b-red');
            $A.util.addClass(familyElement, 'b-red');
            //document.getElementById("deviceFamilySubValues" + index + projectId).classList.add("b-red");
            //document.getElementById("productFamilyValue" + index + projectId).classList.add("b-red");
            //document.getElementById("productNameValues"+ index + projectId).classList.add("b-red");
        }
        setTimeout(function(){ 
            if(cpnElement)
                $A.util.removeClass(cpnElement, 'b-red');
            if(basepartElement)
                $A.util.removeClass(basepartElement, 'b-red');
            if(familyElement)
                $A.util.removeClass(familyElement, 'b-red');
            
            /*if(document.getElementById("deviceFamilySubValues" + index + projectId))
                document.getElementById("deviceFamilySubValues" + index + projectId).classList.remove("b-red");
            if(document.getElementById("productFamilyValue" + index + projectId))
                document.getElementById("productFamilyValue" + index + projectId).classList.remove("b-red");
            if(document.getElementById("productNameValues" + index + projectId))
                document.getElementById("productNameValues" + index + projectId).classList.remove("b-red");*/
        }, 5000);        
    },

    //Hide validation error messages
    hideErrorMessage: function(component, event, helper){
        var EstimatorInstance = component.get("v.EstimatorInstance");
        var QTY = EstimatorInstance.QTY_Board__c;
        var TargetPrice = EstimatorInstance.Target_Price__c;
        var compPrice  = EstimatorInstance.Comp_Price__c;
        console.log(QTY+'||||'+TargetPrice);
        if(QTY != undefined || QTY != '' || parseInt(QTY) > 0){
            component.set("v.blankQTY",'slds-hide'); 
        }
        if(TargetPrice != undefined || TargetPrice != '' || TargetPrice > 0){
            component.set("v.TargetPrice",'slds-hide'); 
        }
        if(compPrice != undefined && compPrice >= 0){
            component.set("v.CompPriceValidation",'slds-hide');
        } 
        
        component.set("v.DuplicateCPN", true);
        component.set("v.CanProjectFlag", true);
        component.set("v.basePartCanProjectFlag", true);
        component.set("v.DeviceFamily", true);
        component.set("v.DuplicateBasePart", true);
        component.set("v.isValidCPN", true);
        component.set("v.isValidBasePart", true);
        component.set("v.isValidBDSC", true);
    },

    //Show duplicate product validation error message
    showDupeErrors: function(component){
        var index = component.get("v.Index");
        var projectId = component.get("v.projectId");
        var cpnElement = component.find("productNameValues");
        var basepartElement = component.find("productFamilyValue");
        var familyElement = component.find("deviceFamilySubValues");
        
        $A.util.addClass(cpnElement, 'b-red');
        $A.util.addClass(basepartElement, 'b-red');
        $A.util.addClass(familyElement, 'b-red');
        //document.getElementById("deviceFamilySubValues"+index + projectId).classList.add("b-red");
        //document.getElementById("productFamilyValue"+index + projectId).classList.add("b-red");
        //document.getElementById("productNameValues"+index + projectId).classList.add("b-red");    
        setTimeout(function(){  
            if(cpnElement)
                $A.util.removeClass(cpnElement, 'b-red');
            if(basepartElement)
                $A.util.removeClass(basepartElement, 'b-red');
            if(familyElement)
                $A.util.removeClass(familyElement, 'b-red');
            
            /*if(document.getElementById("deviceFamilySubValues" + index + projectId))
                document.getElementById("deviceFamilySubValues" + index + projectId).classList.remove("b-red");
            if(document.getElementById("productFamilyValue" + index + projectId))
                document.getElementById("productFamilyValue" + index + projectId).classList.remove("b-red");
            if(document.getElementById("productNameValues" + index + projectId))
                document.getElementById("productNameValues" + index + projectId).classList.remove("b-red");*/
        }, 5000);
    },

    //Show error message when the user enters an invalid CPN
    showInvalidCPN: function(component){
        component.set("v.isValidCPN", false);
    },

    //Show error message when the user enters an duplicate CPN
    showDuplicateCPN: function(component){
        component.set("v.DuplicateCPN", false);
    },
    
    //Show error message when the user enters an duplicate Basepart
    showDuplicateBasePart: function(component){
        component.set("v.DuplicateBasePart", false);
    },

    //Show error message when the user enters a basepart value in CPN
    showDeviceFamily: function(component){
        component.set("v.DeviceFamily", false);
    },

    //Show error message when the user enters a CPN where Can_Project equal to FALSE
    showCanProject: function(component){
        component.set("v.CanProjectFlag", false);
    },

   //Show error message when the user enters a Basepart where Can_Project equal to FALSE 
    showBasePartCanProject: function(component){
        component.set("v.basePartCanProjectFlag", false);
    },

    //Show error message when the user enters an invalid basepart
    showInvalidBasePart: function(component){
        component.set("v.isValidBasePart", false);
    },

    //Show error message when the user enters an invalid product family
    showInvalidDSC: function(component){
        component.set("v.isValidBDSC", false);
    },

    //Event handler when status picklist value is changed    
    statusChange: function(component,event, helper){
        component.getEvent("EstimatorItemChange").fire();
    },

    //Event handler when target price value is changed    
    targetPriceChange: function(component,event,helper){
        component.getEvent("EstimatorItemChange").fire();
    },

    //Event handler when qty/board value is changed    
    QTYBoardChange: function(component, event, helper){
        component.getEvent("EstimatorItemChange").fire();
        $A.enqueueAction(component.get('c.checkQTY'));
    },

    //Delete estimator handler
    removeRow: function(component, event, helper){
        component.getEvent("DeleteEstimatorRow").setParams({"indexVar" : component.get("v.Index")}).fire(); 
    },

    //Handles the key press event of CPN, Basepart, product family
    search: function(component, event, helper){
        if (event.keyCode === 13) {
            event.preventDefault();
            var label = event.currentTarget.getAttribute('data-name');
            helper.showProducts(component, event, helper, label);
            return;
        }
        else if(event.getSource){
            var currentElement = event.getSource().getLocalId(); //document.getElementById(event.currentTarget.id);
            var estimator = component.get("v.EstimatorInstance");
            var label = event.getSource().get('v.name');
            var key = '';
            
            if(currentElement == "deviceFamilySubValues")
                key = 'Device_Family_Sub_Category__c';
            else if(currentElement == 'productFamilyValue')
                key = 'Product_Family__c';
            else if(currentElement == 'productNameValues')
                key = 'Catalog_Part_Number__c';
            
            
            /*Mouse enter function
        if(event.type == "mouseup"){
            //estimator[key] = currentElement.value;
            //component.set('v.'+ label ,'slds-input__icon slds-input__icon_right slds-icon-text-default slds-show');
        }
		*/
            //Keyup function
            /*
        if(event.type == "keyup"){
            //estimator[key] = currentElement.value;
            //component.set('v.'+ label,'slds-input__icon slds-input__icon_right slds-icon-text-default slds-show');
            event.preventDefault();
            if (event.keyCode === 13) {
                helper.showProducts(component, event, helper, label);
            }
        }
        */
            var clrBtn = component.find("clr"+currentElement);
            $A.util.removeClass(clrBtn, 'slds-hide');
            
            if(estimator.Product_Family__c && !estimator.Catalog_Part_Number__c)
                helper.populateDeviceFamily(component, event, helper, estimator.Product_Family__c);  
            
            //helper.compareForEstimatorChange(component);
            if(label == 'catalogpart'){
                helper.validateCanEstimate(component);
                helper.getProductNature(component);
            }
        }
    },

    //Show search product popup 
    showProducts: function(component, event, helper){ 
        var label =  event.getSource().get('v.name'); 
        helper.showProducts(component, event, helper, label);        
    },

    //Add the selected product to estimator
    addProductToEstimator : function(component, event, helper){   
        
        var index = component.get("v.Index");
        var product = component.get("v.EstimatorsProductList");           
        var estimator = component.get("v.EstimatorInstance");
        var projectId = component.get("v.projectId");

        if(product == null || product == '' || product == undefined){
            component.set("v.noselection",'noselection');            
        } else {
            if(component.get("v.selectedLabel") == 'family' && product != null){            
                estimator.Device_Family_Sub_Category__c = product.DeviceFamilySubCategory;            
                //document.getElementById("deviceFamilySubValues" + index + projectId).value = product.DeviceFamilySubCategory;
                component.set("v.noselection",'slds-hide');
                component.set("v.SearchKeyWord1", product.DeviceFamilySubCategory);
            }        
            
            if((component.get("v.selectedLabel") == 'base-family' || component.get("v.selectedLabel") == 'basepart') && product != null){
                estimator.Device_Family_Sub_Category__c = product.DeviceFamilySubCategory || '';            
                /*if(product.DeviceFamilySubCategory === undefined){
                    document.getElementById("deviceFamilySubValues" + index + projectId).value = ''; 
                }else{
                    document.getElementById("deviceFamilySubValues" + index + projectId).value = product.DeviceFamilySubCategory || '';
                }*/
                estimator.Product_Family__c = product.Family || '';            
                //document.getElementById("productFamilyValue" + index + projectId).value = product.Family || '';
                //console.log('getSelection'+ product.Family || '');
                component.set("v.SearchKeyWord1", product.DeviceFamilySubCategory || '');
                component.set("v.SearchKeyWord2", product.Family || ''); 
                component.set("v.EstimatorsProductListHandler",null);
                component.set("v.noselection",'slds-hide');
            }            
            if(component.get("v.selectedLabel") == 'catalogpart' && product != null){
                estimator.Device_Family_Sub_Category__c = product.DeviceFamilySubCategory || '';            
                //document.getElementById("deviceFamilySubValues" + index + projectId).value = product.DeviceFamilySubCategory || '';           
                estimator.Product_Family__c = product.Family || '';            
                //document.getElementById("productFamilyValue" + index + projectId).value = product.Family || '';           
                estimator.Catalog_Part_Number__c = product.Name || '';            
                //document.getElementById("productNameValues" + index + projectId).value = product.Name || '';   
                component.set("v.SearchKeyWord1", product.DeviceFamilySubCategory || '');
                component.set("v.SearchKeyWord2", product.Family || '');
                component.set("v.SearchKeyWord3", product.Name  || '');
                component.set("v.EstimatorsProductListHandler",null); 
                component.set("v.noselection",'slds-hide');
                helper.validateCanEstimate(component);
                helper.getProductNature(component);
            }        
            component.set("v.ShowProducts",false);
            component.set("v.noselection",'slds-hide');  
            component.set("v.EstimatorInstance", estimator);  
        }
        component.set("v.EstimatorsProductList",''); 
        //helper.compareForEstimatorChange(component);

        //helper.checkCanProjectProduct(component,event, helper, estimator.Catalog_Part_Number__c);
    },

    //In search popup handles the key press event of CPN, Basepart, product family fetch appropriate product records
    keyPressController: function(component,event, helper){
        helper.global.loaderStat = true;
        component.set("v.canProject", false);
        var limit = 0;   
        component.set("v.offset", limit);
        helper.fetchProducts(component, component.get("v.SearchKeyWord1"),component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, helper.global.searchMode);
    }, 

    //Handles event when user select a product in search popup
    onProductSelect: function(component, event, helper){
        var getSelection = event.getSource().get("v.text");         
        component.set("v.EstimatorsProductList", getSelection);  
        component.set("v.noselection",'slds-hide');
        
        if(getSelection.Name){
            component.find('addToEstimator').set('v.disabled', true);
            helper.checkCanProjectProduct(component,event, helper, getSelection.Name);
        }else
            component.find('addToEstimator').set('v.disabled', false);

    },

    //Close search product popup
    closeProductsModel: function(component, event, helper){
        component.set("v.ShowProducts",false);
        component.set("v.canProject", false);
        component.set("v.EstimatorsProductList", ""); 
        component.set("v.SearchKeyWord1", ""); 
        component.set("v.SearchKeyWord2", ""); 
        component.set("v.SearchKeyWord3", ""); 
        component.set("v.noselection",'slds-hide');
    },

    //Expand Collapse of additional rows 
    handleH4MClick: function(component, event, helper) {
        var currentIcon = component.get('v.h4mIconToggle');
        if(currentIcon === 'utility:chevronup') {
            component.set('v.h4mIconToggle', 'utility:chevrondown');
            component.set('v.rowClass', '');
            helper.setItemClose(component);  
        } else {
            component.set('v.h4mIconToggle', 'utility:chevronup');
            component.set('v.rowClass', 'slds-show');
        }
    },

    //Clears the value for the actionable input field
    clear : function(component, event, helper) {
        var estimator = component.get("v.EstimatorInstance");
        var index = component.get("v.Index");
        var label =  event.getSource().get("v.name");
        var projectId = component.get("v.projectId");

        if(label == 'family'){
            estimator.Device_Family_Sub_Category__c = '';  
            //document.getElementById("deviceFamilySubValues" + index + projectId).value='';
            component.set("v.SearchKeyWord1", '');
            
        }
        if(label == 'basepart'){
            //document.getElementById("productFamilyValue" + index + projectId).value='';
            estimator.Product_Family__c = '';
            component.set("v.SearchKeyWord2",'');    
        }
        if(label == 'catalogpart'){
            //document.getElementById("productNameValues" + index + projectId).value='';
            component.set("v.SearchKeyWord3",'');
            estimator.Catalog_Part_Number__c = '';
            helper.getProductNature(component);
        }
        //helper.compareForEstimatorChange(component);
        helper.checkForQuoteOption(component);
        component.set("v.EstimatorInstance", estimator);
    },

    //Hide warning message popup
    closeModel: function(component, event, helper) {
        // for Hide/Close Model,set the "isOpen" attribute to "Fasle"  
        component.set("v.showWarningMessage", false);
    },

    //Show warning message when user enter qty/board > 100
    checkQTY: function(component, event, helper){
        var estimator = component.get('v.EstimatorInstance');
        if(estimator.QTY_Board__c != undefined && estimator.QTY_Board__c > 100){
            component.set('v.warningMsg', 'You have entered Quantity/Board greater than 100. This field represents the quantity of this device on a single unit of the product the client is making and is typically less than 10. Please check the value entered');
            component.set("v.showWarningMessage", true);
        }
    },

    //Fixed header handler
    checkScrollContainer: function(component){
        setTimeout(function(){
            var projectId = component.get("v.projectId");
            var elem = document.getElementById(projectId + "scrollContainer");
            var table = document.getElementById(projectId + "estimatorTable");
            if(table && elem && table.clientHeight > 250){
                elem.style.height = "300px";
                elem.scrollTop = elem.scrollHeight;
            }            
            else if(elem)
                elem.style.height = "";
        },10);
    },  

    //Handles event when estimator value is changed
    estimatorInstanceChange: function(component, event, helper){
        helper.checkForQuoteOption(component);
        //helper.compareForEstimatorChange(component);
    },
    changedToQuote: function(component, event, helper){
        //helper.compareForEstimatorChange(component);        
    },

    //Show validation error - Invalid status change
    showInvalidStatusChangeHandler: function(component, event){
        var msg = $A.get("$Label.c.Estimators_InvalidStatusChange");
        var estInst = component.get("v.EstimatorInstance");
        
        msg = msg.replace('status_placeholder', estInst.Status__c);
        msg = msg.replace('cpn_placeholder', estInst.Catalog_Part_Number__c);
        msg = msg.replace('qnumber_placeholder', event.getParam('arguments').quotenumber);
        component.set("v.invalidStatusChangeErrorMsg", msg);
    },

    //Show validation error - Invalid CPN Change
    showInvalidCPNChangeHandler: function(component, event){
        var msg = $A.get("$Label.c.Estimators_InvalidCPNChange");
        msg = msg.replace('qnumber_placeholder', event.getParam('arguments').quotenumber);
        component.set("v.invalidCPNChangeErrorMsg", msg);
    },

    //Handles infinite loading of the product lightning datatable
    loadMoreProducts: function(component, event, helper){
        var loading = component.find("loading");
        if(helper.global.loaderStat  && $A.util.hasClass(loading, 'slds-hide')){
            var projectId = component.get("v.projectId");     
            var limit = component.get("v.offset"); 
            limit = limit + parseInt($A.get("$Label.c.EstimatorSearchQueryLimit"));
            component.set("v.offset", limit);
            helper.fetchProducts(component, component.get("v.SearchKeyWord1"), component.get("v.SearchKeyWord2"), component.get("v.SearchKeyWord3"), limit, helper.global.searchMode);                    
            $A.util.removeClass(loading, 'slds-hide');
        }
    },

    //Handles event when a product chosen in product lightning datatable
    productSelected: function(component, event, helper){
        var getSelection = event.getParam('selectedRows')[0];
        //var getSelection = event.getSource().get("v.text");         
        component.set("v.EstimatorsProductList", getSelection);  
        component.set("v.noselection",'slds-hide');
        
        if(getSelection && getSelection.Name){
            component.find('addToEstimator').set('v.disabled', true);
            helper.checkCanProjectProduct(component,event, helper, getSelection.Name);
        }else
            component.find('addToEstimator').set('v.disabled', false);
    },
	
	//Handles application event when select All / deselect All - Quotes
	handleApplicationEvent : function(component,event,helper){
        var action = event.getParam("action");
         var selectAll = event.getParam("selectAll");
       
        if(action == "QuoteSelection" && !component.get("v.disableToQuote")){
           component.set('v.toQuote',selectAll);
        }
      
 },
 
})