﻿enyo.kind({
    name: "DistrictSelectionView",
    kind: enyo.VFlexBox,
    className: "enyo-bg",
    events: {
        onSearchClick: "",
        onBackClick: "",
        onFuelTypeSearch: "",
        onClosedCheck: ""
    },
    components: [
        {name: "getBezirksData", kind: "WebService",
            url: "http://www.spritpreisrechner.at/ts/BezirkStationServlet",
            method: 'GET',
            onSuccess: "gotData",
            onFailure: "gotDataFailure"},
        {name: "getAllBezirke", kind: "WebService",
            url: "http://www.spritpreisrechner.at/ts/BezirkDataServlet",
            method: 'GET',
            onSuccess: "gotBezirke",
            onFailure: "gotBezirkeFailure"
        },
        {
            kind: "Scroller",
            flex: 1,
            components: [{
                kind: "VFlexBox",
                className: "box-center",
                components: [
                    {kind: "ListSelector", label:'Bundesland', name:'federalStateSelector', popupAlign:'left', contentPack:'middle', onChange: "federalStateChanged", items: []},
                    {kind: "ListSelector", label:'Bezirk', name:'districtSelector', popupAlign:'left', contentPack:'middle', onChange: "districtChanged", items: []},
                    {kind: "Button", caption: "Bezirkssuche",  onclick: "onBezirksAuswahlSucheClick"},
                    {kind: "VirtualRepeater", onSetupRow: 'getItem', name: 'priceList', components: [
                        {kind: "Item", name:'listItem', layoutKind: "HFlexLayout", onclick: "doListTap",  components: [
                            {name: "gasStationName", flex: 2},
                            {name: "price", flex: 1},
                            {name: "open", flex: 1},
                            {kind: "Image", width:18, height:18, src: "images/arrow-right.png"}
                        ]}
                    ]}
                ]}
            ]
        },
        {kind: enyo.Toolbar, pack: "center", components: [
            {kind: "Spacer"},
            {
                kind: "ToolButton",
                name: 'back',
                icon: "images/arrow-left.png",
                className: "enyo-light-menu-button",
                onclick: "handleBackClick"
            },
            {
                kind: "ToolButton",
                //caption: "Refresh",
                name: 'refreshList',
                icon: "images/icons/toolbar-icon-sync.png",
                className: "enyo-light-menu-button",
                onclick: "refresh"
            }
            ,{kind: "Spacer"}
        ]}
    ],
    create: function() {
        enyo.log('districtSearch create')
        this.inherited(arguments);
        this.$.getAllBezirke.call();
    },
    gotData: function(sender, response, request) {
        if(enyo.isArray(response)) {
            this.data = response;
        }
        this.$.priceList.render();
    },
    gotDataFailure: function(sender, response, request) {
        enyo.log('failure');
    },
    gotBezirke: function(sender, response, request){
        this.federalStates = this.getFederalStates(response);
        var items = [];
        enyo.forEach(this.federalStates, function(state){
            items.push({caption: state.bezeichnung, value: state.code, record: state});
        }, this);
        this.$.federalStateSelector.setItems(items);
    },
    gotBezirkeFailure: function(sender, response, request){
        enyo.log('bezirke error');
    },
    onBezirksSucheClick: function(inSender, inTwo, inThree) {
        this.$.getAllBezirke.call();
    },
    federalStateChanged: function(sender, value, oldValue) {
        if(value !== oldValue){
            var record;
            enyo.forEach(this.$.federalStateSelector.items, function(item){
                if(item.value === value){
                    record = item.record;
                    return false;
                }
            }, this);
            var items = [{caption: 'Alle', value:0}];
            enyo.forEach(record.unterregionen, function(district){
                items.push({ caption: district.bezeichnung, value: district.code});
            }, this);
            this.$.districtSelector.setItems(items);
            this.$.districtSelector.setValue(-1);
        }
    },
    districtChanged: function(sender, value, oldValue) {
        enyo.log(value);
    },
    onBezirksAuswahlSucheClick: function(inSender, inTwo, inThree) {
        var state = this.$.federalStateSelector.getValue();
        var district = this.$.districtSelector.getValue();
        var fuelType = this.doFuelTypeSearch();
        var allDistricts = false;

        var districtOrState = "PB";
        if(!district){
            districtOrState = "BL";
            allDistricts = true;
        }

        var checked = '';
        if(this.doClosedCheck()){
            checked = 'checked';
        }

        var data = '[' + (allDistricts ? state : district) + ', \"' + districtOrState + '\", \"' + fuelType +'\", \"' + checked + '\"]';

        this.$.getBezirksData.call({data: data});
        //this.doSearchClick();
    },

    handleBackClick: function(sender, mouseEvent) {
        this.doBackClick();
    },

    getFederalStates: function(stateObjects){
        var states = [];
        states.push(stateObjects.Burgenland);
        states.push(stateObjects.Kärnten);
        states.push(stateObjects.Niederösterreich);
        states.push(stateObjects.Oberösterreich);
        states.push(stateObjects.Salzburg);
        states.push(stateObjects.Steiermark);
        states.push(stateObjects.Tirol);
        states.push(stateObjects.Vorarlberg);
        states.push(stateObjects.Wien);
        return states;
    }
});