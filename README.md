#API REST justify text with Node js

Pour pouvoir tester ce code il faut avoir postman et MongoDB Compass.

Dans MongoDB Compass connecté vous sur l'url mongodb://localhost:27017

Dans postman taper l'URL localhost:3002/api/token

- Appuyer ensuite sur Body, puis form-data, ajouter email comme clé, puis l'email de votre choix en guise de valeur.

Vous recevrez alors le token qui vous permettra de justifier le texte.

- ouvrez une nouvelle fenêtre tapez l'URL localhost:3002/api/justify
- allez dans Authorization, selectionnez API Key
- ajouter autorisation comme clé et insérer le token dans Value
- Pour finir allez dans body puis form-data ajouter text comme clé et insérer votre texte dans value.

L'API vous retournera alors votre text justifié.
