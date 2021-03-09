function onPlayerInput(){
    var input = document.getElementById("playerName").value;
}

$(".dp-list").click(function(e) {
  e.preventDefault();
  var value = e.target.innerText;
  var input = $('#playerName');
  input.val(value);
  document.getElementById("myDropdown").classList.remove("show");
});

$("#playerName").click(function(event){
  if(input.value[1]){
    document.getElementById("myDropdown").classList.add("show");
    $('#myDropdown').show();
  } else if (input.value[0]){
    $('#myDropdown').hide();
  }

});

$(document).click(function (e) {
    e.stopPropagation();
    var container = $(".dropdown");
    //check if the clicked area is dropdown or not
    if (container.has(e.target).length === 0) {
        $('#myDropdown').hide();
    }
})

function showTwosGames(){
  document.getElementById("twos-tool").classList.remove("hide");
  document.getElementById("twos-tool").classList.add("show");

}
function hideTwosGames(){
  document.getElementById("twos-tool").classList.remove("show");
  document.getElementById("twos-tool").classList.add("hide");
}

function showThreesGames(){
  document.getElementById("threes-tool").classList.remove("hide");
  document.getElementById("threes-tool").classList.add("show");
}
function hideThreesGames(){
  document.getElementById("threes-tool").classList.remove("show");
  document.getElementById("threes-tool").classList.add("hide");
}

function showRbgGames(){
  document.getElementById("rbg-tool").classList.remove("hide");
  document.getElementById("rbg-tool").classList.add("show");
}
function hideRbgGames(){
  document.getElementById("rbg-tool").classList.remove("show");
  document.getElementById("rbg-tool").classList.add("hide");
}

let allPlayerRealms = {};

function playerSearch(){

    let input = document.getElementById("playerName").value;
    var name = input.toLowerCase();
    var newName = name.replace(/\s/g, '');
    var searching = "https://srv1.api.check-pvp.fr/v1/characters/search/"+ newName +"?region=us"

    const getPlayers = async searching => {
      try {
          const response = await fetch(searching);
          const json = await response.json();

          let newPlayerUrls = [];
          newPlayerUrls.push(searching);
          allPlayerRealms = newPlayerUrls;

      } catch (error) {

      }
    };
    getPlayers(searching);

    let dropDownInfo = {};
    const newRealmInfo = async () => {
      await getPlayers(searching);
      let requests = allPlayerRealms.map(allPlayerRealm => fetch(allPlayerRealm));
      Promise.all(requests)
      .then(responses => {
        let input = document.getElementById("playerName").value;
        let gRes = [];
        for (var i = 0; i < responses.length; i++) {
              if(responses[i].ok === true){
                // console.log(responses[i]);
                let status = responses[i].status === 200;
                if(status){
                  gRes = responses[i].url;
                }

              const getMoreRealms = async gRes => {
                try {
                    var dropDown = [];
                    const response = await fetch(gRes);
                    const json = await response.json();
                    // console.log(json[i]);
                      var playerObj = {
                        name: json[i].name,
                        realm: json[i].realm
                      }
                      console.log(playerObj);
                      var playerRegion = json[i].region;
                      console.log(playerRegion);

                           document.getElementById('playerObj').innerHTML += '<a href="#" id="playerA" class="dp-name">' +  playerObj.name + "-" + playerObj.realm + "-" + playerRegion + '</a>'

                } catch (error) {
                  // console.log(error);'<p class="dp">'  + '</p>'
                }
              }; // getMoreRealms
              getMoreRealms(gRes);
            }
          }
        })// .then response
      } // newRealInfo async
    newRealmInfo();
  }

  // function insertIntoFormula(specialChar) {
  //     const textarea = document.getElementById('playerName');
  //     const insertStartPoint = textarea.selectionStart;
  //     const insertEndPoint = textarea.selectionEnd;
  //     let value = textarea.value;
  //
  //     // text before cursor/highlighted text + special character + text after cursor/highlighted text
  //     value = value.slice(0, insertStartPoint) + specialChar + value.slice(insertEndPoint);
  //     textarea.value = value;
  // }

    function PopulateUserName() {
        var drop = document.getElementById("specialChar");
        var field = document.getElementById("playerName");
        $(field).val($(field).val() + drop.value);
          console.log($(field.val));
    }
//   function PopulateUserName() {
//     var dropdown = document.getElementById("iSupervisor");
//     var field = document.getElementById("iSupervisorUserName");
//     $(field).val($(field).val() + dropdown.value);
//
// }


var input, filter, ul, li, a, i, cName;
  function filterFunction() {
    input = document.getElementById("playerName");
    filter = input.value.toUpperCase();
    cName = document.getElementsByClassName("dp-name");
    div = document.getElementById("myDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
      // console.log(a[i].textContent);
      // console.log(cName[i]);
      txtValue = a[i].textContent || a[i].innerText;
      console.log(txtValue);
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
        a[i].style.cursor = "pointer";
      } else {
        a[i].style.display = "none";
      }
      if(txtValue.toUpperCase().indexOf(filter) != cName){
        a[i].style.display = "none";
        // console.log(a[i]);
      }

    }
    // console.log(input.value);
  }

  let newRealmArray = {};

  function myFunction() {
    if(input.value[1]){
      document.getElementById("myDropdown").classList.add("show");
      filterFunction();
    } else if (input.value[0]){
      document.getElementById("myDropdown").classList.remove("show");
    }
  }

var charClass = document.getElementsByClassName('char-class')[0].innerText;
function characterColor(color){
  switch(color){
    case "Paladin":
    document.getElementById('char').style.color = "#ff75a0";
    break;

    case "Rogue":
    document.getElementById('char').style.color = "#e7d39f";
    break;

    case "Demon Hunter":
    document.getElementById('char').style.color = "#a335ee";
    break;

    case "Hunter":
    document.getElementById('char').style.color = "#cee397";
    break;

    case "Warrior":
    document.getElementById('char').style.color = "#c1a57b";
    break;

    case "Priest":
    document.getElementById('char').style.color = "white";
    break;

    case "Shaman":
    document.getElementById('char').style.color = "#1b6ca8";
    break;

    case "Mage":
    document.getElementById('char').style.color = "#b2ebf2";
    break;

    case "Warlock":
    document.getElementById('char').style.color = "#c3aed6";
    break;

    case "Monk":
    document.getElementById('char').style.color = "#54e346";
    break;

    case "Druid":
    document.getElementById('char').style.color = "#f88f01";
    break;

    case "Death Knight":
    document.getElementById('char').style.color = "#ec0101";
    break;

    default: console.log(charClass);

  }

}
characterColor(charClass);
