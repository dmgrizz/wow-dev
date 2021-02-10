modules.export getData = () => fetch("https://us.api.blizzard.com/profile/wow/character/"+newRealm+"/"+newName+"/equipment?namespace=profile-us&locale=en_US&access_token=US3ZTYQAe8chSKLT7PUl6vDIldIxYYt71V")
.then(response => response.json())
