({
    //To be executed on component initialization
    doInit: function(component,event,helper){
        var record = component.get("v.selectedRecord");
        var globalId = component.getGlobalId(); 
        //Set values on loading (when prefilled)
        if(record != undefined){
            if(record.Name != undefined){
                component.find("pill").set("v.name",record.Name);
                component.find("pill").set("v.label",record.Name);
                var searchicon = component.find("searchicon");
                $A.util.addClass(searchicon, 'slds-hide');
                $A.util.removeClass(searchicon, 'slds-show');
                
                var forclose = component.find("lookup-pill");
                $A.util.addClass(forclose, 'slds-show');
                $A.util.removeClass(forclose, 'slds-hide');
                
                var forclose = component.find("searchRes");
                $A.util.addClass(forclose, 'slds-is-close');
                $A.util.removeClass(forclose, 'slds-is-open');
                
                var lookUpTarget = component.find("lookupField");
                $A.util.addClass(lookUpTarget, 'slds-hide');
                $A.util.removeClass(lookUpTarget, 'slds-show'); 
            }
        }else{
            $A.enqueueAction(component.get('c.clear'));
        }       
        //if(component.get("v.multiSelect")){
            document.addEventListener("click",  (evt) =>  {
                var flyoutElement = document.getElementById(globalId+'_clookupinput'),
                    targetElement = evt.target;  // clicked element  
                if(flyoutElement != null){
                    do{
                        if(targetElement == flyoutElement){                                          
                            return;
                        }
                        // Go up the DOM
                        if(targetElement != undefined)       
                        targetElement = targetElement.parentNode;
                    }while (targetElement);                
                    // This is a click outside.
                    $A.enqueueAction(component.get("c.onblur"));  
            	}                               
            });
        //}
    },
    
    //Execute when the lookup gains focus
    onfocus : function(component,event,helper){
        component.getEvent("CustomLookupFocus").setParams({"Type" : component.get("v.Type")}).fire(); 
        if(component.get("v.defaultSearchResultOn")){
            var accountId = component.get('v.mpAcc') ;
            var projectId = component.get('v.mpPro'); 
            var meetingPlannerId = component.get('v.mpId');
            var objecttype = component.get("v.Type");
            $A.util.addClass(component.find("mySpinner"), "slds-show");
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');        
            var getInputkeyWord = component.get("v.SearchKeyWord");
            if (objecttype=='contactRecordList') 
                helper.searchContact(component,event,getInputkeyWord,accountId,projectId,meetingPlannerId);
            else if(objecttype == 'userRecordList')
                helper.searchUser(component,event,getInputkeyWord,accountId,projectId,meetingPlannerId);
                else 
                    helper.searchHelper(component,event,getInputkeyWord,component.get("v.offset"));
        }        
    },
    onblur : function(component,event,helper){       
        component.set("v.listOfSearchRecords", null );
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },
    //To be executed on key press 
    keyPressController : function(component, event, helper) {         
        component.getEvent("CustomLookupFocus").setParams({"Type" : component.get("v.Type")}).fire(); 
        if(component.get("v.defaultSearchResultOn")){
        var getInputkeyWord = component.get("v.SearchKeyWord");
        var objecttype = component.get("v.Type");
        var accountId = component.get('v.mpAcc') ;
        var projectId = component.get('v.mpPro'); 
        var meetingPlannerId = component.get('v.mpId');          
        if( getInputkeyWord.length > 0 ){            
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');            
            if(objecttype == 'contactRecordList') 
                helper.searchContact(component,event,getInputkeyWord,accountId,projectId,meetingPlannerId);
            else if(objecttype == 'userRecordList')
                helper.searchUser(component,event,getInputkeyWord,accountId,projectId,meetingPlannerId);
                else
                    helper.searchHelper(component,event,getInputkeyWord, component.get("v.offset"));
        }
        else{  
            component.set("v.listOfSearchRecords", null ); 
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');           
        } }
    },
    
    // function for clear the Record Selaction 
    clear :function(component,event,heplper){
        if(!component.get("v.readonly")){
            var pillTarget = component.find("lookup-pill");
            var lookUpTarget = component.find("lookupField"); 
            
            $A.util.addClass(pillTarget, 'slds-hide');
            $A.util.removeClass(pillTarget, 'slds-show');
            
            $A.util.addClass(lookUpTarget, 'slds-show');
            $A.util.removeClass(lookUpTarget, 'slds-hide');
            
            var searchicon = component.find("searchicon");
            $A.util.removeClass(searchicon, 'slds-hide');
            
            component.set("v.SearchKeyWord",'');
            component.set("v.listOfSearchRecords", null );
            component.set("v.selectedRecord", {} );
        }           
    },
    
    // This function call when the end User Select any record from the result list.   
    handleComponentEvent : function(component, event, helper) {        
        var selectedAccountGetFromEvent = event.getParam("recordByEvent");        
        if(component.get("v.multiSelect")){
            component.set("v.SearchKeyWord",null);
            var listSelectedItems =  component.get("v.lstSelectedRecords");            
            listSelectedItems.push(selectedAccountGetFromEvent);
            component.set("v.lstSelectedRecords" , listSelectedItems); 
        }else{
            component.set("v.selectedRecord" , selectedAccountGetFromEvent); 
            var searchicon = component.find("searchicon");
            $A.util.addClass(searchicon, 'slds-hide');
            
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');          
            
            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show'); 
        }     
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
        component.getEvent("HandleLookupSelection").setParams({"Type" : component.get("v.Type")}).fire();        
    },
    //Display advanced search popup
    showAdvancedSearch: function(component, event, handler){
        component.set("v.showSearch",true);       
    },
    //Close advanced search popup
    closeSearch: function(component, event, handler){
        component.set("v.showSearch",false);
    },
    pillClear :function(component,event,heplper){
        var selectedPillId = event.getSource().get("v.name");
        var AllPillsList = component.get("v.lstSelectedRecords"); 
        var excludeRcrds = component.get("v.excludeRecords");         
        for(var i = 0; i < AllPillsList.length; i++){          
            if(AllPillsList[i].Id == selectedPillId){                           
                if(selectedPillId != undefined){          
                    var index = excludeRcrds.findIndex(x => x.Id == AllPillsList[i]['Id']);                      
                    excludeRcrds.splice(index, 1); 
                    component.set("v.excludeRecords", excludeRcrds);  
                }	
                AllPillsList.splice(i, 1);
                component.set("v.lstSelectedRecords", AllPillsList);    
            }  
        }        
        component.set("v.SearchKeyWord",null);
        component.set("v.listOfSearchRecords", null );      
    },
})