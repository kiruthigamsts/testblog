({    
    //Component initializing 
    initializeDataTable : function(component, event, helper){         
        var columns = component.get("v.columns");       
        helper.formatColumnData(component, columns); 
        var formattedData = helper.formatDataList(component); 
        var defaultFilters = component.get('v.defaultFilters');
        component.set("v.filterCriteria",JSON.parse(JSON.stringify(defaultFilters)));
        $A.enqueueAction(component.get("c.updateTableDefaults"));  
        var data = component.get("v.data");
        component.set("v.dataCopy",JSON.parse(JSON.stringify(data)));
    },
    
    //Re-intializes the table when there is a change in data
    reInitializeDataTable: function(component, event, helper){        
        var data = component.get("v.data");
        var dataCopy = component.get("v.dataCopy");       
        var formattedData = component.get("v.formattedData");
        var tempfrmtData = [], tempdataOld =[];
        
        for(var i=0 ; i < data.length  ; i++){             
            for(var j=0 ; j < formattedData.length  ; j++){        
                if(formattedData[j]['Id']['value'] != null && data[i]['Id'] == formattedData[j]['Id']['value']){
                    var dataOriginal = dataCopy.filter(x => x['Id'] == data[i]['Id'])[0];                
                    if(JSON.stringify(data[i]) != JSON.stringify(dataOriginal))                          
                        tempfrmtData[i] = helper.formatDataRecord(component,data[i]);                                              
                    else
                         tempfrmtData[i] = formattedData[j];
                       
                }else if(formattedData[j]['Id']['value'] == null || formattedData[j]['Id']['value'] == ''){                       
                    tempfrmtData[i] = helper.formatDataRecord(component,data[i]);                  
                }                       
            }
        }
        component.set("v.formattedData",tempfrmtData);
        setTimeout(function(){
        component.set("v.dataCopy",JSON.parse(JSON.stringify(data)));  
        },100);         
    },   
    
    //Apply the default filters, css for the datatable
    updateTableDefaults : function(component, event, helper){        
        var columns = component.get('v.columns');  
        var data = component.get("v.data");
        var globalId = component.getGlobalId(); 
        //if(columns.length > 0 && data.length > 1)
        //helper.applyDefaultSorting(component, columns);     
        
        var defaultFilters = component.get("v.defaultFilters");
        //Set default filters
        if(defaultFilters.length > 0 && data.length > 1)
            helper.applyDefaultFilters(component, defaultFilters); 
        
        
        setTimeout(function(){                
            var tableBody = document.getElementById(globalId+'_table-body');      
            if(tableBody.offsetHeight >= 400)
                component.set("v.tableCSS",'ct-table-fixed');
            else
                component.set("v.tableCSS",'');     
        },100);
    },
    
    //Toggles search filter
    toggleFilter : function(component, event, helper){
        if(component.get("v.enableFilters")){
            var cmpTarget = component.find('filterTab');
            var tableSection = component.find('table-section');  
            var filterState = $A.util.hasClass(cmpTarget,'slds-hide')?'active':'inactive';   
            var globalId = component.getGlobalId();       
            var tableBody = document.getElementById(globalId+'_table-body');    
           
            $A.util.toggleClass(cmpTarget, 'slds-hide');          
            $A.util.toggleClass(tableSection, 'slds-size_9-of-12 custom-data-table');            
            
            if(filterState == 'active')          
                component.set("v.tableCSS",'ct-table-fixed');
            else
            {
                if(tableBody.offsetHeight >= 400)
                    component.set("v.tableCSS",'ct-table-fixed');
                else
                    component.set("v.tableCSS",'');
            }            
            component.getEvent("CustomDataTableChangeEvent").setParams({               
                "type" : 'filter',
                "value" : filterState,
            }).fire();
        }       
    },
    
    //Show the sort icon on mouse over
    onmouseover: function(component, event, helper){ 
        var globalId = component.getGlobalId(); 
        if(component.get("v.enableSorting")){
            var dataSelected = event.currentTarget.getAttribute('data-sortselected');       
            var columnName = event.currentTarget.getAttribute('data-name');       
            var desc = document.getElementById(globalId+'-desc-'+columnName);
            var asc = document.getElementById(globalId+'-asc-'+columnName);       
            if($A.util.hasClass(desc, "slds-hide") && $A.util.hasClass(asc, "slds-hide")  && dataSelected == "false")
                $A.util.removeClass(desc,"slds-hide");  
        }        
    },
    
    //Show the sort icon on mouse leave
    onmouseleave: function(component, event, helper){ 
        var globalId = component.getGlobalId(); 
        if(component.get("v.enableSorting")){
            var dataSelected = event.currentTarget.getAttribute('data-sortselected');       
            var columnName = event.currentTarget.getAttribute('data-name');         
            var desc = document.getElementById(globalId+'-desc-'+columnName);
            var asc = document.getElementById(globalId+'-asc-'+columnName);
            
            if(!$A.util.hasClass(desc, "slds-hide") && $A.util.hasClass(asc, "slds-hide") && dataSelected == "false")
                $A.util.addClass(desc,"slds-hide");
        }
    },
    
    //Invoked upon sorting from column headers
    onSort : function(component, event, helper){
        var globalId = component.getGlobalId(); 
        var columnId = event.currentTarget.getAttribute('id');
        var name = event.currentTarget.getAttribute('data-name');
        var sortOptions = event.currentTarget.getAttribute('data-sortOptions');
        var sortType = event.currentTarget.getAttribute('data-sortType');         
        var sortOrder = columnId.split('-')[1];
        var columnName = columnId.split('-')[2];        
        var header = document.getElementById(globalId+'-'+columnName);       
        
        if(sortOrder === 'asc'){
            var upArrow = document.getElementById(columnId);  
            var downArrow = document.getElementById(globalId+'-desc-'+columnName);           
        }else{
            var downArrow = document.getElementById(columnId);  
            var upArrow = document.getElementById(globalId+'-asc-'+columnName);            
        }         
        
        $A.util.toggleClass(upArrow, 'slds-hide');
        $A.util.toggleClass(downArrow, 'slds-hide');  
        header.setAttribute("data-sortselected","true");      
        if(sortType == null)
            helper.sortRecords(component, columnName, sortOrder, name.split('-')[0]);
        else
            helper.customSort(component, columnName, sortOrder, sortOptions);
    }, 
    
    //On Multipicklist filter change
    handleMultiSelectChange : function(component, event, helper){
        var selectedValues = event.getParam("values"); 
        var fieldName = event.getParam("name"); 
        var fieldLabel = event.getParam("fieldLabel");     
        var filterCriteria = component.get("v.filterCriteria");
        var index = filterCriteria.findIndex(e => e['fieldName'] == fieldName);
        if(selectedValues.length > 0){
            if(index == -1)
                filterCriteria.push({'fieldLabel': fieldLabel, 'fieldName': fieldName, 'type': 'multipicklist',  'selectedValues':selectedValues});            
            else
                filterCriteria[index]['selectedValues'] = selectedValues;              
        }else
            filterCriteria.splice(index,1);
        component.set("v.filterCriteria", filterCriteria); 
    },
    
    //Update filter criteria when a combo box option changes
    onComboChange : function(component, event){
        let name = event.currentTarget.getAttribute("data-name");
        let label =  event.currentTarget.getAttribute("data-label"); 
        let selectedValue = [];
        selectedValue.push(event.currentTarget.getAttribute("data-value"));      
        var filterCriteria = component.get("v.filterCriteria");
        var index = filterCriteria.findIndex(e => e['fieldLabel'] == label);
        if(index == -1)
            filterCriteria.push({'fieldLabel': label, 'fieldName':name, 'type': 'picklist', 'selectedValues':selectedValue,'operation':
                                 event.currentTarget.getAttribute("data-operation")});            
        else
            filterCriteria[index]['selectedValues'] = selectedValue;      
        component.set("v.filterCriteria", filterCriteria);
    },
    
    //On date filter selection
    onDateFilterChange: function(component, event, helper){
        let name = event.currentTarget.getAttribute("data-name");     
        let label = event.currentTarget.getAttribute("data-label");       
        let fieldName = event.currentTarget.getAttribute("data-fieldName");
        let value = event.currentTarget.getAttribute("data-value");
        var filterCriteria = component.get("v.filterCriteria");  
        var index = filterCriteria.findIndex(e => e['fieldName'] == fieldName);        
        
        if(index == -1 && name == 'startDate')
            filterCriteria.push({'fieldLabel': label, 'fieldName':fieldName, 'type': 'date range', 'selectedValues':{'startDate':value, 'endDate':''}});   
        else if(index == -1 && name == 'endDate')
            filterCriteria.push({'fieldLabel': label, 'fieldName':fieldName, 'type': 'date range', 'selectedValues':{'startDate':'', 'endDate':value}});   
            else if(index != -1)
                filterCriteria[index]['selectedValues'][name] = value;
        
        component.set("v.filterCriteria", filterCriteria);
    },
    
    cancelFilter: function(component, event, helper){
        var filterCriteria = component.get("v.filterCriteria");	
        var filters = component.get("v.filters"), options = [], index = -1;
        var filterCriteriaTemp = component.get("v.filterCriteriaTemp");	
        //Reset unapplied filters
        if(JSON.stringify(filterCriteria) != JSON.stringify(filterCriteriaTemp)){    
            for(var i=0; i < filters.length; i++){
                index = filterCriteriaTemp.findIndex(e => e['fieldName'] == filters[i]['fieldName']);               
                if(filters[i]['type'] === 'multipicklist'){           
                    if(index == -1)                    
                        filters[i]["options"] = helper.resetMultiSelect(filters[i]["options"]);  
                    else
                        filters[i]["options"] = helper.setMultiSelect(filters[i]["options"],filterCriteriaTemp[index]['selectedValues'],true);
                }else if(filters[i]['type'] === 'date range'){                    
                    if(index == -1)  {
                        filters[i]['startDate'] = ''; 
                        filters[i]['endDate'] = ''; 
                    }else{
                        filters[i]['startDate'] = filterCriteriaTemp[index]['selectedValues']['startDate']; 
                        filters[i]['endDate'] = filterCriteriaTemp[index]['selectedValues']['endDate']; 
                    }                 
                }
                    else{
                        filters[i]['value'] =  index == -1? '':filterCriteriaTemp[index]['selectedValues'][0];
                    }    
            }   
            component.set("v.filters",filters);
            component.set("v.filterCriteria",JSON.parse(JSON.stringify(filterCriteriaTemp)));
        }             
        $A.enqueueAction(component.get('c.toggleFilter'));
    },
    
    //Identify the filter criteria applied
    applyFilter : function(component, event, helper){              
        var filterCriteria = component.get("v.filterCriteria");	
        var isValid = helper.validateFilters(component, filterCriteria);	
        
        if(filterCriteria.length > 0 && isValid){
            helper.filterRecords(component, filterCriteria); 
            $A.enqueueAction(component.get('c.toggleFilter'));
        }else if(filterCriteria.length == 0)
            $A.enqueueAction(component.get('c.toggleFilter'));
    },  
    //Identify the filter criteria applied
    reApplyFilter : function(component, event, helper){              
        var filterCriteria = component.get("v.filterCriteria");	
        var isValid = helper.validateFilters(component, filterCriteria);        
        if(filterCriteria.length > 0 && isValid)
            helper.filterRecords(component, filterCriteria);    
    },  
    
    //Clear filters
    ClearFilters : function(component, event, helper){
        $A.enqueueAction(component.get("c.resetFilters"));  
        //$A.enqueueAction(component.get("c.resetData"));          
    },
    
    //reset filters
    resetFilters : function(component, event, helper){      
        var norecords = component.find('norecords');       
        var defaultFilters = component.get('v.defaultFilters');  
        var filters = component.get("v.filters");
         //Clear filters 
        for(var i=0; i < filters.length; i++){
            if(filters[i]['type'] === 'multipicklist'){                
                filters[i]['options'] = helper.clearMultiSelectOptions(filters[i]['options']);
            }else if(filters[i]['type'] === 'date range'){
                filters[i]['startDate'] = ''; 
                filters[i]['endDate'] = ''; 
                var errorspan = document.getElementById(filters[i]['fieldName']);                             
                errorspan.innerHTML = "";                
            }
                else{
                    filters[i]['value'] = '';
                }    
        }   
        component.set("v.filters",filters);
        component.set("v.filterCriteria",JSON.parse(JSON.stringify(defaultFilters)));
        component.set("v.filterCriteriaTemp",JSON.parse(JSON.stringify(defaultFilters)));
        if(defaultFilters.length > 0)
            helper.applyDefaultFilters(component, defaultFilters);  
        $A.util.addClass(norecords, 'slds-hide');
    },
    
    //Show all data
    resetData : function(component, event, helper){
        var dataLineItems = component.find('dataRow');               
        //Set custom data table row visibility to true for all the records
        if(Array.isArray(dataLineItems)){
            for(var i=0 ;i < dataLineItems.length ; i++){           
                dataLineItems[i].set("v.recordVisibility",'');                
            }   
        }else{
            dataLineItems.set("v.recordVisibility",'');
        }   
    },
    
    //Select all the rows
    onSelectAll: function(component, event, helper){
        component.getEvent("CustomDataTableRowSelect").setParams({
            "selectType" : 'SelectAll',
            "rowIndex" : component.get("v.index")}).fire(); 
    },
    
    //Clear all the row selections
    onClearAll: function(component, event, helper){
        var lineItems = component.find('dataRow');        
        if(Array.isArray(lineItems)){
            for(var i =0 ; i < lineItems.length; i++)
                lineItems[i].clearRowSelection();
        }else{
            lineItems.clearRowSelection();
        }    
    },
    
    //Initialize a particular row
    initializeRow: function(component, event, helper){
        var dataRows = component.find('dataRow');
        var params = event.getParam('arguments');         
        var rowIndex = params ? params.rowIndex : '';
        var formattedData = component.get("v.formattedData");
        var data = component.get("v.data");  
        
        if(Array.isArray(dataRows)){           
            for(var i=0 ;i < dataRows.length ; i++){ 
                var index = dataRows[i].get("v.index");				              
                if(rowIndex == index){           
                    formattedData[rowIndex] = helper.formatDataRecord(component,data[rowIndex]);                    
                    dataRows[i].initializeRow();
                }  
            }
        }else{        
            formattedData[rowIndex] = helper.formatDataRecord(component,data[rowIndex]);
            dataRows.initializeRow();
        }
        component.set("v.formattedData",formattedData);
    },
    
    //Disable a particular checkbox
    disableRowCheckBoxes: function(component, event, helper){
        var params = event.getParam('arguments');         
        var rowIndexes = params ? params.rowIndexes : '';      
        var dataRows = component.find('dataRow'); 
        var data = component.find('data'); 
        
        if(Array.isArray(dataRows)){      
            for(var i=0 ; i < rowIndexes.length ; i++){ 
                for(var j=0 ;j < dataRows.length ; j++){
                    if(rowIndexes[i] == dataRows[j].get("v.index"))
                        dataRows[j].disableRowCheckBox();                      
                }                             
            }              
        }else
            dataRows.disableRowCheckBox();
    },
    
    //Update the validation message for a particular row
    updateValidationStatus: function(component, event, helper){   
        var dataRows = component.find('dataRow');
        var params = event.getParam('arguments');         
        var rowIndex = params ? params.rowIndex : '';
        var fieldName = params ? params.fieldName : '';
        var errormessage = params ? params.errormessage : ''; 
      
        if(Array.isArray(dataRows)){  
            for(var i=0 ;i < dataRows.length ; i++){ 
                var index = dataRows[i].get("v.index");                
                if(rowIndex == index)
                    dataRows[i].showErrorMessage(rowIndex,fieldName,errormessage);
            }
        }else{
            dataRows.showErrorMessage(rowIndex,fieldName,errormessage);
        }  
        
    },    
    
    //Hide all the errors in a particular row
    hideAllErrors : function(component, event, helper){       
        var dataRows = component.find('dataRow');    
        var errorspan = document.getElementsByClassName('errorText');  
        if(errorspan.length > 0){
            for(var i=0 ;i < errorspan.length ; i++){          
                if(!errorspan[i].className.includes('slds-hide'))
                    errorspan[i].classList.add("slds-hide");               
            }
        }else{           
            if(!errorspan[0].className.includes('slds-hide'))
                errorspan[0].classList.add("slds-hide");           
        }          
    },
    
    //Update table status to view/edit when mode is changed
    modeChanged: function(component, event, helper){
        var mode = event.getParam("value");       
        var formattedData =  component.get("v.formattedData");
        var columnData =  component.get("v.columnData");
        var dataKeys = component.get("v.dataKeys");       
        for(var j=0 ; j < formattedData.length ; j++){
            for(var i=0 ; i < dataKeys.length ; i++){                 
                formattedData[j][dataKeys[i]]['editable'] = mode == 'edit'?columnData[dataKeys[i]]['editable']:false;
            }           
        }               
        component.set("v.formattedData",formattedData); 
    },
    
    //Update the formatted data when there is a change to the growth driver list
    dataChanged: function(component, event, helper){        
        var dataOld = event.getParam("oldValue");  
        var dataLatest = event.getParam("value"); 
        var formattedData =  component.get("v.formattedData"); 
        var isDataUpdateRequired = component.get("v.isDataUpdateRequired");        
        var dataRow = component.find('dataRow');        
        var globalId = component.getGlobalId(); 
        
        if(isDataUpdateRequired){
            if(dataOld.length != 0 && dataLatest.length > formattedData.length){ 
                var oldrcrIds =[], newrcrdids=[];
                var index = dataLatest.length - 1;                   
                formattedData.push(helper.formatDataRecord(component,dataLatest[index]));
                setTimeout(function(){
                    helper.updateTableState(component);
                    helper.setTabFocus(component);
                    component.set("v.dataCopy",JSON.parse(JSON.stringify(dataLatest)));
                },100);                 
                component.set("v.formattedData",formattedData);   
            }else if(dataLatest.length < formattedData.length){                
                for(var i=formattedData.length ; i >= dataLatest.length  ; i--)
                    formattedData.splice(i, 1);                
                component.set("v.formattedData",formattedData);  
                setTimeout(function(){
                    helper.updateTableView(component);
                    component.set("v.dataCopy",JSON.parse(JSON.stringify(dataLatest)));
                },100);           
            }                     
        }        
    }
})