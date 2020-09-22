({
    //Functionality to sort the records
    sortRecords: function(component, columnName, sortOrder, dataType){         
        var data = component.get("v.data"); 
        var formattedData = component.get("v.formattedData"); 
        var numericalTypes = component.get("v.numericalDataTypes");
        
        //Clear all the sort of other columns
        this.clearSorting(component, columnName);
        
        if(columnName != 'undefined' && sortOrder != 'undefined'){
            //Sorting for text fields and picklists
            if(sortOrder === 'asc' && !numericalTypes.includes(dataType)){
                formattedData.sort(function (x, y) {                    
                    let a = x[columnName]['value'] == undefined?'':x[columnName]['value'].toUpperCase(),
                        b = y[columnName]['value']	 == undefined?'':y[columnName]['value'].toUpperCase();
                    return a == b ? 0 : a > b ? 1 : -1;               
                });
            }else if(sortOrder === 'desc' && !numericalTypes.includes(dataType)){
                formattedData.sort(function (x, y) {                   
                    let a =  x[columnName]['value'] == undefined?'':x[columnName]['value'].toUpperCase(),
                        b = y[columnName]['value'] == undefined?'':y[columnName]['value'].toUpperCase();
                    return a == b ? 0 : a < b ? 1 : -1;                    
                });                
            }else if(sortOrder === 'asc' && numericalTypes.includes(dataType)){                
                formattedData.sort(function (x, y) {
                    let a =  x[columnName]['value'] == undefined?0:x[columnName]['value'],
                        b = y[columnName]['value'] == undefined?0:y[columnName]['value'];
                    return a - b;
                });
            }else if(sortOrder === 'desc' && numericalTypes.includes(dataType)){
                formattedData.sort(function (x, y) {
                    let a =  x[columnName]['value'] == undefined?0:x[columnName]['value'],
                        b = y[columnName]['value'] == undefined?0:y[columnName]['value'];
                    return b - a;
                });
            }            
        } 
        var dataList = [];
        formattedData.forEach(function(item){dataList.push(data.filter(e => e.Id == item['Id']['value'])[0])});        
        component.set("v.formattedData",formattedData); 
        component.set("v.isDataUpdateRequired",false);
        component.set("v.data",dataList);
        component.set("v.isDataUpdateRequired",true);
    },
    
    //Customized sorting
    customSort :function(component, columnName, sortOrder, defaultSortOrder){  
        var orderOfSort = defaultSortOrder.split(',');
        orderOfSort = orderOfSort.map(function(x){ return x.toUpperCase() });      
        var data = component.get("v.data"); 
        var formattedData = component.get("v.formattedData"); 
        //Clear all the sort of other columns
        this.clearSorting(component, columnName);
        
        if(sortOrder === 'asc'){
            formattedData.sort(function (x, y) {                    
                let a = x[columnName]['value'] == undefined?'':x[columnName]['value'].toUpperCase(),
                    b = y[columnName]['value'] == undefined?'':y[columnName]['value'].toUpperCase();                
                return orderOfSort.indexOf(a) - orderOfSort.indexOf(b);               
            });
            
        }else if(sortOrder === 'desc'){
            formattedData.sort(function (x, y) {                   
                let a = x[columnName]['value'] == undefined?'':x[columnName]['value'].toUpperCase(),
                    b = y[columnName]['value'] == undefined?'':y[columnName]['value'].toUpperCase();                
                return orderOfSort.indexOf(b) - orderOfSort.indexOf(a);                 
            });               
        }
        
        var dataList = [];
        formattedData.forEach(function(item){dataList.push(data.filter(e => e.Id == item['Id']['value'])[0])});        
        component.set("v.formattedData",formattedData); 
        component.set("v.isDataUpdateRequired",false);
        component.set("v.data",dataList);   
        component.set("v.isDataUpdateRequired",true);
    },   
    
    //Filtering logic to filter records
    filterRecords: function(component, filterCriteria){   
        var data = component.get("v.formattedData");
        component.set("v.filterCriteriaTemp",JSON.parse(JSON.stringify(filterCriteria)));
        if(filterCriteria.length > 0)
            this.clearDataSelection(component);
        var filteredKeys = Object.keys(data).filter(function (key) {
            if(data != undefined){               
                let dataRcrd = data[key];           
                let startDate, endDate, recordDate;   
                let fieldName = null, selectedValues = null, type = null, operation=null,filterMatch = 0;
                for(var filterKey in filterCriteria){                 
                    fieldName = filterCriteria[filterKey]['fieldName'];
                    selectedValues = filterCriteria[filterKey]['selectedValues']; 
                    type = filterCriteria[filterKey]['type']; 
                    operation = filterCriteria[filterKey]['operation'];                    
                    var dataVal = dataRcrd[fieldName]['value'];
                    if(type == 'picklist' && operation =='equals' && dataVal === selectedValues[0])
                        filterMatch += 1;
                    if(type == 'picklist' && operation =='precision'){
                        let recordVal = Number.isInteger(dataVal)?dataVal:dataVal.toPrecision(1);
                        let rangeVal = selectedValues[0] == 'All'?'All':selectedValues[0].split('-');
                        let startVal = rangeVal == 'All'? 0 : Number(rangeVal[0]);                    
                        let endVal = rangeVal == 'All'? 10 : Number(rangeVal[1]);                    
                        if(recordVal >= startVal && recordVal <= endVal)
                            filterMatch += 1;                                    
                    }                    
                    if(type == 'multipicklist' && selectedValues.includes(dataVal))
                        filterMatch += 1; 
                    if(type =='date range' && (selectedValues['startDate'] != '' || selectedValues['endDate'] != '')){
                        startDate = selectedValues['startDate'];
                        endDate = selectedValues['endDate'];
                        recordDate = dataVal;
                        if((recordDate <= endDate) && (recordDate >= startDate))
                            filterMatch += 1;
                    }
                    if(filterMatch == filterCriteria.length)
                        return true;
                }    
                
            }
            return false;
        });       
        
        var cmpTarget = component.find('norecords');       
        if(filteredKeys.length == 0)
            $A.util.removeClass(cmpTarget, 'slds-hide');        	
        else
            $A.util.addClass(cmpTarget, 'slds-hide'); 
        
        this.updateDataItemVisibility(component, filteredKeys);
    },   
    
    //Hide the rows
    updateDataItemVisibility: function(component, filteredKeys){       
        var dataLineItems = component.find('dataRow');
        if(Array.isArray(dataLineItems)){
            for(var i=0 ;i < dataLineItems.length ; i++){ 
                var index = dataLineItems[i].get("v.index");				              
                if(!filteredKeys.includes(index.toString()))              
                    dataLineItems[i].set("v.recordVisibility",'slds-hide');             
                else
                    dataLineItems[i].set("v.recordVisibility",'');                                       
            }     
        }else{
            dataLineItems.set("v.recordVisibility",'slds-hide');     
        }          
    },    
    
    //Clear data selection
    clearDataSelection: function(component){       
        var dataLineItems = component.find('dataRow'); 
        if(Array.isArray(dataLineItems)){
            for(var i=0 ;i < dataLineItems.length ; i++)                           
                dataLineItems[i].set("v.recordVisibility",'');     
        }else{
            dataLineItems.set("v.recordVisibility",'');     
        }  
    },
    //Format options to be assigned to a multpicklist component
    clearMultiSelectOptions:  function(values){        
        for(var k =0 ;k < values.length; k++){  
            values[k]['selected'] = false;
        }                 
        return values;       
    },
    
    //Clear sorting for all columns except the currently selected column
    clearSorting: function(component, columnName){
        var globalId = component.getGlobalId();  
        var allHeaders = document.getElementsByClassName('dtHeader');
        var colName, descCol, ascCol;
        for(var i = 0; i < allHeaders.length ; i++){
            colName = allHeaders[i].getAttribute('data-name');
            descCol = document.getElementById(globalId+'-desc-'+colName);
            ascCol = document.getElementById(globalId+'-asc-'+colName);
            if(colName != columnName && 
               allHeaders[i].getAttribute('data-sortselected') == "true"){
                allHeaders[i].setAttribute('data-sortselected',"false")
                if(!descCol.classList.contains('slds-hide'))
                    descCol.classList.add('slds-hide');
                if(!ascCol.classList.contains('slds-hide'))
                    ascCol.classList.add('slds-hide');
            }			
        }
    }, 
    
    //Applies default sorting
    applyDefaultSorting : function(component, columns){     
        for(var i =0 ; i < columns.length; i++)          
            if(columns[i]['sortable'] && columns[i]['sortbydefault'] != '' && columns[i]['sortbydefault'] != undefined && component.get("v.mode") == 'view'){                  
                //this.sortRecords(component, columns[i]['fieldName'], columns[i]['sortbydefault'],columns[i]['type']);  
                this.clearSorting(component, columns[i]['fieldName']);              
            }         
    },
    
    //Applies default filters
    applyDefaultFilters : function(component, filterCriteria){       
        var multifilters = component.find("multipick-filter");
        var filter, options = [];       
        if(multifilters != undefined){            
            for(var j=0 ; j < filterCriteria.length ; j++){              
                  if(filterCriteria[j]['type'] == 'multipicklist'){
                    for(var i=0 ; i < multifilters.length ; i++){               
                        if(multifilters[i].get('v.fieldName') == filterCriteria[j]['fieldName']){   
                            filter = component.get("v.filters").filter(e => e['fieldName'] == filterCriteria[j]['fieldName']);
                            options = filter[0]['options'].filter(e => !filterCriteria[j]['selectedValues'].includes(e['value']));
                            multifilters[i].set("v.options",this.setMultiSelectOptions(filterCriteria[j]['selectedValues'],true).concat(options));
                        }                        
                    }
                } 
            } 
            this.filterRecords(component, filterCriteria); 
        }            
    },
    
    //Generate Multi selection options
    setMultiSelectOptions:  function(values, selection){
        var options = [];
        for(var k =0 ;k < values.length; k++){                        
            options.push({               
                label: values[k],
                value: values[k],
                selected: selection
            });                       
        }        
        return options;       
    },
    
    //Reset the Multi select control
    resetMultiSelect:  function(values){        
        for(var k =0 ;k < values.length; k++){                        
            values[k]['selected'] = false;                      
        }        
        return values;       
    },
    
    //Multiselect select/deselect all the values
    setMultiSelect:  function(values, selectedValues, selection){       
        for(var k =0 ;k < values.length; k++){
            values[k]['selected'] = selectedValues.includes(values[k]['value'])?selection:!selection;                    
        }          
        return values;       
    },
    
    //Validate filters applied
    validateFilters: function(component, filterCriteria){
        var dateCriteria = filterCriteria.filter(e => e['type'] == 'date range');        
        for(var i=0 ;i < dateCriteria.length ; i++){     
            var selectedValues = dateCriteria[i]['selectedValues'];
            var errorspan = document.getElementById(dateCriteria[i]['fieldName']);
            if((selectedValues['startDate'] != '' && selectedValues['endDate'] == '') || (selectedValues['startDate'] == '' && selectedValues['endDate'] != '')){
                errorspan.classList.remove('slds-hide');                
                errorspan.innerHTML = "Enter both Start and End Dates";
                return false;
            }else if(selectedValues['startDate'] > selectedValues['endDate']){
                errorspan.classList.remove('slds-hide');                
                errorspan.innerHTML = "Start date cannot be greater than End Date";
                return false;
            }else{
                errorspan.classList.add('slds-hide');                
                errorspan.innerHTML = "";
                return true;
            }                
            
        } 
        return true;
    },
    
    //Process the picklist value
    processPickValue : function(component, defaultOptions, newValue) {
        var allOptions =[], options = [];          
        for(var i=0 ;i < defaultOptions.length ; i++){
            allOptions.push(defaultOptions[i]['value']);
        }                            
        if(!allOptions.includes(newValue)){
            allOptions.push(newValue);
            allOptions.sort(); 
            for(var i=0 ;i < allOptions.length ; i++){
                options.push({                   
                    label: allOptions[i],
                    value: allOptions[i]
                });   
            }   
            return options
        }else     
            return defaultOptions;
    },
    
    //Get reference values for columns
    getRefernceFieldValue : function(component, fieldRefrnc, data) {
        var fieldName = fieldRefrnc.split('.');                   
        var label = null;
        if(fieldName.length > 1)
            label = data[fieldName[0]] != undefined?data[fieldName[0]][fieldName[1]]:null;
        else
            label = data[fieldName[0]] != undefined?data[fieldName[0]]:null;
        
        return label;
    },
    
    //Format the column specification based on fields
    formatColumnData: function(component, columns){
        var columnData = {};
        var dataKeys =[], chngeEvntRequrdFlds = [];
        //Specifications of column data by field name
        for(var i=0 ;i < columns.length ; i++){                   
            columnData[columns[i]['fieldName']] = {'type':columns[i]['type'],
                                                   'editable':columns[i]['editable'],
                                                   'placeholder' : columns[i]['placeholder'],
                                                   'options' : columns[i]['options'],
                                                   'changeEventRequired' : columns[i]['changeEventRequired'],
                                                   'isRestricted': columns[i]['isRestricted'],                                                  
                                                   'enableLinkToRecord':columns[i]['enableLinkToRecord']};
            
            if(columns[i]['type'] != 'hidden')
                dataKeys.push(columns[i]['fieldName']);
            
            if(columnData[columns[i]['fieldName']]['changeEventRequired'])            
                chngeEvntRequrdFlds.push(columns[i]['fieldName']);         
        }      
        component.set("v.chngEvntRequrdFlds",chngeEvntRequrdFlds);  
        component.set("v.dataKeys", dataKeys);    
        component.set("v.columnData",columnData);
    },
    
    //Format a data record
    formatDataRecord: function(component, data){ 
        var columnData = component.get("v.columnData"); 
        var value ='', label ='' , tooltip='', placeholder='', enableLinkToRecord ='';          
        var formattedData = [], options = [];
        var editable = false;
        for(var key in columnData){              
            value = data[key] == undefined?'':data[key];                        
            enableLinkToRecord = columnData[key]['enableLinkToRecord'] == undefined?false:columnData[key]['enableLinkToRecord'];
            
            if(component.get("v.mode") == 'edit')
                editable = columnData[key]['editable'];                
            
            if(columnData[key]['type'] == 'picklist'){                                                     
                if(data[key] != undefined && data[key] != '')
                    options = columnData[key]['isRestricted']?columnData[key]['options']:this.processPickValue(component,columnData[key]['options'],data[key]);
                else
                    options = columnData[key]['options'];                  
            }else if(columnData[key]['type'] == 'link'){                      
                label = this.getRefernceFieldValue(component, columnData[key]['options']['label'], data);   
                tooltip = this.getRefernceFieldValue(component, columnData[key]['options']['tooltip']['tooltiptext'], data); 
                placeholder = label == null?columnData[key]['options']['alternativeText']:label;
            }else if(columnData[key]['type'] == 'image'){ 
                // value = data[i][key] == undefined?'/resource/GrowthPlan_NotStarted':data[i][key];
            }                   
            formattedData[key] = {                                
                'type' : columnData[key]['type'],    
                'editable' : editable,  
                'value' : value,
                'placeholder':placeholder,
                'options' : options,
                'tooltip': tooltip,
                'enableLinkToRecord': enableLinkToRecord      
            };                
            
        }
        
        return formattedData; 
    },
    
    //Format a list of data
    formatDataList: function(component){      
        var columnData = component.get("v.columnData");         
        var data = component.get("v.data");       
        var allData = [];       
        //Format data to include specifications like placeholder, type and options   
        if(data.length > 0){          
            for(var i=0 ;i < data.length; i++){               
                allData[i] = this.formatDataRecord(component, data[i]);                
            }
        }    
        component.set("v.formattedData", allData);          
        return allData;
    },
    
    //Update table properties dynamically based on the content
    updateTableState : function(component){
        var globalId = component.getGlobalId();        
        var tableBody = document.getElementById(globalId+'_table-body');  
        var table = document.getElementById(globalId+"_table-section"); 
        if(tableBody.offsetHeight >= 400)
            component.set("v.tableCSS",'ct-table-fixed');
        else
            component.set("v.tableCSS",'');     
        window.scrollTo({ left: 0, top: document.documentElement.scrollHeight, behavior: "smooth" });                        
        table.scrollTop = table.scrollHeight; 
    },
     //Update table properties dynamically based on the content
    updateTableView : function(component){
        var globalId = component.getGlobalId();        
        var tableBody = document.getElementById(globalId+'_table-body'); 
        if(tableBody.offsetHeight >= 400)
            component.set("v.tableCSS",'ct-table-fixed');
        else
            component.set("v.tableCSS",'');       
    },
    //Set focus to the first element in the row
    setTabFocus: function(component){        
        var dataRow = component.find('dataRow'); 
        if(Array.isArray(dataRow) && dataRow != undefined){
            if(dataRow[dataRow.length-1] != undefined)
                dataRow[dataRow.length-1].setTabFocus();                         
        }                        
        else if(!Array.isArray(dataRow) && dataRow != undefined)                    
            dataRow.setTabFocus(); 
    }
})