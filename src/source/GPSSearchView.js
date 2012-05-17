﻿enyo.kind({
    name: "GpsSearchView",
    kind: enyo.VFlexBox,
    className: "enyo-bg",
    events: {
        onStationSelected: "",
        onFuelTypeSearch: "",
        onClosedCheck: "",
        onBackButton: ""
    },
    published: {
        data: [],
        gpsData: {}
    },
    components: [
        {kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
            {kind: "SpinnerLarge"}
        ]},
        {name: "getPositionStations", kind: "WebService",
            url: "http://imperialcoder.no.de/GpsData/",
            method: 'GET',
            onSuccess: "gotStations",
            onFailure: "gotStationsFailure"
        },
        {
            kind: "PageHeader",
            name: "header",
            pack: "center",
            components: [
                {
                    kind: "ToolButton",
                    name: 'back',
                    icon: "images/arrow-left.png",
                    className: "enyo-light-menu-button",
                    onclick: 'backButtonClicked'
                },
                {kind: "Spacer" },
                {
                    kind: "Control",
                    name: "title",
                    content: $L("Fuel Austria"),
                    className: "enyo-text-header page-title"
                }
            ]
        },
        {
            kind: "Scroller",
            flex: 1,
            components: [{
                kind: "VFlexBox",
                className: "box-center",
                components: [
                    {kind: "RowGroup", caption: $L("Stations"), components: [
                        {kind: "VirtualRepeater", onSetupRow: 'getItem', name: 'priceList', components: [
                            {kind: "Item", name:'listItem', tapHighlight: true, layoutKind: "HFlexLayout", onclick: "stationSelected",  components: [
                                {name: "gasStationName", flex: 4},
                                {name: "price", flex: 2},
                                {kind: "Image", flex: 1, name:"open", width:18, height:18}
                            ]}
                        ]}
                    ]}
                ]}
            ]
        }
    ],
    create: function() {
        this.inherited(arguments);
        this.dataChanged();
    },
    load: function(gpsData){
        this.setGpsData(gpsData);
        //this.showScrim(true);
    },
    gotStations: function(sender, response, request){
        if(!response.success){
            //TODO: error msg
            enyo.error(JSON.stringify(response));
            this.showScrim(false);
            return;
        } else {
            //load data;
            this.$.priceList.render();
            this.showScrim(false);
        }
    },
    gotStationsFailure: function(sender, response, request){
        enyo.error(enyo.json.stringify(response));
        //TODO:
    },
    getItem: function(sender, index) {
        var record = this.getData()[index];
        if (record) {
            this.$.gasStationName.setContent(index + 1 + '. ' + record.gasStationName);
            this.$.price.setContent('€ ' +  record.spritPrice[0].amount);
            this.$.open.setSrc(this.translateBoolean(record.open));
            return true;
        }
    },
    stationSelected: function(sender, mouseEvent, index){
        var station = this.getData()[index];
        this.doStationSelected(station);
    },
    translateBoolean: function(open){
        if(open){
            return 'images/open.png';
        } else {
            return 'images/closed.png';
        }
    },
    //
    dataChanged: function(){
        this.$.data = this.data;
        this.$.gpsData = this.gpsData;
    },
    backButtonClicked: function(sender, mouseEvent) {
        this.doBackButton();
    },
    showScrim: function(inShowing) {
        this.$.scrim.setShowing(inShowing);
        this.$.spinnerLarge.setShowing(inShowing);
    }
});