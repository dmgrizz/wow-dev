app.post("/playerSearch", function(req, res){

  let allRealms = {};
  let whyTF = {};
  var playerName = _.lowerCase(req.body.playerName);

  var newName = playerName.replace(/\s/g, '');

    let anotherOne = "https://us.api.blizzard.com/data/wow/realm/index?namespace=dynamic-us&locale=en_US&access_token=" + token;
    let allPlayerRealms = {};
    const getRealms = async anotherOne => {
      try {
          const response = await fetch(anotherOne);
          const json = await response.json();
          // console.log(json);
          var realmArray = [];
          let newPlayerUrls = [];

          var realmList = json.realms;
          for (var i = 0; i < json.realms.length; i++) {
            var realms = json.realms[i].name;
            realmArray.push(realms);
            allRealms = realmArray;

            var lowerCaseRealms = _.lowerCase(allRealms[i]);
            var newRealm = lowerCaseRealms.replace(/\s/g, '');
            let realmUrls = "https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"?namespace=profile-us&locale=en_US&access_token=" + token;

            newPlayerUrls.push(realmUrls);
          }
           allPlayerRealms = newPlayerUrls;

      } catch (error) {
        console.log(error);
      }
    };
    getRealms(anotherOne);

    const newRealmInfo = async () => {
      await getRealms(anotherOne);
      let requests = allPlayerRealms.map(allPlayerRealm => fetch(allPlayerRealm));
      Promise.all(requests)
      .then(responses => {
        let gRes = [];
          for (var i = 0; i < responses.length; i++) {
            if(responses[i].status === 200){
              gRes = responses[i].url;
              const getMoreRealms = async gRes => {
                try {
                    var dropDown = [];
                    const response = await fetch(gRes);
                    const json = await response.json();
                    dropDown = json;

                    var playerObj = {
                      name: dropDown.name,
                      realm: dropDown.realm.name,
                    }

                } catch (error) {
                  console.log(error);
                }
              };
              getMoreRealms(gRes);
            }
        }
        return responses;
      })
    }
    res.render("home");
    newRealmInfo();
});
