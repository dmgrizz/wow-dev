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

function showNormalKillTime(){
  document.getElementsByClassName("").classList.remove("hide");
  document.getElementsByClassName("").classList.add("show");
}
function hideNormalKillTime(){
  document.getElementsByClassName("").classList.add("hide");
  document.getElementsByClassName("").classList.remove("show");
}

function showHeroicKillTime(){
  var heroic = document.getElementsByClassName("heroic-time");
  for (var i = 0; i < heroic.length; i++) {
    if(heroic[i].classList.contains("hide"))
    {
      heroic[i].classList.remove("hide");
      heroic[i].classList.add("show");
    } else {
      heroic[i].classList.remove("show");
      heroic[i].classList.add("hide");
    }

  }
}
function hideHeroicKillTime(){
  // document.getElementsByClassName("heroic-time").classList.add("hide");
  // document.getElementsByClassName("heroic-time").classList.remove("show");
}


function showMythicKillTime(){
  document.getElementById("mythic-tool").classList.remove("hide");
  document.getElementById("mythic-tool").classList.add("show");
}
function hideMythicKillTime(){
  document.getElementById("mythic-tool").classList.add("hide");
  document.getElementById("mythic-tool").classList.remove("show");
}



let allPlayerRealms = {};


function PopulateUserName() {
        var drop = document.getElementById("specialChar");
        var field = document.getElementById("playerName");
        $(field).val($(field).val() + drop.value);
          console.log($(field.val));
    }


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
    document.getElementById('char').style.color = "#9ede73";
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
