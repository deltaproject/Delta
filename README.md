<div align="center">
  <h1>ProjectMagister</h1>
  <h3>📚 Een moderne versie van Magister, gemaakt voor leerlingen.</h3>
</div>
---

# Installatie
ProjectMagister is momenteel nog in de bètafase, dus verdere instructies en documentatie volgen later.

# Voor ontwikkelaars
1. Clone deze repository naar je lokale schijf met `git clone https://github.com/projectmagister/ProjectMagister`
2. Open je Terminal-emulator en navigeer naar de locatie waar je de repository hebt gecloned
3. Typ `npm install` om alle dependencies te installeren
4. Bewerk vervolgens `main.js` met een teksteditor en verander de volgende variabelen:
```js
var m = new Magister.Magister({
    school: '<volledige schoolnaam>',
    username: '<gebruikersnaam>',
    password: '<wachtwoord>'
});
```
5. Start ProjectMagister met `electron .`

# Credits
Met speciale dank aan [Lieuwe Rooijakkers (@lieuwex)](https://github.com/lieuwex) voor het maken van [MagisterJS](https://github.com/simplyGits/MagisterJS), die ProjectMagister mogelijk maakte.

# Licentie
ProjectMagister is gelicentieerd onder een [Mozilla Public License 2.0](https://github.com/projectmagister/ProjectMagister/blob/master/LICENSE) licentie.
