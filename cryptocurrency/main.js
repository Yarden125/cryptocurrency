/// <reference path="jquery-3.4.1.js"/>

//IIFE:
(() => {

    // Document Ready:
    $(() => {

        const urlLink = "https://api.coingecko.com/api/v3/coins/";
        let allCards = [];
        let chosenCards = [];
        let chosenCardsHolder = [];
        let index = 0;

        let allCoinsNames = [];
        let coinsChosen = "";
        let graphPoints = {};
        let graphArray = [];
        let pointsTimer = null;

        // Show loading bar:
        $(".loadingBarClass").show();
        //On page-load show the requested details from the API:
        getHomePageData();   

        //get Details from API
        function getHomePageData(){
            getDetails(urlLink + "list")
            .then(details => {
                printDetails(details);
                $(".loadingBarClass").hide();
                clearLocalStorage();
            })
            .catch(error => {
                alert(error);
            });
        }

        // Initializing function:
        function init() {

            // Bind to scroll event - Parallax:
            $(window).scroll(()=>{
                parallax();
            });   

            // Bind to click event- "Home" link - show coins by clicking on the "Home" link:
            $("#coinsContainer").click(() => {
                initHomePage(); 
            });

            // Bind to click event- "Live Reports" link - on click initialize the live reports function:
            $("#reportsContainer").click(() => {
                initLiveReports();
            });

            // Bind to click event- "About" link - on click shows the About content:
            $("#aboutContainer").click(() => {
                initAbout();
            });

            // Bind to click event- Search button - on click searches for the card matching to the word the user typed in the input box:
            $("#searchButton").click(() => {
                $(".loadingBarClass").show();
                searchCoin();
                $(".loadingBarClass").hide();
            });

            // Bind to click event- Clear Selected- on click removes all coins selected:
            $("#clearSelectedButton").click(()=>{
                for( let i=0; i<chosenCards.length; i++){
                    $(`#toggleSelect_${chosenCards[i].coinSymbol}`).prop('checked', false);
                }
                chosenCards=[];
            });
        }

         //Parallax effect- background moves slower than foreground:
         function parallax(){
            const windowScroll = $(window).scrollTop();
            $(".parallax").css("background-position", `center ${windowScroll*-0.5}px`);
        }

        // Initialize Home page:
        function initHomePage(){
            clearInterval(pointsTimer);
            $("#coinsDetailsContainer").show();
            createLoadingImage("#coinsDetailsContainer");
            $("#reportDetailsContainer").hide();
            $("#aboutContentContainer").hide();
            $("#searchBarDiv").show();
            $("#chartContainer").hide();
            $("#noSearchResultDiv").hide();
            clearSearchResult();
            $(".loadingBarClass").hide();
        }

          // Initialize Live Report page:
          function initLiveReports(){
            clearInterval(pointsTimer);
            $("#noSearchResultDiv").hide();
            clearSearchResult();
            $("#searchBoxId").val("");
            if(chosenCards.length === 0){
                alert("No coins were selected.\nPlease choose your coins first and then click on Live Reports.");
                $("#reportDetailsContainer").hide();
                $("#coinsDetailsContainer").show();
                $("#searchBarDiv").show();
            }
            else{
                coinsChosen="";
                graphPoints = {};
                graphArray = [];
                allCoinsNames =[];
                $("#reportDetailsContainer").empty().show();
                createLoadingImage("#reportDetailsContainer");
                $("#coinsDetailsContainer").hide();
                $("#aboutContentContainer").hide();
                $("#searchBarDiv").hide();
                createSymbolString();
                $("#chartContainer").show();
                createGraphData();
                printChart();
                createDataWithSetInterval();
            }
        }
    
        // Initialize About page:
        function initAbout(){
            clearInterval(pointsTimer);
            $("#aboutContentContainer").empty().show();
            createLoadingImage("#aboutContentContainer");
            printAboutContent();
            $("#coinsDetailsContainer").hide();
            $("#reportDetailsContainer").hide();
            $("#searchBarDiv").hide();
            $("#chartContainer").hide();
            $("#noSearchResultDiv").hide();
            clearSearchResult();
            $("#searchBoxId").val("");
            $(".loadingBarClass").hide();
        }
   
        // Create loading image:
        function createLoadingImage(selector){
            const loadingImg = `<img class="loadingBarClass" src="/assets/images/loading2.gif">`;
            $(selector).append(loadingImg);
            $(".loadingBarClass").show();
        }

        // print the details from the API:
        function printDetails(details) {
            $("#coinsDetailsContainer").empty();
            index = 0;
            for (let i = 0; i < 200; i++) {
                //create object using the retrieved details:
                const cardObj = {
                    id: index,
                    coinName: details[i].name,
                    coinSymbol: details[i].symbol,
                    coinId: details[i].id,
                };
                // Add object to allCards array:
                pushToArray(allCards, cardObj);

                // For each object create html and insert to DOM:
                printCardDetails(cardObj);

                // Bind More Info button to click event :
                $(`#moreInfoButton_${cardObj.coinId}`).click(() => {
                    checkMoreInfoOpenClosed(cardObj);
                    // Show loader image:
                    $(`#moreInfoCollapser_${cardObj.coinId} > .loadingBarMoreInfo`).show();
                });

                // Bind Toggle-select to click event:
                $(`#toggleSelect_${cardObj.coinSymbol}`).click(() => {
                    // check toggle On or Off:
                    checkToggleOnOff(`#toggleSelect_${cardObj.coinSymbol}`, cardObj);
                });
                index++;
            }
            // create modal html and insert to DOM:
            createModal();
            $("#chartContainer").hide();
        }

        // check if More Info collapse is open or closed:
        function checkMoreInfoOpenClosed(cardObj){
            if($(`#collapse_${cardObj.coinId}`).is('.collapse:not(.show)')){
                checkLocalStorage(`#moreInfoButton_${cardObj.coinId}`, cardObj.coinId);
            }
            else{
                $(`#collapse_${cardObj.coinId}`).collapse();
            }
        }

        // Checks if there's already data saved on the local storage:
        function checkLocalStorage(key, coinId) {
            // if there is - loads the saved data from the local storage:
            if ((localStorage.getItem(key)) !== null) {
                loadFromLocalStorage(key);
            }
            // if there isn't - gets the more info from the API:
            else {
                getMoreInfo(coinId);
            }
        }
        
         // Clear Local Storage:
         function clearLocalStorage(){
            for(let i=0; i<allCards.length; i++){
                if((localStorage.getItem(`#moreInfoButton_${allCards[i].coinId}`)) !== null){
                    removeFromLocalStorage(`#moreInfoButton_${allCards[i].coinId}`);
                }
            }
        }

        // Prints card details:
        function printCardDetails(cardObj) {
            const coinId = `<div id="coinId" class="coinIdClass">${cardObj.coinId}</div>`;
            const symbol = printCoinSymbol(cardObj.coinSymbol);
            const name = printCoinName(cardObj.coinName);
            const cardDetails = `<div class="card-body2">${symbol}<br>${name}</div>`;
            const moreInfo = `<p>
                                <button id="moreInfoButton_${cardObj.coinId}" class="btn btn-primary moreInfoButton" 
                                type="button" data-toggle="collapse" data-target="#collapse_${cardObj.coinId}" 
                                aria-expanded="false" aria-controls="collapse_${cardObj.coinId}">More Info</button>
                              </p>
                              <div class="collapse" id="collapse_${cardObj.coinId}">
                                <div id="moreInfoCollapser_${cardObj.coinId}" class="card card-body loadingBarClassborder">
                                    <img class="loadingBarMoreInfo" src="/assets/images/loading2.gif">
                                </div>
                              </div>`;
            const toggleSelect = printToggleSelect(`${cardObj.coinSymbol}`);
            const eachCard = `<div id="eachCard_${cardObj.id}" class="card cardClass col-12 col-md-3 text-left"">
            ${toggleSelect}${coinId}${cardDetails}<br>${moreInfo}</div>`;
            $("#coinsDetailsContainer").append(eachCard);
        }

        // Gets more information by sending the coin's id:
        function getMoreInfo(coinId) {
            // gets the API with promise:
            getDetails(urlLink + coinId)
                .then(details => {
                    arrangeMoreInfo(details);
                    $("#loadingBar").hide();
                })
                .catch(error => {
                    alert(error);
                });
        }

        // Arrange retrieved more info data:
        function arrangeMoreInfo(details) {
            const moreInfoObj = {
                coinId: details.id,
                coinImage: details.image.thumb,
                coinUsd: details.market_data.current_price.usd,
                coinEur: details.market_data.current_price.eur,
                coinIls: details.market_data.current_price.ils
            };
            printMoreInfo(moreInfoObj);
            saveToLocalStorage(`#moreInfoButton_${moreInfoObj.coinId}`, moreInfoObj);
            setTimerToRemoveData(`#moreInfoButton_${moreInfoObj.coinId}`);
        }

        //Print the info from the API into the collapse box:
        function printMoreInfo(detailsData) {
            const coinImage = `<div><img src="${detailsData.coinImage}"></div><br>`;
            const coinUsd = `<p>USD: ${detailsData.coinUsd}$</p>`;
            const coinEur = `<p>EUR: ${detailsData.coinEur}&euro;</p>`;
            const coinIls = `<p>ILS: ${detailsData.coinIls}&#8362;</p>`;
            const divCollapsContant = `<div class="card card-body">${coinImage}${coinUsd}${coinEur}${coinIls}</div>`;
            $(`#moreInfoCollapser_${detailsData.coinId}`).empty().append(divCollapsContant);
        }

        // Print About page:
        function printAboutContent() {
            const aboutContent = 
                `<div class="aboutImageClassDiv col-12 col-sm-6 col-md-6">
                    <img src="/assets/images/myPic.jpg" class="aboutImageClass"/>
                </div>
                <div class="aboutTextClass col-12 col-sm-6 col-md-6">
                    <div class="aboutMeTextClass">
                        <p class="aboutProjectClass">
                            Hello! My name is Yarden.<br>
                            I'm a current student at John Bryce, studing to become a Fullstack Web Developer.
                        </p>
                    </div>
                    <div class="aboutProjectTextClass">
                        <p class="aboutProjectClass">
                            In this project I created a Single Page Application website, 
                            which retrieves and presents data from an API taken from the Cryptocurrency world. 
                        </p>
                        <p class="aboutProjectClass">
                            Here you would be able to see a veriety of coins, their worth compaired to the USD, EUR and NIS, 
                            narrow down your search by simply entering a search word, 
                            see a live report of the different coins in a chart, and trak its updates in real time.<br>
                        </p>
                        <p class="aboutProjectClass">   
                            Hope you find this website helpful and easy to use.<br>
                        </p>
                        <p class="aboutProjectClass">
                            Enjoy!
                        </p>
                    </div>
                </div>`;
            $("#aboutContentContainer").append(aboutContent);
        }

        // Timer-Removes saved data from local storage after 2 minuts:
        function setTimerToRemoveData(key) {
            setTimeout(() => {
                removeFromLocalStorage(key);
            }, 120 * 1000);
        }

        // Search a specific coin with the search button:
        function searchCoin() {
            let count = 0;
            const searchWord = $("#searchBoxId").val();
            const searchWordlowerCase = turnToLowercase(searchWord);
            let isValid = validateInboxContent();
            if (isValid) {
                $("#noSearchResultDiv").empty();
                createClearSearchButton();
                for (let i = 0; i < allCards.length; i++) {
                    if (!(allCards[i].coinSymbol.includes(searchWordlowerCase))) {
                        $(`#eachCard_${allCards[i].id}`).hide();
                        count++;
                        if(count === allCards.length){
                            const message = `<p class="noSearchResultClass">Sorry! No matches have been founed.</p>`;
                            $("#noSearchResultDiv").append(message).show();
                        }
                    }
                    else {
                        $(`#eachCard_${allCards[i].id}`).show();
                    }
                }
            }
            else {
                alert("No search word has been entered. \nPlease write your search in the search box.");
            }
            $("#searchBoxId").val("");
        }

        // convert UpperCase letters to LowerCase letter:
        function turnToLowercase(searchWord){
            if(searchWord===searchWord.toUpperCase()){
                searchWord =  searchWord.toLowerCase();
            }
            return searchWord;
        }

        // Validates that the input box is not empty when when user is clicking on "search":
        function validateInboxContent() {
            if (($("#searchBoxId").val()) === "") {
                return false;
            }
            return true;
        }

        // Create "Clear Search Button":
        function createClearSearchButton() {
            const clearSearchButton = `<button type="button" id="clearSearchButtonId" class="btn btn-sm searchButtonClass">Clear Search</button>`;
            $("#clearSearchButtonDiv").empty().append(clearSearchButton);
            $("#clearSearchButtonId").click(() => {
                clearSearchResult();
            });
        }

        // Clears search result:
        function clearSearchResult(){
            $("#noSearchResultDiv").hide();
                for (let i = 0; i < allCards.length; i++) {
                    if ($(`#eachCard_${allCards[i].id}`).hide()) {
                        $(`#eachCard_${allCards[i].id}`).show();
                    }
                }
            $("#clearSearchButtonId").remove();
        }

        // Get API with Promise
        function getDetails(url) {
            return new Promise((resolve, reject) => {
                $.getJSON(url, details => {
                    resolve(details);
                }).fail(err => {
                    reject(err);
                });
            });
        }

        // Add object to array:
        function pushToArray(array, object) {
            array.push(object);
        }

        // Removes the last item from array:
        function removeLastFromArray(array) {
            array.pop();
        }

        // Checks if toggle switch is On or Off:
        function checkToggleOnOff(id, cardObj) {
            // If Toggle was turned On:
            if ($(id).is(":checked")) {
                // ckeck array limit:
                checkArrayLimit(chosenCards, cardObj, id);
            }
            // If toggle was already turned On - turns it Off
            else {
                removeCard(id);
            }
        }

        // Check array limit - Make sure that only 5 coins or less can be selected. 
        // The sixth coin will pop up the Modal:
        function checkArrayLimit(arr, cardObj) {
            if (arr.length > 4) {
                pushToArray(chosenCards, cardObj);
                printModalOptions();
                $('#modalId').modal('show');
            }
            else {
                pushToArray(chosenCards, cardObj);
            }
        }

          // Remove object from array:
          function removeCard(id) {
            for (let i = 0; i < chosenCards.length; i++) {
                if (`#toggleSelect_${chosenCards[i].coinSymbol}` === id) {
                    chosenCards.splice(i, 1);
                }
            }
        }

        // Creates the html for the Modal and adds it to the DOM:
        function createModal() {
            const modal = 
                `<div class="modal fade" id="modalId" tabindex="-1" role="dialog" aria-labelledby="modalIdTitle" aria-hidden="true" data-backdrop="static" data-keyboard="false">
                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <p class="modal-title" id="modalIdTitle">Only five items are allowed.
                                    <br>Your sixth choice hadn't been saved.<br>
                                    Please select an item to remove and press "Save changes" to save. 
                                    <br>Otherwise your sixth choice will be removed.
                                </p>
                                <button id="xButtonId" type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div id="modal-body-id" class="modal-body"></div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary closeButton" data-dismiss="modal" id="modalCloseButton">Close</button>
                                <button type="button" class="btn btn-primary saveButton" data-dismiss="modal" id="modalSaveButton">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            $("#sectionId").append(modal);

            // Bind Modal Close button to click event:
            $("#modalCloseButton").click(() => {
                abortModal("#modal-body-id");
            });

            // Bind Modal X button to click event:
            $("#xButtonId").click(() => {
                abortModal("#modal-body-id");
            });

            //  Bind Modal Save Changes button to click event:
            $("#modalSaveButton").click(() => {
                if (chosenCards.length > 5) {
                    removeLastFromArray(chosenCards);
                }
                $("#modal-body-id").empty();
                checkUncheckToggle();
            });
        }

        //Print Modal options:
        function printModalOptions() {
            for (let i = 0; i < chosenCards.length; i++) {
                const symbol = `<div class="modalOptionSymbol">${printCoinSymbol(chosenCards[i].coinSymbol)}</div>`;
                const name = `<div class="modalOptionName">${printCoinName(chosenCards[i].coinName)}</div>`;
                const toggleSelect = `<div class="modalOptionToggle">${printToggleSelect(chosenCards[i].coinSymbol)}</div>`;
                const options = `<div class="modalOptionDiv">${symbol}${toggleSelect}${name}</div>`;
                $("#modal-body-id").append(options);
                changeUncheckedToChecked();
                $(`#toggleSelect_${chosenCards[i].coinSymbol}`).click(() => {
                    for (let i = 0; i < chosenCards.length; i++) {
                        if ($(`#toggleSelect_${chosenCards[i].coinSymbol}`).is(":not(:checked)")) {
                            chosenCards.splice(i, 1);
                        }
                    }
                });
            }
            chosenCardsHolder = chosenCards.slice(0);
        }

         // print coin symbol:
         function printCoinSymbol(id) {
            return `<h5 class="card-title">${id}</h5>`;
        }

        // print coin name:
        function printCoinName(id) {
            return `<p class="card-text">${id}</p>`;
        }

        // print toggle switch - as checked:
        function printToggleSelect(id) {
            return `<div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" id="toggleSelect_${id}">
            <label class="custom-control-label" for="toggleSelect_${id}"></label></div>`;
        }

        // Unchecks and checks the cards according to the chosenCards array: 
        function checkUncheckToggle() {
            changeCheckedToUnchecked();
            changeUncheckedToChecked();
        }

        // Goes over allCards array - If toggle select is checked - then it Unchecks it:
        function changeCheckedToUnchecked() {
            for (let i = 0; i < allCards.length; i++) {
                if ($(`#toggleSelect_${allCards[i].coinSymbol}`).is(":checked")) {
                    $(`#toggleSelect_${allCards[i].coinSymbol}`).prop('checked', false);
                }
            }
        }

        // Goes over chosenCards array- If toggle select is unchecked- then it checks it:
        function changeUncheckedToChecked() {
            for (let i = 0; i < chosenCards.length; i++) {
                if ($(`#toggleSelect_${chosenCards[i].coinSymbol}`).is(":not(:checked)")) {
                    $(`#toggleSelect_${chosenCards[i].coinSymbol}`).prop('checked', true);
                }
            }
        }

        // Abort Modal without making changes to the first 5 choices:
        function abortModal(selector) {
            removeLastFromArray(chosenCardsHolder);
            $(selector).empty();
            chosenCards = chosenCardsHolder.slice(0);
            checkUncheckToggle();
        }       

        // Save data to local storage:
        function saveToLocalStorage(key, object) {
            localStorage.setItem(key, JSON.stringify(object));
        }

        // Load saved data from local storage:
        function loadFromLocalStorage(key) {
            const str = localStorage.getItem(key);
            const object2 = JSON.parse(str);
            printMoreInfo(object2);
        }

        // Remove object from local storage:
        function removeFromLocalStorage(key) {
            localStorage.removeItem(key);
        }

        // ---------------- Live Reports Chart------------------//

        // Creates a string with uppercase from coinSymbol:
        function createSymbolString() {
            for (let i=0; i<chosenCards.length; i++){
                const symbol = chosenCards[i].coinSymbol.toUpperCase();
                pushToArray(allCoinsNames,symbol);
                coinsChosen += `${symbol},`;
            }
            // removes the "," at the end of the string:
            coinsChosen = coinsChosen.replace(/,\s*$/,"");
            createDataPointsObj();
        }

        // According to allCoinsNames, creates object properties with an empty array in graphPoints object:
        function createDataPointsObj() {
            for(i=0; i<allCoinsNames.length; i++){
                graphPoints[allCoinsNames[i]]=[];
            }
        }

        // Create graph data:
        function createGraphData() {
            for(i=0; i<allCoinsNames.length; i++){
                const graphData = {
                    type: "line",
                    name: allCoinsNames[i],
                    showInLegend: true,
                    dataPoints: graphPoints[allCoinsNames[i]]
                }
                pushToArray(graphArray,graphData);
            }
        }
        
        // Print chart:
        function printChart() {
            let graphTitle= `${coinsChosen} to USD`;
            let options = {
                animationEnabled: true,
                title: {
                    text: graphTitle
                },
                axisX: {
                    title: "Time (sec)"
                },
                axisY: {
                    title: "Coin Value (USD)",
                    titleFontColor: "#4F81BC",
                    lineColor: "#4F81BC",
                    labelFontColor: "#4F81BC",
                    tickColor: "#4F81BC",
                    includeZero: false
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    itemclick: toggleDataSeries
                },
                data:  graphArray
            };
            
            $("#chartContainer").CanvasJSChart(options);

            function toggleDataSeries(e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }
        }

        // Use setInterval every 2 seconds to create x,y points for the chart:
        function createDataWithSetInterval() {
            pointsTimer = setInterval(() => {
                let xP = new Date();
                getY(xP);
                $("#chartContainer").CanvasJSChart().render();
            }, 2000);
        }

        // Get data for y from API:
        function getY(xP) {
            getDetails("https://min-api.cryptocompare.com/data/pricemulti?fsyms="+ coinsChosen +"&tsyms=USD")
                .then(data => {
                    createGraphPoints(data, xP);
                  $(".loadingBarClass").hide();
                })
                .catch(error => {
                    alert(error);
                }); 
        }

        // create x,y points for graphPoints:
        function createGraphPoints(data,xP){
            for (let item in data) {
                graphPoints[item].push({
                    x: xP,
                    y: data[item].USD
                });
            }
        }

        // Invoking the Initializing function:
        init();
    });

})();