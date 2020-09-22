({
    searchHelper : function(component, event, getInputkeyWord, offset) {        
        // call the apex class method 
        var action = component.get("c.fetchLookUpValues");
        // set param to method  
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'ObjectName' : component.get("v.objectAPIName"),
            'fieldAPIName': component.get("v.fieldAPIName"),
            'additionalField' : component.get("v.additionalField").split(';'),
            'jsonFilters' : JSON.stringify(component.get("v.filters")),
            'datalimit' : $A.get("$Label.c.Customlookup_default_search_datalimit"), //data limit displayed in the lookup result
            'offset'    : offset
        });
        // set a callBack    
        action.setCallback(this, function(response) {
            $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();                
                if (storeResponse.length == 0) {
                    component.set("v.Message", 'No Result Found...');
                } else {
                    component.set("v.Message", '');
                }               
                component.set("v.listOfSearchRecords", storeResponse);
            }
            
        });
        // enqueue the Action  
        $A.enqueueAction(action);
        
    },
    
	searchContact : function(component,event,getInputkeyWord,accountId,projectId,meetingPlannerId) {
        var action = component.get("c.fetchLookUpContacts");
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'accountId':accountId,
            'projectId':projectId,
            'meetingPlannerId':meetingPlannerId,
            'additionalField' : component.get("v.additionalField").split(';'),
            'excludeRecords' : component.get("v.excludeRecords")
        });  
        action.setCallback(this, function(response) {
            $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") { 
                                                                    
                var storeResponse = response.getReturnValue();
                var totalLength = storeResponse.length 
                storeResponse.length == 0 ?  component.set("v.Message", 'No Result Found...'):component.set("v.Message", ''); 
                var listData = []; 
                for(var i=0;i < totalLength; i++){ 
                    listData.push({
                        'Id':storeResponse[i].Id,
                        'Name': storeResponse[i][component.get("v.fieldAPIName")],
                        'Title':storeResponse[i].Title,
                        'Email':storeResponse[i].Email,
                        'Phone':storeResponse[i].Phone,
                        'Account.name':(storeResponse[i].Account) ? storeResponse[i].Account.Name:'Null',
                    })
                } 
                component.set("v.listOfSearchRecords", listData);
            }
        });$A.enqueueAction(action);  
    },
	searchUser : function(component,event,getInputkeyWord,accountId,projectId,meetingPlannerId) {       
        var action = component.get("c.fetchLookUpUsers");
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'accountId':accountId,
            'projectId':projectId,
            'meetingPlannerId':meetingPlannerId,
            'additionalField' : component.get("v.additionalField").split(';'),
            'userLicense': component.get("v.userLicense"),
            'excludeRecords' : component.get("v.excludeRecords")
        });  
        action.setCallback(this, function(response) {
            $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") {   
                var roleName;
                var storeResponse = response.getReturnValue();
                var totalLength = storeResponse.length 
                storeResponse.length == 0 ?  component.set("v.Message", 'No Result Found...'):component.set("v.Message", ''); 
                var listData = []; 
                for(var i=0;i < totalLength; i++){ 
                    	listData.push({
                        'Id':storeResponse[i].Id,
                        'Name': storeResponse[i][component.get("v.fieldAPIName")],
                        'Title':storeResponse[i].Title,
                        'Username':storeResponse[i].Username        
                   	 })
                }                
                component.set("v.listOfSearchRecords", listData);
            }
        });$A.enqueueAction(action);  
    }
})