function onPlayerInput(){
    var input = document.getElementById("playerName").value;
}

$(".dp-list").click(function(e) {
  // var input = document.getElementById("playerName").value;
  e.preventDefault();
  // var dropTarget = $('#playerA');
  // console.log(dropTarget);
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

  let allPlayerRealms = {};
function playerSearch() {
    let input = document.getElementById("playerName").value;
    let allRealms = {};
    var name = input.toLowerCase();
    var newName = name.replace(/\s/g, '');
    let anotherOne = "https://us.api.blizzard.com/data/wow/realm/index?namespace=dynamic-us&locale=en_US&access_token=US3UGbTh6EEcouw5ZbJPFqfXMvArcncuiB";

      const getRealms = async anotherOne => {
        try {
            const response = await fetch(anotherOne);
            const json = await response.json();
            // console.log(json);
            var realmArray = [];
            let newPlayerUrls = [];
            var realmList = json.realms;
            var searching = "https://srv1.api.check-pvp.fr/v1/characters/search/"+ newName +"?region=us"
            // console.log(searching)
            // for (var i = 0; i < json.realms.length; i++) {
            //   var realms = json.realms[i].slug;
            //
            //   realmArray.push(realms);
            //   allRealms = realmArray;
            //   // var lowerCaseRealms = allRealms[i].toLowerCase(); used these to get lower case and remove spaces before using .slug
            //   // var newRealm = lowerCaseRealms.replace(/\s/g, '');
            //
            //
            //   let realmUrls = "https://us.api.blizzard.com/profile/wow/character/"+allRealms[i]+"/"+newName+"?namespace=profile-us&locale=en_US&access_token=USMfqSFt6cD5w8tbqgo4czeSJTV2fdzj1K";
            //   newPlayerUrls.push(realmUrls);
            // }
              newPlayerUrls.push(searching);
              allPlayerRealms = newPlayerUrls;

        } catch (error) {

        }
      };
      getRealms(anotherOne);

      let dropDownInfo = {};
      const newRealmInfo = async () => {
        await getRealms(anotherOne);
        let requests = allPlayerRealms.map(allPlayerRealm => fetch(allPlayerRealm));
        Promise.all(requests)
        .then(responses => {
          let input = document.getElementById("playerName").value;
          let gRes = [];
          let inner = [];
          let nameArray = [];
          let realmArrayName = [];
          // console.log(responses);
            for (var i = 0; i < responses.length; i++) {
              if(responses[i].ok === true){
                // console.log(responses[i]);
                let status = responses[i].status === 200;
                if(status){
                  gRes = responses[i].url;
                }

                // console.log(status);
                // console.log(gRes);
                const getMoreRealms = async gRes => {
                  try {
                      var dropDown = [];
                      const response = await fetch(gRes);
                      const json = await response.json();
                      console.log(json[i]);
                        var playerObj = {
                          name: json[i].name,
                          realm: json[i].realm
                        }
                        var playerRegion = json[i].region;
                        console.log(playerRegion);
                         document.getElementById('playerObj').innerHTML += '<a href="#" id="playerA" class="dp-name">' +  playerObj.name + "-" + playerObj.realm + "-" + playerRegion + '</a>'


                  } catch (error) {
                    // console.log(error);'<p class="dp">'  + '</p>'
                  }
                }; // getMoreRealms
                getMoreRealms(gRes);
              }
            } //for loop

          })// .then response
        } // newRealInfo async
      newRealmInfo();
  } //playerSearch function

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

// document.addEventListener('click', function(event){
//   if(event.target.closest('.dp-name'))
// });
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
    document.getElementById('char').style.color = "White";
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

// $(function(){
//     // Select the element and initialize with the longPress method.
//     $('#input_or_textarea').longPress();
// });
