
window.onload = function()
{
  //variable globale pour que toutes les fontions puissent les utilisés
  terrainWidth = 540+30*8; //on lui donne une largeur
  terrainHeight = 540+30*8; //et une hauteur
  var ctx; //pour dessiner
  var tailleBlockSerpent = 30; //taille d'un block
  var delai = 120; //delai en ms
  var serpent;
  var pomme;
  var blockWidth = terrainWidth/tailleBlockSerpent; //nb de block en largeur
  var blockHeight = terrainHeight/tailleBlockSerpent; //nb de block en hauteur
  var score = 0;

  init(); //appel de la fonction init()


  function init() //initialisation du ctx
  {
    ////creation terrain
    //on créer l'émément "terrain" qui est de type canvas (comme ca pourrait etre de type div etc..)
    var terrain = document.createElement('canvas');
    terrain.width = terrainWidth; //on lui donne une largeur
    terrain.height = terrainHeight; //et une hauteur
    terrain.style.border = "1px solid"; //et un type de bordure (pour mieux le voir)
    document.body.appendChild(terrain); //on l'ajoute a notre document html
    ////creation ctx
    ctx = terrain.getContext('2d');   //dessiner dans le terrain (en 2 dimmensions)
    ////creation serpent
    serpent = new Snake( [[4,4], [5,4], [6,4]], "right" );
    ////creation pomme
    //position aleatoire de la pomme
    var nouvellePositionX = Math.round(Math.random() * (blockWidth -1));
    var nouvellePositionY = Math.round(Math.random() * (blockHeight -1));
    pomme = new Apple([nouvellePositionX, nouvellePositionY]);
    mouvement(); //appel a mouvement pour le depalcement du serpent
  }



  function changePointHtml(){
    document.getElementById("score").innerHTML = score;
  }


  function changeDirectionHtml(direction){
    document.getElementById("direction").innerHTML =direction;
  }


  function mouvement() //pour deplacer le serpent
  {
    //on degage tout ce qu'il y a dans le terrain, donc on efface le dessin (car on le dessine apres)
    serpent.avance(); //appel a this.avance = serpent avance
    if (serpent.collision() ) //on regarde si le joueur a perdu et affichage score
    {
      alert('You lose');
    }
    else //on joue encore
    {
      if (serpent.mangerPomme(pomme)) //a manger la pomme = longueur et score +1 / va plus vite
      {
        pomme.nouvellePosition(); //la pomme se replace
        serpent.grandit(); //le serpent grandit
        score += 1; //le score augmente
        changePointHtml();
        delai -= 2.5; //le serpent va plus vite

      }
      ctx.clearRect(0,0, terrainWidth, terrainWidth);
      serpent.dessin(); //appel a this.dessin = dessin du serpent
      pomme.dessin();
      setTimeout(mouvement, delai) //execute la fonction mouvement à chaque fois que le delai est passé
    }
  }



  function dessinBlock(ctx, position) //position = une liste/tableau
  {
    var x = position[0] * tailleBlockSerpent; //coordoné x
    var y = position[1] * tailleBlockSerpent; // coordoné y
    ctx.fillRect(x,y, tailleBlockSerpent, tailleBlockSerpent); //dessin un block en fonction des x et y donné
  }



  function Snake(tableau, direction) //init du serpent
  {
    this.corps = tableau;
    this.direction = direction; //prit par l'utilisateur

    this.dessin = function() //dessiner le serpent
    {
      ctx.save(); //sauvergarder contenu ctx (le garder avant de la modifier)
      ctx.fillStyle = "green";   //on lui donne une couleur
      for (t in this.corps) //pour tous les sous tableaux du corps, on dessin block par block
      {
        dessinBlock(ctx, this.corps[t]); // on dessin block par block
      }
      ctx.restore(); //on le remet comme il etait avant
    };

    this.avance = function() //avancer le serpent = supprimer le dernier elt et ajoute le 1er a sa nouvelle position
    {
      changeDirectionHtml(this.direction);
      var positinSuivante = this.corps[this.corps.length-1].slice(); //on copie le dernier elt du tableau
      switch(this.direction)
      {
        case "left":
          positinSuivante[0] -= 1; //avance vers la gauche
          break;
        case "right":
          positinSuivante[0] += 1; //avance vers la droite
          break;
        case 'down':
          positinSuivante[1] += 1; //avance vers le bas
          break;
        case 'up':
          positinSuivante[1] -= 1; //avance vers le haut
          break;
        default :
          throw("direction incorrect") //message d'erreur
      }
      this.corps.push(positinSuivante); //ajoute l'elt a la fin
      this.corps.shift(); //supprime 1er elt
    };

    this.setDirection = function(nouvelleDirection)
    {
      var directionPermises; //pas de demi-tour (le serpent rentrerait sa tete pour la s=resortir)
      switch(this.direction)
      {
        case "left":
        case "right" :
          directionPermises = ['up', 'down'];
          break;
        case "up":
        case "down" :
          directionPermises = ['right', 'left'];
          break;
      }
      //si direction directionPermises, on change de direction
      if (directionPermises.indexOf(nouvelleDirection) > -1) //indexOf renvoie -1 si pas trouvé
      {
        this.direction = nouvelleDirection;
      }
    };

    this.collision = function() //perdu ou pas? (se prend un mur ou son corps)
    {
      var collisionMur = false;
      var collisionSerpent = false;
      var teteSerpent = this.corps[this.corps.length - 1]; //la tete == dernier elt
      var teteSerpentX = teteSerpent[0];
      var teteSerpentY = teteSerpent[1];
      var corpsSerpent = this.corps.slice(0, this.corps.length - 1) //corps == le reste

      var minX = 0;
      var maxX = blockWidth -1;
      var minY = 0;
      var maxY = blockHeight -1;
      var pasEntreMurHorizontaux = teteSerpentX < minX || teteSerpentX > maxX;
      var pasEntreMurVerticaux = teteSerpentY < minY || teteSerpentY > maxY;


      if (pasEntreMurVerticaux || pasEntreMurHorizontaux) //se prend un mur
      {
        collisionMur = true;
      }

      for (e in corpsSerpent) //si serpent se prend son corps
      {
        if (corpsSerpent[e][0] == teteSerpentX && corpsSerpent[e][1] == teteSerpentY)
        {
          collisionSerpent = true;
        }
      }
      return collisionMur || collisionSerpent;
    };

    this.mangerPomme = function(positionPomme) //mange la pomme? (la tete passe sur la pomme)
    {
      var teteSerpent = this.corps[this.corps.length - 1]; //la tete == dernier elt
      var teteSerpentX = teteSerpent[0];
      var teteSerpentY = teteSerpent[1];

      if (teteSerpentX == positionPomme.position[0] && teteSerpentY == positionPomme.position[1]) //a mangé la pomme
      {
        return true;
      }
      else
      {
        return false;
      }
    };

    this.grandit = function()
    {
      // unshuft = insert au premier element python
      this.corps.unshift(this.corps[0]);
    };
  }


  document.onkeydown = function handleKeyDown(e) //gerer evenement clavier
  //fleche directionnelle ou ZQSD
  {
    var cle = e.keyCode; // detecte touche qu'on vient d'appuyer
    var nouvelleDirection;
    switch (cle)
    {
      case 37: //code qui correspond a la touche directionnelle de gauche
      case 81: //code qui correspond a lalettre Q
        nouvelleDirection = 'left';
        break;
      case 38: //code qui correspond a la touche directionnelle du bas
      case 90: //code qui correspond a lalettre Z
        nouvelleDirection = 'up';
        break;
      case 39: //code qui correspond a la touche directionnelle de droite
      case 68: //code qui correspond a lalettre D
        nouvelleDirection = 'right';
        break;
      case 40: //code qui correspond a la touche directionnelle du bas
      case 83: //code qui correspond a lalettre S
        nouvelleDirection = 'down';
        break;
      default :
        return;
    }
    serpent.setDirection(nouvelleDirection); //appel a this.setDirection
  }



  function Apple(position) //init de la pomme
  {
    this.position = position;

    this.dessin = function()
    {
      ctx.save();
      ctx.fillStyle = 'red'; //couleur de la pomme
      ctx.beginPath();
      var rayonPomme = tailleBlockSerpent/2; //rayon de la pomme
      var x = this.position[0] * tailleBlockSerpent + rayonPomme; //on rajoute rayonPomme pour avoir le centre de la pomme
      var y = this.position[1] * tailleBlockSerpent + rayonPomme;
      ctx.arc(x, y, rayonPomme, 0, Math.PI*2, true) //dessiner un rond
      ctx.fill();
      ctx.restore();
    };

    this.nouvellePosition = function()
    {
      var nouvellePositionX = Math.round(Math.random() * (blockWidth -1));
      var nouvellePositionY = Math.round(Math.random() * (blockHeight -1));
      for (e in Snake.corps) {
        while (nouvellePositionX == Snake.corps[e][0] && nouvellePositionY == Snake.corps[e][1] ) { //pour eviter que la pomme se retrouve sur le serpent
          var nouvellePositionX = Math.round(Math.random() * (blockWidth -1));
          var nouvellePositionY = Math.round(Math.random() * (blockHeight -1));
        }
    }
      this.position = [nouvellePositionX, nouvellePositionY];
    };

  }

}
